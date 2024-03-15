import * as React from 'react';
import { Divider } from '@patternfly/react-core/dist/dynamic/components/Divider';
import { Flex } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { FlexItem } from '@patternfly/react-core/dist/dynamic/layouts/Flex';
import { PageSection } from '@patternfly/react-core/dist/dynamic/components/Page';
import { PageSectionVariants } from '@patternfly/react-core/dist/dynamic/components/Page';
import { Text } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextContent } from '@patternfly/react-core/dist/dynamic/components/Text';
import { TextVariants } from '@patternfly/react-core/dist/dynamic/components/Text';

type Props = {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
};

const PageBanner = ({ children, icon, title }: Props) => (
  <PageSection variant={PageSectionVariants.light} className="pf-u-p-xl">
    <Flex
      direction={{ default: 'column', sm: 'row' }}
      spaceItems={{ default: 'spaceItemsMd', sm: 'spaceItemsXl' }}
      alignItems={{ sm: 'alignItemsFlexStart' }}
      flexWrap={{ default: 'nowrap' }}
    >
      <FlexItem style={{ flexShrink: 0 }}>{icon}</FlexItem>
      <Divider orientation={{ default: 'horizontal', sm: 'vertical' }} />
      <FlexItem>
        <TextContent>
          <Text component={TextVariants.h1}>{title}</Text>
          <Text component={TextVariants.p}>{children}</Text>
        </TextContent>
      </FlexItem>
    </Flex>
  </PageSection>
);

export default PageBanner;
