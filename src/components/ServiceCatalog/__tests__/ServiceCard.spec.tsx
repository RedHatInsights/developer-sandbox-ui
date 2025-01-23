import React from 'react';
import {render, screen, within} from '@testing-library/react';
import ServiceCard, {ButtonsFuncOptions} from '../ServiceCard';
import AnalyticsButton from "../../AnalyticsButton/AnalyticsButton";
import {Text, TextContent, TextVariants} from "@patternfly/react-core/dist/esm/components/Text";
import {Spinner} from "@patternfly/react-core/dist/esm/components/Spinner";

describe('ServiceCard', () => {
    const mockCallBack = jest.fn();
    const defaultLaunchButton = (o: ButtonsFuncOptions) => {
        return (
            <AnalyticsButton
                component="a"
                isDisabled={o.showDisabledButton}
                href={o.launchUrl}
                className="pf-v5-u-mr-md"
                target="_blank"
                rel="noopener"
                onClick={o.onClickFunc}
                analytics={{
                    event: 'DevSandbox Service Launch',
                    properties: {
                        name: `${o.title} ${o.subtitle}`,
                        url: o.launchUrl ? "" : "",
                    },
                }}
            >
                Launch
            </AnalyticsButton>
        );
    }

    it('should display launch link', () => {
        render(
            <ServiceCard
                description=""
                iconUrl=""
                learnMoreUrl=""
                subtitle=""
                title=""
                launchUrl="test"
                buttonOptions={{
                    title: "",
                    subtitle: "",
                    showDisabledButton: false,
                    launchUrl: "test",
                    onClickFunc: mockCallBack,
                }}
                buttonsFunc={defaultLaunchButton}
            />,
        );
        const link = screen.queryByRole('link', {name: 'Launch'});
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'test');
    });

    it('should not display launch link if missing launch url', () => {
        render(<ServiceCard description="" iconUrl="" learnMoreUrl="" subtitle="" title="" buttonOptions={{
            title: "",
            subtitle: "",
            showDisabledButton: false,
            onClickFunc: mockCallBack,
        }} buttonsFunc={defaultLaunchButton}/>);
        expect(screen.queryByRole('link', {name: 'Launch'})).not.toBeInTheDocument();
    });

    it('should invoke the custom onclick function if provided', () => {
        render(<ServiceCard description="" iconUrl="" learnMoreUrl="" subtitle="" title=""
                            buttonOptions={{
                                title: "",
                                subtitle: "",
                                showDisabledButton: false,
                                launchUrl: "test",
                                onClickFunc: mockCallBack,
                            }}
                            buttonsFunc={defaultLaunchButton}/>);
        let button = screen.queryByText('Launch')
        button?.click()
        expect(mockCallBack).toHaveBeenCalled();
    });

    it('should display status', () => {
        let showStatus = (status? : string) : React.ReactElement => {
           return (
               <TextContent data-testid="status-text">
                   <Text  component={TextVariants.p}>
                       {status}
                   </Text>
               </TextContent>
           )
        }
        render(<ServiceCard description="" iconUrl="" learnMoreUrl="" subtitle="" title=""
                            buttonOptions={{
                                title: "",
                                subtitle: "",
                                showDisabledButton: false,
                                launchUrl: "test",
                                onClickFunc: mockCallBack,
                            }}
                            status={"Provisioning"}
                            helperText={showStatus}
                            buttonsFunc={defaultLaunchButton}/>);
        const { getByText } = within(screen.getByTestId('status-text'))
        expect(getByText('Provisioning')).toBeInTheDocument();
    });
});
