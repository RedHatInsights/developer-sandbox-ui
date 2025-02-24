import { AxiosInstance } from 'axios';

function projectDeploymentUrl(namespace: string, labelSelector?: string) {
  let url = `/apis/apps/v1/namespaces/${namespace}/deployments`;
  if (labelSelector) {
    url += `?labelSelector=${labelSelector}`;
  }
  return url;
}

export type DeploymentItem = {
  status: {
    conditions: {
      type: string;
      status: string;
    }[];
  };
  spec: {
    replicas: number;
    template: {
      metadata: {
        labels: {
          app: string;
          deployment: string;
        };
      };
      spec: {
        volumes?: {
          name: string;
          persistentVolumeClaim?: {
            claimName: string;
          };
          secret?: {
            secretName: string;
          };
        }[];
      };
    };
  };
  metadata: {
    name: string;
    uuid: string;
    creationTimestamp: string;
    labels: {
      app: string;
    };
  };
};

export type DeploymentData = {
  items: DeploymentItem[];
};

export const getDeployments = async (
  axiosInstance: AxiosInstance,
  namespace: string,
  labels?: string,
) => {
  const url = projectDeploymentUrl(namespace, labels);
  const { data } = await axiosInstance.get<DeploymentData>(url);
  return data;
};

function projectPersistentVolumeClaimUrl(namespace: string, labelSelector?: string) {
  let url = `/api/v1/namespaces/${namespace}/persistentvolumeclaims`;
  if (labelSelector) {
    url += `?labelSelector=${labelSelector}`;
  }
  return url;
}

export type PersistentVolumeClaimItem = {
  metadata: {
    name: string;
    uuid: string;
    creationTimestamp: string;
    labels: {
      app: string;
    };
  };
};

export type PersistentVolumeClaimData = {
  items: PersistentVolumeClaimItem[];
};

export const getPersistentVolumeClaims = async (
  axiosInstance: AxiosInstance,
  namespace: string,
  labels?: string,
) => {
  const url = projectPersistentVolumeClaimUrl(namespace, labels);
  const { data } = await axiosInstance.get<PersistentVolumeClaimData>(url);
  return data;
};

function projectStatefulSetUrl(namespace: string, labelSelector?: string) {
  let url = `/apis/apps/v1/namespaces/${namespace}/statefulsets`;
  if (labelSelector) {
    url += `?labelSelector=${labelSelector}`;
  }
  return url;
}

export type StateFulSetItem = {
  status: {
    conditions: {
      type: string;
      status: string;
    }[];
  };
  spec: {
    replicas: number;
    template: {
      metadata: {
        labels: {
          app: string;
          deployment: string;
        };
      };
      spec: {
        volumes?: {
          name: string;
          persistentVolumeClaim?: {
            claimName: string;
          };
          secret?: {
            secretName: string;
          };
        }[];
      };
    };
    volumeClaimTemplates?: {
      metadata: {
        name: string;
      };
    }[];
  };
  metadata: {
    name: string;
    uuid: string;
    creationTimestamp: string;
    labels: {
      app: string;
    };
  };
};

export type StatefulSetData = {
  items: StateFulSetItem[];
};

export const getStatefulSets = async (
  axiosInstance: AxiosInstance,
  namespace: string,
  labels?: string,
) => {
  const url = projectStatefulSetUrl(namespace, labels);
  const { data } = await axiosInstance.get<StatefulSetData>(url);
  return data;
};

function projectAAPUrl(namespace: string) {
  return `/apis/aap.ansible.com/v1alpha1/namespaces/${namespace}/ansibleautomationplatforms`;
}

export type StatusCondition = {
  type: string;
  status: string;
  reason: string;
  message: string;
};
export type AAPItem = {
  status: {
    conditions: StatusCondition[];
    URL: string;
    adminPasswordSecret: string;
    adminUser: string;
  };
  spec: {
    idle_aap: boolean;
  };
  metadata: {
    name: string;
    uuid: string;
    creationTimestamp: string;
  };
};

export type AAPData = {
  items: AAPItem[];
};

export const getAAP = async (
  axiosInstance: AxiosInstance,
  namespace: string,
): Promise<AAPData | undefined> => {
  const url = projectAAPUrl(namespace);
  const { data } = await axiosInstance.get<AAPData>(url);
  return data;
};

function projectSecretURL(namespace: string, secretName: string) {
  return `/api/v1/namespaces/${namespace}/secrets/${secretName}`;
}

export type SecretItem = {
  data: {
    password: string;
  };
  metadata: {
    name: string;
    uuid: string;
    creationTimestamp: string;
  };
};

export const getSecret = async (
  axiosInstance: AxiosInstance,
  namespace: string,
  secretName: string,
): Promise<SecretItem | undefined> => {
  const url = projectSecretURL(namespace, secretName);
  const { data } = await axiosInstance.get<SecretItem>(url);
  return data;
};
