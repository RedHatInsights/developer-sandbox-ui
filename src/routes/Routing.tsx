import React, { Suspense, lazy, useMemo } from 'react';
import { Navigate, Route as RouterRoute, Routes as RouterRoutes } from 'react-router-dom';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { linkBasename } from '../utils/utils';

const SandboxPage = lazy(
  () => import(/* webpackChunkName: "SandboxPage" */ './SandboxPage/SandboxPage'),
);
const OopsPage = lazy(() => import(/* webpackChunkName: "OopsPage" */ './OopsPage/OopsPage'));
const NoPermissionsPage = lazy(
  () => import(/* webpackChunkName: "NoPermissionsPage" */ './NoPermissionsPage/NoPermissionsPage'),
);

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
