// 主题配置
// 可以在这里集中维护项目的主题色卡，并支持多套主题切换

const THEMES = {
  // 默认主题：现在项目里实际使用的主色抽象整理
  default: {
    // 主色（标题、强调文字、卡片描边等）
    primary: '#667eea',
    secondary: '#764ba2',

    // 强调渐变（按钮、重要操作）
    accentFrom: '#f093fb',
    accentTo: '#f5576c',

    // 高亮 / 奖励色
    goldFrom: '#FFD700',
    goldTo: '#FFA500',
    warning: '#FFD93D',

    // 危险 / 失败提示
    danger: '#ff6b6b',

    // 文本与背景
    textPrimary: '#2d3436',
    textSecondary: '#636e72',
    pageBg: '#667eea',

    // Header 统计文字颜色
    headerTextWhite: '#ffffff',                  // 纯白 - 统计数值
    headerTextLight: 'rgba(255, 255, 255, 0.8)', // 半透明白 - 标签

    // Header 卡片容器背景
    headerCardBg: 'rgba(255, 255, 255, 0.2)',    // 半透明白色 - 统计卡片背景

    // 操作提示文字颜色
    tipsText: 'rgba(255, 255, 255, 0.7)',        // 半透明白 - 底部提示文字

    // 翻牌游戏卡片背景
    cardBackFrom: '#ffeaa7',                     // 卡片背面渐变起始色
    cardBackTo: '#fdcb6e',                       // 卡片背面渐变结束色
    cardFront: 'rgba(255, 255, 255, 0.2)',      // 卡片正面背景（问号面）
    // Canvas 覆盖层背景
    canvasOverlayBg: 'rgba(255, 255, 255, 0.15)',
  },
  fresh: {
    // 主色 & 次主色
    primary: '#4ECDC4',      // --primary
    secondary: '#45B7D1',

    // 强调色（按钮等），这里用同一色做渐变两端，必要时可以再拆分
    accentFrom: '#FFBC60',
    accentTo: '#FF9F1C',

     // 高亮 / 奖励色
     goldFrom: '#FFD700',
     goldTo: '#FFA500',
     warning: '#FFD93D',

     // 危险 / 失败提示
     danger: '#FF8A5C',

     // 文本与背景
     textPrimary: '#2d3436',
     textSecondary: '#636e72',
     pageBg: '#4ECDC4',

     // Header 统计文字颜色
     headerTextWhite: '#ffffff',
     headerTextLight: 'rgba(255, 255, 255, 0.8)',

     // Header 卡片容器背景
     headerCardBg: 'rgba(255, 255, 255, 0.2)',

     // 操作提示文字颜色
     tipsText: 'rgba(255, 255, 255, 0.7)',

     // 翻牌游戏卡片背景
     cardBackFrom: '#ffeaa7',
     cardBackTo: '#fdcb6e',
     cardFront: 'rgba(255, 255, 255, 0.2)',

     // Canvas 覆盖层背景
     canvasOverlayBg: 'rgba(255, 255, 255, 0.15)',
  },
  warmOrange: {
    // 主色：温暖活力橙
    primary: '#FF9A3C',
    secondary: '#FF7733',

    // 强调渐变按钮（暖橙 → 红橙）
    accentFrom: '#FFB86C',
    accentTo: '#FF7733',

    // 金色高亮
    goldFrom: '#FFD700',
    goldTo: '#FFA500',

    // 提示色
    warning: '#FFCC66',
    danger: '#FF6B6B',

    // 文字（深灰，护眼不刺眼）
    textPrimary: '#333333',
    textSecondary: '#777777',

    // 背景（浅暖白，非常舒服）
    pageBg: '#FFF9F2',
    cardBg: '#FFFFFF',

    // 顶部标题栏文字
    headerTextWhite: '#ffffff',
    headerTextLight: 'rgba(255, 255, 255, 0.85)',

    // Header 卡片容器背景
    headerCardBg: '#FF917a',

    // 操作提示文字颜色
    tipsText: '#333333',

    // 翻牌游戏卡片背景
    cardBackFrom: '#ffeaa7',
    cardBackTo: '#fdcb6e',
    cardFront: '#FFCD9E',

    // Canvas 覆盖层背景
    canvasOverlayBg: 'rgba(255, 255, 255, 0.6)',
  },
};

function getTheme(themeKey = 'default') {
  return THEMES[themeKey] || THEMES.default;
}

module.exports = {
  THEMES,
  getTheme,
};

