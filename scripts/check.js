#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const IGNORED_DIRS = new Set(['.git', 'node_modules', 'miniprogram_npm']);
const REQUIRED_THEME_VARS = [
  '--page-bg:',
  '--primary:',
  '--panel-bg:',
  '--overlay-bg:',
  '--home-card-tint-opacity:',
];
const REQUIRED_GAME_FIELDS = ['id', 'title', 'url', 'category', 'difficulty', 'tags'];
const CANVAS_GAME_KEYS = ['game2048', 'tetris', 'catch', 'klotski'];
const RUNTIME_CODE_DIRS = ['pages', 'subpackages', 'utils'];

let failed = false;

function walk(dir, matcher, result = []) {
  if (!fs.existsSync(dir)) return result;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.eslintrc') continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        walk(fullPath, matcher, result);
      }
      continue;
    }

    if (matcher(fullPath)) result.push(fullPath);
  }

  return result;
}

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function formatFile(filePath) {
  return path.relative(ROOT, filePath);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runCheck(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    failed = true;
    console.error(`❌ ${name}`);
    console.error(`   ${error.message}`);
  }
}

function checkJsSyntax() {
  const jsFiles = walk(ROOT, file => file.endsWith('.js'));
  jsFiles.forEach(file => {
    try {
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    } catch (error) {
      const detail = error.stderr ? error.stderr.toString().trim() : error.message;
      throw new Error(`${formatFile(file)} 语法检查失败\n${detail}`);
    }
  });
}

function checkJsonSyntax() {
  const jsonFiles = walk(ROOT, file => file.endsWith('.json'));
  jsonFiles.forEach(file => {
    try {
      JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      throw new Error(`${formatFile(file)} JSON 解析失败：${error.message}`);
    }
  });
}

function checkAppRoutes() {
  const appJson = readJson('app.json');
  assert(Array.isArray(appJson.pages), 'app.json 缺少 pages 配置');
  assert(appJson.pages.includes('pages/index/index'), 'app.json 缺少首页路由 pages/index/index');
  assert(appJson.pages.includes('pages/settings/index'), 'app.json 缺少设置页路由 pages/settings/index');

  const gamePackage = (appJson.subPackages || []).find(item => item.root === 'subpackages');
  assert(gamePackage, 'app.json 缺少 subpackages 分包配置');
  assert(Array.isArray(gamePackage.pages), 'subpackages 配置缺少 pages');
  assert(gamePackage.pages.length === 8, `游戏分包页面数量应为 8，当前为 ${gamePackage.pages.length}`);
  assert(appJson.window.navigationBarTextStyle === 'black', 'navigationBarTextStyle 应保持 black，运行时由主题管理导航栏颜色');
}

function checkThemeSystem() {
  const { THEMES } = require(path.join(ROOT, 'utils/theme.js'));
  const {
    getCanvasPalette,
    getHomeGameCards,
    getThemeOptions,
    getThemeState,
  } = require(path.join(ROOT, 'utils/theme-manager.js'));

  const themeKeys = Object.keys(THEMES);
  assert(themeKeys.length >= 4, `主题数量至少应为 4，当前为 ${themeKeys.length}`);
  assert(THEMES.minimal, '缺少简约主题 minimal');

  themeKeys.forEach(themeKey => {
    const { theme, themeStyle } = getThemeState(themeKey);
    assert(theme, `${themeKey} 未返回主题对象`);
    assert(['#000000', '#ffffff'].includes(theme.navFrontColor), `${themeKey}.navFrontColor 只能是 #000000 或 #ffffff`);
    REQUIRED_THEME_VARS.forEach(varName => {
      assert(themeStyle.includes(varName), `${themeKey} 生成的 themeStyle 缺少 ${varName}`);
    });

    CANVAS_GAME_KEYS.forEach(gameKey => {
      const palette = getCanvasPalette(themeKey, gameKey);
      assert(palette && typeof palette === 'object', `${themeKey}.${gameKey} 缺少 Canvas 配色`);
    });
  });

  const minimalOptions = getThemeOptions('minimal');
  const activeOptions = minimalOptions.filter(item => item.active);
  assert(activeOptions.length === 1 && activeOptions[0].key === 'minimal', 'getThemeOptions 未正确标记 minimal 为当前主题');

  const games = getHomeGameCards();
  assert(games.length === 8, `首页游戏数量应为 8，当前为 ${games.length}`);
  games.forEach(game => {
    REQUIRED_GAME_FIELDS.forEach(field => {
      assert(Boolean(game[field]), `首页游戏 ${game.id || '<unknown>'} 缺少 ${field}`);
    });
    assert(Array.isArray(game.tags) && game.tags.length > 0, `首页游戏 ${game.id} tags 应为非空数组`);
  });
}

function checkRuntimeCodeQuality() {
  const runtimeJsFiles = RUNTIME_CODE_DIRS.flatMap(dir => (
    walk(path.join(ROOT, dir), file => file.endsWith('.js'))
  ));

  runtimeJsFiles.forEach(file => {
    const relativePath = formatFile(file);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      if (line.includes('console.log')) {
        throw new Error(`${relativePath}:${index + 1} 页面运行代码不应保留 console.log`);
      }
      if (line.includes('wx.getSystemInfoSync') && !line.includes('wx.getWindowInfo')) {
        throw new Error(`${relativePath}:${index + 1} wx.getSystemInfoSync 需要优先使用 wx.getWindowInfo 并保留低版本兜底`);
      }
      const directTimerCall = /\b(setTimeout|setInterval|clearTimeout|clearInterval)\s*\(/.test(line);
      const managedTimerCall = /\.(setTimeout|setInterval|clear|clearAll|clearByPrefix|addTimeout)\s*\(/.test(line);
      if (relativePath !== 'utils/timer-manager.js' && directTimerCall && !managedTimerCall) {
        throw new Error(`${relativePath}:${index + 1} 页面运行代码定时器应通过 utils/timer-manager.js 管理`);
      }
      const directModalCall = /wx\.(showToast|showModal)\s*\(/.test(line);
      if (relativePath !== 'utils/modal-manager.js' && directModalCall) {
        throw new Error(`${relativePath}:${index + 1} 页面运行代码弹窗应通过 utils/modal-manager.js 管理`);
      }
    });
  });
}

function checkHomePresentationRules() {
  const indexWxml = fs.readFileSync(path.join(ROOT, 'pages/index/index.wxml'), 'utf8');
  const forbiddenTokens = ['played-badge', 'recordSummary', 'recordText', 'game-record', '已玩'];
  forbiddenTokens.forEach(token => {
    assert(!indexWxml.includes(token), `首页不应展示记录/已玩模块残留：${token}`);
  });
}

function checkGameTopbars() {
  const appJson = readJson('app.json');
  const gamePackage = (appJson.subPackages || []).find(item => item.root === 'subpackages');
  gamePackage.pages.forEach(page => {
    const wxmlPath = path.join(ROOT, gamePackage.root, page.replace(/\.wxml$/, '') + '.wxml');
    const content = fs.readFileSync(wxmlPath, 'utf8');
    assert(content.includes('game-topbar'), `${formatFile(wxmlPath)} 缺少统一顶部布局 class: game-topbar`);
    assert(content.includes('game-title-block'), `${formatFile(wxmlPath)} 缺少统一顶部标题 class: game-title-block`);
    assert(content.includes('game-stats'), `${formatFile(wxmlPath)} 缺少统一顶部统计 class: game-stats`);
    assert(content.includes('best-record-bar'), `${formatFile(wxmlPath)} 缺少游戏内最佳记录展示: best-record-bar`);
  });
}

runCheck('JS 语法检查', checkJsSyntax);
runCheck('JSON 配置检查', checkJsonSyntax);
runCheck('小程序路由检查', checkAppRoutes);
runCheck('主题与首页数据冒烟检查', checkThemeSystem);
runCheck('页面运行代码质量检查', checkRuntimeCodeQuality);
runCheck('首页展示规则检查', checkHomePresentationRules);
runCheck('游戏页顶部布局检查', checkGameTopbars);

if (failed) {
  console.error('\n❌ 项目检查未通过');
  process.exit(1);
}

console.log('\n✅ 项目检查通过');
