import * as React from 'react';
import iconUrl from '../../images/Logo-Red_Hat-Developer-A-Standard-RGB.svg';
import PageBanner from './PageBanner';

const SandboxPageBanner = () => (
  <PageBanner title="Red Hat Developer Sandbox" icon={<img src={iconUrl} style={{ height: 64 }} />}>
    Try Red Hat's products and technologies without setup or configuration.
  </PageBanner>
);

export default SandboxPageBanner;
