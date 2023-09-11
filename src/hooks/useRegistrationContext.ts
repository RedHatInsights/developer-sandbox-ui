import * as React from 'react';
import { RegistrationContext } from '../utils/registration-context';

export const useRegistrationContext = () => React.useContext(RegistrationContext);
