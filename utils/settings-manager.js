const SETTINGS_KEY = 'appSettings';

const DEFAULT_SETTINGS = {
  // 是否允许游戏触发震动反馈。关闭后会拦截 wx.vibrateShort / wx.vibrateLong 包装调用。
  vibration: true,
};

function canUseStorage() {
  return typeof wx !== 'undefined' && wx.getStorageSync && wx.setStorageSync;
}

function getAppSettings() {
  if (!canUseStorage()) return { ...DEFAULT_SETTINGS };
  try {
    const saved = wx.getStorageSync(SETTINGS_KEY);
    return {
      ...DEFAULT_SETTINGS,
      ...(saved && typeof saved === 'object' ? saved : {}),
    };
  } catch (error) {
    console.error('读取设置失败:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

function saveAppSettings(settings) {
  const nextSettings = {
    ...DEFAULT_SETTINGS,
    ...(settings || {}),
  };
  if (!canUseStorage()) return nextSettings;
  try {
    wx.setStorageSync(SETTINGS_KEY, nextSettings);
  } catch (error) {
    console.error('保存设置失败:', error);
  }
  return nextSettings;
}

function setAppSetting(key, value) {
  const settings = getAppSettings();
  return saveAppSettings({
    ...settings,
    [key]: value,
  });
}

function resetAppSettings() {
  return saveAppSettings(DEFAULT_SETTINGS);
}

function canVibrate() {
  return getAppSettings().vibration !== false;
}

function vibrateShort(options = {}) {
  if (!canVibrate()) return;
  if (typeof wx !== 'undefined' && wx.vibrateShort) {
    wx.vibrateShort(options);
  }
}

function vibrateLong(options = {}) {
  if (!canVibrate()) return;
  if (typeof wx !== 'undefined' && wx.vibrateLong) {
    wx.vibrateLong(options);
  }
}

module.exports = {
  DEFAULT_SETTINGS,
  getAppSettings,
  saveAppSettings,
  setAppSetting,
  resetAppSettings,
  vibrateShort,
  vibrateLong,
};
