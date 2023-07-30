const debugging = true;
export const debug = (...args: any[]) => {
  if (debugging) console.log(...args);
}
