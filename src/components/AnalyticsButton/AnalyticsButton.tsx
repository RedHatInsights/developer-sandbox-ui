import * as React from 'react';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { AnalyticProps, useTrackEvent } from '../../hooks/useTrackEvent';

const AnalyticsButton: React.FC<
  React.ComponentProps<typeof Button> & {
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
