export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
