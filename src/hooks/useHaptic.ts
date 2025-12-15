export const useHaptic = () => {
  const trigger = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        warning: [20, 50, 20],
        error: [30, 50, 30, 50, 30]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  return { trigger };
};
