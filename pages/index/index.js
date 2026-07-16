// 首页 - 游戏列表
const {
  getHomeGameCards,
  getThemeOptions,
  withThemePage,
} = require('../../utils/theme-manager.js');
const {
  getRecentGame,
  recordGameVisit,
} = require('../../utils/game-records.js');
const { showToast } = require('../../utils/modal-manager.js');

Page(withThemePage({
  data: {
    games: [],
    recentGame: null,
    currentThemeName: '',
  },

  onLoad() {
    this.refreshHome();
  },

  onShow() {
    this.refreshHome();
  },

  onThemeChange() {
    this.refreshHome();
  },

  refreshHome() {
    const games = getHomeGameCards();
    const themeOptions = getThemeOptions(this.data.themeKey);
    const currentTheme = themeOptions.find(item => item.active) || themeOptions[0];
    this.setData({
      games,
      recentGame: getRecentGame(games),
      currentThemeName: currentTheme ? currentTheme.name : '默认',
    });
  },

  onOpenSettings() {
    wx.navigateTo({
      url: '/pages/settings/index',
    });
  },

  onGameTap(e) {
    const { id, url } = e.currentTarget.dataset;
    if (!id || !url) return;

    wx.navigateTo({
      url,
      success: () => {
        recordGameVisit(id);
      },
      fail: (error) => {
        console.error('打开游戏失败:', id, url, error);
        showToast({
          title: '打开失败',
          icon: 'none',
        });
      },
    });
  },
}));
