export const pirsch: typeof window.pirsch = (...args) => {
  if (window.pirsch) {
    window.pirsch(...args);
  }
};
