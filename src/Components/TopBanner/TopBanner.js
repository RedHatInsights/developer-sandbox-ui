import React from 'react';
import {
  Button,
  Card,
  CardBody,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import '../../Routes/SandboxPage/SandboxPage.scss';

const TopBanner = () => (
  <Card
    className="sbx-c-card-banner pf-u-px-lg-on-md pf-u-px-0-on-sm pf-u-pt-sm pf-u-pb-sm"
    isPlain
  >
    <CardBody className="pf-u-w-66-on-md">
      <TextContent>
        <Text
          component={TextVariants.h1}
          className="pf-u-color-light-100 pf-u-mb-md"
        >
          Get started with the Developer Sandbox for Red Hat OpenShift
        </Text>
        <Text className="pf-u-color-light-200">
          If you are exploring how to run your code as containers in OpenShift,
          our free Developer Sandbox instantly gives you a way to try it out.
          Not only can you easily deploy code from your Git repo, you can
          leverage our samples, run a database, connect to Red Hat Managed
          Application Services, and edit code directly with pre-configured cloud
          IDE.
        </Text>
      </TextContent>
      <Button
        className="pf-u-mt-2xl"
        component="a"
        href="https://developers.redhat.com/developer-sandbox"
        target="_blank"
        isLarge
      >
        Learn more about Sandbox for Red Hat OpenShift
      </Button>
    </CardBody>
  </Card>
);

export default TopBanner;
