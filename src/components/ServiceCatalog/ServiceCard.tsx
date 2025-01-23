import {ButtonVariant} from '@patternfly/react-core/dist/dynamic/components/Button';
import {Card, CardBody, CardFooter, CardHeader} from '@patternfly/react-core/dist/dynamic/components/Card';
import {Text, TextContent, TextVariants} from '@patternfly/react-core/dist/dynamic/components/Text';
import * as React from 'react';
import AnalyticsButton from '../AnalyticsButton/AnalyticsButton';

type Props = {
    title: string;
    subtitle: string;
    description: string;
    iconUrl: string;
    learnMoreUrl: string;
    launchUrl?: string;
    buttonOptions: ButtonsFuncOptions
    buttonsFunc: (o: ButtonsFuncOptions) => React.ReactElement;
    status?: string
    helperText?: (status?: string) => React.ReactElement;
};

export type ButtonsFuncOptions = {
    showDisabledButton: boolean;
    launchUrl?: string;
    onClickFunc?: () => {};
    title: string;
    subtitle: string;
    status?: string;
}


const ServiceCard = ({
                         title,
                         subtitle,
                         description,
                         iconUrl,
                         learnMoreUrl,
                         buttonOptions,
                         buttonsFunc,
                         status,
                         helperText,
                     }: Props) => {


    return (<Card className="pf-v5-u-h-100">
        <CardHeader>
            <img src={iconUrl} style={{width: 48}} className="pf-v5-u-mr-md"/>
            <TextContent>
                <Text component={TextVariants.h2}>{title}</Text>
                {subtitle}
            </TextContent>
        </CardHeader>
        <CardBody>{description}</CardBody>
        <CardFooter>
            {helperText != undefined ? helperText(status) : ""}
            {buttonsFunc(buttonOptions)}
            <AnalyticsButton
                variant={ButtonVariant.link}
                component="a"
                href={learnMoreUrl}
                target="_blank"
                rel="noopener"
                isInline
                analytics={{
                    event: 'DevSandbox Service Learn',
                    properties: {
                        name: `${title} ${subtitle}`,
                        url: learnMoreUrl,
                    },
                }}
            >
                Learn more
            </AnalyticsButton>
        </CardFooter>
    </Card>)
}

export default ServiceCard;

