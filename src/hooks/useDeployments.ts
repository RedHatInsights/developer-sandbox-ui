import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import useKubeApi from './useKubeApi';
import { useRegistrationContext } from './useRegistrationContext';
import { getDeploymentsAtom, loadDeploymentsAtom } from '../state/deploymentsAtom';

export const useDeployments = () => {
  const [{ status }] = useRegistrationContext();
  const { getDeployments } = useKubeApi();
  const setDeployments = useSetAtom(getDeploymentsAtom);
  const deployments = useAtomValue(loadDeploymentsAtom);
  useEffect(() => {
    if (status === 'ready' && getDeployments) {
      setDeployments(() => getDeployments);
    }
  }, [getDeployments.toString(), status]);
  return deployments;
};
