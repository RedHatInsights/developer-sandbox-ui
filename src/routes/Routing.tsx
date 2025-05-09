import React, { Suspense, lazy, useMemo } from 'react';
import { Navigate, Route as RouterRoute, Routes as RouterRoutes } from 'react-router-dom';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { linkBasename } from '../utils/utils';
import { UiConfigData } from '../types';
import useRegistrationService from '../hooks/useRegistrationService';
import { canaryDeploymentCheck } from '../utils/canary-deployment';

const SandboxPage = lazy(
  () => import(/* webpackChunkName: "SandboxPage" */ './SandboxPage/SandboxPage'),
);
const NoPermissionsPage = lazy(
  () => import(/* webpackChunkName: "NoPermissionsPage" */ './NoPermissionsPage/NoPermissionsPage'),
);

const ExperimentalPage = lazy(
  () => import(/* webpackChunkName: "ExperimentalPage" */ './ExperimentalPage/ExperimentalPage'),
);

const SHOW_EXPERIMENTAL = localStorage.getItem('dev-sandbox.experimental') === 'true';

const routes = [
  {
    path: 'no-permissions',
    element: NoPermissionsPage,
  },
  {
    path: '/',
    element: SandboxPage,
  },
];

// enable this route by running localStorage.setItem('dev-sandbox.experimental', 'true') in browser console
// and refresh the browser
if (SHOW_EXPERIMENTAL) {
  routes.push({
    path: 'experimental',
    element: ExperimentalPage,
  });
}

interface RouteType {
  path?: string;
  element: React.ComponentType;
  childRoutes?: RouteType[];
  elementProps?: Record<string, unknown>;
}

const renderRoutes = (routes: RouteType[] = []) =>
  routes.map(({ path, element: Element, childRoutes, elementProps }) => (
    <RouterRoute key={path} path={path} element={<Element {...elementProps} />}>
      {renderRoutes(childRoutes)}
    </RouterRoute>
  ));

const Routing = () => {
  const renderedRoutes = useMemo(() => renderRoutes(routes), [routes]);
  const [uiconfig, setUIConfig] = React.useState<UiConfigData | undefined>();
  const { getUIConfigData } = useRegistrationService();

  /*** CANARY Deployment for redirecting users to new UI
   Users visiting the first time the UI will get assigned with a random number, the number will be stored in localstorage and reused everytime the user opens the UI.
   The users that gets a number that is lower than the canary weight threshold, they will be redirected to the new ui,
   the others will be using the current UI.
   The threshold can be configured in the backend so that a bigger/smaller number of users can be routed to the new UI.
   ***/
  const loadUIConfig = React.useCallback(
    async function () {
      const uiConfigData = await getUIConfigData();
      if (uiConfigData != undefined) {
        canaryDeploymentCheck(uiConfigData.uiCanaryDeploymentWeight);
      }
      setUIConfig(uiConfigData);
    },
    [getUIConfigData, setUIConfig],
  );

  React.useLayoutEffect(() => {
    loadUIConfig();
  }, [uiconfig]);
  /** END canary UI deployment logic **/

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      <RouterRoutes>
        {renderedRoutes}
        <RouterRoute path="*" element={<Navigate replace to={linkBasename} />} />
      </RouterRoutes>
    </Suspense>
  );
};

export default Routing;
