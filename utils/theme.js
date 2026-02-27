// 主题配置
// 可以在这里集中维护项目的主题色卡，并支持多套主题切换

const THEMES = {
  // 默认主题：现在项目里实际使用的主色抽象整理
  default: {
    // 主色（标题、强调文字、卡片描边等）
    primary: '#667eea',
    primaryDark: '#764ba2',

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
  },

  // 清爽亮色主题（参考用户提供的配色方案）
  fresh: {
    // 主色 & 次主色
    primary: '#4ECDC4',      // --primary
    primaryDark: '#45B7D1',  // --secondary

    // 强调色（按钮等），这里用同一色做渐变两端，必要时可以再拆分
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
     pageBg: '#4ECDC4',
  },
};

function getTheme(themeKey = 'default') {
  return THEMES[themeKey] || THEMES.default;
}

module.exports = {
  THEMES,
  getTheme,
};

