import * as React from 'react';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';

type JSONValue = string | number | boolean | JSONObject | Array<JSONValue>;

interface JSONObject {
  [x: string]: JSONValue;
}

export type AnalyticProps = {
  event: string;
  properties?: JSONObject;
};

export const useTrackEvent = () => {
  const { analytics } = useChrome();
  return React.useCallback(
    (event: string, properties?: JSONObject) => {
      if (process.env.NODE_ENV !== 'development') {
        analytics?.track(event, properties);
      } else {
        // eslint-disable-next-line no-console
        console.log('analytics.track', event, properties);
      }
    },
    [analytics],
  );
};
