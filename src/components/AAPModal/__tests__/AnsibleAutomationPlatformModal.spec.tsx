import * as React from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import AnsibleAutomationPlatformModal from '../AnsibleAutomationPlatformModal';
import useKubeApi from '../../../hooks/useKubeApi';
import useRegistrationService from '../../../hooks/useRegistrationService';
import { Buffer } from 'buffer';

import yamlParse from 'yaml';
import { ANSIBLE_PROVISIONING_STATUS, ANSIBLE_UNKNOWN_STATUS } from '../../../utils/conditions';
import {
  ANSIBLE_PROVISIONING_LABEL,
  ANSIBLE_REPROVISIONING_LABEL,
} from '../../ServiceCatalog/ServiceCatalog';
import { capitalize } from 'lodash-es';

const mockedAAPCR = yamlParse.parse(`
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
        `);

const encode = (str: string): string => Buffer.from(str, 'binary').toString('base64');

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
  const mockCallBack = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    const kubeService = useKubeApi();
    getAAPDataMock = kubeService.getAAPData as jest.Mock;
    getSecretMock = kubeService.getSecret as jest.Mock;
    const signupService = useRegistrationService();
    getSignupDataMock = signupService.getSignupData as jest.Mock;
  });

  function requiredModalTextWhenProvisioning(provisioningLabel: string) {
    // title should be there
    const modalTitle = screen.getByText(
      `${provisioningLabel} Ansible Automation Platform (AAP) instance`,
    );
    expect(modalTitle).toBeDefined();
    // modal content should be there
    const { getByText } = within(screen.getByTestId('modal-content'));
    expect(
      getByText(
        `${provisioningLabel} can take up to 30 minutes. When ready, your instance will remain active for several hours.`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'introductory learning path' })).toHaveAttribute(
      'href',
      'http://red.ht/ansibledevsandboxpath',
    );
    // spinner should be there
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeDefined();
    // close modal button should be available
    const button = screen.queryByText('Close');
    button?.click();
    expect(mockCallBack).toHaveBeenCalled();
  }

  it('modal should say that provisioning is in progress when initialStatus is unknown', () => {
    render(
      <AnsibleAutomationPlatformModal
        onClose={mockCallBack}
        initialStatus={ANSIBLE_UNKNOWN_STATUS}
        provisioningLabel={ANSIBLE_PROVISIONING_LABEL}
      />,
    );
    requiredModalTextWhenProvisioning(capitalize(ANSIBLE_PROVISIONING_LABEL));
  });

  it('modal should say that provisioning is in progress when initialStatus in provisioning', () => {
    render(
      <AnsibleAutomationPlatformModal
        onClose={mockCallBack}
        initialStatus={ANSIBLE_PROVISIONING_STATUS}
        provisioningLabel={ANSIBLE_PROVISIONING_LABEL}
      />,
    );
    requiredModalTextWhenProvisioning(capitalize(ANSIBLE_PROVISIONING_LABEL));
  });

  it('modal should say that reprovisioning un-idling existing instance', () => {
    render(
      <AnsibleAutomationPlatformModal
        onClose={mockCallBack}
        initialStatus={ANSIBLE_PROVISIONING_STATUS}
        provisioningLabel={ANSIBLE_REPROVISIONING_LABEL}
      />,
    );
    requiredModalTextWhenProvisioning(capitalize(ANSIBLE_REPROVISIONING_LABEL));
  });

  it('should render when AAP is ready', async () => {
    window.open = jest.fn();
    getSignupDataMock.mockReturnValue({
      defaultUserNamespace: 'testnamespace',
      status: {
        ready: false,
      },
    });
    const ansibleUIPassword = 'mypassword'; // notsecret
    getSecretMock.mockReturnValue({
      data: {
        password: encode(ansibleUIPassword), // notsecret
      },
    });
    getAAPDataMock.mockReturnValue(mockedAAPCR);
    act(() => {
      render(
        <AnsibleAutomationPlatformModal
          onClose={mockCallBack}
          initialStatus={ANSIBLE_UNKNOWN_STATUS}
          provisioningLabel={ANSIBLE_PROVISIONING_LABEL}
        />,
      );
    });
    // Modal is still in provisioning mode
    requiredModalTextWhenProvisioning(capitalize(ANSIBLE_PROVISIONING_LABEL));
    // once we retrieve the AAP CR with the ready status,
    // the open UI button and credentials should be rendered
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      const modalTitle = screen.getByText('Ansible Automation Platform instance provisioned');
      expect(modalTitle).toBeDefined();
      // credentials should be there
      expect(screen.getByText('admin')).toBeDefined();
      // by default the password field si masked
      expect(screen.getByText('*'.repeat(ansibleUIPassword.length))).toBeDefined(); // notsecret
      // show password button should be there
      expect(screen.queryByRole('Show password')).toBeDefined();
      // copy password button should be there
      expect(screen.queryByRole('Copy password')).toBeDefined();
      // open UI button should be there
      const openAAPUIButton = screen.queryByText('Log in to Ansible Automation Platform');
      // when clicked, it should open the UI link from the AAP CR
      openAAPUIButton?.click();
      expect(window.open).toHaveBeenCalledTimes(1);
      expect(window.open).toHaveBeenCalledWith('https://sandbox-aap-test.com', '_blank');
    });
  });
});
