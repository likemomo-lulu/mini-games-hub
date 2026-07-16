const app = getApp();
const {
  getThemeOptions,
  withThemePage,
} = require('../../utils/theme-manager.js');
const {
  getAppSettings,
  setAppSetting,
} = require('../../utils/settings-manager.js');
const {
  clearGameRecords,
} = require('../../utils/game-records.js');
const {
  clearAchievements,
  getAchievements,
} = require('../../utils/achievements.js');
const {
  showConfirm,
  showToast,
} = require('../../utils/modal-manager.js');

Page(withThemePage({
  data: {
    themeOptions: [],
    settings: {
      vibration: true,
    },
    achievements: [],
    achievementProgress: '',
  },

  onLoad() {
    this.refreshSettings();
  },

  onShow() {
    this.refreshSettings();
  },

  onThemeChange() {
    this.refreshSettings();
  },

  refreshSettings() {
    const achievements = getAchievements();
    const unlockedCount = achievements.filter(item => item.unlocked).length;
    this.setData({
      themeOptions: getThemeOptions(this.data.themeKey),
      settings: getAppSettings(),
      achievements,
      achievementProgress: `${unlockedCount}/${achievements.length}`,
    });
  },

  onSelectTheme(e) {
    const { key } = e.currentTarget.dataset;
    if (!key) return;
    app.setTheme(key);
    this.refreshTheme(key);
    this.refreshSettings();
    showToast({
      title: '皮肤已切换',
      icon: 'success',
    });
  },

  onVibrationChange(e) {
    const settings = setAppSetting('vibration', e.detail.value);
    this.setData({ settings });
  },

  onClearRecords() {
    showConfirm({
      title: '清空本地数据',
      content: '会清空最近游玩、最佳记录和成就，皮肤与设置会保留。',
      confirmText: '清空',
      onConfirm: () => {
        clearGameRecords();
        clearAchievements();
        this.refreshSettings();
        showToast({
          title: '已清空',
          icon: 'success',
        });
      },
    });
  },
}));
