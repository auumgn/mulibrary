const debugging = false;
export const debug = (...args: any[]) => {
  if (debugging) console.log(...args);
};
