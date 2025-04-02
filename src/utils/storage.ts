/** clear both session and local storage */
const clear = () => {
  window.sessionStorage.clear();
  window.localStorage.clear();
};

export default {
  clear
};
