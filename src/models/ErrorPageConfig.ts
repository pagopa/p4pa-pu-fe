import { ButtonConfig } from '../components/ResponsePage/ResponsePage';

type ErrorPage = {
  title: string;
  description: string;
  buttonConfig?: Array<ButtonConfig>;
};

type ErrorOpts = Record<string, ErrorPage>;

export const ErrorPageConfig: ErrorOpts = {
  default: {
    title: 'utilityPages.genericError.title',
    description: 'utilityPages.genericError.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.back',
        actionID: 'HOME'
      }
    ]
  }
};
