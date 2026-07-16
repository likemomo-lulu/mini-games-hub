// 小程序入口文件
const { THEMES, getTheme } = require('./utils/theme.js');
const {
  getThemeState,
  applyNavigationBar,
} = require('./utils/theme-manager.js');

App({
  globalData: {
    themeKey: 'default',
    theme: getTheme('default'),
    themeStyle: '',
  },

  onLaunch() {
    console.log('盖姆小院启动');

    // 读取缓存的主题
    const savedThemeKey = wx.getStorageSync('themeKey');
    const state = getThemeState(savedThemeKey && THEMES[savedThemeKey] ? savedThemeKey : 'default');
    this._applyThemeState(state);
  },

  /**
   * 切换主题（全局生效）
   * @param {string} themeKey - 主题键名
   */
  setTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    const state = getThemeState(themeKey);
    wx.setStorageSync('themeKey', themeKey);
    this._applyThemeState(state);
  },

  /**
   * 应用主题到全局状态和导航栏
   * @private
   */
  _applyThemeState(state) {
    this.globalData.themeKey = state.themeKey;
    this.globalData.theme = state.theme;
    this.globalData.themeStyle = state.themeStyle;
    applyNavigationBar(state.theme);
  },
});
