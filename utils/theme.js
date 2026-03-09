// 主题配置 - 精致配色系统
// 三套独特主题，每套都有明确的视觉性格

const THEMES = {
  // 默认主题：日落珊瑚系 - 温暖活力
  default: {
    // 主色调（珊瑚橙渐变）
    primary: '#FF6B6B',
    secondary: '#FF8E53',

    // 强调渐变（按钮、重要元素）
    accentFrom: '#FF8E53',
    accentTo: '#FF6B6B',

    // 高亮/奖励色（金色光芒）
    goldFrom: '#FFD93D',
    goldTo: '#FFA500',
    warning: '#FFD93D',

    // 危险/失败（珊瑚红）
    danger: '#FF6B6B',

    // 成功/正确（薄荷绿）
    success: '#20B2AA',

    // 文本颜色
    textPrimary: '#2D3436',
    textSecondary: '#636E72',
    textLight: '#B2BEC3',

    // 背景色（米白渐变）
    pageBg: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DC 100%)',
    pageBgSolid: '#FFF5F0',

    // Header 统计卡片
    headerTextWhite: '#FFFFFF',
    headerTextLight: 'rgba(255, 255, 255, 0.85)',
    headerCardBg: 'linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(255, 142, 83, 0.9) 100%)',

    // 操作提示
    tipsText: '#636E72',

    // 翻牌游戏卡片
    cardBackFrom: '#FFEAA7',
    cardBackTo: '#FDcb6E',
    cardFront: 'rgba(255, 255, 255, 0.9)',

    // Canvas 遮罩
    canvasOverlayBg: 'rgba(255, 255, 255, 0.25)',

    // 卡片背景（首页游戏卡片）
    gameCardBg: '#FFFFFF',
    gameCardShadow: 'rgba(255, 107, 107, 0.15)',
  },

  // 清新主题：薄荷迷雾系 - 清新舒适
  fresh: {
    // 主色调（薄荷绿）
    primary: '#20B2AA',
    secondary: '#48D1CC',

    // 强调渐变
    accentFrom: '#48D1CC',
    accentTo: '#20B2AA',

    // 高亮/奖励
    goldFrom: '#FFD93D',
    goldTo: '#FFA500',
    warning: '#FFD93D',

    // 危险/失败
    danger: '#FF6B6B',

    // 成功/正确
    success: '#20B2AA',

    // 文本颜色
    textPrimary: '#2D3436',
    textSecondary: '#636E72',
    textLight: '#B2BEC3',

    // 背景色（淡绿渐变）
    pageBg: 'linear-gradient(135deg, #E8F8F5 0%, #D1F2EB 100%)',
    pageBgSolid: '#E8F8F5',

    // Header 统计卡片
    headerTextWhite: '#FFFFFF',
    headerTextLight: 'rgba(255, 255, 255, 0.85)',
    headerCardBg: 'linear-gradient(135deg, rgba(32, 178, 170, 0.9) 0%, rgba(72, 209, 204, 0.9) 100%)',

    // 操作提示
    tipsText: '#636E72',

    // 翻牌游戏卡片
    cardBackFrom: '#D4F1F4',
    cardBackTo: '#A8E6CF',
    cardFront: 'rgba(255, 255, 255, 0.9)',

    // Canvas 遮罩
    canvasOverlayBg: 'rgba(255, 255, 255, 0.25)',

    // 卡片背景
    gameCardBg: '#FFFFFF',
    gameCardShadow: 'rgba(32, 178, 170, 0.15)',
  },

  // 暖阳主题：蜜糖暖阳系 - 温暖治愈
  warmOrange: {
    // 主色调（蜜糖橙）
    primary: '#FFA07A',
    secondary: '#FFD700',

    // 强调渐变
    accentFrom: '#FFD700',
    accentTo: '#FFA07A',

    // 高亮/奖励
    goldFrom: '#FFD93D',
    goldTo: '#FFA500',
    warning: '#FFD93D',

    // 危险/失败
    danger: '#FF6B6B',

    // 成功/正确
    success: '#20B2AA',

    // 文本颜色（深棕，护眼）
    textPrimary: '#3E2723',
    textSecondary: '#6D4C41',
    textLight: '#A1887F',

    // 背景色（暖白渐变）
    pageBg: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
    pageBgSolid: '#FFF8E1',

    // Header 统计卡片
    headerTextWhite: '#3E2723',
    headerTextLight: 'rgba(62, 39, 35, 0.7)',
    headerCardBg: 'linear-gradient(135deg, rgba(255, 160, 122, 0.95) 0%, rgba(255, 215, 0, 0.95) 100%)',

    // 操作提示
    tipsText: '#3E2723',

    // 翻牌游戏卡片
    cardBackFrom: '#FFE0B2',
    cardBackTo: '#FFCC80',
    cardFront: 'rgba(255, 255, 255, 0.9)',

    // Canvas 遮罩
    canvasOverlayBg: 'rgba(255, 255, 255, 0.25)',

    // 卡片背景
    gameCardBg: '#FFFFFF',
    gameCardShadow: 'rgba(255, 160, 122, 0.15)',
  },
};

// 获取主题
function getTheme(themeKey = 'default') {
  return THEMES[themeKey] || THEMES.default;
}

// 获取所有主题键名
function getThemeKeys() {
  return Object.keys(THEMES);
}

// 获取下一个主题（循环切换）
function getNextTheme(currentKey) {
  const keys = getThemeKeys();
  const currentIndex = keys.indexOf(currentKey);
  const nextIndex = (currentIndex + 1) % keys.length;
  return keys[nextIndex];
}

module.exports = {
  THEMES,
  getTheme,
  getThemeKeys,
  getNextTheme,
};
