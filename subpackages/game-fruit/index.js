// 打水果游戏（DOM实现）
const { withThemePage } = require('../../utils/theme-manager.js');
const { vibrateLong, vibrateShort } = require('../../utils/settings-manager.js');
const { createTimerManager } = require('../../utils/timer-manager.js');
const {
  getGameRecordText,
  updateGameBestRecord,
} = require('../../utils/game-records.js');
const { unlockAchievements } = require('../../utils/achievements.js');

Page(withThemePage({
  data: {
    score: 0,           // 分数
    timeLeft: 60,       // 剩余时间（秒）
    gameRunning: false, // 游戏是否进行中
    gameReady: false,   // 游戏是否准备好
    gamePaused: false,  // 游戏是否暂停
    fruits: [],         // 水果数组
    particles: [],      // 粒子特效数组
    canvasWidth: 0,     // 游戏区域宽度
    canvasHeight: 0,    // 游戏区域高度
    bestRecordText: '暂无最佳记录',
  },

  // 游戏配置
  GAME_DURATION: 60, // 游戏时长（秒）
  SPAWN_INTERVAL: 1000, // 初始生成间隔（毫秒）

  // 水果类型配置
  FRUIT_TYPES: [
    { emoji: '🍎', color: '#ff4444', points: 10, type: 'normal' },
    { emoji: '🍊', color: '#ff9933', points: 10, type: 'normal' },
    { emoji: '🍋', color: '#ffff33', points: 10, type: 'normal' },
    { emoji: '🍇', color: '#9933ff', points: 10, type: 'normal' },
    { emoji: '🍓', color: '#ff66aa', points: 10, type: 'normal' },
    { emoji: '🍑', color: '#ffccaa', points: 10, type: 'normal' },
    { emoji: '🍉', color: '#ff5566', points: 10, type: 'normal' },
    { emoji: '🥝', color: '#8b4513', points: 10, type: 'normal' },
    { emoji: '🍍', color: '#ffcc00', points: 10, type: 'normal' },
    { emoji: '🍈', color: '#98fb98', points: 10, type: 'normal' },
    { emoji: '🍐', color: '#cceebb', points: 10, type: 'normal' },
    { emoji: '🍌', color: '#ffe135', points: 10, type: 'normal' },
    { emoji: '🫐', color: '#4169E1', points: 10, type: 'normal' },
    { emoji: '🍒', color: '#DC143C', points: 10, type: 'normal' },
    { emoji: '⭐', color: '#ffd700', points: 50, type: 'gold' },
    { emoji: '💣', color: '#333333', points: -30, type: 'bomb' },
    { emoji: '⚡', color: '#66ccff', points: 0, type: 'lightning' },
  ],

  onLoad() {
    this.timers = createTimerManager();
    this.refreshBestRecord();
    // 计算游戏区域尺寸
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
    const screenWidth = windowInfo.windowWidth || windowInfo.screenWidth || 375;
    const rpxToPx = screenWidth / 750;

    // 游戏区域宽度 = 屏幕宽度 - 左右padding(40rpx) - game-board padding(48rpx)
    const canvasWidth = screenWidth - (40 + 48) * rpxToPx;
    // 游戏区域高度 = 宽度 × 1.2（保持宽高比）
    const canvasHeight = canvasWidth * 1.2;

    this.setData({
      canvasWidth: Math.floor(canvasWidth),
      canvasHeight: Math.floor(canvasHeight),
    });

    this.initGame();
  },

  onUnload() {
    this.saveBestRecord();
    // 清理定时器
    if (this.timers) this.timers.clearAll();
  },

  onShow() {
    this.refreshBestRecord();
  },

  onHide() {
    this.saveBestRecord();
    // 页面隐藏时暂停
    if (this.data.gameRunning) {
      this.pauseGame();
    }
  },

  // ===== 游戏初始化 =====

  initGame() {
    this.fruits = [];
    this.particles = [];
    this.secondsElapsed = 0;
    this.currentSpawnInterval = this.SPAWN_INTERVAL;
    this.currentFruitSpeed = 2;
  },

  // ===== 游戏控制 =====

  startGame() {
    this.clearGameLoop();
    this.clearUpdateLoop();
    this.clearVibrateTimer();
    this.initGame();

    this.setData({
      gameRunning: true,
      gameReady: true,
      gamePaused: false,
      score: 0,
      timeLeft: this.GAME_DURATION,
      fruits: [],
      particles: [],
    });

    this.startGameLoop();
    this.startUpdateLoop();
  },

  pauseGame() {
    if (!this.data.gameRunning) return;
    this.setData({ gameRunning: false });
    this.clearGameLoop();
    this.clearUpdateLoop();
    this.setData({ gamePaused: true });
  },

  resumeGame() {
    if (!this.data.gamePaused || this.data.timeLeft <= 0) return;
    this.setData({ gameRunning: true, gamePaused: false });
    this.startGameLoop();
    this.startUpdateLoop();
  },

  endGame() {
    this.setData({ gameRunning: false, gamePaused: false, timeLeft: 0 });
    this.clearGameLoop();
    this.clearUpdateLoop();
    this.saveBestRecord();
  },

  saveBestRecord() {
    if (this.data.score <= 0) return;
    // 保存最高分
    const highScore = wx.getStorageSync('fruitHighScore') || 0;
    if (this.data.score > highScore) {
      wx.setStorageSync('fruitHighScore', this.data.score);
    }
    updateGameBestRecord('game-fruit', { score: this.data.score });
    this.refreshBestRecord();
    if (this.data.score >= 1000) unlockAchievements('score_1000');
    if (this.data.score >= 5000) unlockAchievements('score_5000');
  },

  refreshBestRecord() {
    this.setData({
      bestRecordText: getGameRecordText('game-fruit'),
    });
  },

  // ===== 游戏循环 =====

  startGameLoop() {
    this.clearGameLoop();

    // 开始生成水果
    this.spawnFruit();
    this.scheduleNextSpawn();

    // 开始倒计时
    this.timers.setInterval('gameTimer', () => {
      this.secondsElapsed++;
      this.setData({ timeLeft: this.GAME_DURATION - this.secondsElapsed });

      // 每15秒加快生成速度
      if (this.secondsElapsed % 15 === 0) {
        this.currentSpawnInterval = Math.max(300, this.currentSpawnInterval - 50);
      }

      // 游戏结束
      if (this.secondsElapsed >= this.GAME_DURATION) {
        this.endGame();
      }
    }, 1000);
  },

  clearGameLoop() {
    if (!this.timers) return;
    this.timers.clear('spawnTimer');
    this.timers.clear('gameTimer');
  },

  clearVibrateTimer() {
    if (this.timers) this.timers.clear('vibrateTimer');
  },

  // ===== 更新循环（替代Canvas渲染） =====

  startUpdateLoop() {
    // 每30ms更新一次水果和粒子位置
    this.timers.setInterval('updateTimer', () => {
      this.update();
    }, 30);
  },

  clearUpdateLoop() {
    if (this.timers) this.timers.clear('updateTimer');
  },

  update() {
    if (!this.data.gameRunning) return;

    // 更新水果位置
    this.fruits = this.fruits.filter(fruit => {
      fruit.y -= fruit.speed;
      fruit.wobble += fruit.wobbleSpeed;

      // 移除飞出屏幕的水果
      if (fruit.y < -50) return false;
      return true;
    });

    // 更新粒子位置
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // 重力
      particle.life -= 0.02;

      return particle.life > 0;
    });

    // 批量更新数据
    this.setData({
      fruits: [...this.fruits],
      particles: [...this.particles],
    });
  },

  // ===== 水果生成 =====

  scheduleNextSpawn() {
    if (!this.data.gameRunning) return;

    this.timers.setTimeout('spawnTimer', () => {
      this.spawnFruit();
      this.scheduleNextSpawn();
    }, this.currentSpawnInterval);
  },

  spawnFruit() {
    const canvasWidth = this.data.canvasWidth;
    const canvasHeight = this.data.canvasHeight;

    // 随机选择水果类型
    const rand = Math.random();
    let fruitConfig;
    if (rand < 0.05) {
      fruitConfig = this.FRUIT_TYPES[14]; // 金星 5%
    } else if (rand < 0.15) {
      fruitConfig = this.FRUIT_TYPES[15]; // 炸弹 10%
    } else if (rand < 0.25) {
      fruitConfig = this.FRUIT_TYPES[16]; // 闪电 10%
    } else {
      // 随机选择普通水果（前14个都是普通水果）
      const normalFruits = this.FRUIT_TYPES.slice(0, 14);
      fruitConfig = normalFruits[Math.floor(Math.random() * normalFruits.length)];
    }

    const fruit = {
      id: Date.now() + Math.random(),
      x: Math.random() * (canvasWidth - 60) + 30,
      y: canvasHeight - 80,
      size: 50,
      speed: this.currentFruitSpeed + Math.random() * 2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.02,
      ...fruitConfig,
    };

    this.fruits.push(fruit);
  },

  // ===== 点击处理 =====

  onFruitTap(e) {
    if (!this.data.gameRunning) return;

    const { index } = e.currentTarget.dataset;
    const fruit = this.fruits[index];
    if (!fruit) return;

    // 计算得分
    let points = fruit.points;

    // 特殊水果效果
    if (fruit.type === 'lightning') {
      // 清除所有普通水果
      this.fruits.forEach(f => {
        if (f.type === 'normal') {
          this.createParticles(f.x, f.y, f.color);
          points += 5;
        }
      });
      this.fruits = this.fruits.filter(f => f.type !== 'normal');
    } else if (fruit.type === 'bomb') {
      // 💣 炸弹爆炸效果
      this.createBombExplosion(fruit.x, fruit.y);

      // 清除爆炸范围内的所有水果（100px半径内）
      const explosionRadius = 100;
      this.fruits.forEach((f, i) => {
        if (i === index) return; // 跳过炸弹本身

        const dx = f.x - fruit.x;
        const dy = f.y - fruit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < explosionRadius) {
          // 范围内的水果也被炸飞
          this.createParticles(f.x, f.y, '#ff6600');
        }
      });

      // 清除所有在爆炸范围内的水果
      this.fruits = this.fruits.filter((f, i) => {
        if (i === index) return false; // 移除炸弹

        const dx = f.x - fruit.x;
        const dy = f.y - fruit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance >= explosionRadius; // 保留爆炸范围外的水果
      });
    } else {
      // 普通水果：创建粒子特效
      this.createParticles(fruit.x, fruit.y, fruit.color);
    }

    // 移除被点击的水果（如果炸弹已经被上面的逻辑移除了，这里就不需要再移除）
    if (fruit.type !== 'bomb') {
      this.fruits.splice(index, 1);
    }

    // 更新分数和粒子（关键：同步更新particles到视图）
    this.setData({
      score: this.data.score + points,
      fruits: [...this.fruits],
      particles: [...this.particles],
    }, () => {
      // 💣 炸弹震动效果（在setData完成后调用，确保真机生效）
      if (fruit.type === 'bomb') {
        vibrateLong(); // 长震动400ms，更强烈
        this.timers.setTimeout('vibrateTimer', () => {
          vibrateShort();
        }, 200); // 追加短震动
      }
    });
  },

  // ===== 粒子特效 =====

  createParticles(x, y, color) {
    const particleCount = 30; // 增加粒子数量，营造丰富果汁感

    // 将hex颜色转为rgb，用于rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      // 更大的速度变化，营造飞溅感
      const speed = 3 + Math.random() * 10;
      // 更大的粒子大小范围，大小粒子混合
      const size = Math.random() < 0.3
        ? 8 + Math.random() * 7  // 30%大粒子（8-15px）- 主要果汁
        : 2 + Math.random() * 6; // 70%小粒子（2-8px）- 飞溅水珠

      const particle = {
        id: Date.now() + Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color: `rgb(${r}, ${g}, ${b})`,
        life: 1,
      };

      this.particles.push(particle);
    }
  },

  // 💣 炸弹爆炸特效
  createBombExplosion(x, y) {
    // 爆炸颜色：红橙黄混合
    const explosionColors = ['#ff0000', '#ff6600', '#ffcc00', '#ff3300', '#ff9900'];

    // 创建大量粒子（80个粒子）
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      // 爆炸速度更快（8-18）
      const speed = 8 + Math.random() * 10;
      // 爆炸粒子更大（10-20px）
      const size = 10 + Math.random() * 10;

      // 随机选择爆炸颜色
      const color = explosionColors[Math.floor(Math.random() * explosionColors.length)];

      // 将hex颜色转为rgb
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const particle = {
        id: Date.now() + Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color: `rgb(${r}, ${g}, ${b})`,
        life: 1,
        type: 'bomb', // 💥 标记为炸弹粒子
      };

      this.particles.push(particle);
    }
  },
}));
