import * as React from 'react';
import { SignupData } from '../types';

// state
export type Status = 'unknown' | 'new' | 'verify' | 'pending-approval' | 'provisioning' | 'ready';
export type RegistrationState = {
  showUserSignup?: boolean;
  status: Status;
  signupData?: SignupData;
  error?: string;
};

// actions
export type RegistrationActions = {
  refreshSignupData: () => Promise<void>;
  setShowUserSignup: (showUserSignup: boolean) => void;
  setSignupData: (data: SignupData | undefined) => void;
  setError: (error: string | undefined) => void;
};

// context
export type RegistrationContextValue = [RegistrationState, RegistrationActions];
export const RegistrationContext = React.createContext<RegistrationContextValue>(
  null as unknown as RegistrationContextValue,
);

export const signupDataToStatus = (signupData?: SignupData): Status => {
  let status: Status;
  if (signupData == null) {
    status = 'new';
  } else if (signupData.status.ready === true) {
    status = 'ready';
  } else if (signupData.status.ready === false && signupData.status.verificationRequired) {
    status = 'verify';
  } else if (signupData.status.ready === false && signupData.status.reason === 'Provisioning') {
    status = 'provisioning';
  } else {
    // unknown state
    status = 'pending-approval';
  }
  return status;
};
