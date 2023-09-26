import * as React from 'react';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import axios, { AxiosRequestConfig } from 'axios';

const baseURL =
  'https://registration-service-toolchain-host-operator.apps.sandbox.x8i5.p1.openshiftapps.com';

export const useAxios = () => {
  const { auth } = useChrome();

  return React.useMemo(() => {
    const axiosInstance = axios.create();
    axiosInstance.interceptors.request.use((reqConfig: AxiosRequestConfig) => ({
      baseURL,
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
