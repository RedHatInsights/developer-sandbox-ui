import { axiosInstance } from './axios-instance';
import axios from 'axios';
import { recaptchaApiKey } from '../utils/recaptcha';
import { SignupData } from '../types';

// signup endpoint
const signupURL = '/api/v1/signup';

// phone verification endpoint
const phoneVerificationURL = '/api/v1/signup/verification';

export const getSignupData = async (): Promise<SignupData | undefined> => {
  try {
    const { data } = await axiosInstance.get<SignupData>(signupURL);
    return data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response?.status === 404) {
        return undefined;
      }
    }
    throw e;
  }
};

const getRecaptchaToken = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const apiKey = recaptchaApiKey;
    let timeout = false;
    const captchaTimeout = setTimeout(() => {
      timeout = true;
      reject('Recaptcha timeout.');
    }, 10000);
    if (grecaptcha?.enterprise) {
      grecaptcha.enterprise.ready(async () => {
        if (!timeout) {
          clearTimeout(captchaTimeout);
          try {
            resolve(
              await grecaptcha.enterprise.execute(apiKey, {
                action: 'SIGNUP',
              }),
            );
          } catch (e) {
            reject('Recaptcha failure.');
          }
        }
      });
    } else {
      reject('Recaptcha failure.');
    }
  });
};

export const signup = async () => {
  const token = await getRecaptchaToken();
  await axiosInstance.post(signupURL, null, {
    headers: {
      'Recaptcha-Token': token,
    },
  });
};

export const initiatePhoneVerification = async (countryCode: string, phoneNumber: string) => {
  if (!isValidCountryCode(countryCode)) {
    throw 'Invalid country code.';
  }
  if (!isValidPhoneNumber(phoneNumber)) {
    throw 'Invalid phone number.';
  }
  await axiosInstance.put(phoneVerificationURL, {
    country_code: countryCode,
    phone_number: phoneNumber,
  });
};

export const completePhoneVerification = async (code: string) => {
  await axiosInstance.get(`${phoneVerificationURL}/${code}`);
};

export const isValidCountryCode = (countryCode: string) => /^[+]?[0-9]+$/.test(countryCode);
export const isValidPhoneNumber = (phoneNumber: string) =>
  /^[(]?[0-9]+[)]?[-\s.]?[0-9]+[-\s./0-9]*$/im.test(phoneNumber);
