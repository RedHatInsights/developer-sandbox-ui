import * as React from 'react';
import { Gallery } from '@patternfly/react-core/dist/dynamic/layouts/Gallery';
import { GalleryItem } from '@patternfly/react-core/dist/dynamic/layouts/Gallery';
import { useSandboxServices } from '../../hooks/useSandboxServices';
import ServiceCard from './ServiceCard';

type Props = {
  isDisabled?: boolean;
};

const ServiceCatalog = ({ isDisabled }: Props) => {
  const services = useSandboxServices();
  return (
    <Gallery hasGutter minWidths={{ default: '330px' }}>
      {services.map((service) => (
        <GalleryItem key={service.title}>
          <ServiceCard {...service} launchUrl={isDisabled ? undefined : service.launchUrl} />
        </GalleryItem>
      ))}
    </Gallery>
  );
};
export default ServiceCatalog;
