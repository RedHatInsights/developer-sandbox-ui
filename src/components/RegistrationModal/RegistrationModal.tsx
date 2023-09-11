import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Bullseye,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Modal,
  Spinner,
  Text,
  TextContent,
  TextInput,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { CheckIcon } from '@patternfly/react-icons/dist/esm/icons/check-icon';
import FooterButton from './FooterButton';
import {
  completePhoneVerification,
  getSignupData,
  initiatePhoneVerification,
  isValidCountryCode,
  isValidPhoneNumber,
  signup,
} from '../../services/registration-service';
import sandboxReadyImg from '../../images/launch-sandbox-success.svg';
import { errorMessage } from '../../utils/utils';
import { SignupData } from '../../types';
import { Status } from '../../utils/registration-context';
import { useTrackEvent } from '../../hooks/useTrackEvent';
import AnalyticsButton from '../AnalyticsButton/AnalyticsButton';
import { SHORT_INTERVAL } from '../../utils/const';

type Props = {
  initialStatus?: Status;
  onClose: (signupData?: SignupData) => void;
};

const RegistrationModal = ({ onClose, initialStatus }: Props) => {
  const track = useTrackEvent();

  const [step, setStep] = React.useState<
    'new' | 'ready' | 'provisioning' | 'verify' | 'verifyCode' | 'pending-approval'
  >(initialStatus && initialStatus !== 'unknown' ? initialStatus : 'new');
  const [error, setError] = React.useState<string | undefined>();
  const [verifyCode, setVerifyCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [countryCode, setCountryCode] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [codeResent, setCodeResent] = React.useState(false);

  const [signupData, setSignupDataState] = React.useState<SignupData>();

  const getSignupDataFn = React.useCallback(async () => {
    try {
      const data = await getSignupData();
      setSignupDataState(data);
      if (data == null) {
        setStep('new');
      } else if (data.status.ready === true) {
        setStep('ready');
      } else if (data.status.ready === false && data.status.verificationRequired) {
        setStep((cur) => (cur !== 'verify' && cur !== 'verifyCode' ? 'verify' : cur));
      } else if (data.status.ready === false && data.status.reason === 'Provisioning') {
        setStep('provisioning');
      } else {
        setStep('pending-approval');
      }
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  React.useEffect(() => {
    if (step === 'provisioning' || step === 'pending-approval') {
      const handle = setInterval(getSignupDataFn, SHORT_INTERVAL);
      return () => {
        clearInterval(handle);
      };
    }
  }, [step]);

  React.useEffect(() => {
    if (error) {
      track('DevSandbox Signup Error', {
        error,
      });
    }
  }, [error]);

  React.useEffect(() => {
    track('DevSandbox Signup Step', {
      step,
    });
  }, [step]);

  return (
    <Modal
      data-testid="registration-modal"
      width={600}
      aria-labelledby="registration-modal-title"
      header={
        // custom title to prevent ellipsis overflow on small screens
        <Title id="registration-modal-title" headingLevel="h1">
          {step === 'ready'
            ? "Congratulations, you're ready to get started!"
            : 'Activate your free 30 days trial'}
        </Title>
      }
      isOpen
      onClose={() => onClose(signupData)}
    >
      {error ? (
        <Alert
          title="An error occurred"
          variant={AlertVariant.danger}
          actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
          isInline
          className="pf-u-mb-lg"
        >
          {error}
        </Alert>
      ) : null}
      {(() => {
        switch (step) {
          case 'new':
            return (
              <FooterButton
                isDisabled={loading}
                isLoading={loading}
                onClick={async () => {
                  try {
                    setError(undefined);
                    setLoading(true);
                    await signup();
                    await getSignupDataFn();
                  } catch (e) {
                    setError(errorMessage(e));
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Activate
              </FooterButton>
            );
          case 'verify':
            return (
              <>
                <TextContent>
                  <Text component={TextVariants.p}>
                    We are preparing your Sandbox. It will be available shortly.
                  </Text>
                  <Text component={TextVariants.p}>
                    One more thing, to ensure your account is secure please enter a valid phone
                    number for SMS verification.
                  </Text>
                </TextContent>
                <Form>
                  <Grid hasGutter className="pf-u-mt-md" style={{ alignItems: 'end' }}>
                    <GridItem span={3}>
                      <FormGroup label="Country code" isRequired>
                        <TextInput
                          aria-label="Country code"
                          isRequired
                          validated={
                            !countryCode || isValidCountryCode(countryCode) ? 'default' : 'error'
                          }
                          type="text"
                          placeholder="+01"
                          minLength={1}
                          maxLength={4}
                          value={countryCode}
                          onChange={(value) => {
                            setError(undefined);
                            setCountryCode(value);
                          }}
                        />
                      </FormGroup>
                    </GridItem>
                    <GridItem span={9}>
                      <FormGroup label="Phone number" isRequired>
                        <TextInput
                          aria-label="Phone number"
                          isRequired
                          validated={
                            !phoneNumber || isValidPhoneNumber(phoneNumber) ? 'default' : 'error'
                          }
                          type="tel"
                          placeholder="123-456-7890"
                          minLength={6}
                          maxLength={32}
                          value={phoneNumber}
                          onChange={(value) => {
                            setError(undefined);
                            setPhoneNumber(value);
                          }}
                        />
                      </FormGroup>
                    </GridItem>
                  </Grid>
                </Form>
                <FooterButton
                  isDisabled={
                    loading || !isValidCountryCode(countryCode) || !isValidPhoneNumber(phoneNumber)
                  }
                  isLoading={loading}
                  onClick={async () => {
                    try {
                      setError(undefined);
                      setLoading(true);
                      await initiatePhoneVerification(countryCode, phoneNumber);
                      setStep('verifyCode');
                    } catch (e) {
                      setError(errorMessage(e));
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Next
                </FooterButton>
              </>
            );
          case 'verifyCode':
            return (
              <>
                <TextContent>
                  <Text component={TextVariants.p}>
                    We are preparing your Sandbox. It will be available shortly.
                  </Text>
                  <Text component={TextVariants.p}>
                    We sent a verification code to "<b>{`${countryCode} ${phoneNumber}`}</b>"
                  </Text>
                </TextContent>
                <Form>
                  <FormGroup label="Verification code" isRequired className="pf-u-mt-md pf-u-mb-md">
                    <TextInput
                      aria-label="Veritification code"
                      isRequired
                      validated={!verifyCode || verifyCode.length === 6 ? 'default' : 'error'}
                      minLength={6}
                      maxLength={6}
                      placeholder="XXXXXX"
                      value={verifyCode || ''}
                      onChange={(value) => {
                        setError(undefined);
                        setCodeResent(false);
                        setVerifyCode(value);
                      }}
                    />
                  </FormGroup>
                </Form>
                <TextContent>
                  <Text component={TextVariants.p}>
                    No text received?{' '}
                    <AnalyticsButton
                      isInline
                      variant={ButtonVariant.link}
                      onClick={() => {
                        setError(undefined);
                        setVerifyCode('');
                        initiatePhoneVerification(countryCode, phoneNumber);
                        setCodeResent(true);
                      }}
                      analytics={{
                        event: 'DevSandbox Signup Resend Code',
                      }}
                    >
                      Resend code
                    </AnalyticsButton>
                    {codeResent ? (
                      <CheckIcon
                        className="pf-u-ml-md"
                        style={{ color: 'var(--pf-global--success-color--100)' }}
                      />
                    ) : null}
                    <br />
                    Or{' '}
                    <Button
                      isInline
                      variant={ButtonVariant.link}
                      onClick={() => {
                        setError(undefined);
                        setStep('verify');
                        setVerifyCode('');
                      }}
                    >
                      use a different phone number
                    </Button>
                  </Text>
                </TextContent>
                <FooterButton
                  isDisabled={loading || verifyCode.length !== 6}
                  isLoading={loading}
                  onClick={async () => {
                    try {
                      setError(undefined);
                      setLoading(true);
                      await completePhoneVerification(verifyCode);
                      await getSignupDataFn();
                    } catch (e) {
                      setError(
                        errorMessage(e) ||
                          'Error while sending verification code. Please try again.',
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Next
                </FooterButton>
              </>
            );
          case 'provisioning':
            return (
              <>
                <TextContent>
                  <Text component={TextVariants.p}>
                    We are preparing your Sandbox. It will be available shortly.
                  </Text>
                </TextContent>
                <Bullseye className="pf-u-mt-2xl pf-u-mb-lg">
                  <Spinner isSVG size="xl" />
                </Bullseye>
                <FooterButton isDisabled>Launch Sandbox</FooterButton>
              </>
            );

          case 'pending-approval':
            return (
              <>
                <TextContent>
                  <p>Your Sandbox account is waiting for approval.</p>
                </TextContent>
                <Bullseye className="pf-u-mt-2xl pf-u-mb-lg">
                  <Spinner isSVG size="xl" />
                </Bullseye>
                <FooterButton onClick={() => onClose(signupData)}>Close</FooterButton>
              </>
            );
          case 'ready':
            return (
              <>
                <TextContent>
                  <Text component={TextVariants.p}>
                    Your Sandbox is now active. It will be available for next 30 days. Jump right in
                    and start creating your applications!
                  </Text>
                </TextContent>
                <div className="pf-u-p-md">
                  <img src={sandboxReadyImg} />
                </div>
                <FooterButton onClick={() => onClose(signupData)}>Got it</FooterButton>
              </>
            );
          default:
            return null;
        }
      })()}
    </Modal>
  );
};

export default RegistrationModal;
