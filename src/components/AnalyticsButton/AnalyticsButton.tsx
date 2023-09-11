import * as React from 'react';
import { Button, ButtonProps } from '@patternfly/react-core';
import { AnalyticProps, useTrackEvent } from '../../hooks/useTrackEvent';

const AnalyticsButton: React.FC<
  ButtonProps & {
    analytics?: AnalyticProps;
  }
> = ({ onClick, analytics, ...props }) => {
  const track = useTrackEvent();
  return (
    <Button
      {...props}
      onClick={
        analytics
          ? (...args) => {
              track(analytics.event, analytics.properties);
              onClick?.(...args);
            }
          : onClick
      }
    />
  );
};

export default AnalyticsButton;
