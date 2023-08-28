import * as React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RegistrationModal from '../RegistrationModal';
import {
  completePhoneVerification,
  getSignupData,
  initiatePhoneVerification,
  signup,
} from '../../../services/registration-service';

jest.mock('../../../services/registration-service', () => {
  const actual = jest.requireActual('../../../services/registration-service');
  return {
    ...actual,
    completePhoneVerification: jest.fn(),
    getSignupData: jest.fn(),
    initiatePhoneVerification: jest.fn(),
    signup: jest.fn(),
  };
});

const getSignupDataMock = getSignupData as jest.Mock;
const signupMock = signup as jest.Mock;

describe('RegistrationModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('should render the activate button', () => {
    render(<RegistrationModal onClose={() => null} />);
    expect(screen.getByRole('button', { name: 'Activate' })).not.toBeDisabled();
  });

  it('should render the pending approval screen', () => {
    render(<RegistrationModal onClose={() => null} initialStatus="pending-approval" />);
    expect(screen.getAllByRole('button', { name: 'Close' }).reverse()[0]).not.toBeDisabled();
  });

  it('should render the provisioning screen', () => {
    render(<RegistrationModal onClose={() => null} initialStatus="provisioning" />);
    expect(screen.getByRole('button', { name: 'Launch Sandbox' })).toBeDisabled();
  });

  it('should render the ready screen', () => {
    const onClose = jest.fn();
    render(<RegistrationModal onClose={onClose} initialStatus="ready" />);
    const button = screen.getByRole('button', { name: 'Got it' });
    expect(button).not.toBeDisabled();
    button.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('should render the verify screen', () => {
    render(<RegistrationModal onClose={() => null} initialStatus="verify" />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('should complete registration process', async () => {
    getSignupDataMock.mockReturnValue({
      status: {
        ready: false,
        reason: 'Provisioning',
      },
    });
    render(<RegistrationModal onClose={() => null} />);
    screen.getByRole('button', { name: 'Activate' }).click();
    expect(signupMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Launch Sandbox' })).toBeDisabled();
    });
    getSignupDataMock.mockReturnValue({
      status: {
        ready: true,
      },
    });
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Got it' })).not.toBeDisabled();
    });
  });

  it('should complete registration with approval', async () => {
    getSignupDataMock.mockReturnValue({
      status: {
        ready: false,
      },
    });
    render(<RegistrationModal onClose={() => null} />);
    screen.getByRole('button', { name: 'Activate' }).click();
    expect(signupMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Close' }).reverse()[0]).not.toBeDisabled();
    });
    getSignupDataMock.mockReturnValue({
      status: {
        ready: true,
      },
    });
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Got it' })).not.toBeDisabled();
    });
  });

  it('should complete registration with verification', async () => {
    getSignupDataMock.mockReturnValue({
      status: {
        ready: false,
        verificationRequired: true,
      },
    });
    render(<RegistrationModal onClose={() => null} />);
    screen.getByRole('button', { name: 'Activate' }).click();
    expect(signupMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Close' }).reverse()[0]).not.toBeDisabled();
    });
    getSignupDataMock.mockReturnValue({
      status: {
        ready: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    });
    const countryCodeInput = screen.getByLabelText('Country code');
    const phoneInput = screen.getByLabelText('Phone number');

    const verifyNextButton = screen.getByRole('button', { name: 'Next' });
    expect(verifyNextButton).toBeDisabled();

    fireEvent.change(countryCodeInput, { target: { value: '1' } });
    fireEvent.change(phoneInput, { target: { value: '1231231234' } });

    expect(verifyNextButton).not.toBeDisabled();

    verifyNextButton.click();

    expect(initiatePhoneVerification).toHaveBeenCalledWith('1', '1231231234');

    await waitFor(() => {
      expect(screen.getByText(/We sent a verification code to/)).toBeInTheDocument();
    });

    const verifyCodeNextButton = screen.getByRole('button', { name: 'Next' });
    expect(verifyCodeNextButton).toBeDisabled();

    const codeInput = screen.getByLabelText('Veritification code');
    fireEvent.change(codeInput, { target: { value: '123456' } });

    expect(verifyCodeNextButton).not.toBeDisabled();

    verifyCodeNextButton.click();

    expect(completePhoneVerification).toHaveBeenCalledWith('123456');

    getSignupDataMock.mockReturnValue({
      status: {
        ready: true,
      },
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Got it' })).not.toBeDisabled();
    });
  });
});
