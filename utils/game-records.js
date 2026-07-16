const RECENT_GAME_KEY = 'recentGameId';
const GAME_BEST_RECORDS_KEY = 'gameBestRecords';
const { unlockAchievements } = require('./achievements.js');

const RECORD_STORAGE_KEYS = [
  RECENT_GAME_KEY,
  // 旧版本用于记录最近游玩时间；当前不再写入，仅在清空记录时顺带清理历史数据。
  'gameVisitHistory',
  GAME_BEST_RECORDS_KEY,
  'fruitHighScore',
  'memoryGameLevel',
];

function canUseStorage() {
  return typeof wx !== 'undefined' && wx.getStorageSync && wx.setStorageSync;
}

function safeGetStorage(key, fallback = null) {
  if (!canUseStorage()) return fallback;
  try {
    const value = wx.getStorageSync(key);
    return value === '' || value === undefined ? fallback : value;
  } catch (error) {
    console.error('读取游戏记录失败:', key, error);
    return fallback;
  }
}

function safeSetStorage(key, value) {
  if (!canUseStorage()) return;
  try {
    wx.setStorageSync(key, value);
  } catch (error) {
    console.error('保存游戏记录失败:', key, error);
  }
}

function safeRemoveStorage(key) {
  if (typeof wx === 'undefined' || !wx.removeStorageSync) return;
  try {
    wx.removeStorageSync(key);
  } catch (error) {
    console.error('清理游戏记录失败:', key, error);
  }
}

function getAllGameRecords() {
  const records = safeGetStorage(GAME_BEST_RECORDS_KEY, {});
  return records && typeof records === 'object' && !Array.isArray(records) ? records : {};
}

function getGameRecord(gameId) {
  return getAllGameRecords()[gameId] || {};
}

function saveGameRecord(gameId, record) {
  const records = getAllGameRecords();
  records[gameId] = {
    ...(records[gameId] || {}),
    ...record,
    updatedAt: Date.now(),
  };
  safeSetStorage(GAME_BEST_RECORDS_KEY, records);
  return records[gameId];
}

/**
 * 记录成功进入游戏的行为。
 * 当前只保存最近一次进入的游戏 ID，用于首页“继续游玩”；不记录具体游玩时间。
 * @param {string} gameId - 首页游戏卡片的唯一 ID。
 */
function recordGameVisit(gameId) {
  if (!gameId) return;
  safeSetStorage(RECENT_GAME_KEY, gameId);
  unlockAchievements('first_play');
}

function formatTime(seconds) {
  const value = Number(seconds) || 0;
  const minutes = Math.floor(value / 60);
  const secs = value % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 更新游戏最佳记录。
 * 业务口径：
 * - score/level：数值越大越好；
 * - steps/timeSeconds：数值越小越好；
 * - 同一次结算可同时更新多个维度，用于首页轻量展示和设置页后续扩展。
 * @param {string} gameId - 首页游戏 ID。
 * @param {Object} result - 本局结果，支持 score、steps、timeSeconds、level、label。
 * @returns {{record: Object, changed: boolean}} 更新后的记录和是否刷新最佳值。
 */
function updateGameBestRecord(gameId, result = {}) {
  if (!gameId) return { record: {}, changed: false };
  const current = getGameRecord(gameId);
  const next = { ...current };
  let changed = false;

  if (typeof result.score === 'number' && result.score > (current.bestScore || 0)) {
    next.bestScore = result.score;
    changed = true;
  }

  if (typeof result.level === 'number' && result.level > (current.bestLevel || 0)) {
    next.bestLevel = result.level;
    changed = true;
  }

  if (typeof result.steps === 'number' && result.steps > 0) {
    const noSteps = !current.bestSteps;
    const fewerSteps = result.steps < current.bestSteps;
    if (noSteps || fewerSteps) {
      next.bestSteps = result.steps;
      changed = true;
    }
  }

  if (typeof result.timeSeconds === 'number' && result.timeSeconds > 0) {
    const noTime = !current.bestTimeSeconds;
    const faster = result.timeSeconds < current.bestTimeSeconds;
    if (noTime || faster) {
      next.bestTimeSeconds = result.timeSeconds;
      changed = true;
    }
  }

  if (result.label) {
    next.latestLabel = result.label;
  }

  if (!changed && !result.label) {
    return { record: current, changed: false };
  }

  return {
    record: saveGameRecord(gameId, next),
    changed,
  };
}

function getGameRecordText(gameId) {
  const record = getGameRecord(gameId);

  if (record.bestScore) return `最高 ${record.bestScore} 分`;
  if (record.bestLevel) return `最高第 ${record.bestLevel} 关`;
  if (record.bestSteps) return `最佳 ${record.bestSteps} 步`;
  if (record.bestTimeSeconds) return `最快 ${formatTime(record.bestTimeSeconds)}`;

  // 兼容旧存储，避免升级后已有记录直接消失。
  if (gameId === 'game-fruit') {
    const highScore = Number(safeGetStorage('fruitHighScore', 0)) || 0;
    if (highScore > 0) return `最高 ${highScore} 分`;
  }
  if (gameId === 'game-memory') {
    const level = Number(safeGetStorage('memoryGameLevel', 1)) || 1;
    if (level > 1) return `最高第 ${level} 关`;
  }

  return '暂无最佳记录';
}

function getRecentGame(games) {
  const recentGameId = safeGetStorage(RECENT_GAME_KEY, '');
  if (!recentGameId) return null;
  return games.find(game => game.id === recentGameId) || null;
}

function clearGameRecords() {
  RECORD_STORAGE_KEYS.forEach(safeRemoveStorage);
}

module.exports = {
  getAllGameRecords,
  getGameRecord,
  getGameRecordText,
  getRecentGame,
  recordGameVisit,
  updateGameBestRecord,
  clearGameRecords,
};
