import React from 'react';
import { Alert } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { AlertVariant } from '@patternfly/react-core/dist/dynamic/components/Alert';
import { Bullseye } from '@patternfly/react-core/dist/dynamic/layouts/Bullseye';
import { Flex } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { PageSection } from '@patternfly/react-core/dist/dynamic/components/Page';
import { Spinner } from '@patternfly/react-core/dist/dynamic/components/Spinner';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextContent } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextVariants } from '@patternfly/react-core/dist/dynamic/components/Text';
import SandboxPageBanner from '../../components/PageBanner/SandboxPageBanner';
import HowItWorksCard from '../../components/HowItWorksCard/HowItWorksCard';
import GetStartedCard from '../../components/GetStartedCard/GetStartedCard';
import ServiceCatalog from '../../components/ServiceCatalog/ServiceCatalog';
import { useRegistrationContext } from '../../hooks/useRegistrationContext';

const SandboxPage = () => {
  const [{ status, error }] = useRegistrationContext();
  const showOverview = status !== 'ready';
  return (
    <>
      <SandboxPageBanner />
      <PageSection className="pf-u-p-xl">
        {status === 'unknown' ? (
          <Bullseye>
            <Spinner />
          </Bullseye>
        ) : (
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXl' }}>
            {error ? (
              <Alert
                title="An error occurred"
                variant={AlertVariant.danger}
                className="pf-u-mb-lg"
                style={{ boxShadow: 'var(--pf-global--BoxShadow--sm)' }}
              >
                {error}
              </Alert>
            ) : null}
            {showOverview ? (
              <>
                <GetStartedCard />
                <HowItWorksCard />
              </>
            ) : (
              <>
                <TextContent>
                  <Text component={TextVariants.h1}>Available services</Text>
                  <Text component={TextVariants.p}>
                    Now that your Sandbox is activated, these are all the cool things that are
                    available to you, right in your Sandbox!
                  </Text>
                </TextContent>
                <ServiceCatalog />
              </>
            )}
          </Flex>
        )}
      </PageSection>
    </>
  );
};

export default SandboxPage;
