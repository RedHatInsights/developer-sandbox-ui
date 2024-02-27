import React, { Suspense, useMemo } from 'react';
import { useDeployments } from '../../hooks/useDeployments';
import { useRegistrationContext } from '../../hooks/useRegistrationContext';

const ExperimentalPage = () => {
  const deployments = useDeployments();
  const [{ signupData }] = useRegistrationContext();
  const launchUrl =
    signupData?.consoleURL && signupData?.defaultUserNamespace
      ? `${signupData.consoleURL}topology/ns/${signupData.defaultUserNamespace}?view=graph`
      : signupData?.consoleURL;
  const rows = useMemo(() => {
    return (
      deployments?.items.map((item) => {
        return (
          <tr key={item.metadata.uuid}>
            <td>{item.metadata.name}</td>
            <td>{item.metadata.creationTimestamp}</td>
            {/* FIXME: What is type of application vs type of deployment */}
            <td>{item.spec.template.metadata.labels.app}</td>
            <td>{item.spec.template.metadata.labels.deployment}</td>
            <td>
              {item.status.conditions.find((condition) => condition.status === 'True')?.type ??
                'Unknown'}
            </td>
            <td>{item.spec.replicas}</td>
            <td>
              <a target="_blank" href={launchUrl} rel="noreferrer">
                Open
              </a>
            </td>
          </tr>
        );
      }) ?? []
    );
  }, [deployments]);
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Created at</th>
          <th>Application type</th>
          <th>Deployment type</th>
          <th>Status</th>
          <th>Total replicas</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

const ExperimentalPageLoader = () => {
  return (
    <Suspense fallback="Loading deployments">
      <ExperimentalPage />
    </Suspense>
  );
};

export default ExperimentalPageLoader;
