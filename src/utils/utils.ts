import axios from 'axios';
import { To } from 'react-router-dom';

export const linkBasename = '/openshift/sandbox';
export const mergeToBasename = (to: To, basename: string): To => {
  if (typeof to === 'string') {
    // replace possible "//" after basename
    return `${basename}/${to}`.replace(`^${basename}//`, '/');
  }

  return {
    ...to,
    pathname: `${basename}/${to.pathname}`.replace(`^${basename}//`, '/'),
  };
};

export const errorMessage = (e: unknown): string =>
  (axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message || e.message
    : typeof e === 'object'
    ? e?.toString()
    : typeof e === 'string'
    ? e
    : '') || '';
