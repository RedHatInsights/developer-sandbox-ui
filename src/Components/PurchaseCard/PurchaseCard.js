import React from 'react';
import PropTypes from 'prop-types';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import {
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

const PurchaseCard = () => {
  const push = useChrome(({ chromeHistory: { push } = {} }) => push);

  return (
    <Card>
      <CardBody>
        <Grid>
          <GridItem
            md={6}
            lg={8}
            component={TextContent}
            className="pf-u-pr-2xl"
          >
            <Text component={TextVariants.h2} className="pf-u-mb-md">
              Continue your experience with Red Hat OpenShift service on AWS
            </Text>
            <Text
              component={TextVariants.p}
              className="pf-u-color-200 pf-u-mb-lg"
            >
              Get started with your own dedicated cluster on AWS, managed by Red
              Hat and Amazon, and even move your application from Dev Sandbox.
            </Text>
            <Flex className="pf-u-flex-direction-column pf-u-flex-direction-row-on-md pf-u-mt-lg pf-u-mt-0-on-md">
              <Button
                component="a"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  push('./openshift/create/rosa/welcome');
                }}
                className="pf-u-flex-grow-1 pf-u-mb-md pf-u-mb-0-on-lg"
                href="/openshift/create/rosa/welcome"
                isLarge
              >
                Get Started
              </Button>
              <Button
                variant="tertiary"
                component="a"
                className="sbx-c-card__button pf-u-flex-grow-1"
                href="https://developers.redhat.com/developer-sandbox/get-started"
                isLarge
              >
                Learn how to move your application
              </Button>
            </Flex>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};

PurchaseCard.propTypes = {
  title: PropTypes.string,
};

export default PurchaseCard;
