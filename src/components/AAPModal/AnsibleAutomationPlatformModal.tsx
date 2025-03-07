import * as React from 'react';
import { Buffer } from 'buffer';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Bullseye,
  Button,
  ClipboardCopy,
  Icon,
  Modal,
  Spinner,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListVariants,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExternalLinkAltIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@patternfly/react-icons';
import { errorMessage } from '../../utils/utils';
import { AAPData } from '../../services/kube-api';
import { SHORT_INTERVAL } from '../../utils/const';
import useKubeApi from '../../hooks/useKubeApi';
import useRegistrationService from '../../hooks/useRegistrationService';
import AnalyticsButton from '../AnalyticsButton/AnalyticsButton';
import { getReadyCondition } from '../../utils/conditions';

import './CustomList.scss';

type Props = {
  initialStatus?: string;
  onClose: (aapData?: AAPData) => void;
};

const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary');

function AnsibleAutomationPlatformProvisioningModalContent(props: { onClose: () => void }) {
  return (
    <>
      <TextContent>
        <Text component={TextVariants.p} data-testid="modal-content">
          Provisioning can take up to 30 minutes. When ready, your instance will remain active for
          11 hours.
        </Text>
        <br />
        <Text component={TextVariants.p} data-testid="modal-content-docs">
          While you wait, consider exploring the
          <a
            className={'pf-v5-u-ml-xs'}
            target="_blank"
            rel="noreferrer"
            href={'https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform'}
          >
            AAP documentation
          </a>
          <ExternalLinkAltIcon></ExternalLinkAltIcon>.
        </Text>
      </TextContent>
      <Bullseye className="pf-v5-u-mt-2xl pf-v5-u-mb-lg">
        <Spinner size="xl" />
      </Bullseye>
      <Alert
        variant="info"
        isInline
        title="You can close this modal. Follow the status of your instance on the AAP sandbox card."
      />
      <br />
      <Button
        variant="link"
        size="sm"
        component="span"
        isInline
        onClick={props.onClose}
        aria-label="Close"
      >
        Close
      </Button>
    </>
  );
}

function AnsibleAutomationPlatformReadyModalContent(props: {
  ansibleUIUser: string | undefined;
  onCopy: () => void;
  passwordHidden: boolean;
  ansibleUIPassword: string;
  onHidePasswordClick: () => void;
  onOpenUIClick: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <TextContent>
        <Text className={'pf-v5-u-mb-lg'} component={TextVariants.p}>
          Next:
        </Text>
      </TextContent>
      <TextContent className="instructions">
        <TextList
          component={TextListVariants.ol}
          className={`instructions__list pf-v5-u-max-width`}
        >
          <TextListItem className={'instructions__list-item-simple'}>
            <div className="instructions__list-item-contents">
              <TextContent>
                <Text component={TextVariants.p}>
                  <b>Log in to your AAP trial instance</b>
                </Text>
                <AnalyticsButton
                  onClick={props.onOpenUIClick}
                  variant={'secondary'}
                  className="pf-v5-u-w-100 pf-v5-u-w-initial-on-sm"
                  analytics={{
                    event: 'DevSandbox Ansible UI Start',
                  }}
                >
                  Log in to Ansible Automation Platform <ExternalLinkAltIcon></ExternalLinkAltIcon>
                </AnalyticsButton>
              </TextContent>

              <TextContent className={'pf-v5-u-mt-md pf-v5-u-mb-lg'}>
                <Text component={TextVariants.p}>
                  Use the following credentials to log in to your AAP instance:
                </Text>
              </TextContent>
              <TextContent>
                <Text component={TextVariants.small}>
                  Username:
                  <ClipboardCopy
                    isReadOnly
                    className={'pf-v5-u-ml-xs'}
                    hoverTip="Copy"
                    clickTip="Copied"
                    variant="inline-compact"
                    isCode
                  >
                    {props.ansibleUIUser}
                  </ClipboardCopy>
                </Text>
              </TextContent>
              <TextContent className={'pf-v5-u-mb-xl'}>
                <Text component={TextVariants.small}>
                  Password:
                  <ClipboardCopy
                    isReadOnly
                    className={'pf-v5-u-ml-sm pf-v5-u-mr-0'}
                    hoverTip="Copy"
                    clickTip="Copied"
                    variant="inline-compact"
                    aria-label={'Copy password'}
                    isCode
                    onCopy={props.onCopy}
                  >
                    {props.passwordHidden
                      ? '*'.repeat(props.ansibleUIPassword.length)
                      : props.ansibleUIPassword}
                  </ClipboardCopy>
                  <Button
                    className={'pf-v5-u-pl-xs'}
                    variant="plain"
                    onClick={props.onHidePasswordClick}
                    aria-label={props.passwordHidden ? 'Show password' : 'Hide password'}
                    icon={props.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
                  ></Button>
                </Text>
              </TextContent>
            </div>
          </TextListItem>

          <TextListItem className={'instructions__list-item-simple'}>
            <div className="instructions__list-item-contents">
              <TextContent className={'pf-v5-u-mb-xl'}>
                <Text component={TextVariants.p}>
                  <b>Activate your instance </b>
                </Text>
                <Text component={TextVariants.p}>
                  Activate your AAP instance using your Red Hat Hybrid Cloud Console credentials.
                </Text>
              </TextContent>
            </div>
          </TextListItem>

          <TextListItem className={'instructions__list-item-simple'}>
            <div className="instructions__list-item-contents">
              <TextContent className={'pf-v5-u-mb-xl'}>
                <Text component={TextVariants.p}>
                  <b>Enjoy your AAP sandbox!</b>
                </Text>
                <Text component={TextVariants.p}>Instance will time out after 11 hours.</Text>
              </TextContent>
            </div>
          </TextListItem>
        </TextList>
      </TextContent>
      <TextContent>
        <Text component={TextVariants.small}>
          Access the information again by clicking the <b>Launch</b> button on the Ansible
          Automation Platform sandbox card.
        </Text>
      </TextContent>
      <br />
      <Button
        variant="link"
        size="sm"
        component="span"
        isInline
        onClick={props.onClose}
        aria-label="Close"
      >
        Close
      </Button>
    </>
  );
}

/**
 * provisioning status indicates that the AAP instance is still provisioning/booting.
 */
export const ANSIBLE_PROVISIONING_STATUS = 'provisioning';
/**
 * the unknown status might indicate that the AAP instance is still provisioning/booting and, it doesn't have a status condition yet.
 */
export const ANSIBLE_UNKNOWN_STATUS = 'unknown';
/**
 * the ready status indicates that the AAP instance is ready to be used.
 */
export const ANSIBLE_READY_STATUS = 'ready';

const AAPModal = ({ onClose, initialStatus }: Props) => {
  const [error, setError] = React.useState<string | undefined>();
  const { getSignupData } = useRegistrationService();
  const { getAAPData, getSecret } = useKubeApi();
  const [status, setStatus] = React.useState<string>(
    initialStatus ? initialStatus : ANSIBLE_PROVISIONING_STATUS,
  );
  const [ansibleUILink, setAnsibleUILink] = React.useState<string | undefined>();
  const [ansibleUIUser, setAnsibleUIUser] = React.useState<string>();
  const [ansibleUIPassword, setAnsibleUIPassword] = React.useState<string>('');
  const [passwordHidden, setPasswordHidden] = React.useState(true);
  const handleSetAAPCRError = (errorDetails: string) => {
    setError(errorDetails);
  };

  const getAAPDataFn = React.useCallback(async () => {
    try {
      const signupData = await getSignupData();
      if (signupData == undefined) {
        setError('Unable to retrieve signup data.');
        return;
      }
      const data = await getAAPData(signupData.defaultUserNamespace);
      const status = getReadyCondition(data, handleSetAAPCRError);
      setStatus(status);
      if (data != undefined && data.items.length > 0 && data.items[0].status != undefined) {
        // set UI link if available
        if (data.items[0].status.URL) {
          setAnsibleUILink(data.items[0].status.URL);
        }
        // set the user for accessing the UI
        if (data.items[0].status.adminUser) {
          setAnsibleUIUser(data.items[0].status.adminUser);
        }
        // set the password for the UI user
        if (data.items[0].status.adminPasswordSecret) {
          const adminSecret = await getSecret(
            signupData.defaultUserNamespace,
            data.items[0].status.adminPasswordSecret,
          );
          if (adminSecret != undefined && adminSecret.data != undefined) {
            setAnsibleUIPassword(decode(adminSecret.data.password));
          }
        }
      }
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  React.useEffect(() => {
    if (
      status === ANSIBLE_PROVISIONING_STATUS ||
      status === ANSIBLE_UNKNOWN_STATUS ||
      status == ''
    ) {
      const handle = setInterval(getAAPDataFn, SHORT_INTERVAL);
      return () => {
        clearInterval(handle);
      };
    }
  }, [status]);

  return (
    <Modal
      data-testid="aap-modal"
      variant={'small'}
      aria-labelledby="aap-modal-title"
      header={
        // custom title to prevent ellipsis overflow on small screens
        <Title id="aap-modal-title" headingLevel="h1">
          {status === ANSIBLE_READY_STATUS ? (
            <>
              <Icon className={'pf-v5-u-mr-md'} status="success">
                <CheckCircleIcon />
              </Icon>
              Ansible Automation Platform instance provisioned
            </>
          ) : (
            'Provisioning Ansible Automation Platform (AAP) instance'
          )}
        </Title>
      }
      isOpen
      onClose={() => onClose()}
    >
      {error ? (
        <Alert
          title="An error occurred"
          variant={AlertVariant.danger}
          actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
          isInline
          className="pf-v5-u-mb-lg"
        >
          {error}
        </Alert>
      ) : null}
      {(() => {
        switch (status) {
          case ANSIBLE_PROVISIONING_STATUS:
          case ANSIBLE_UNKNOWN_STATUS:
            return <AnsibleAutomationPlatformProvisioningModalContent onClose={onClose} />;

          case ANSIBLE_READY_STATUS:
            return (
              <AnsibleAutomationPlatformReadyModalContent
                onCopy={() => {
                  navigator.clipboard.writeText(ansibleUIPassword);
                }}
                passwordHidden={passwordHidden}
                ansibleUIUser={ansibleUIUser}
                ansibleUIPassword={ansibleUIPassword}
                onHidePasswordClick={() => setPasswordHidden(!passwordHidden)}
                onOpenUIClick={() => {
                  window.open(ansibleUILink, '_blank');
                }}
                onClose={onClose}
              />
            );
          default:
            return null;
        }
      })()}
    </Modal>
  );
};

export default AAPModal;
