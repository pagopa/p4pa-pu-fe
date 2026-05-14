import i18n from '@core/translations/i18n';
import translationIT from './it/translations.json';

export const enterpriseTranslations = {
  it: translationIT
};

i18n.addResourceBundle('it', 'send', enterpriseTranslations.it);
