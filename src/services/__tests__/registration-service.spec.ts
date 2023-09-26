import {
  completePhoneVerification,
  getSignupData,
  initiatePhoneVerification,
  signup,
} from '../registration-service';
import { recaptchaApiKey } from '../../utils/recaptcha';
import { AxiosInstance } from 'axios';

const getMock = jest.fn() as jest.Mock;
const putMock = jest.fn() as jest.Mock;
const postMock = jest.fn() as jest.Mock;

const axiosInstance = {
  get: getMock,
  put: putMock,
  post: postMock,
} as unknown as AxiosInstance;

describe('registration-service', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getSignupData', () => {
    it('should get signup data', async () => {
      const mockData = {
        foo: 'bar',
      };
      getMock.mockReturnValue({ data: mockData });
      const data = await getSignupData(axiosInstance);
      expect(getMock).toHaveBeenCalledWith('/api/v1/signup');
      expect(data).toEqual(mockData);
    });

    it('should return undefined for error 404', async () => {
      getMock.mockImplementation(() => {
        throw {
          isAxiosError: true,
          response: {
            status: 404,
          },
        };
      });
      const data = await getSignupData(axiosInstance);
      expect(getMock).toHaveBeenCalledWith('/api/v1/signup');
      expect(data).toBeUndefined();
    });

    it('should reject errors', () => {
      const error = {
        isAxiosError: true,
        code: '403',
      };
      getMock.mockImplementation(() => {
        throw error;
      });
      expect(() => getSignupData(axiosInstance)).rejects.toBe(error);
    });
  });

  describe('initiatePhoneVerification', () => {
    it('should reject invalid country code and phone number', () => {
      expect(() =>
        initiatePhoneVerification(axiosInstance, 'invalid', '123 123 1234'),
      ).rejects.toBe('Invalid country code.');
      expect(() => initiatePhoneVerification(axiosInstance, '1', 'invalid')).rejects.toBe(
        'Invalid phone number.',
      );
    });

    it('should initiate phone verification', async () => {
      const data = await initiatePhoneVerification(axiosInstance, '1', '123 123 1234');
      expect(putMock).toHaveBeenCalledWith('/api/v1/signup/verification', {
        country_code: '1',
        phone_number: '123 123 1234',
      });
      expect(data).toBeUndefined();
    });

    it('should reject errors', () => {
      const error = {
        isAxiosError: true,
        code: '403',
      };
      putMock.mockImplementation(() => {
        throw error;
      });
      expect(() => initiatePhoneVerification(axiosInstance, '1', '123 123 1234')).rejects.toBe(
        error,
      );
      expect(putMock).toHaveBeenCalledWith('/api/v1/signup/verification', {
        country_code: '1',
        phone_number: '123 123 1234',
      });
    });

    describe('completePhoneVerification', () => {
      it('should complete phone verification', async () => {
        await completePhoneVerification(axiosInstance, '12345');
        expect(getMock).toHaveBeenCalledWith('/api/v1/signup/verification/12345');
      });

      it('should reject errors', () => {
        const error = {
          isAxiosError: true,
          code: '403',
        };
        getMock.mockImplementation(() => {
          throw error;
        });
        expect(() => completePhoneVerification(axiosInstance, '12345')).rejects.toBe(error);
        expect(getMock).toHaveBeenCalledWith('/api/v1/signup/verification/12345');
      });
    });

    describe('signup', () => {
      it('should request token from recaptcha', async () => {
        window.grecaptcha = {
          enterprise: {
            ready: jest.fn((cb) => cb()),
            execute: jest.fn(async () => 'test-token'),
          },
        };
        await signup(axiosInstance);
        expect(window.grecaptcha.enterprise.ready).toHaveBeenCalled();
        expect(window.grecaptcha.enterprise.execute).toHaveBeenCalledWith(recaptchaApiKey, {
          action: 'SIGNUP',
        });
        expect(postMock).toHaveBeenCalledWith('/api/v1/signup', null, {
          headers: {
            'Recaptcha-Token': 'test-token',
          },
        });
      });

      it('should timeout recaptcha ready', async () => {
        jest.useFakeTimers();

        window.grecaptcha = {
          enterprise: {
            ready: jest.fn(),
            execute: jest.fn(async () => 'test-token'),
          },
        };
        const promise = signup(axiosInstance);
        expect(window.grecaptcha.enterprise.ready).toHaveBeenCalled();
        expect(window.grecaptcha.enterprise.execute).not.toHaveBeenCalled();

        jest.advanceTimersByTime(10000);

        await expect(promise).rejects.toBe('Recaptcha timeout.');
        jest.useRealTimers();
      });

      it('should reject errors', () => {
        const error = {
          isAxiosError: true,
          code: '403',
        };
        postMock.mockImplementation(() => {
          throw error;
        });
        expect(() => signup(axiosInstance)).rejects.toBe(error);
      });
    });
  });
});
