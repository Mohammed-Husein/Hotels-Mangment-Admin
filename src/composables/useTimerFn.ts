export const useTimerFn = () => {
  const timeOut = ref();

  const FnExcute = (fn: Function, timerValue?: number) => {
    clearTimeout(timeOut.value);
    timeOut.value = setTimeout(() => {
      fn();
    }, timerValue || 3000);
  };

  return { FnExcute };
};
