import * as React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import AnalyticsButton from '../AnalyticsButton';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: jest.fn(),
}));

const useChromeMock = useChrome as jest.Mock;

describe('AnalyticsButton', () => {
  it('should track button click', () => {
    const trackMock = jest.fn();
    useChromeMock.mockImplementation(() => ({
      analytics: {
        track: trackMock,
      },
    }));

    const result = render(
      <AnalyticsButton
        analytics={{
          event: 'button clicked',
          properties: { current_path: '/foo/bar', link_name: 'foo' },
        }}
      />,
    );
    result.getByRole('button').click();
    expect(trackMock).toHaveBeenCalledWith('button clicked', {
      current_path: '/foo/bar',
      link_name: 'foo',
    });
  });

  it('should callback original onClick handler', () => {
    const onClickMock = jest.fn();
    const result = render(<AnalyticsButton onClick={onClickMock} analytics={{ event: 'foo' }} />);
    result.getByRole('button').click();
    expect(onClickMock).toHaveBeenCalled();

    onClickMock.mockClear();
    result.rerender(<AnalyticsButton onClick={onClickMock} />);
    result.getByRole('button').click();
    expect(onClickMock).toHaveBeenCalled();
  });
});
