import { ReviewResponse } from './review';

export type RootStackParamList = {
  Home: undefined;
  Result: { review: ReviewResponse };
  History: undefined;
  AuthCallback: { token?: string; error?: string };
};
