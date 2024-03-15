import { SignupData } from '../../types';
import { signupDataToStatus } from '../registration-context';

describe('registration-context', () => {
  it('should determine status from signup data', () => {
    expect(signupDataToStatus()).toBe('new');
    expect(
      signupDataToStatus({
        status: {
          ready: true,
        },
      } as SignupData),
    ).toBe('ready');
    expect(
      signupDataToStatus({
        status: {
          ready: false,
          verificationRequired: true,
        },
      } as SignupData),
    ).toBe('verify');
    expect(
      signupDataToStatus({
        status: {
          ready: false,
          reason: 'Provisioning',
        },
      } as SignupData),
    ).toBe('provisioning');
    expect(
      signupDataToStatus({
        status: {
          ready: false,
        },
      } as SignupData),
    ).toBe('pending-approval');
  });
});
