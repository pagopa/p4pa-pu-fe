import translationIT from './it/translations.json';
import { Languages } from '@pagopa/mui-italia';

const lang: Languages & {
  it: { label: string; lang: string; translation: typeof translationIT };
} = {
  it: {
    it: 'Italiano',
    label: 'Italiano',
    lang: 'it-IT',
    translation: translationIT
  }
};

export default lang;
