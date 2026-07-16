// 打地鼠游戏
const { withThemePage } = require('../../utils/theme-manager.js');
const { vibrateShort } = require('../../utils/settings-manager.js');
const { createTimerManager } = require('../../utils/timer-manager.js');
const {
  getGameRecordText,
  updateGameBestRecord,
} = require('../../utils/game-records.js');
const { unlockAchievements } = require('../../utils/achievements.js');

Page(withThemePage({
  data: {
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: 60,
    timeDisplay: '60',
    gameRunning: false,
    gameOver: false,
    holes: [],
    bestRecordText: '暂无最佳记录',
  },

  onLoad() {
    this.timers = createTimerManager();
    this.refreshBestRecord();
    this.initHoles();
  },

  onShow() {
    this.refreshBestRecord();
    if (this.wasRunningOnHide && !this.data.gameOver && this.data.timeLeft > 0) {
      this.wasRunningOnHide = false;
      this.setData({ gameRunning: true });
      this.startTimer();
      this.spawnMole();
    }
  },

  onHide() {
    this.saveBestRecord();
    if (this.data.gameRunning) {
      this.wasRunningOnHide = true;
      this.clearTimers();
      this.setData({ gameRunning: false });
    }
  },

  // 初始化地洞
  initHoles() {
    const holes = [];
    for (let i = 0; i < 9; i++) {
      holes.push({
        active: false,
        type: 'normal',
        icon: '🐹',
        hit: false,
        scoreText: '',
      });
    }
    this.setData({ holes });
  },

  // 开始游戏
  startGame() {
    this.clearTimers();
    this.wasRunningOnHide = false;
    this.setData({
      score: 0,
      combo: 0,
      maxCombo: 0,
      timeLeft: 60,
      timeDisplay: '60',
      gameRunning: true,
      gameOver: false,
    });
    this.initHoles();
    this.startTimer();
    this.spawnMole();
  },

  // 倒计时
  startTimer() {
    this.timers.setInterval('mainTimer', () => {
      const timeLeft = this.data.timeLeft - 1;
      this.setData({
        timeLeft,
        timeDisplay: timeLeft.toString(),
      });

      if (timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  // 生成地鼠
  spawnMole() {
    if (!this.data.gameRunning) return;

    // 随机选择一个地洞
    const holes = this.data.holes.map(hole => ({ ...hole }));
    const availableHoles = holes
      .map((h, i) => ({ ...h, index: i }))
      .filter(h => !h.active);

    if (availableHoles.length === 0) {
      this.timers.setTimeout('moleTimer', () => this.spawnMole(), 500);
      return;
    }

    const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
    const index = randomHole.index;

    // 随机决定地鼠类型
    const rand = Math.random();
    let type = 'normal';
    let icon = '🐹';

    if (rand < 0.1) {
      type = 'luck';
      icon = '🦄';
    } else if (rand > 0.85) {
      type = 'pig';
      icon = '🐷';
    }

    // 激活地鼠
    holes[index] = {
      ...holes[index],
      active: true,
      type,
      icon,
      hit: false,
      scoreText: '',
    };

    this.setData({ holes });

    // 地鼠停留时间
    const stayTime = type === 'luck' ? 800 : type === 'pig' ? 1200 : 1000;

    this.timers.addTimeout('moleHide', () => {
      if (this.data.gameRunning && !this.data.holes[index].hit) {
        const nextHoles = this.data.holes.map(hole => ({ ...hole }));
        nextHoles[index] = {
          ...nextHoles[index],
          active: false,
        };
        this.setData({ holes: nextHoles });
      }
    }, stayTime);

    // 下一次生成地鼠
    const nextSpawnTime = Math.random() * 800 + 400;
    this.timers.setTimeout('moleTimer', () => this.spawnMole(), nextSpawnTime);
  },

  // 点击地洞
  onHoleTap(e) {
    if (!this.data.gameRunning) return;

    const { index } = e.currentTarget.dataset;
    const holes = this.data.holes.map(item => ({ ...item }));
    const hole = holes[index];

    if (!hole.active || hole.hit) return;

    // 标记为已击中
    holes[index] = {
      ...holes[index],
      hit: true,
      active: false,
    };

    // 计算得分
    let score = 0;
    let scoreText = '';

    if (hole.type === 'normal') {
      const nextCombo = this.data.combo + 1;
      score = 10;
      scoreText = '+10';
      this.setData({
        combo: nextCombo,
        maxCombo: Math.max(this.data.maxCombo, nextCombo),
      });
      if (nextCombo > 1) {
        score += nextCombo * 2;
        scoreText += ` ×${nextCombo}`;
      }
    } else if (hole.type === 'luck') {
      const nextCombo = this.data.combo + 1;
      score = 30;
      scoreText = '+30';
      this.setData({
        combo: nextCombo,
        maxCombo: Math.max(this.data.maxCombo, nextCombo),
      });
      if (nextCombo > 1) {
        score += nextCombo * 2;
        scoreText += ` ×${nextCombo}`;
      }
    } else if (hole.type === 'pig') {
      score = -20;
      scoreText = '-20';
      this.setData({ combo: 0 });
    }

    holes[index].scoreText = scoreText;

    this.setData({
      score: this.data.score + score,
      holes,
    });

    // 震动反馈
    vibrateShort({ type: 'light' });

    // 显示得分特效后重置
    this.timers.addTimeout('scoreText', () => {
      const nextHoles = this.data.holes.map(item => ({ ...item }));
      nextHoles[index] = {
        ...nextHoles[index],
        hit: false,
        scoreText: '',
      };
      this.setData({ holes: nextHoles });
    }, 500);
  },

  // 结束游戏
  endGame() {
    this.clearTimers();
    this.saveBestRecord();

    this.setData({
      gameRunning: false,
      gameOver: true,
    });
  },

  saveBestRecord() {
    if (this.data.score <= 0 && this.data.maxCombo <= 0) return;
    updateGameBestRecord('game-whack', {
      score: this.data.score,
      level: this.data.maxCombo,
    });
    this.refreshBestRecord();
    if (this.data.score >= 1000) unlockAchievements('score_1000');
    if (this.data.score >= 5000) unlockAchievements('score_5000');
  },

  refreshBestRecord() {
    this.setData({
      bestRecordText: getGameRecordText('game-whack'),
    });
  },

  clearTimers() {
    if (!this.timers) return;
    this.timers.clear('mainTimer');
    this.timers.clear('moleTimer');
    this.timers.clearByPrefix('moleHide');
    this.timers.clearByPrefix('scoreText');
  },

  onUnload() {
    this.saveBestRecord();
    if (this.timers) this.timers.clearAll();
  },
}));
