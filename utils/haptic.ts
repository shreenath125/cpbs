export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    switch (type) {
      case 'heavy':
        navigator.vibrate(20);
        break;
      case 'medium':
        navigator.vibrate(10);
        break;
      case 'light':
      default:
        navigator.vibrate(5);
        break;
    }
  }
};