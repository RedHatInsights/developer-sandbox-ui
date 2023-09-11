import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  ButtonVariant,
  Card,
  CardBody,
  Grid,
  GridItem,
  List,
  ListItem,
  Title,
} from '@patternfly/react-core';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import heroImg from '../../images/sandbox-hero-graphic.svg';
import { useRegistrationContext } from '../../hooks/useRegistrationContext';
import AnalyticsButton from '../AnalyticsButton/AnalyticsButton';
import { signup } from '../../services/registration-service';
import { errorMessage } from '../../utils/utils';
import { Status } from '../../utils/registration-context';

const PrimaryCheckIcon = () => (
  <CheckIcon
    style={{
      color: 'var(--pf-global--primary-color--100)',
    }}
  />
);

const STATUS_TITLE: { [key in Status]?: string } = {
  'pending-approval': 'Pending approval',
  provisioning: 'Preparing your Sandbox',
};

const GetStartedCard = () => {
  const [error, setError] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(false);
  const [state, { setShowUserSignup, refreshSignupData }] = useRegistrationContext();
  return (
    <>
      <Card>
        <CardBody>
          <Grid hasGutter>
            <GridItem
              md={4}
              order={{ md: '1' }}
              style={{ alignSelf: 'center' }}
              className="pf-u-text-align-center"
            >
              <img
                src={heroImg}
                style={{ maxHeight: 200 }}
                className="pf-u-display-block pf-u-m-auto pf-u-mb-lg pf-u-mb-auto-on-md"
              />
            </GridItem>
            <GridItem md={8}>
              <Title headingLevel="h1">Start exploring Developer Sandbox for free</Title>
              <List isPlain className="pf-u-p-md pf-u-pt-lg pf-u-pb-lg">
                <ListItem icon={<PrimaryCheckIcon />}>
                  Instant access to a free pre-configured for learning and experimenting with
                  OpenShift, Kubernetes, and containers.
                </ListItem>
                <ListItem icon={<PrimaryCheckIcon />}>
                  Built in, pre-configured, developer tooling combined with a set of sample
                  applications enables immediate productivity with minimal effort.
                </ListItem>
                <ListItem icon={<PrimaryCheckIcon />}>
                  Includes Kubernetes-hosted Jupyter Notebooks for Python-based AI/ML modeling.
                </ListItem>
                <ListItem icon={<PrimaryCheckIcon />}>
                  Learn how to use OpenShift with guided tutorials and sample applications.
                </ListItem>
                <ListItem icon={<PrimaryCheckIcon />}>
                  Includes an instance of Red Hat OpenShift Dev Spaces, a cloud hosted IDE, to
                  enable a consistent, rapid application development experience, all within the
                  browser.
                </ListItem>
              </List>
              {error ? (
                <Alert
                  title="An error occurred"
                  variant={AlertVariant.danger}
                  actionClose={<AlertActionCloseButton onClose={() => setError(undefined)} />}
                  isInline
                  className="pf-u-mb-lg"
                >
                  {error}
                </Alert>
              ) : null}
              <AnalyticsButton
                isDisabled={
                  loading || state.status === 'pending-approval' || state.status === 'provisioning'
                }
                isLoading={loading || state.status === 'provisioning'}
                onClick={async () => {
                  if (state.status === 'new') {
                    try {
                      setError(undefined);
                      setLoading(true);
                      await signup();
                      await refreshSignupData();
                    } catch (e) {
                      setError(errorMessage(e));
                    } finally {
                      setLoading(false);
                    }
                  } else {
                    setShowUserSignup(true);
                  }
                }}
                className="pf-u-w-100 pf-u-w-initial-on-sm"
                analytics={{
                  event: 'DevSandbox Signup Start',
                }}
              >
                {STATUS_TITLE[state.status] || 'Get started'}
              </AnalyticsButton>
              <AnalyticsButton
                variant={ButtonVariant.link}
                component="a"
                href="https://developers.redhat.com/developer-sandbox"
                target="_blank"
                rel="noopener"
                className="pf-u-w-100 pf-u-w-initial-on-sm"
                style={{
                  display: 'inline-block',
                  whiteSpace: 'initial',
                }}
                analytics={{
                  event: 'DevSandbox Learn More',
                }}
              >
                Learn more about the Developer Sandbox
              </AnalyticsButton>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </>
  );
};

export default GetStartedCard;
