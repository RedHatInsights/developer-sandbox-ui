import * as React from 'react';
import { Gallery, GalleryItem } from '@patternfly/react-core';
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
