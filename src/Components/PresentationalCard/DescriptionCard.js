import React from 'react';
import {
  Card,
  CardBody,
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

const DescriptionCard = () => (
  <Card className="pf-u-mb-xl">
    <CardBody>
      <Grid>
        <GridItem
          md={6}
          lg={8}
          component={TextContent}
          className="pf-u-pr-3xl-on-md"
        >
          <Text component={TextVariants.h2} className="pf-u-mb-md">
            What is Developer Sandbox for Red Hat OpenShift?
          </Text>
          <Text component={TextVariants.p} className="pf-u-color-200">
            The sandbox provides you with a private OpenShift environment in a
            shared, multi-tenant OpenShift cluster that is pre-configured with a
            set of developer tools. You can easily create containers from your
            source code or Dockerfile, build new applications using the samples
            and stacks provided, add services such as databases from our
            templates catalog, deploy Helm charts, and much more. Discover the
            rich capabilities of the full developer experience on OpenShift with
            the sandbox.
          </Text>
        </GridItem>
        <GridItem md={6} lg={4}>
          <img
            className="sbx-sandbox-graphic pf-u-pt-md pf-u-pt-0-on-md"
            src="https://console.redhat.com/apps/frontend-assets/background-images/developer-sandbox-ui/sandbox-diagram.png"
          />
        </GridItem>
      </Grid>
    </CardBody>
  </Card>
);

export default DescriptionCard;
