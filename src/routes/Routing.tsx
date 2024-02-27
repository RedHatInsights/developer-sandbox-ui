import React, { Suspense, lazy, useMemo } from 'react';
import { Navigate, Route as RouterRoute, Routes as RouterRoutes } from 'react-router-dom';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { linkBasename } from '../utils/utils';

const SandboxPage = lazy(
  () => import(/* webpackChunkName: "SandboxPage" */ './SandboxPage/SandboxPage'),
);
const OopsPage = lazy(() => import(/* webpackChunkName: "OopsPage" */ './OopsPage/OopsPage'));
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
    path: 'oops',
    element: OopsPage,
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
