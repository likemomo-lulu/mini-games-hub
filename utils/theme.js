// 主题配置 - 精致配色系统
// 三套独特主题，每套都有明确的视觉性格

const THEMES = {
  // 默认主题：日落珊瑚系 - 温暖活力
  default: {
    displayName: '日落珊瑚',
    description: '温暖活力',
    // 主色调（珊瑚橙渐变）
    primary: '#FF6B6B',
    secondary: '#FF8E53',
    navFrontColor: '#000000',
    navBackgroundColor: '#FF6B6B',

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
    overlayBg: 'rgba(45, 52, 54, 0.78)',

    // 卡片背景（首页游戏卡片）
    gameCardBg: '#FFFFFF',
    gameCardShadow: 'rgba(255, 107, 107, 0.15)',
  },

  // 清新主题：薄荷迷雾系 - 清新舒适
  fresh: {
    displayName: '薄荷迷雾',
    description: '清新舒适',
    // 主色调（薄荷绿）
    primary: '#20B2AA',
    secondary: '#48D1CC',
    navFrontColor: '#000000',
    navBackgroundColor: '#20B2AA',

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
    overlayBg: 'rgba(32, 50, 57, 0.78)',

    // 卡片背景
    gameCardBg: '#FFFFFF',
    gameCardShadow: 'rgba(32, 178, 170, 0.15)',
  },

  // 暖阳主题：蜜糖暖阳系 - 温暖治愈
  warmOrange: {
    displayName: '蜜糖暖阳',
    description: '温暖治愈',
    // 主色调（蜜糖橙）
    primary: '#FFA07A',
    secondary: '#FFD700',
    // 微信小程序导航栏前景色只支持 #000000 / #ffffff，深棕正文色不能直接用于此字段。
    navFrontColor: '#000000',
    navBackgroundColor: '#FFA07A',

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
    overlayBg: 'rgba(62, 39, 35, 0.72)',

    // 卡片背景
    gameCardBg: '#FFFFFF',
    gameCardShadow: 'rgba(255, 160, 122, 0.15)',
  },

  // 简约主题：雪山留白系 - 淡蓝、留白、轻阴影
  minimal: {
    displayName: '雪山留白',
    description: '淡蓝简约',

    // 主色调（冰川淡蓝）
    primary: '#60A5FA',
    secondary: '#BAE6FD',
    navFrontColor: '#000000',
    navBackgroundColor: '#E0F2FE',

    // 强调渐变（按钮、重要元素）
    accentFrom: '#BAE6FD',
    accentTo: '#60A5FA',
    buttonPrimaryText: '#0F172A',

    // 高亮/奖励色（淡琥珀）
    goldFrom: '#FBBF24',
    goldTo: '#D97706',
    warning: '#FBBF24',

    // 危险/失败（低饱和红）
    danger: '#DC2626',

    // 成功/正确（低饱和绿）
    success: '#059669',

    // 文本颜色
    textPrimary: '#0F172A',
    textSecondary: '#3B82A8',
    textLight: '#93C5FD',

    // 背景色（冰蓝渐变）
    pageBg: 'linear-gradient(135deg, #EFF6FF 0%, #E0F2FE 100%)',
    pageBgSolid: '#EFF6FF',

    // Header 统计卡片
    headerTextWhite: '#0F172A',
    headerTextLight: 'rgba(15, 23, 42, 0.62)',
    headerCardBg: 'linear-gradient(135deg, rgba(224, 242, 254, 0.96) 0%, rgba(186, 230, 253, 0.92) 100%)',

    // 操作提示
    tipsText: '#3B82A8',

    // 翻牌游戏卡片
    cardBackFrom: '#E0F2FE',
    cardBackTo: '#BAE6FD',
    cardFront: 'rgba(255, 255, 255, 0.94)',

    // Canvas 遮罩
    canvasOverlayBg: 'rgba(224, 242, 254, 0.55)',
    overlayBg: 'rgba(12, 74, 110, 0.62)',

    // 卡片背景（首页游戏卡片）
    gameCardBg: '#FFFFFF',
    gameCardShadow: 'rgba(14, 165, 233, 0.10)',
    homeCardTintOpacity: 0.22,
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
