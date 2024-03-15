import { atom } from 'jotai';
import { DeploymentData, DeploymentItem } from '../services/kube-api';
import { registrationSignUpData } from './registrationAtom';

export const deploymentsAtom = atom<DeploymentItem[]>([]);

export const getDeploymentsAtom = atom<
  ((namespace: string) => Promise<DeploymentData>) | undefined
>(undefined);

export const loadDeploymentsAtom = atom(async (get) => {
  const getDeployments = get(getDeploymentsAtom);
  if (!getDeployments) {
    return undefined;
  }
  const signUpData = get(registrationSignUpData);
  console.log({ signUpData });
  if (!signUpData) {
    return undefined;
  }

  const deployment = await getDeployments(signUpData.defaultUserNamespace);
  return deployment;
});
