import { ButtonConfig } from '../components/ResponsePage/ResponsePage';

type ErrorPage = {
  title: string;
  description: string;
  buttonConfig?: Array<ButtonConfig>;
};

type ErrorOpts = Record<string, ErrorPage>;

export const ErrorPageConfig: ErrorOpts = {
  'spontaneous-form-create': {
    title: 'spontaneousForm.create.error.title',
    description: 'spontaneousForm.create.error.description',
    buttonConfig: [
      {
        variant: 'contained',
        size: 'large',
        buttonLabel: 'commons.close',
        actionID: 'SPONTANEOUS_FORM_INDEX'
      }
    ]
  },
  defaultOptions: {
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
