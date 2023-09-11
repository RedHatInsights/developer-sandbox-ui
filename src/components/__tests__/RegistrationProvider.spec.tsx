import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import RegistrationProvider from '../RegistrationProvider';
import { useRegistrationContext } from '../../hooks/useRegistrationContext';
import { RegistrationActions, RegistrationState } from '../../utils/registration-context';
import { SignupData } from '../../types';

jest.mock('../../services/registration-service');

describe('RegistrationProvider', () => {
  it('should provider registration context api', async () => {
    jest.useFakeTimers();
    let state: RegistrationState = {} as RegistrationState;
    let api: RegistrationActions = {} as RegistrationActions;
    const APICapture = () => {
      [state, api] = useRegistrationContext();
      return null;
    };
    render(
      <RegistrationProvider>
        <APICapture />
      </RegistrationProvider>,
    );

    expect(state).not.toBeNull();
    expect(api).not.toBeNull();

    // run all use effects
    await act(async () => {
      // do nothing
    });

    await act(async () => {
      api.setError('test');
    });
    expect(state.error).toBe('test');

    await act(async () => {
      api.setShowUserSignup(true);
    });
    expect(state.showUserSignup).toBe(true);
    expect(screen.queryByTestId('registration-modal')).toBeInTheDocument();

    const signupData = {
      status: {
        ready: true,
        verificationRequired: true,
        reason: 'Provisioning',
      },
    } as SignupData;
    await act(async () => {
      api.setSignupData(signupData);
    });
    expect(state.signupData).toBe(signupData);
  });
});
