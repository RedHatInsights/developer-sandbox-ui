import {
  completePhoneVerification,
  getSignupData,
  initiatePhoneVerification,
  signup,
} from '../services/registration-service';
import useAxios from './useAxios';

const useRegistrationService = () => {
  const axiosInstance = useAxios();

  return {
    getSignupData: () => getSignupData(axiosInstance),

    signup: () => signup(axiosInstance),

    initiatePhoneVerification: async (countryCode: string, phoneNumber: string) =>
      initiatePhoneVerification(axiosInstance, countryCode, phoneNumber),

    completePhoneVerification: async (code: string) =>
      completePhoneVerification(axiosInstance, code),
  };
};

export default useRegistrationService;
