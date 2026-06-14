import * as yup from 'yup';

export const audioSchema = yup.object({
  audio: yup.mixed().required('Audio file is required'),
});

export const textToVoiceSchema = yup.object({
  text: yup.string().required('Text is required'),
  voice: yup.string().required('Voice is required'),
});

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'At least 6 chars').required('Password is required'),
});

export const registerSchema = yup.object({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'At least 6 chars').required('Password is required'),
});