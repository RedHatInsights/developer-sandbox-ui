import * as React from 'react';
import { Gallery } from '@patternfly/react-core/dist/dynamic/layouts/Gallery';
import { GalleryItem } from '@patternfly/react-core/dist/dynamic/layouts/Gallery';
import { HelperText } from '@patternfly/react-core/dist/dynamic/components/HelperText';
import { HelperTextItem } from '@patternfly/react-core/dist/dynamic/components/HelperText';
import { useFlag } from '@unleash/proxy-client-react';
import { OPENSHIFT_AI_ID, useSandboxServices } from '../../hooks/useSandboxServices';
import ServiceCard from './ServiceCard';

type Props = {
  isDisabled?: boolean;
};

const ServiceCatalog = ({ isDisabled }: Props) => {
  const services = useSandboxServices();
  const disableAI = useFlag('platform.sandbox.openshift-ai-disabled');
  return (
    <Gallery hasGutter minWidths={{ default: '330px' }}>
      {services.map((service) => {
        const shouldDisableAI = service.id === OPENSHIFT_AI_ID && disableAI;
        return (
          <GalleryItem key={service.id}>
            <ServiceCard
              {...service}
              launchUrl={isDisabled ? undefined : service.launchUrl}
              showDisabledButton={shouldDisableAI}
              {...(shouldDisableAI
                ? {
                    helperText: (
                      <HelperText>
                        <HelperTextItem variant="indeterminate" className="pf-v5-u-mb-lg">
                          OpenShift AI is temporarily unavailable, but&nbsp;will return soon.
                        </HelperTextItem>
                      </HelperText>
                    ),
                  }
                : {})}
            />
          </GalleryItem>
        );
      })}
    </Gallery>
  );
};
export default ServiceCatalog;
