import * as React from 'react';
import {Gallery, GalleryItem} from '@patternfly/react-core/dist/dynamic/layouts/Gallery';
import {HelperText, HelperTextItem} from '@patternfly/react-core/dist/dynamic/components/HelperText';
import {useFlag} from '@unleash/proxy-client-react';
import {ANSIBLE_ID, OPENSHIFT_AI_ID, useSandboxServices} from '../../hooks/useSandboxServices';
import ServiceCard, {ButtonsFuncOptions} from './ServiceCard';
import AAPModal from "../AAPModal/AnsibleAutomationPlatformModal";
import useKubeApi from "../../hooks/useKubeApi";
import {getReadyCondition} from "../../utils/conditions";
import {SHORT_INTERVAL} from "../../utils/const";
import AnalyticsButton from "../AnalyticsButton/AnalyticsButton";
import {Text, TextContent, TextVariants} from "@patternfly/react-core/dist/esm/components/Text";
import {Spinner} from "@patternfly/react-core/dist/esm/components/Spinner";
import {Button, Icon} from "@patternfly/react-core";
import CheckIcon from "@patternfly/react-icons/dist/esm/icons/check-icon";
import {AxiosError} from "axios";
import {errorMessage} from "../../utils/utils";
import {useRegistrationContext} from "../../hooks/useRegistrationContext";
import useAxios, {InstanceAPI} from "../../hooks/useAxios";
import {DeploymentData, StatefulSetData} from "../../services/kube-api";

type Props = {
    isDisabled?: boolean;
};

const ServiceCatalog = ({isDisabled}: Props) => {
    const [showAAPModal, setShowAAPModal] = React.useState(false);
    const handleShowAAPModal = () => {
        setShowAAPModal(true)
    }
    const handleCloseAAPModal = () => {
        setShowAAPModal(false)
    }
    const services = useSandboxServices(handleShowAAPModal);
    const disableAI = useFlag('platform.sandbox.openshift-ai-disabled');
    const {getAAPData, getDeployments, getStatefulSets, getPersistentVolumeClaims} = useKubeApi();
    const [AAPStatus, setAAPStatus] = React.useState<string>('');
    const axiosInstance = useAxios(InstanceAPI.KUBE_API);
    const [{signupData}, api] = useRegistrationContext();
    const handleSetAAPCRError = (errorDetails: string) => {
         api.setError(errorDetails)
    }

    async function deleteSecretsAndPVCs(k8sObjects: StatefulSetData | DeploymentData | void, userNamespace: string) {
        if (k8sObjects && k8sObjects.items.length > 0) {
            for (const itemKey in k8sObjects.items) {
                const k8sObject = k8sObjects.items[itemKey]
                if (k8sObject.spec.template != undefined && k8sObject.spec.template.spec.volumes != undefined) {
                    const volumes = k8sObject.spec.template.spec.volumes
                    for (const volumeKey in volumes) {
                        const volume = volumes[volumeKey]
                        // delete pvc if any
                        if (volume.persistentVolumeClaim != undefined) {
                            await axiosInstance.delete(`/api/v1/namespaces/${userNamespace}/persistentvolumeclaims/${volume.persistentVolumeClaim.claimName}`).catch((error: AxiosError) => {
                                // 404 errors get ignored when deleting
                                if (error.response && error.response.status != 404) {
                                    api.setError(
                                        errorMessage(error) ||
                                        'Error while cleaning up pvc\'s. Please try again.',
                                    );
                                }
                            })
                        }
                        // delete secret if any
                        if (volume.secret != undefined) {
                            await axiosInstance.delete(`/api/v1/namespaces/${userNamespace}/secrets/${volume.secret.secretName}`).catch((error: AxiosError) => {
                                // 404 errors get ignored when deleting
                                if (error.response && error.response.status != 404) {
                                    api.setError(
                                        errorMessage(error) ||
                                        'Error while cleaning up secrets. Please try again.',
                                    );
                                }
                            })
                        }
                    }
                }
            }
        }
    }

    async function deletePVCsForSTS(k8sObjects: StatefulSetData | void, userNamespace: string) {
        if (k8sObjects && k8sObjects.items.length > 0) {
            for (const itemKey in k8sObjects.items) {
                const k8sObject = k8sObjects.items[itemKey]
                if (k8sObject.spec.volumeClaimTemplates != undefined) {
                    for (const vck in k8sObject.spec.volumeClaimTemplates) {
                        const volumeClaim = k8sObject.spec.volumeClaimTemplates[vck]
                        const pvcs = await getPersistentVolumeClaims(userNamespace, "?labelSelector=app.kubernetes.io%2Fname%3D" + volumeClaim.metadata.name)
                        // the pvc name of a steatefulset is composed by statefulsetname and pvc name from the template
                        if (pvcs != undefined && pvcs.items.length > 0) {
                            for (const pvck in pvcs.items) {
                                const pvc = pvcs.items[pvck]
                                await axiosInstance.delete(`/api/v1/namespaces/${userNamespace}/persistentvolumeclaims/${pvc.metadata.name}`).catch((error: AxiosError) => {
                                    // 404 errors get ignored when deleting
                                    if (error.response && error.response.status != 404) {
                                        api.setError(
                                            errorMessage(error) ||
                                            'Error while cleaning the sts pvc. Please try again.',
                                        );
                                    }
                                })
                            }
                        }
                    }
                }
            }
        }
    }

    const deleteAAPInstance = async () => {
        // Deleting the AAP instance means:
        // 1. Deleting the AAP CR
        // 2. Cleanup the leftovers ( pvcs, secrets atm ) - this might be fixed in the future and not needed anymore
        if (signupData == undefined) {
            api.setError('Unable to retrieve signup data.');
            return
        }
        api.setError(undefined);

        // TODO: this might be removed in the future,
        // Let's get the deployments before deleting the AAP CR
        // and the statefulsets, so that we can retrieve the names of secrets and pvcs used by those.
        const aapLabelSelector = 'app.kubernetes.io%2Fmanaged-by+in+%28aap-gateway-operator%2Caap-operator%2Cautomationcontroller-operator%2Cautomationhub-operator%2Ceda-operator%2Clightspeed-operator%29&limit=50';
        let aapDeployments = await getDeployments(signupData.defaultUserNamespace, aapLabelSelector).catch((reason: AxiosError) => {
            api.setError(
                errorMessage(reason) ||
                'Error while listing deployments. Please try again.',
            );
        })
        let aapStatefulSets = await getStatefulSets(signupData.defaultUserNamespace, aapLabelSelector).catch((reason: AxiosError) => {
            api.setError(
                errorMessage(reason) ||
                'Error while listing statefulsets. Please try again.',
            );
        })

        // delete the AAP CR
        await axiosInstance.delete(`/apis/aap.ansible.com/v1alpha1/namespaces/${signupData.defaultUserNamespace}/ansibleautomationplatforms/sandbox-aap`).catch((reason: AxiosError) => {
            api.setError(
                errorMessage(reason) ||
                'Error while deleting AAP instance. Please try again.',
            );
        })


        // after deleting the AAP CR some pvcs and secrets are not cleaned properly
        // so let's delete those explicitly
        await deleteSecretsAndPVCs(aapDeployments, signupData.defaultUserNamespace);
        await deleteSecretsAndPVCs(aapStatefulSets, signupData.defaultUserNamespace);
        await deletePVCsForSTS(aapStatefulSets, signupData.defaultUserNamespace);
    }

    const getAAPDataFn = React.useCallback(
        async () => {
            try {
                if (signupData == undefined) {
                    api.setError('Unable to retrieve signup data.');
                    return
                }
                const data = await getAAPData(signupData.defaultUserNamespace)
                let status = getReadyCondition(data, handleSetAAPCRError)
                setAAPStatus(status);
            } catch (e) {
                api.setError(errorMessage(e));
            }
        }
        , []);


    React.useEffect(() => {
        const handle = setInterval(getAAPDataFn, SHORT_INTERVAL);
        return () => {
            clearInterval(handle);
        };
    }, [AAPStatus]);

    const defaultLaunchButton = (o: ButtonsFuncOptions) => {
        return (
            <AnalyticsButton
                component="a"
                isDisabled={o.showDisabledButton}
                href={o.launchUrl}
                className="pf-v5-u-mr-md"
                target="_blank"
                rel="noopener"
                onClick={o.onClickFunc}
                analytics={{
                    event: 'DevSandbox Service Launch',
                    properties: {
                        name: `${o.title} ${o.subtitle}`,
                        url: o.launchUrl ? "" : "",
                    },
                }}
            >
                Launch
            </AnalyticsButton>
        );
    }

    const AAPButtonsFunc = ((o: ButtonsFuncOptions) => {
        switch (o.status) {
            case 'provisioning':
            case 'unknown':
                return (
                    <>
                        <Button
                            variant="control"
                            size="sm"
                            component="span"
                            isInline
                            onClick={deleteAAPInstance}
                            aria-label="Cancel"
                        >Cancel
                        </Button>
                        &nbsp;
                        &nbsp;
                    </>
                );
            case 'ready':
                return (
                    <>
                        <Button
                            variant="primary"
                            size="sm"
                            component="span"
                            isInline
                            onClick={handleShowAAPModal}
                            aria-label="Open"
                        >Open
                        </Button>
                        &nbsp;
                    </>
                );
            default:
                return defaultLaunchButton(o);
        }
    })

    return (
        <>
            {showAAPModal ? (
                <AAPModal
                    initialStatus={""}
                    onClose={handleCloseAAPModal}
                />
            ) : null}
            <Gallery hasGutter minWidths={{default: '330px'}}>
                {services.map((service) => {
                    const shouldDisableAI = service.id === OPENSHIFT_AI_ID && disableAI;

                    let buttonOptions: ButtonsFuncOptions = {
                        title: service.title,
                        subtitle: service.subtitle,
                        showDisabledButton: shouldDisableAI,
                        launchUrl: isDisabled ? undefined : service.launchUrl,
                        status: service.id == ANSIBLE_ID ? AAPStatus : "",
                        onClickFunc: service.onClickFunc,
                    }

                    let helperTextFunc = shouldDisableAI ? () => {
                        return (
                            <HelperText>
                                <HelperTextItem variant="indeterminate" className="pf-v5-u-mb-lg">
                                    OpenShift AI is temporarily unavailable, but&nbsp;will return
                                    soon.
                                </HelperTextItem>
                            </HelperText>
                        )
                    } : undefined


                    return (
                        <GalleryItem key={service.id}>
                            <ServiceCard
                                title={service.title}
                                subtitle={service.subtitle}
                                description={service.description}
                                iconUrl={service.iconUrl}
                                learnMoreUrl={service.learnMoreUrl}
                                launchUrl={isDisabled ? undefined : service.launchUrl}
                                buttonOptions={buttonOptions}
                                buttonsFunc={service.id == ANSIBLE_ID ? AAPButtonsFunc : defaultLaunchButton}
                                status={service.id == ANSIBLE_ID ? AAPStatus : ""}
                                helperText={service.id == ANSIBLE_ID ? getAAPStatusTextComponent : helperTextFunc}
                            />
                        </GalleryItem>
                    );
                })}
            </Gallery>
        </>
    );
};

function getAAPStatusTextComponent(status?: string): React.ReactElement {
    switch (status) {
        case 'provisioning':
        case 'unknown':
            return (
                <>
                    <TextContent>
                        <Text component={TextVariants.p}>
                            <Spinner size="sm" aria-label="Contents of the small example"/>
                            &nbsp;
                            Provisioning...
                        </Text>
                    </TextContent>
                    <br/>
                </>
            );

        case 'ready':
            return (
                <>
                    <TextContent>
                        <Text component={TextVariants.p}>
                            <Icon status="success">
                                <CheckIcon/>
                            </Icon>
                            &nbsp;
                            Ready
                        </Text>
                    </TextContent>
                    <br/>
                </>

            );
        default:
            return (
                <></>
            );
    }

}

export default ServiceCatalog;
