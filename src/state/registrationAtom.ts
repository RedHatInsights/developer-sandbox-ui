import { atom } from 'jotai';
import { SignupData } from '../types';

export const registrationSignUpData = atom<SignupData | undefined>(undefined);
