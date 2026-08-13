/**
 * Safe helper wrapper for Telegram Mini App WebApp SDK
 */

export function getTelegramApp() {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function initTelegramApp() {
  const tg = getTelegramApp();
  if (tg) {
    tg.ready();
    tg.expand();
    try {
      tg.enableClosingConfirmation();
    } catch (e) {
      // Ignore if unsupported
    }
  }
  return tg;
}

export function triggerHaptic(type = 'impact', style = 'medium') {
  const tg = getTelegramApp();
  if (tg && tg.HapticFeedback) {
    if (type === 'impact') {
      tg.HapticFeedback.impactOccurred(style);
    } else if (type === 'notification') {
      tg.HapticFeedback.notificationOccurred(style);
    } else if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    }
  }
}

export function getUserInfo() {
  const tg = getTelegramApp();
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    return tg.initDataUnsafe.user;
  }
  return {
    first_name: 'CS Admin',
    last_name: '',
    username: 'cs_manager',
    photo_url: null
  };
}
