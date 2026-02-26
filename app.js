// 小程序入口文件
const { THEMES, getTheme } = require('./utils/theme.js');

App({
  globalData: {
    themeKey: 'default',
    theme: getTheme('default'),
  },

  onLaunch() {
    console.log('小游戏集合启动');
  },

  /**
   * 切换主题（全局生效）
   * @param {string} themeKey - 主题键名，比如 'default'、'dark'
   */
  setTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    this.globalData.themeKey = themeKey;
    this.globalData.theme = getTheme(themeKey);
  },
});

