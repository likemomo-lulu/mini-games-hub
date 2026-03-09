// 首页 - 游戏列表
const app = getApp();
const { getNextTheme } = require('../../utils/theme.js');

Page({
  data: {
    theme: app.globalData.theme,
  },

  onShow() {
    // 每次显示时同步最新主题
    this.setData({
      theme: app.globalData.theme,
    });
  },

  // 切换主题
  onSwitchTheme() {
    const currentKey = app.globalData.themeKey || 'default';
    const nextKey = getNextTheme(currentKey);

    app.setTheme(nextKey);
    this.setData({
      theme: app.globalData.theme,
    });
  },
});
