import * as React from 'react';
import { loadRecaptchaScript } from '../utils/recaptcha';

export const useRecaptcha = () => {
  React.useEffect(() => {
    loadRecaptchaScript();
  }, []);
};
