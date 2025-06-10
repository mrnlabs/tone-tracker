export function truncateText(text, limit) {
    return text.length > limit ? text.substring(0, limit) + '...' : text
  }

  /**
 * Author: Mazisi Msebele
 * Date: 15 Sep 2024
 * Description: Debounces a given function by the given time in milliseconds.
 **/
/** 
 * @function debounce
 * @description Debounces a given function by the given time in milliseconds.
 * @param {function} func The function to debounce.
 * @param {number} delay The time in milliseconds to debounce.
 * @returns A new debounced function.
 * @example
 * const debouncedClick = debounce((e) => console.log(e.target), 500);
 * button.addEventListener('click', debouncedClick);
 */
export const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
