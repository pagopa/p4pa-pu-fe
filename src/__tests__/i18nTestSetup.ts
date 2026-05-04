import { initReactI18next } from 'react-i18next';
import i18n from '../translations/i18n';

export const i18nTestSetup = (langmap: object) => {
  i18n.use(initReactI18next).init({
    lng: 'it',
    fallbackLng: 'en',
    resources: {
      it: {
        translation: {
          ...langmap
        }
      }
    }
  });
};
