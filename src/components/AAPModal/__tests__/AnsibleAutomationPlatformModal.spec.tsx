import * as React from 'react';
import YAML from 'yaml'
import {act, render, screen, waitFor} from '@testing-library/react';
import AnsibleAutomationPlatformModal from '../AnsibleAutomationPlatformModal';
import useKubeApi from "../../../hooks/useKubeApi";
import useRegistrationService from "../../../hooks/useRegistrationService";

jest.mock('../../../hooks/useRegistrationService', () => {
    const mock = {
        getSignupData: jest.fn(),
    };
    return {
        __esModule: true,
        default: () => mock,
    };
});

jest.mock('../../../hooks/useKubeApi', () => {
    const mock = {
        getAAPData: jest.fn(),
        getSecret: jest.fn(),
    };
    return {
        __esModule: true,
        default: () => mock,
    };
});

describe('AnsibleAutomationPlatformModal', () => {
    let getAAPDataMock: jest.Mock;
    let getSecretMock: jest.Mock;
    let getSignupDataMock: jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.resetAllMocks();
        const kubeService = useKubeApi();
        getAAPDataMock = kubeService.getAAPData as jest.Mock;
        getSecretMock = kubeService.getSecret as jest.Mock;
        const signupService = useRegistrationService();
        getSignupDataMock = signupService.getSignupData as jest.Mock;
    });


    function requiredModalTextWhenProvisioning() {
        // title should be there
        const modalTitle = screen.getByText('We are provisioning your AAP instance...');
        expect(modalTitle).toBeDefined();
        // modal content should be there
        const modalContent = screen.getByText("We are preparing your AAP instance. It might take up to ~30 minutes to be ready...")
        expect(modalContent).toBeDefined();
        // spinner should be there
        const progressBar = screen.getByRole("progressbar")
        expect(progressBar).toBeDefined();
    }

    it('modal should say that provisioning is in progress when initialStatus is unknown', () => {
        render(<AnsibleAutomationPlatformModal onClose={() => null} initialStatus="unknown"/>);
        requiredModalTextWhenProvisioning();
    });

    it('modal should say that provisioning is in progress when initialStatus in provisioning', () => {
        render(<AnsibleAutomationPlatformModal onClose={() => null} initialStatus="provisioning"/>);
        requiredModalTextWhenProvisioning();
    });

    it('should render when AAP is ready', async () => {
        getSignupDataMock.mockReturnValue({
            defaultNamespace: "testnamespace",
            status: {
                ready: false,
            },
        });
        getSecretMock.mockReturnValue({
            data: {
                password: "bXlwYXNzd29yZAo", // notsecret
            },
        });
        getAAPDataMock.mockReturnValue(YAML.parse(`
apiVersion: v1
items:
- apiVersion: aap.ansible.com/v1alpha1
  kind: AnsibleAutomationPlatform
  metadata:
    creationTimestamp: "2025-01-04T16:51:17Z"
    name: sandbox-aap
    uid: 60d90446-9c1f-4875-b00c-ac8954a67397
  spec:
  status:
    URL: https://sandbox-aap-test.com
    adminPasswordSecret: sandbox-aap-admin-password
    adminUser: admin
    conditions:
    - lastTransitionTime: "2025-01-04T17:10:07Z"
      message: ""
      reason: ""
      status: "False"
      type: Failure
    - lastTransitionTime: "2025-01-04T17:16:50Z"
      message: Last reconciliation succeeded
      reason: Successful
      status: "True"
      type: Successful
    - lastTransitionTime: "2025-01-04T16:51:17Z"
      message: Running reconciliation
      reason: Running
      status: "True"
        `));
        act(() => {
            render(<AnsibleAutomationPlatformModal onClose={() => null} initialStatus="unknown"/>);
        });
        // Modal is still in provisioning mode
        requiredModalTextWhenProvisioning()
        // once we retrieve the AAP CR with the ready status,
        // the open UI button and credentials should be rendered
        jest.advanceTimersByTime(2000);
        await waitFor(() => {
            const modalTitle = screen.getByText('Congratulations, you\'re ready to get started!');
            expect(modalTitle).toBeDefined();
            // UI link should be there
            expect(screen.getByRole('link', { name: 'Open UI' })).toHaveAttribute('href', 'https://sandbox-aap-test.com')
            // credentials should be there
            expect(screen.getByText("mypassword")).toBeDefined() // notsecret
            expect(screen.getByText("admin")).toBeDefined()
        });
    });
});
