import * as React from 'react';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import axios, { AxiosRequestConfig } from 'axios';

const registrationBaseURL =
  'https://registration-service-toolchain-host-operator.apps.sandbox.x8i5.p1.openshiftapps.com';

const kubeBaseUrl = 'https://api-toolchain-host-operator.apps.sandbox.x8i5.p1.openshiftapps.com';

export enum InstanceAPI {
  REGISTRATION,
  KUBE_API,
}

const instanceBaseUrlMap = {
  [InstanceAPI.REGISTRATION]: registrationBaseURL,
  [InstanceAPI.KUBE_API]: kubeBaseUrl,
};

export const useAxios = (instanceType: InstanceAPI) => {
  const { auth } = useChrome();

  return React.useMemo(() => {
    const axiosInstance = axios.create();
    axiosInstance.interceptors.request.use((reqConfig: AxiosRequestConfig) => ({
      baseURL: instanceBaseUrlMap[instanceType],
      ...reqConfig,
    }));

    axiosInstance.interceptors.request.use((reqConfig: AxiosRequestConfig) => {
      return auth.getToken().then((bearerToken) => {
        if (!bearerToken) {
          return reqConfig;
        }
        return {
          ...reqConfig,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${bearerToken}`,
            ...reqConfig.headers,
          },
        };
      });
    });
    return axiosInstance;
  }, [auth]);
};

export default useAxios;
