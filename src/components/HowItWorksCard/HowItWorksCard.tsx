import React from 'react';
import { Card, CardBody, Text, TextContent, TextVariants } from '@patternfly/react-core';
import howItWorksImg from '../../images/2021_RHD__illustration_A.svg';

import './HowItWorksCard.scss';

const HowItWorksCard = () => (
  <Card>
    <CardBody className="how-it-works">
      <TextContent>
        <Text component={TextVariants.h1}>How it works</Text>
        <Text component={TextVariants.p}>
          The sandbox provides you with a private OpenShift environment in a shared, multi-tenant
          OpenShift cluster that is pre-configured with a set of developer tools. You can easily
          create containers from your source code or Dockerfile, build new applications using the
          samples and stacks provided, add services such as databases from our templates catalog,
          deploy Helm charts, and much more. Discover the rich capabilities of the full developer
          experience on OpenShift with the sandbox.
        </Text>
      </TextContent>
      <img src={howItWorksImg} className="pf-u-w-75 pf-u-pt-md pf-u-pb-md" />
      <div className="how-it-works__viz">
        <div>Import your code</div>
        <div />
        <div>Deploy and share your application</div>
        <div />
        <div>Play, experiment, and learn</div>
      </div>
    </CardBody>
  </Card>
);

export default HowItWorksCard;
