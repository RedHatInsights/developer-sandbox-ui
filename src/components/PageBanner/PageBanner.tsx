import * as React from 'react';
import {
  Divider,
  Flex,
  FlexItem,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

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
