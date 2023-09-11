import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import * as React from 'react';

const FooterButton = (
  props: Pick<
    React.ComponentProps<typeof Button>,
    'children' | 'onClick' | 'isDisabled' | 'isLoading'
  >,
) => (
  <div className="pf-u-pt-xl pf-u-pt-md pf-u-text-align-center">
    <Button {...props} className="pf-u-w-100 pf-u-w-initial-on-sm" />
  </div>
);

export default FooterButton;
