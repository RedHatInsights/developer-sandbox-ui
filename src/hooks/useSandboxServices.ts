import React from 'react';
import openShiftIconUrl from '../images/Product_Icon-Red_Hat-OpenShift-RGB.svg';
import dataScienceUrl from '../images/Product_Icon-Red_Hat-OpenShift_Data_Science-RGB.svg';
import devSpacesUrl from '../images/Product_Icon-Red_Hat-OpenShift_Dev_Spaces-RGB.svg';
import ansibleUrl from '../images/Product_Icon-Red_Hat-Ansible_Automation_Platform-RGB.svg';
import useAxios, { InstanceAPI } from './useAxios';
import { errorMessage } from '../utils/utils';
import { AxiosError } from 'axios';
import useKubeApi from './useKubeApi';
import { getReadyCondition } from '../utils/conditions';
import openshiftVirtualization from '../images/Product_Icon-Red_Hat-Openshift_virtualization-RGB.svg';
import { useRegistrationContext } from './useRegistrationContext';

export const OPENSHIFT_AI_ID = 'red-hat-data-science';
export const ANSIBLE_ID = 'red-hat-ansible-automation-platform';

export type Service = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconUrl: string;
  learnMoreUrl: string;
  launchUrl?: string;
  onClickFunc?: () => Promise<void>;
};

export const useSandboxServices = (handleShowAAPModal: () => void): Service[] => {
  const [{ signupData }, api] = useRegistrationContext();
  const axiosInstance = useAxios(InstanceAPI.KUBE_API);
  const { getAAPData } = useKubeApi();

  const handleAAPInstance = async () => {
    if (signupData == undefined) {
      api.setError('Unable to retrieve signup data.');
      return;
    }
    api.setError(undefined);
    const data = await getAAPData(signupData.defaultUserNamespace);
    const status = getReadyCondition(data, (errorDetails: string) => {
      api.setError(errorDetails);
    });

    if (status == 'idled' && data != undefined && data.items.length > 0) {
      // we need to un-idle the instance
      await axiosInstance
        .patch(
          `/apis/aap.ansible.com/v1alpha1/namespaces/${signupData.defaultUserNamespace}/ansibleautomationplatforms/${data.items[0].metadata.name}`,
          JSON.parse('{"spec":{"idle_aap":false}}'),
          {
            headers: { 'Content-type': 'application/merge-patch+json' },
          },
        )
        .catch((reason: AxiosError) => {
          api.setError(errorMessage(reason) || 'Error while resuming instance. Please try again.');
        })
        .finally(() => {
          handleShowAAPModal();
        });
      return;
    }

    // we need to provision a new instance
    await axiosInstance
      .post(
        `/apis/aap.ansible.com/v1alpha1/namespaces/${signupData.defaultUserNamespace}/ansibleautomationplatforms`,
        JSON.parse(AAPObject),
        {},
      )
      .catch((reason: AxiosError) => {
        // resource already exists (response code 409) it's bypassed,
        // we can ignore it since we only allow for 1 aap instance to be created
        if (reason.response!.status !== 409) {
          // report system error
          console.log(reason.message);
          api.setError(
            errorMessage(reason) || 'Error while creating AAP instance. Please try again.',
          );
        }
      })
      .finally(() => {
        handleShowAAPModal();
      });
  };

  return React.useMemo<Service[]>(
    () => [
      {
        id: 'red-hat-openshift',
        title: 'OpenShift',
        subtitle: '',
        description:
          'A cloud-native application platform with everything you need to manage your development life cycle securely, including standardized workflows, support for multiple environments, continuous integration, and release management.',
        iconUrl: openShiftIconUrl,
        learnMoreUrl: 'https://developers.redhat.com/products/openshift/overview',
        launchUrl:
          signupData?.consoleURL && signupData?.defaultUserNamespace
            ? `${signupData?.consoleURL}/add/ns/${signupData?.defaultUserNamespace}`
            : signupData?.consoleURL,
      },
      {
        id: 'red-hat-dev-spaces',
        title: 'Openshift Dev Spaces',
        subtitle: '',
        description:
          'A collaborative Kubernetes-native solution for rapid application development that delivers consistent developer environments on Red Hat OpenShift to allow anyone with a browser to contribute code in under two minutes.',
        iconUrl: devSpacesUrl,
        learnMoreUrl: 'https://developers.redhat.com/products/openshift-dev-spaces/overview',
        launchUrl: signupData?.cheDashboardURL,
      },
      {
        id: OPENSHIFT_AI_ID,
        title: 'OpenShift AI',
        subtitle: '',
        description:
          'OpenShift AI gives data scientists and developers a powerful AI/ML platform for building AI-enabled applications.',
        iconUrl: dataScienceUrl,
        learnMoreUrl: 'https://developers.redhat.com/products/red-hat-openshift-ai/overview ',
        launchUrl: signupData?.rhodsMemberURL,
      },
      {
        id: 'openshift-virtualization',
        title: 'OpenShift Virtualization',
        subtitle: '',
        description:
          'OpenShift Virtualization provides the scalable, enterprise-grade virtualization functionality in Red Hat OpenShift. You can use it to run and manage virtual machines (VMs) alongside containerized application instances and infrastructure.',
        iconUrl: openshiftVirtualization,
        learnMoreUrl: 'https://developers.redhat.com/products/openshift/virtualization',
        launchUrl: `${signupData?.consoleURL}/k8s/ns/${signupData?.defaultUserNamespace}/virtualization-overview`,
      },
      {
        id: ANSIBLE_ID,
        title: 'Ansible Automation Platform',
        subtitle: '',
        description:
          'A comprehensive solution for managing the content and execution of your strategic automation.',
        iconUrl: ansibleUrl,
        learnMoreUrl: 'https://developers.redhat.com/products/ansible/overview',
        onClickFunc: handleAAPInstance,
      },
    ],
    [signupData],
  );
};

// This is custom crafted AAP CR which is able to run properly with the sandbox environment constraints.
// In future release, some of these values might become defaults or they will be moved into webhooks.
// For the time being, they are being stored here in order to simplify the configuration and deployment for the end user.

const AAPObject: string = `
{
   "apiVersion":"aap.ansible.com/v1alpha1",
   "kind":"AnsibleAutomationPlatform",
   "metadata":{
      "name":"sandbox-aap"
   },
   "spec":{
      "idle_aap":false,
      "no_log":false,
      "api":{
         "replicas":1,
         "resource_requirements":{
            "requests":{
               "cpu":"100m",
               "memory":"256Mi"
            },
            "limits":{
               "cpu":"500m",
               "memory":"1000Mi"
            }
         }
      },
      "redis":{
         "replicas":1,
         "resource_requirements":{
            "requests":{
               "cpu":"100m",
               "memory":"256Mi"
            },
            "limits":{
               "cpu":"500m",
               "memory":"500Mi"
            }
         }
      },
      "database":{
         "replicas":1,
         "resource_requirements":{
            "requests":{
               "cpu":"100m",
               "memory":"256Mi"
            },
            "limits":{
               "cpu":"500m",
               "memory":"800Mi"
            }
         }
      },
      "controller":{
         "extra_settings":[
            {
               "setting":"DEFAULT_EXECUTION_QUEUE_POD_SPEC_OVERRIDE",
               "value":{
                  "resources":{
                     "limits":{
                        "cpu":"200m",
                        "memory":"500Mi"
                     },
                     "requests":{
                        "cpu":"220m",
                        "memory":"100Mi"
                     }
                  }
               }
            }
         ],
         "garbage_collect_secrets":true,
         "disabled":false,
         "uwsgi_processes":2,
         "task_resource_requirements":{
            "requests":{
               "cpu":"100m",
               "memory":"150Mi"
            },
            "limits":{
               "cpu":"1000m",
               "memory":"1200Mi"
            }
         },
         "web_resource_requirements":{
            "requests":{
               "cpu":"100m",
               "memory":"200Mi"
            },
            "limits":{
               "cpu":"200m",
               "memory":"1600Mi"
            }
         },
         "ee_resource_requirements":{
            "requests":{
               "cpu":"100m",
               "memory":"64Mi"
            },
            "limits":{
               "cpu":"1000m",
               "memory":"500Mi"
            }
         },
         "redis_resource_requirements":{
            "requests":{
               "cpu":"50m",
               "memory":"64Mi"
            },
            "limits":{
               "cpu":"100m",
               "memory":"200Mi"
            }
         },
         "rsyslog_resource_requirements":{
            "requests":{
               "cpu":"100m",
               "memory":"128Mi"
            },
            "limits":{
               "cpu":"500m",
               "memory":"250Mi"
            }
         },
         "init_container_resource_requirements":{
            "requests":{
               "cpu":"100m",
               "memory":"128Mi"
            },
            "limits":{
               "cpu":"500m",
               "memory":"200Mi"
            }
         }
      },
      "eda":{
         "disabled":false,
         "api":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"50m",
                  "memory":"350Mi"
               },
               "limits":{
                  "cpu":"500m",
                  "memory":"400Mi"
               }
            }
         },
         "ui":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"25m",
                  "memory":"64Mi"
               },
               "limits":{
                  "cpu":"500m",
                  "memory":"150Mi"
               }
            }
         },
         "scheduler":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"50m",
                  "memory":"200Mi"
               },
               "limits":{
                  "cpu":"500m",
                  "memory":"250Mi"
               }
            }
         },
         "worker":{
            "replicas":2,
            "resource_requirements":{
               "requests":{
                  "cpu":"25m",
                  "memory":"200Mi"
               },
               "limits":{
                  "cpu":"250m",
                  "memory":"250Mi"
               }
            }
         },
         "default_worker":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"25m",
                  "memory":"200Mi"
               },
               "limits":{
                  "cpu":"500m",
                  "memory":"400Mi"
               }
            }
         },
         "activation_worker":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"25m",
                  "memory":"150Mi"
               },
               "limits":{
                  "cpu":"500m",
                  "memory":"400Mi"
               }
            }
         },
         "event_stream":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"25m",
                  "memory":"150Mi"
               },
               "limits":{
                  "cpu":"100m",
                  "memory":"300Mi"
               }
            }
         }
      },
      "hub":{
         "redis_data_persistence":false,
         "disabled":false,
         "storage_type":"file",
         "file_storage_storage_class":"efs-sc",
         "file_storage_size":"10Gi",
         "api":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"150m",
                  "memory":"256Mi"
               },
               "limits":{
                  "cpu":"800m",
                  "memory":"500Mi"
               }
            }
         },
         "content":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"150m",
                  "memory":"256Mi"
               },
               "limits":{
                  "cpu":"800m",
                  "memory":"1200Mi"
               }
            }
         },
         "worker":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"150m",
                  "memory":"256Mi"
               },
               "limits":{
                  "cpu":"800m",
                  "memory":"400Mi"
               }
            }
         },
         "web":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"100m",
                  "memory":"256Mi"
               },
               "limits":{
                  "cpu":"500m",
                  "memory":"300Mi"
               }
            }
         },
         "redis":{
            "replicas":1,
            "resource_requirements":{
               "requests":{
                  "cpu":"100m",
                  "memory":"250Mi"
               },
               "limits":{
                  "cpu":"300m",
                  "memory":"400Mi"
               }
            }
         }
      }
   }
}
`;
