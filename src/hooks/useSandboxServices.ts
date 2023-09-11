import * as React from 'react';
import openShiftIconUrl from '../images/Product_Icon-Red_Hat-OpenShift-RGB.svg';
import dataScienceUrl from '../images/Product_Icon-Red_Hat-OpenShift_Data_Science-RGB.svg';
import devSpacesUrl from '../images/Product_Icon-Red_Hat-OpenShift_Dev_Spaces-RGB.svg';
import { useRegistrationContext } from './useRegistrationContext';

export type Service = {
  title: string;
  subtitle: string;
  description: string;
  iconUrl: string;
  learnMoreUrl: string;
  launchUrl?: string;
};

export const useSandboxServices = () => {
  const [{ signupData }] = useRegistrationContext();
  return React.useMemo<Service[]>(
    () => [
      {
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
        title: 'Red Hat',
        subtitle: 'Dev Spaces',
        description:
          'A collaborative Kubernetes-native solution for rapid application development that delivers consistent developer environments on Red Hat OpenShift to allow anyone with a browser to contribute code in under two minutes.',
        iconUrl: devSpacesUrl,
        learnMoreUrl: 'https://developers.redhat.com/products/openshift-dev-spaces/overview',
        launchUrl: signupData?.cheDashboardURL,
      },
      {
        title: 'Red Hat',
        subtitle: 'Data Science',
        description:
          'Red Hat OpenShift Data Science is a part of the Red Hat OpenShift AI portfolio and provides tools across the AI/ML lifecycle.',
        iconUrl: dataScienceUrl,
        learnMoreUrl:
          'https://developers.redhat.com/products/red-hat-openshift-data-science/overview',
        launchUrl: signupData?.rhodsMemberURL,
      },
    ],
    [signupData],
  );
};
