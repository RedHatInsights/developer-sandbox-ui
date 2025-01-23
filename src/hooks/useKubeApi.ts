import {getDeployments, getAAP, getSecret, getStatefulSets, getPersistentVolumeClaims} from '../services/kube-api';
import useAxios, { InstanceAPI } from './useAxios';

const useKubeApi = () => {
  const axiosInstance = useAxios(InstanceAPI.KUBE_API);

  return {
    getDeployments: (namespace: string, labelSelector?: string) => getDeployments(axiosInstance, namespace, labelSelector),

    getStatefulSets: (namespace: string, labelSelector?: string) => getStatefulSets(axiosInstance, namespace, labelSelector),

    getPersistentVolumeClaims: (namespace: string, labelSelector?: string) => getPersistentVolumeClaims(axiosInstance, namespace, labelSelector),

    getAAPData: (namespace: string) => getAAP(axiosInstance, namespace),

    getSecret: (namespace: string, secretName: string) => getSecret(axiosInstance, namespace, secretName),
  };
};

export default useKubeApi;
