// 小程序入口文件
const { THEMES, getTheme } = require('./utils/theme.js');

App({
  globalData: {
    themeKey: 'default',
    theme: getTheme('default'),
  },

  onLaunch() {
    console.log('小游戏集合启动');

    // 读取缓存的主题
    const savedThemeKey = wx.getStorageSync('themeKey');
    if (savedThemeKey && THEMES[savedThemeKey]) {
      this.globalData.themeKey = savedThemeKey;
      this.globalData.theme = getTheme(savedThemeKey);
    }

    this._applyTheme();
  },

  /**
   * 切换主题（全局生效）
   * @param {string} themeKey - 主题键名，比如 'default'、'dark'
   */
  setTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    this.globalData.themeKey = themeKey;
    this.globalData.theme = getTheme(themeKey);

    // 保存到本地缓存
    wx.setStorageSync('themeKey', themeKey);

    this._applyTheme();
  },

  /**
   * 应用主题到导航栏
   * @private
   */
  _applyTheme() {
    const { primary } = this.globalData.theme;
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: primary,
    });
  },
});

