import useRegistrationService from '../useRegistrationService';
import {
  completePhoneVerification,
  getSignupData,
  initiatePhoneVerification,
  signup,
} from '../../services/registration-service';

const axiosInstanceMock = {};
jest.mock('../../services/registration-service');
jest.mock('../../hooks/useAxios', () => {
  const actual = jest.requireActual('../../hooks/useAxios');
  return {
    ...actual,
    __esModule: true,
    default: () => axiosInstanceMock,
  };
});

describe('useRegistrationService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should delegate to completePhoneVerification with axios instance', () => {
    const { completePhoneVerification: testFn } = useRegistrationService();
    testFn('test');
    expect(completePhoneVerification).toHaveBeenCalledWith(axiosInstanceMock, 'test');
  });

  it('should delegate to getSignupData with axios instance', () => {
    const { getSignupData: testFn } = useRegistrationService();
    testFn();
    expect(getSignupData).toHaveBeenCalledWith(axiosInstanceMock);
  });

  it('should delegate to initiatePhoneVerification with axios instance', () => {
    const { initiatePhoneVerification: testFn } = useRegistrationService();
    testFn('1', '1231231234');
    expect(initiatePhoneVerification).toHaveBeenCalledWith(axiosInstanceMock, '1', '1231231234');
  });

  it('should delegate to signup with axios instance', () => {
    const { signup: testFn } = useRegistrationService();
    testFn();
    expect(signup).toHaveBeenCalledWith(axiosInstanceMock);
  });
});
