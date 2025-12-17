const PRESERVED_KEY_PREFIXES = ['userProfilePreference:'];

const clear = () => {
  window.sessionStorage.clear();

  Object.keys(window.localStorage)
    .filter(
      (key) => !PRESERVED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))
    )
    .forEach((key) => {
      window.localStorage.removeItem(key);
    });
};

export default {
  clear
};
