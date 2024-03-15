import {
  completePhoneVerification,
  getSignupData,
  initiatePhoneVerification,
  signup,
} from '../services/registration-service';
import useAxios, { InstanceAPI } from './useAxios';

const useRegistrationService = () => {
  const axiosInstance = useAxios(InstanceAPI.REGISTRATION);

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
