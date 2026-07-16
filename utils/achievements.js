const ACHIEVEMENT_STORAGE_KEY = 'gameAchievements';
const { showToast } = require('./modal-manager.js');

const ACHIEVEMENTS = [
  {
    id: 'first_play',
    title: '初到小院',
    desc: '第一次进入任意游戏',
  },
  {
    id: 'score_1000',
    title: '千分玩家',
    desc: '任意计分游戏达到 1000 分',
  },
  {
    id: 'score_5000',
    title: '高分猎手',
    desc: '任意计分游戏达到 5000 分',
  },
  {
    id: 'tile_2048',
    title: '合成 2048',
    desc: '在 2048 中合成 2048 方块',
  },
  {
    id: 'memory_master',
    title: '记忆大师',
    desc: '记忆翻牌通关第 8 关',
  },
  {
    id: 'minesweeper_win',
    title: '排雷专家',
    desc: '扫雷成功通关一次',
  },
  {
    id: 'klotski_solver',
    title: '破局者',
    desc: '华容道完成任意关卡',
  },
  {
    id: 'klotski_clean_move',
    title: '妙手华容',
    desc: '华容道步数不超过关卡最优步数',
  },
];

const ACHIEVEMENT_MAP = ACHIEVEMENTS.reduce((map, item) => {
  map[item.id] = item;
  return map;
}, {});

function canUseStorage() {
  return typeof wx !== 'undefined' && wx.getStorageSync && wx.setStorageSync;
}

function getUnlockedAchievementIds() {
  if (!canUseStorage()) return [];
  try {
    const ids = wx.getStorageSync(ACHIEVEMENT_STORAGE_KEY);
    return Array.isArray(ids) ? ids : [];
  } catch (error) {
    console.error('读取成就失败:', error);
    return [];
  }
}

function saveUnlockedAchievementIds(ids) {
  if (!canUseStorage()) return;
  try {
    wx.setStorageSync(ACHIEVEMENT_STORAGE_KEY, ids);
  } catch (error) {
    console.error('保存成就失败:', error);
  }
}

function notifyAchievement(achievement) {
  showToast({
    title: `成就：${achievement.title}`,
    icon: 'none',
    duration: 1800,
  });
}

/**
 * 解锁成就。已解锁的成就不会重复提示。
 * @param {string|string[]} ids - 成就 ID 或 ID 数组。
 * @param {Object} options - notify=false 时只保存不提示。
 * @returns {Object[]} 本次新解锁的成就列表。
 */
function unlockAchievements(ids, options = {}) {
  const targets = Array.isArray(ids) ? ids : [ids];
  const current = getUnlockedAchievementIds();
  const currentSet = new Set(current);
  const unlocked = [];

  targets.forEach(id => {
    const achievement = ACHIEVEMENT_MAP[id];
    if (!achievement || currentSet.has(id)) return;
    currentSet.add(id);
    unlocked.push(achievement);
  });

  if (unlocked.length === 0) return [];

  saveUnlockedAchievementIds(Array.from(currentSet));
  if (options.notify !== false) {
    notifyAchievement(unlocked[0]);
  }
  return unlocked;
}

function getAchievements() {
  const unlockedIds = new Set(getUnlockedAchievementIds());
  return ACHIEVEMENTS.map(item => ({
    ...item,
    unlocked: unlockedIds.has(item.id),
  }));
}

function clearAchievements() {
  if (typeof wx === 'undefined' || !wx.removeStorageSync) return;
  try {
    wx.removeStorageSync(ACHIEVEMENT_STORAGE_KEY);
  } catch (error) {
    console.error('清理成就失败:', error);
  }
}

module.exports = {
  ACHIEVEMENT_STORAGE_KEY,
  ACHIEVEMENTS,
  clearAchievements,
  getAchievements,
  unlockAchievements,
};
