import * as React from 'react';
import { Gallery, GalleryItem } from '@patternfly/react-core';
import {
  Button,
  HelperText,
  HelperTextItem,
  Icon,
  Spinner,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { useFlag } from '@unleash/proxy-client-react';
import { ANSIBLE_ID, OPENSHIFT_AI_ID, useSandboxServices } from '../../hooks/useSandboxServices';
import ServiceCard, { ButtonsFuncOptions } from './ServiceCard';
import AAPModal, {
  ANSIBLE_PROVISIONING_STATUS,
  ANSIBLE_READY_STATUS,
  ANSIBLE_UNKNOWN_STATUS,
} from '../AAPModal/AnsibleAutomationPlatformModal';
import useKubeApi from '../../hooks/useKubeApi';
import { getReadyCondition } from '../../utils/conditions';
import { SHORT_INTERVAL } from '../../utils/const';
import AnalyticsButton from '../AnalyticsButton/AnalyticsButton';
import { CheckIcon } from '@patternfly/react-icons';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { AxiosError } from 'axios';
import { errorMessage } from '../../utils/utils';
import { useRegistrationContext } from '../../hooks/useRegistrationContext';
import useAxios, { InstanceAPI } from '../../hooks/useAxios';
import { DeploymentData, StatefulSetData } from '../../services/kube-api';

type Props = {
  isDisabled?: boolean;
};

const AAPTrialButton = () => {
  return (
    <>
      <TextContent>
        <Text component={TextVariants.p}>
          <b>
            Note: Requires AAP trial
            <span style={{ color: 'red' }}>*</span>
          </b>
        </Text>
      </TextContent>
      <br />
      <AnalyticsButton
        component="a"
        href={'https://www.redhat.com/en/technologies/management/ansible/dev-sandbox/trial'}
        className="pf-v5-u-mr-md"
        rel="noopener"
        analytics={{
          event: 'DevSandbox AAP Start Trial',
          properties: {
            name: `DevSandbox AAP Start Trial`,
            url: '',
          },
        }}
      >
        Get AAP Trial
      </AnalyticsButton>
    </>
  );
};

const AAPCancelProvisioningButton = (props: { onClick: () => Promise<void> }) => {
  return (
    <>
      <Button
        className={'pf-v5-u-mr-xl'}
        variant="control"
        size="sm"
        component="span"
        isInline
        onClick={props.onClick}
        aria-label="Cancel"
      >
        Cancel
      </Button>
    </>
  );
};

const AAPLaunchButton = (props: { onClick: () => void }) => {
  return (
    <>
      <Button
        className={'pf-v5-u-mr-md'}
        component="a"
        isInline
        onClick={props.onClick}
        aria-label="Launch"
      >
        Launch
      </Button>
    </>
  );
};

const AAPProvisionButton = (props: {
  disabled: boolean;
  href: string | undefined;
  onClick: (() => void) | undefined;
  title: string;
  subtitle: string;
}) => {
  return (
    <>
      <TextContent>
        <Text component={TextVariants.p}>
          <b>Note:</b> instance might take up to 30 minutes to provision.
          <span style={{ color: 'red' }}>*</span>
        </Text>
      </TextContent>
      <br />
      <AnalyticsButton
        component="a"
        isDisabled={props.disabled}
        href={props.href}
        className="pf-v5-u-mr-md"
        target="_blank"
        rel="noopener"
        onClick={props.onClick}
        analytics={{
          event: 'DevSandbox Service Launch',
          properties: {
            name: `${props.title} ${props.subtitle}`,
            url: props.href ? '' : '',
          },
        }}
      >
        Provision
      </AnalyticsButton>
    </>
  );
};

const ServiceCatalog = ({ isDisabled }: Props) => {
  const { auth } = useChrome();
  const [showAAPModal, setShowAAPModal] = React.useState(false);
  const handleShowAAPModal = () => {
    setShowAAPModal(true);
  };
  const handleCloseAAPModal = () => {
    setShowAAPModal(false);
  };
  const services = useSandboxServices(handleShowAAPModal);
  const disableAI = useFlag('platform.sandbox.openshift-ai-disabled');
  const { getAAPData, getDeployments, getStatefulSets, getPersistentVolumeClaims } = useKubeApi();
  const [AAPStatus, setAAPStatus] = React.useState<string>('');
  const [AAPTrialEnabled, setAAPTrialEnabled] = React.useState<boolean>(false);
  const axiosInstance = useAxios(InstanceAPI.KUBE_API);
  const [{ signupData }, api] = useRegistrationContext();
  const handleSetAAPCRError = (errorDetails: string) => {
    api.setError(errorDetails);
  };

  async function deleteSecretsAndPVCs(
    k8sObjects: StatefulSetData | DeploymentData | void,
    userNamespace: string,
  ) {
    if (k8sObjects && k8sObjects.items.length > 0) {
      for (const itemKey in k8sObjects.items) {
        const k8sObject = k8sObjects.items[itemKey];
        if (
          k8sObject.spec.template != undefined &&
          k8sObject.spec.template.spec.volumes != undefined
        ) {
          const volumes = k8sObject.spec.template.spec.volumes;
          for (const volumeKey in volumes) {
            const volume = volumes[volumeKey];
            // delete pvc if any
            if (volume.persistentVolumeClaim != undefined) {
              await axiosInstance
                .delete(
                  `/api/v1/namespaces/${userNamespace}/persistentvolumeclaims/${volume.persistentVolumeClaim.claimName}`,
                )
                .catch((error: AxiosError) => {
                  // 404 errors get ignored when deleting
                  if (error.response && error.response.status != 404) {
                    api.setError(
                      errorMessage(error) || "Error while cleaning up pvc's. Please try again.",
                    );
                  }
                });
            }
            // delete secret if any
            if (volume.secret != undefined) {
              await axiosInstance
                .delete(`/api/v1/namespaces/${userNamespace}/secrets/${volume.secret.secretName}`)
                .catch((error: AxiosError) => {
                  // 404 errors get ignored when deleting
                  if (error.response && error.response.status != 404) {
                    api.setError(
                      errorMessage(error) || 'Error while cleaning up secrets. Please try again.',
                    );
                  }
                });
            }
          }
        }
      }
    }
  }

  async function deletePVCsForSTS(k8sObjects: StatefulSetData | void, userNamespace: string) {
    if (k8sObjects && k8sObjects.items.length > 0) {
      for (const itemKey in k8sObjects.items) {
        const k8sObject = k8sObjects.items[itemKey];
        if (k8sObject.spec.volumeClaimTemplates != undefined) {
          for (const vck in k8sObject.spec.volumeClaimTemplates) {
            const volumeClaim = k8sObject.spec.volumeClaimTemplates[vck];
            const pvcs = await getPersistentVolumeClaims(
              userNamespace,
              '?labelSelector=app.kubernetes.io%2Fname%3D' + volumeClaim.metadata.name,
            );
            // the pvc name of a steatefulset is composed by statefulsetname and pvc name from the template
            if (pvcs != undefined && pvcs.items.length > 0) {
              for (const pvck in pvcs.items) {
                const pvc = pvcs.items[pvck];
                await axiosInstance
                  .delete(
                    `/api/v1/namespaces/${userNamespace}/persistentvolumeclaims/${pvc.metadata.name}`,
                  )
                  .catch((error: AxiosError) => {
                    // 404 errors get ignored when deleting
                    if (error.response && error.response.status != 404) {
                      api.setError(
                        errorMessage(error) ||
                          'Error while cleaning the sts pvc. Please try again.',
                      );
                    }
                  });
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
      return;
    }
    api.setError(undefined);

    // TODO: this might be removed in the future,
    // Let's get the deployments before deleting the AAP CR
    // and the statefulsets, so that we can retrieve the names of secrets and pvcs used by those.
    const aapLabelSelector =
      'app.kubernetes.io%2Fmanaged-by+in+%28aap-gateway-operator%2Caap-operator%2Cautomationcontroller-operator%2Cautomationhub-operator%2Ceda-operator%2Clightspeed-operator%29&limit=50';
    const aapDeployments = await getDeployments(
      signupData.defaultUserNamespace,
      aapLabelSelector,
    ).catch((reason: AxiosError) => {
      api.setError(errorMessage(reason) || 'Error while listing deployments. Please try again.');
    });
    const aapStatefulSets = await getStatefulSets(
      signupData.defaultUserNamespace,
      aapLabelSelector,
    ).catch((reason: AxiosError) => {
      api.setError(errorMessage(reason) || 'Error while listing statefulsets. Please try again.');
    });

    // delete the AAP CR
    await axiosInstance
      .delete(
        `/apis/aap.ansible.com/v1alpha1/namespaces/${signupData.defaultUserNamespace}/ansibleautomationplatforms/sandbox-aap`,
      )
      .catch((reason: AxiosError) => {
        api.setError(
          errorMessage(reason) || 'Error while deleting AAP instance. Please try again.',
        );
      });

    // after deleting the AAP CR some pvcs and secrets are not cleaned properly
    // so let's delete those explicitly
    await deleteSecretsAndPVCs(aapDeployments, signupData.defaultUserNamespace);
    await deleteSecretsAndPVCs(aapStatefulSets, signupData.defaultUserNamespace);
    await deletePVCsForSTS(aapStatefulSets, signupData.defaultUserNamespace);
  };

  const getAAPDataFn = React.useCallback(async () => {
    try {
      if (signupData == undefined) {
        api.setError('Unable to retrieve signup data.');
        return;
      }
      const user = await auth.getUser();
      if (user == undefined) {
        api.setError('Unable to retrieve chrome user data.');
        return;
      }
      setAAPTrialEnabled(user.entitlements.ansible.is_entitled);
      const data = await getAAPData(signupData.defaultUserNamespace);
      const status = getReadyCondition(data, handleSetAAPCRError);
      setAAPStatus(status);
    } catch (e) {
      api.setError(errorMessage(e));
    }
  }, []);

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
            url: o.launchUrl ? o.launchUrl : '',
          },
        }}
      >
        Launch
      </AnalyticsButton>
    );
  };

  const AAPButtonsFunc = (o: ButtonsFuncOptions) => {
    // the user has first to enable the trial subscription
    // before launching the AAP instance
    if (!AAPTrialEnabled) {
      return <AAPTrialButton />;
    }

    switch (o.status) {
      case ANSIBLE_PROVISIONING_STATUS:
      case ANSIBLE_UNKNOWN_STATUS:
        return <AAPCancelProvisioningButton onClick={deleteAAPInstance} />;
      case ANSIBLE_READY_STATUS:
        return <AAPLaunchButton onClick={handleShowAAPModal} />;
      default:
        return (
          <AAPProvisionButton
            disabled={o.showDisabledButton}
            href={o.launchUrl}
            onClick={o.onClickFunc}
            title={o.title}
            subtitle={o.subtitle}
          />
        );
    }
  };

  return (
    <>
      {showAAPModal ? <AAPModal initialStatus={''} onClose={handleCloseAAPModal} /> : null}
      <Gallery hasGutter minWidths={{ default: '330px' }}>
        {services.map((service) => {
          const shouldDisableAI = service.id === OPENSHIFT_AI_ID && disableAI;

          const buttonOptions: ButtonsFuncOptions = {
            title: service.title,
            subtitle: service.subtitle,
            showDisabledButton: shouldDisableAI,
            launchUrl: isDisabled ? undefined : service.launchUrl,
            status: service.id == ANSIBLE_ID ? AAPStatus : '',
            onClickFunc: service.onClickFunc,
          };

          const helperTextFunc = shouldDisableAI
            ? () => {
                return (
                  <HelperText>
                    <HelperTextItem variant="indeterminate" className="pf-v5-u-mb-lg">
                      OpenShift AI is temporarily unavailable, but&nbsp;will return soon.
                    </HelperTextItem>
                  </HelperText>
                );
              }
            : undefined;

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
                status={service.id == ANSIBLE_ID ? AAPStatus : ''}
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
              <Spinner className={'pf-v5-u-mr-sm'} size="sm" aria-label="Provisioning" />
              Provisioning...
            </Text>
          </TextContent>
          <br />
        </>
      );

    case 'ready':
      return (
        <>
          <TextContent>
            <Text component={TextVariants.p}>
              <Icon className={'pf-v5-u-mr-sm'} status="success">
                <CheckIcon />
              </Icon>
              Ready
            </Text>
          </TextContent>
          <br />
        </>
      );
    default:
      return <></>;
  }
}

export default ServiceCatalog;
