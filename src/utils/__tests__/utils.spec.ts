import { errorMessage } from '../utils';

describe('utils', () => {
  it('should extract error message', () => {
    expect(errorMessage({ isAxiosError: true, message: 'axios error message' })).toBe(
      'axios error message',
    );

    expect(errorMessage({ isAxiosError: true })).toBe('');
    expect(
      errorMessage({
        isAxiosError: true,
        message: 'axios error message',
        response: { data: { message: 'response message' } },
      }),
    ).toBe('response message');
    expect(errorMessage('test string')).toBe('test string');
    expect(errorMessage(new String('test string object'))).toBe('test string object');
    expect(errorMessage(new Error('test error'))).toBe('Error: test error');
    expect(errorMessage(null)).toBe('');
    expect(errorMessage(undefined)).toBe('');
  });
});
