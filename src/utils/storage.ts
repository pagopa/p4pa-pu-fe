import { STORAGE_KEY_PREFIX } from './userPreferences';

const clear = () => {
  window.sessionStorage.clear();

  Object.keys(window.localStorage)
    .filter((key) => !key.startsWith(STORAGE_KEY_PREFIX))
    .forEach((key) => {
      window.localStorage.removeItem(key);
    });
};

export default {
  clear
};
