import * as React from 'react';
import openShiftIconUrl from '../images/Product_Icon-Red_Hat-OpenShift-RGB.svg';
import dataScienceUrl from '../images/Product_Icon-Red_Hat-OpenShift_Data_Science-RGB.svg';
import devSpacesUrl from '../images/Product_Icon-Red_Hat-OpenShift_Dev_Spaces-RGB.svg';
import ansibleUrl from '../images/Product_Icon-Red_Hat-Ansible_Automation_Platform-RGB.svg';
import {useRegistrationContext} from './useRegistrationContext';
import useAxios, {InstanceAPI} from "./useAxios";
import {errorMessage} from "../utils/utils";
import {AxiosError} from 'axios'


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

export const useSandboxServices = () => {
    const [{signupData}, api] = useRegistrationContext();
    const axiosInstance = useAxios(InstanceAPI.KUBE_API);

    const handleAAPInstance = async () => {
        if (signupData == undefined) {
            api.setError('Unable to retrieve signup data.');
            return
        }
        api.setError(undefined);
        await axiosInstance.post(`/apis/aap.ansible.com/v1alpha1/namespaces/${signupData.defaultUserNamespace}/ansibleautomationplatforms`, JSON.parse(AAPObject), {}).catch((reason: AxiosError) => {
            // resource already exists (response code 409) it's bypassed,
            // we can ignore it since we only allow for 1 aap instance to be created
            if (reason.response!.status !== 409) {
                // report system error
                console.log(reason.message)
                api.setError(
                    errorMessage(reason) ||
                    'Error while creating AAP instance. Please try again.',
                );
            }
        });
    }

    return React.useMemo<Service[]>(
        () => [
            {
                id: 'red-hat-openshift',
                title: 'Red Hat',
                subtitle: 'OpenShift',
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
                title: 'Red Hat',
                subtitle: 'Dev Spaces',
                description:
                    'A collaborative Kubernetes-native solution for rapid application development that delivers consistent developer environments on Red Hat OpenShift to allow anyone with a browser to contribute code in under two minutes.',
                iconUrl: devSpacesUrl,
                learnMoreUrl: 'https://developers.redhat.com/products/openshift-dev-spaces/overview',
                launchUrl: signupData?.cheDashboardURL,
            },
            {
                id: OPENSHIFT_AI_ID,
                title: 'Red Hat',
                subtitle: 'OpenShift AI',
                description:
                    'OpenShift AI gives data scientists and developers a powerful AI/ML platform for building AI-enabled applications.',
                iconUrl: dataScienceUrl,
                learnMoreUrl: 'https://developers.redhat.com/products/red-hat-openshift-ai/overview ',
                launchUrl: signupData?.rhodsMemberURL,
            },
            {
                id: ANSIBLE_ID,
                title: 'Red Hat',
                subtitle: 'Ansible Automation Platform',
                description:
                    'A comprehensive solution for managing the content and execution of your strategic automation.',
                iconUrl: ansibleUrl,
                learnMoreUrl: 'https://developers.redhat.com/products/ansible/overview',
                launchUrl: `${signupData?.consoleURL}k8s/ns/${signupData?.defaultUserNamespace}/aap.ansible.com~v1alpha1~AnsibleAutomationPlatform/dev-sandbox-aap`,
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
  "apiVersion": "aap.ansible.com/v1alpha1",
  "kind": "AnsibleAutomationPlatform",
  "metadata": {
    "name": "sandbox-aap"
  },
  "spec": {
    "no_log": false,
    "api": {
      "replicas": 1,
      "resource_requirements": {
        "requests": {
          "cpu": "100m",
          "memory": "256Mi"
        },
        "limits": {
          "cpu": "500m",
          "memory": "1000Mi"
        }
      }
    },
    "redis": {
      "replicas": 1,
      "resource_requirements": {
        "requests": {
          "cpu": "100m",
          "memory": "256Mi"
        },
        "limits": {
          "cpu": "500m",
          "memory": "500Mi"
        }
      }
    },
    "database": {
      "resource_requirements": {
        "requests": {
          "cpu": "100m",
          "memory": "256Mi"
        },
        "limits": {
          "cpu": "500m",
          "memory": "800Mi"
        }
      }
    },
    "controller": {
      "disabled": false,
      "uwsgi_processes": 2,
      "task_resource_requirements": {
        "requests": {
          "cpu": "100m",
          "memory": "150Mi"
        },
        "limits": {
          "cpu": "1000m",
          "memory": "1200Mi"
        }
      },
      "web_resource_requirements": {
        "requests": {
          "cpu": "100m",
          "memory": "200Mi"
        },
        "limits": {
          "cpu": "200m",
          "memory": "1600Mi"
        }
      },
      "ee_resource_requirements": {
        "requests": {
          "cpu": "100m",
          "memory": "64Mi"
        },
        "limits": {
          "cpu": "1000m",
          "memory": "500Mi"
        }
      },
      "redis_resource_requirements": {
        "requests": {
          "cpu": "50m",
          "memory": "64Mi"
        },
        "limits": {
          "cpu": "100m",
          "memory": "200Mi"
        }
      },
      "rsyslog_resource_requirements": {
        "requests": {
          "cpu": "100m",
          "memory": "128Mi"
        },
        "limits": {
          "cpu": "500m",
          "memory": "250Mi"
        }
      },
      "init_container_resource_requirements": {
        "requests": {
          "cpu": "100m",
          "memory": "128Mi"
        },
        "limits": {
          "cpu": "500m",
          "memory": "200Mi"
        }
      }
    },
    "eda": {
      "disabled": false,
      "api": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "50m",
            "memory": "350Mi"
          },
          "limits": {
            "cpu": "500m",
            "memory": "400Mi"
          }
        }
      },
      "ui": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "25m",
            "memory": "64Mi"
          },
          "limits": {
            "cpu": "500m",
            "memory": "150Mi"
          }
        }
      },
      "scheduler": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "50m",
            "memory": "200Mi"
          },
          "limits": {
            "cpu": "500m",
            "memory": "250Mi"
          }
        }
      },
      "worker": {
        "replicas": 2,
        "resource_requirements": {
          "requests": {
            "cpu": "25m",
            "memory": "200Mi"
          },
          "limits": {
            "cpu": "250m",
            "memory": "250Mi"
          }
        }
      },
      "default_worker": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "25m",
            "memory": "200Mi"
          },
          "limits": {
            "cpu": "500m",
            "memory": "400Mi"
          }
        }
      },
      "activation_worker": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "25m",
            "memory": "150Mi"
          },
          "limits": {
            "cpu": "500m",
            "memory": "400Mi"
          }
        }
      },
      "event_stream": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "25m",
            "memory": "150Mi"
          },
          "limits": {
            "cpu": "100m",
            "memory": "300Mi"
          }
        }
      }
    },
    "hub": {
      "disabled": false,
      "storage_type": "file",
      "file_storage_storage_class": "efs-sc",
      "file_storage_size": "10Gi",
      "api": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "150m",
            "memory": "256Mi"
          },
          "limits": {
            "cpu": "800m",
            "memory": "500Mi"
          }
        }
      },
      "content": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "150m",
            "memory": "256Mi"
          },
          "limits": {
            "cpu": "800m",
            "memory": "1200Mi"
          }
        }
      },
      "worker": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "150m",
            "memory": "256Mi"
          },
          "limits": {
            "cpu": "800m",
            "memory": "400Mi"
          }
        }
      },
      "web": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "100m",
            "memory": "256Mi"
          },
          "limits": {
            "cpu": "500m",
            "memory": "300Mi"
          }
        }
      },
      "redis": {
        "replicas": 1,
        "resource_requirements": {
          "requests": {
            "cpu": "100m",
            "memory": "250Mi"
          },
          "limits": {
            "cpu": "300m",
            "memory": "400Mi"
          }
        }
      }
    }
  }
}
`
