import { AxiosInstance } from 'axios';

function projectDeploymentUrl(namespace: string) {
  return `/apis/apps/v1/namespaces/${namespace}/deployments `;
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

export const getDeployments = async (axiosInstance: AxiosInstance, namespace: string) => {
  const url = projectDeploymentUrl(namespace);
  const { data } = await axiosInstance.get<DeploymentData>(url);
  return data;
};
