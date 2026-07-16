const { THEMES, getTheme } = require('./theme.js');

const HOME_GAMES = [
  {
    id: 'game-2048',
    title: '2048',
    desc: '滑动合并数字',
    icon: '🧩',
    url: '/subpackages/game-2048/index',
    category: '益智',
    difficulty: '中等',
    tags: ['数字', '策略'],
    cardBg: 'linear-gradient(135deg, #FFE5D4 0%, #FFD4C4 100%)',
    iconBg: 'linear-gradient(135deg, #FF8E53 0%, #FF6B6B 100%)',
  },
  {
    id: 'game-tetris',
    title: '俄罗斯方块',
    desc: '经典消除游戏',
    icon: '🧱',
    url: '/subpackages/game-tetris/index',
    category: '反应',
    difficulty: '较难',
    tags: ['消除', '节奏'],
    cardBg: 'linear-gradient(135deg, #E8F8F5 0%, #D1F2EB 100%)',
    iconBg: 'linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)',
  },
  {
    id: 'game-catch',
    title: '接物品',
    desc: '接住掉落物品',
    icon: '🎯',
    url: '/subpackages/game-catch/index',
    category: '反应',
    difficulty: '轻松',
    tags: ['操作', '躲避'],
    cardBg: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
    iconBg: 'linear-gradient(135deg, #FFA07A 0%, #FFD700 100%)',
  },
  {
    id: 'game-memory',
    title: '记忆翻牌',
    desc: '考验记忆力',
    icon: '🎴',
    url: '/subpackages/game-memory/index',
    category: '记忆',
    difficulty: '递增',
    tags: ['配对', '闯关'],
    cardBg: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)',
    iconBg: 'linear-gradient(135deg, #EC407A 0%, #F48FB1 100%)',
  },
  {
    id: 'game-minesweeper',
    title: '扫雷',
    desc: '经典益智游戏',
    icon: '💣',
    url: '/subpackages/game-minesweeper/index',
    category: '推理',
    difficulty: '中等',
    tags: ['逻辑', '标记'],
    cardBg: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    iconBg: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
  },
  {
    id: 'game-whack',
    title: '打地鼠',
    desc: '疯狂点击解压',
    icon: '🐹',
    url: '/subpackages/game-whack/index',
    category: '反应',
    difficulty: '轻松',
    tags: ['点击', '连击'],
    cardBg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    iconBg: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
  },
  {
    id: 'game-fruit',
    title: '水果大战',
    desc: '点击水果得分',
    icon: '🍉',
    url: '/subpackages/game-fruit/index',
    category: '反应',
    difficulty: '轻松',
    tags: ['点击', '爆炸'],
    cardBg: 'linear-gradient(135deg, #F1F8E9 0%, #DCEDC8 100%)',
    iconBg: 'linear-gradient(135deg, #8BC34A 0%, #AED581 100%)',
  },
  {
    id: 'game-klotski',
    title: '华容道',
    desc: '经典滑块游戏',
    icon: '🤔',
    url: '/subpackages/game-klotski/index',
    category: '益智',
    difficulty: '较难',
    tags: ['滑块', '关卡'],
    cardBg: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
    iconBg: 'linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%)',
  },
];

const CANVAS_PALETTES = {
  default: {
    game2048: {
      boardBg: '#fffaf5',
      cellColors: {
        2: ['#ffeaa7', '#fdcb6e'],
        4: ['#fab1a0', '#e17055'],
        8: ['#fd79a8', '#e84393'],
        16: ['#a29bfe', '#6c5ce7'],
        32: ['#74b9ff', '#0984e3'],
        64: ['#81ecec', '#00cec9'],
        128: ['#55efc4', '#00b894'],
        256: ['#ff7675', '#d63031'],
        512: ['#fdcb6e', '#e17055'],
        1024: ['#e17055', '#d63031'],
        2048: ['#ffd700', '#ff8c00'],
        4096: ['#2d3436', '#000000'],
        8192: ['#2d3436', '#000000'],
        16384: ['#2d3436', '#000000'],
        32768: ['#2d3436', '#000000'],
        0: ['#cdc1b4', '#cdc1b4'],
      },
      textColors: {
        2: '#2d3436',
        4: '#ffffff',
        8: '#ffffff',
        16: '#ffffff',
        32: '#ffffff',
        64: '#ffffff',
        128: '#ffffff',
        256: '#ffffff',
        512: '#ffffff',
        1024: '#ffffff',
        2048: '#ffffff',
        4096: '#ffd700',
        8192: '#ffd700',
        16384: '#ffd700',
        32768: '#ffd700',
        0: '#ffffff',
      },
    },
    tetris: {
      colors: {
        I: '#FF6B9D',
        O: '#4ECDC4',
        T: '#FFE66D',
        S: '#95E1D3',
        Z: '#F38181',
        J: '#AA96DA',
        L: '#FCBAD3',
        board: '#2d3436',
      },
    },
    catch: {
      boardBg: 'rgba(255, 107, 107, 0.14)',
      player: {
        fill: '#8B4513',
        texture: '#A0522D',
        rim: '#D2691E',
      },
    },
    klotski: {
      boardBg: '#fffaf5',
      exitBg: 'rgba(255, 107, 107, 0.28)',
      exitText: '#ff6b6b',
      blockColors: {
        caocao: ['#ff6b6b', '#ee5a5a'],
        'v-general': ['#4ecdc4', '#44b3ab'],
        'h-general': ['#ffe66d', '#ffd93d'],
        soldier: ['#95e1d3', '#7ed7c6'],
      },
    },
  },
  fresh: {
    game2048: {
      boardBg: '#eefaf7',
      cellColors: {
        2: ['#d4f1f4', '#a8e6cf'],
        4: ['#b7efc5', '#70d6ff'],
        8: ['#9bf6ff', '#48cae4'],
        16: ['#cdb4db', '#a29bfe'],
        32: ['#ffc8dd', '#ffafcc'],
        64: ['#ffafcc', '#ff8fab'],
        128: ['#bde0fe', '#8ecae6'],
        256: ['#caffbf', '#80ed99'],
        512: ['#ffd6a5', '#ffb703'],
        1024: ['#ffb4a2', '#e76f51'],
        2048: ['#ffd93d', '#ffa500'],
        4096: ['#264653', '#1d3557'],
        8192: ['#264653', '#1d3557'],
        16384: ['#264653', '#1d3557'],
        32768: ['#264653', '#1d3557'],
        0: ['#cde6e3', '#cde6e3'],
      },
      textColors: {
        2: '#264653',
        4: '#264653',
        8: '#ffffff',
        16: '#ffffff',
        32: '#264653',
        64: '#ffffff',
        128: '#ffffff',
        256: '#264653',
        512: '#264653',
        1024: '#ffffff',
        2048: '#ffffff',
        4096: '#ffffff',
        8192: '#ffffff',
        16384: '#ffffff',
        32768: '#ffffff',
        0: '#264653',
      },
    },
    tetris: {
      colors: {
        I: '#48D1CC',
        O: '#A8E6CF',
        T: '#CDB4DB',
        S: '#70D6FF',
        Z: '#FFAFCC',
        J: '#BDE0FE',
        L: '#FFD6A5',
        board: '#203239',
      },
    },
    catch: {
      boardBg: 'rgba(32, 178, 170, 0.14)',
      player: {
        fill: '#2E8B57',
        texture: '#20B2AA',
        rim: '#48D1CC',
      },
    },
    klotski: {
      boardBg: '#eefaf7',
      exitBg: 'rgba(32, 178, 170, 0.28)',
      exitText: '#20b2aa',
      blockColors: {
        caocao: ['#ff8fab', '#ff6b6b'],
        'v-general': ['#48d1cc', '#20b2aa'],
        'h-general': ['#8ecae6', '#219ebc'],
        soldier: ['#b7efc5', '#70d6ff'],
      },
    },
  },
  warmOrange: {
    game2048: {
      boardBg: '#fff8e1',
      cellColors: {
        2: ['#fff3cd', '#ffd166'],
        4: ['#ffdd99', '#ffb703'],
        8: ['#ffb4a2', '#f77f00'],
        16: ['#ffd6a5', '#fb8500'],
        32: ['#ffc6ff', '#e76f51'],
        64: ['#ffadad', '#f94144'],
        128: ['#ffdccb', '#ff9f1c'],
        256: ['#f4d35e', '#ee964b'],
        512: ['#ffd93d', '#ffa500'],
        1024: ['#e17055', '#d63031'],
        2048: ['#ffd700', '#ff8c00'],
        4096: ['#3e2723', '#1b1b1b'],
        8192: ['#3e2723', '#1b1b1b'],
        16384: ['#3e2723', '#1b1b1b'],
        32768: ['#3e2723', '#1b1b1b'],
        0: ['#f2d6c6', '#f2d6c6'],
      },
      textColors: {
        2: '#3e2723',
        4: '#ffffff',
        8: '#ffffff',
        16: '#ffffff',
        32: '#ffffff',
        64: '#ffffff',
        128: '#ffffff',
        256: '#3e2723',
        512: '#ffffff',
        1024: '#ffffff',
        2048: '#ffffff',
        4096: '#ffd700',
        8192: '#ffd700',
        16384: '#ffd700',
        32768: '#ffd700',
        0: '#3e2723',
      },
    },
    tetris: {
      colors: {
        I: '#ffd700',
        O: '#ffb703',
        T: '#ff8fab',
        S: '#ffd166',
        Z: '#f94144',
        J: '#ff9f1c',
        L: '#f77f00',
        board: '#2b2118',
      },
    },
    catch: {
      boardBg: 'rgba(255, 160, 122, 0.16)',
      player: {
        fill: '#8D5524',
        texture: '#C68642',
        rim: '#FFD166',
      },
    },
    klotski: {
      boardBg: '#fff8e1',
      exitBg: 'rgba(255, 160, 122, 0.32)',
      exitText: '#6d4c41',
      blockColors: {
        caocao: ['#ff8c42', '#ff6b35'],
        'v-general': ['#ffd166', '#f4a261'],
        'h-general': ['#fcbf49', '#f77f00'],
        soldier: ['#ffcad4', '#ff9f1c'],
      },
    },
  },
  minimal: {
    game2048: {
      boardBg: '#eff6ff',
      cellColors: {
        2: ['#e0f2fe', '#bae6fd'],
        4: ['#dbeafe', '#bfdbfe'],
        8: ['#bfdbfe', '#93c5fd'],
        16: ['#bae6fd', '#7dd3fc'],
        32: ['#bbf7d0', '#86efac'],
        64: ['#fde68a', '#fcd34d'],
        128: ['#ddd6fe', '#c4b5fd'],
        256: ['#fecaca', '#fca5a5'],
        512: ['#fed7aa', '#fdba74'],
        1024: ['#7dd3fc', '#38bdf8'],
        2048: ['#fef3c7', '#fbbf24'],
        4096: ['#0ea5e9', '#0369a1'],
        8192: ['#0ea5e9', '#0369a1'],
        16384: ['#0ea5e9', '#0369a1'],
        32768: ['#0ea5e9', '#0369a1'],
        0: ['#dbeafe', '#dbeafe'],
      },
      textColors: {
        2: '#0f172a',
        4: '#0f172a',
        8: '#0f172a',
        16: '#0f172a',
        32: '#0f172a',
        64: '#0f172a',
        128: '#0f172a',
        256: '#0f172a',
        512: '#0f172a',
        1024: '#0f172a',
        2048: '#0f172a',
        4096: '#ffffff',
        8192: '#ffffff',
        16384: '#ffffff',
        32768: '#ffffff',
        0: '#3b82a8',
      },
    },
    tetris: {
      colors: {
        I: '#93C5FD',
        O: '#FDE68A',
        T: '#C4B5FD',
        S: '#86EFAC',
        Z: '#FCA5A5',
        J: '#A5B4FC',
        L: '#FDBA74',
        board: '#0C4A6E',
      },
    },
    catch: {
      boardBg: 'rgba(96, 165, 250, 0.12)',
      player: {
        fill: '#60A5FA',
        texture: '#38BDF8',
        rim: '#BAE6FD',
      },
    },
    klotski: {
      boardBg: '#eff6ff',
      exitBg: 'rgba(96, 165, 250, 0.20)',
      exitText: '#0284c7',
      blockColors: {
        caocao: ['#93c5fd', '#60a5fa'],
        'v-general': ['#bae6fd', '#7dd3fc'],
        'h-general': ['#bfdbfe', '#93c5fd'],
        soldier: ['#e0f2fe', '#bae6fd'],
      },
    },
  },
};

function themeToCssVars(theme) {
  return [
    `--page-bg:${theme.pageBg}`,
    `--page-bg-solid:${theme.pageBgSolid}`,
    `--primary:${theme.primary}`,
    `--secondary:${theme.secondary}`,
    `--accent-from:${theme.accentFrom}`,
    `--accent-to:${theme.accentTo}`,
    `--gold-from:${theme.goldFrom}`,
    `--gold-to:${theme.goldTo}`,
    `--warning:${theme.warning}`,
    `--danger:${theme.danger}`,
    `--success:${theme.success}`,
    `--text-primary:${theme.textPrimary}`,
    `--text-secondary:${theme.textSecondary}`,
    `--text-light:${theme.textLight}`,
    `--header-text-white:${theme.headerTextWhite}`,
    `--header-text-light:${theme.headerTextLight}`,
    `--button-primary-text:${theme.buttonPrimaryText || theme.headerTextWhite}`,
    `--header-card-bg:${theme.headerCardBg}`,
    `--tips-text:${theme.tipsText}`,
    `--card-back-from:${theme.cardBackFrom}`,
    `--card-back-to:${theme.cardBackTo}`,
    `--card-front:${theme.cardFront}`,
    `--panel-bg:${theme.canvasOverlayBg}`,
    `--overlay-bg:${theme.overlayBg || 'rgba(45, 52, 54, 0.78)'}`,
    `--game-card-bg:${theme.gameCardBg}`,
    `--game-card-shadow:${theme.gameCardShadow}`,
    `--home-card-tint-opacity:${theme.homeCardTintOpacity || 0.5}`,
    `--nav-front-color:${theme.navFrontColor}`,
    `--nav-background-color:${theme.navBackgroundColor}`,
  ].join(';');
}

function getThemeState(themeKey = 'default') {
  const resolvedKey = THEMES[themeKey] ? themeKey : 'default';
  const theme = getTheme(resolvedKey);
  return {
    themeKey: resolvedKey,
    theme,
    themeStyle: themeToCssVars(theme),
  };
}

function getStoredThemeState(appInstance) {
  const themeKey = appInstance && appInstance.globalData && appInstance.globalData.themeKey
    ? appInstance.globalData.themeKey
    : 'default';
  return getThemeState(themeKey);
}

function getHomeGameCards() {
  return HOME_GAMES.map(item => ({ ...item }));
}

function getThemeOptions(activeThemeKey = 'default') {
  return Object.keys(THEMES).map(key => {
    const theme = getTheme(key);
    return {
      key,
      name: theme.displayName || key,
      description: theme.description || '',
      primary: theme.primary,
      secondary: theme.secondary,
      active: key === activeThemeKey,
    };
  });
}

function getCanvasPalette(themeKey = 'default', gameKey) {
  const themeName = THEMES[themeKey] ? themeKey : 'default';
  const themePalettes = CANVAS_PALETTES[themeName] || CANVAS_PALETTES.default;
  return themePalettes[gameKey] || themePalettes;
}

function applyNavigationBar(theme) {
  if (typeof wx === 'undefined' || !wx.setNavigationBarColor) return;
  const frontColor = ['#000000', '#ffffff'].includes(theme.navFrontColor)
    ? theme.navFrontColor
    : '#000000';
  wx.setNavigationBarColor({
    frontColor,
    backgroundColor: theme.navBackgroundColor || theme.primary,
  });
}

function syncPageTheme(page, themeState = null) {
  if (!page || typeof page.setData !== 'function') return null;
  const app = typeof getApp === 'function' ? getApp() : null;
  const state = themeState || getStoredThemeState(app || {});
  page.setData({
    themeKey: state.themeKey,
    theme: state.theme,
    themeStyle: state.themeStyle,
  });
  return state;
}

function withThemePage(pageOptions = {}) {
  const userOnLoad = pageOptions.onLoad;
  const userOnShow = pageOptions.onShow;
  const userOnUnload = pageOptions.onUnload;

  return {
    ...pageOptions,
    data: {
      themeKey: 'default',
      theme: getTheme('default'),
      themeStyle: themeToCssVars(getTheme('default')),
      ...(pageOptions.data || {}),
    },
    onLoad(...args) {
      syncPageTheme(this);
      if (typeof userOnLoad === 'function') userOnLoad.apply(this, args);
      if (typeof this.onThemeChange === 'function') {
        this.onThemeChange(this.data.theme, this.data.themeKey);
      }
    },
    onShow(...args) {
      syncPageTheme(this);
      if (typeof userOnShow === 'function') userOnShow.apply(this, args);
      if (typeof this.onThemeChange === 'function') {
        this.onThemeChange(this.data.theme, this.data.themeKey);
      }
    },
    onUnload(...args) {
      if (typeof userOnUnload === 'function') userOnUnload.apply(this, args);
    },
    refreshTheme(themeKey) {
      const app = typeof getApp === 'function' ? getApp() : null;
      const state = getThemeState(themeKey || (app && app.globalData ? app.globalData.themeKey : 'default'));
      this.setData({
        themeKey: state.themeKey,
        theme: state.theme,
        themeStyle: state.themeStyle,
      });
      if (typeof this.onThemeChange === 'function') {
        this.onThemeChange(state.theme, state.themeKey);
      }
      return state;
    },
  };
}

module.exports = {
  HOME_GAMES,
  getHomeGameCards,
  getThemeOptions,
  getThemeState,
  getStoredThemeState,
  getCanvasPalette,
  applyNavigationBar,
  syncPageTheme,
  withThemePage,
};
