import React, { Fragment, useEffect } from 'react';
import { Reducer } from 'redux';
import Routing from './routes/Routing';

import './App.scss';

import { getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import RegistrationProvider from './components/RegistrationProvider';

const App = () => {
  const { updateDocumentTitle } = useChrome();

  useEffect(() => {
    const registry = getRegistry();
    registry.register({ notifications: notificationsReducer as Reducer });
    // You can use directly the name of your app
    updateDocumentTitle('Developer Sandbox');
  }, []);

  return (
    <Fragment>
      <NotificationsPortal />
      <RegistrationProvider>
        <Routing />
      </RegistrationProvider>
    </Fragment>
  );
};

export default App;
