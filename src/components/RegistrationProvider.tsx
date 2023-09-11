import * as React from 'react';
import isEqual from 'lodash/isEqual';
import {
  RegistrationContext,
  RegistrationContextValue,
  signupDataToStatus,
} from '../utils/registration-context';
import RegistrationModal from './RegistrationModal/RegistrationModal';
import { SignupData } from '../types';
import { errorMessage } from '../utils/utils';
import { useTrackEvent } from '../hooks/useTrackEvent';
import { useRecaptcha } from '../hooks/useRecaptcha';
import { LONG_INTERVAL, SHORT_INTERVAL } from '../utils/const';
import useRegistrationService from '../hooks/useRegistrationService';

const RegistrationProvider = ({ children }: { children?: React.ReactNode }) => {
  useRecaptcha();
  const track = useTrackEvent();
  const { getSignupData } = useRegistrationService();

  // state
  const [statusUnknown, setStatusUnknown] = React.useState(true);
  const [signupData, setSignupData] = React.useState<SignupData>();
  const [error, setError] = React.useState<string>();
  const [showUserSignup, setShowUserSignup] = React.useState(false);
  const [showModalOnReady, setShowModalOnReady] = React.useState(false);

  const status = React.useMemo(
    () => (statusUnknown ? 'unknown' : signupDataToStatus(signupData)),
    [statusUnknown, signupData],
  );

  React.useEffect(() => {
    // send event when signup status is first established and upon change
    if (!statusUnknown) {
      track('DevSandbox Signup Status', {
        status,
      });
    }
  }, [statusUnknown, status]);

  const getSignupDataRef = React.useRef<() => void>();
  getSignupDataRef.current = async () => {
    try {
      const data = await getSignupData();
      if (!isEqual(data, signupData)) {
        setSignupData(data);
      }
      setError(undefined);
      setStatusUnknown(false);
    } catch (e) {
      setError(`An error occurred retrieving registration status. ${errorMessage(e)}`);
      setStatusUnknown(false);
    }
  };

  const refreshSignupData = React.useCallback(async () => getSignupDataRef.current?.(), []);

  React.useEffect(() => {
    getSignupDataRef.current?.();
  }, []);

  const pollStatus = !showUserSignup;
  const pollInterval = status === 'provisioning' ? SHORT_INTERVAL : LONG_INTERVAL;
  React.useEffect(() => {
    if (pollStatus) {
      const handle = setInterval(() => {
        getSignupDataRef.current?.();
      }, pollInterval);
      return () => {
        clearInterval(handle);
      };
    }
  }, [pollStatus, pollInterval]);

  const actions = React.useMemo(
    () => ({ setError, setSignupData, setShowUserSignup, refreshSignupData }),
    [refreshSignupData],
  );

  const contextValue: RegistrationContextValue = React.useMemo(
    () => [
      {
        error,
        signupData,
        showUserSignup,
        status,
      },
      actions,
    ],
    [error, signupData, showUserSignup, status, actions],
  );

  React.useEffect(() => {
    if (status === 'ready' && showModalOnReady) {
      // when signup status transitions to ready, show the modal
      setShowUserSignup(true);
    } else if (status !== 'ready' && !showModalOnReady && !statusUnknown) {
      // when signup status transitions from ready, prepare to show the modal
      setShowModalOnReady(true);
    }
  }, [status]);

  return (
    <RegistrationContext.Provider value={contextValue}>
      {showUserSignup ? (
        <RegistrationModal
          initialStatus={status}
          onClose={(newSignupData) => {
            track('DevSandbox Signup Closed');
            if (newSignupData) {
              setSignupData(newSignupData);
            }
            setShowUserSignup(false);
          }}
        />
      ) : null}
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider;
