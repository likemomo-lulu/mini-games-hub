// 首页：从全局获取当前主题，用于演示主题色配置与应用
const app = getApp();
const { THEMES } = require('../../utils/theme.js');

Page({
  data: {
    theme: app.globalData.theme,
  },

  onShow() {
    // 每次显示时同步最新主题（支持后续切换主题后返回首页也能更新）
    this.setData({
      theme: app.globalData.theme,
    });
  },

  onSwitchTheme() {
    // 根据 theme 配置动态获取所有可用主题键名
    const order = Object.keys(THEMES);
    const currentKey = app.globalData.themeKey || order[0];
    const idx = order.indexOf(currentKey);
    const nextKey = order[(idx + 1 + order.length) % order.length];

    app.setTheme(nextKey);
    this.setData({
      theme: app.globalData.theme,
    });
  },
});

