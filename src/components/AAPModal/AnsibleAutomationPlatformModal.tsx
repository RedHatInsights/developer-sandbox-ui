import * as React from 'react';
import {Buffer} from "buffer";
import {Alert, AlertActionCloseButton, AlertVariant} from '@patternfly/react-core/dist/dynamic/components/Alert';
import {Bullseye} from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import {Modal} from '@patternfly/react-core/dist/dynamic/components/Modal';
import {Spinner} from '@patternfly/react-core/dist/dynamic/components/Spinner';
import {Text, TextContent, TextVariants} from '@patternfly/react-core/dist/dynamic/components/Text';
import {Title} from '@patternfly/react-core/dist/dynamic/components/Title';
import {errorMessage} from '../../utils/utils';
import {AAPData, StatusCondition} from "../../services/kube-api";
import {LONG_INTERVAL, SHORT_INTERVAL} from '../../utils/const';
import useKubeApi from "../../hooks/useKubeApi";
import {Button, ClipboardCopy} from '@patternfly/react-core';
import useRegistrationService from "../../hooks/useRegistrationService";
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import AnalyticsButton from "../AnalyticsButton/AnalyticsButton";
import {ExternalLinkAltIcon} from "@patternfly/react-icons";
import {getReadyCondition} from "../../utils/conditions";

type Props = {
    initialStatus?: string;
    onClose: (aapData?: AAPData) => void;
};

const decode = (str: string): string => Buffer.from(str, 'base64').toString('binary');

const AAPModal = ({onClose, initialStatus}: Props) => {
    const [error, setError] = React.useState<string | undefined>();
    const {getSignupData} = useRegistrationService();
    const {getAAPData, getSecret} = useKubeApi();
    const [status, setStatus] = React.useState<string>(initialStatus ? initialStatus : 'provisioning');
    const [ansibleUILink, setAnsibleUILink] = React.useState<string | undefined>();
    const [ansibleUIUser, setAnsibleUIUser] = React.useState<string>();
    const [ansibleUIPassword, setAnsibleUIPassword] = React.useState<string>("");
    const [passwordHidden, setPasswordHidden] = React.useState(true);
    const handleSetAAPCRError = (errorDetails: string) => {
        setError(errorDetails)
    }

    const getAAPDataFn = React.useCallback(async () => {
        try {
            let signupData = await getSignupData()
            if (signupData == undefined) {
                setError('Unable to retrieve signup data.');
                return
            }
            const data = await getAAPData(signupData.defaultUserNamespace);
            let status = getReadyCondition(data, handleSetAAPCRError)
            setStatus(status);
            if (data != undefined && data.items.length > 0 && data.items[0].status != undefined) {
                // set UI link if available
                if (data.items[0].status.URL) {
                    setAnsibleUILink(data.items[0].status.URL)
                }
                // set the user for accessing the UI
                if (data.items[0].status.adminUser) {
                    setAnsibleUIUser(data.items[0].status.adminUser)
                }
                // set the password for the UI user
                if (data.items[0].status.adminPasswordSecret) {
                    let adminSecret = await getSecret(signupData.defaultUserNamespace, data.items[0].status.adminPasswordSecret)
                    if (adminSecret != undefined && adminSecret.data != undefined) {
                        setAnsibleUIPassword(decode(adminSecret.data.password))
                    }
                }
            }

        } catch (e) {
            setError(errorMessage(e));
        }
    }, []);


    React.useEffect(() => {
        if (status === 'provisioning' || status === 'unknown' || status == '') {
            const handle = setInterval(getAAPDataFn, SHORT_INTERVAL);
            return () => {
                clearInterval(handle);
            };
        }
    }, [status]);

    return (
        <Modal
            data-testid="aap-modal"
            width={600}
            aria-labelledby="aap-modal-title"
            header={
                // custom title to prevent ellipsis overflow on small screens
                <Title id="aap-modal-title" headingLevel="h1">
                    {status === 'ready'
                        ? "Ansible Automation Platform instance provisioned"
                        : 'Provisioning Ansible Automation Platform (AAP) instance'}
                </Title>
            }
            isOpen
            onClose={() => onClose()}
        >
            {error ? (
                <Alert
                    title="An error occurred"
                    variant={AlertVariant.danger}
                    actionClose={<AlertActionCloseButton onClose={() => setError(undefined)}/>}
                    isInline
                    className="pf-v5-u-mb-lg"
                >
                    {error}
                </Alert>
            ) : null}
            {(() => {
                switch (status) {
                    case 'provisioning':
                    case 'unknown':
                        return (
                            <>
                                <TextContent>
                                    <Text component={TextVariants.p}>
                                        Your AAP instance might take up to 30 minutes to provision.
                                        Once ready, your instance will be automatically turned off after 12 hours.
                                        <br/>
                                        While you wait, start your prerequisite AAP trial subscription.
                                    </Text>
                                    <Text component={TextVariants.p}>
                                        <a target="_blank" rel="noreferrer">Start AAP Trial
                                            subscription <ExternalLinkAltIcon></ExternalLinkAltIcon></a>
                                    </Text>
                                </TextContent>
                                <Bullseye className="pf-v5-u-mt-2xl pf-v5-u-mb-lg">
                                    <Spinner size="xl"/>
                                </Bullseye>
                                <TextContent>
                                    <Text component={TextVariants.small}>
                                        You can close this modal, and follow the status from the AAP card on the screen
                                        in the background.
                                    </Text>
                                </TextContent>
                                <Button
                                    variant="link"
                                    size="sm"
                                    component="span"
                                    isInline
                                    onClick={(event) => onClose()}
                                    aria-label="Close"
                                >Close
                                </Button>
                            </>
                        );

                    case 'ready':
                        return (
                            <>
                                <TextContent>
                                    <Text component={TextVariants.p}>
                                        Use the following credentials to log into the Ansible Portal.
                                    </Text>
                                </TextContent>
                                &nbsp;
                                <TextContent>
                                    <Text component={TextVariants.p}>
                                        Username: &nbsp;
                                        <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied"
                                                       variant="inline-compact"
                                                       isCode>
                                            {ansibleUIUser}
                                        </ClipboardCopy>
                                    </Text>
                                </TextContent>
                                <TextContent>
                                    <Text component={TextVariants.p}>
                                        Password: &nbsp;
                                        <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied"
                                                       variant="inline-compact"
                                                       isCode
                                                       onCopy={() => {
                                                           navigator.clipboard.writeText(ansibleUIPassword)
                                                       }}
                                        >
                                            {passwordHidden ? "*".repeat(ansibleUIPassword.length) : ansibleUIPassword}
                                        </ClipboardCopy>

                                        <Button variant="plain"
                                                onClick={() => setPasswordHidden(!passwordHidden)}
                                                aria-label={passwordHidden ? 'Show password' : 'Hide password'}
                                                icon={passwordHidden ? <EyeIcon/> : <EyeSlashIcon/>}

                                        ></Button>
                                    </Text>
                                    &nbsp;
                                </TextContent>
                                <TextContent>
                                    <AnalyticsButton
                                        onClick={() => {
                                            window.open(ansibleUILink, '_blank');
                                        }}
                                        className="pf-v5-u-w-100 pf-v5-u-w-initial-on-sm"
                                        analytics={{
                                            event: 'DevSandbox Ansible UI Start',
                                        }}
                                    >
                                        Go to Ansible Automation Platform <ExternalLinkAltIcon></ExternalLinkAltIcon>
                                    </AnalyticsButton>

                                </TextContent>
                                <br/>
                                <TextContent>
                                    <Text component={TextVariants.small}>
                                        12 hours remaining until the instance will be automatically turned off.
                                    </Text>
                                </TextContent>
                            </>
                        );
                    default:
                        return null;
                }
            })()}
        </Modal>
    );
};

export default AAPModal;
