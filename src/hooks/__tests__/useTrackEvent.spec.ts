import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useTrackEvent } from '../useTrackEvent';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: jest.fn(),
}));

const useChromeMock = useChrome as jest.Mock;

describe('useTrackEvent', () => {
  it('should track event', () => {
    const trackMock = jest.fn();
    useChromeMock.mockImplementation(() => ({
      analytics: {
        track: trackMock,
      },
    }));
    const { result } = renderHook(() => useTrackEvent());
    result.current('test-event', { foo: 'bar' });
    expect(trackMock).toHaveBeenCalledWith('test-event', { foo: 'bar' });
    trackMock.mockClear();

    result.current('test-event', { current_path: '/foo/bar', foo: 'bar', test: 'testing' });
    expect(trackMock).toHaveBeenCalledWith('test-event', {
      current_path: '/foo/bar',
      foo: 'bar',
      test: 'testing',
    });
  });
});
