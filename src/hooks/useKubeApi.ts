import { getDeployments } from '../services/kube-api';
import useAxios, { InstanceAPI } from './useAxios';

const useKubeApi = () => {
  const axiosInstance = useAxios(InstanceAPI.KUBE_API);

  return {
    getDeployments: (namespace: string) => getDeployments(axiosInstance, namespace),
  };
};

export default useKubeApi;
