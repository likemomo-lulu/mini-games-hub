// 打地鼠游戏
const app = getApp();

Page({
  data: {
    theme: app.globalData.theme,
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: 60,
    timeDisplay: '60',
    gameRunning: false,
    gameOver: false,
    holes: [],
    timer: null,
    moleTimer: null,
  },

  onLoad() {
    this.initHoles();
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme,
    });
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
    this.data.timer = setInterval(() => {
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
    const holes = this.data.holes;
    const availableHoles = holes
      .map((h, i) => ({ ...h, index: i }))
      .filter(h => !h.active);

    if (availableHoles.length === 0) {
      this.data.moleTimer = setTimeout(() => this.spawnMole(), 500);
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

    setTimeout(() => {
      if (this.data.gameRunning && !this.data.holes[index].hit) {
        holes[index] = {
          ...holes[index],
          active: false,
        };
        this.setData({ holes });
      }
    }, stayTime);

    // 下一次生成地鼠
    const nextSpawnTime = Math.random() * 800 + 400;
    this.data.moleTimer = setTimeout(() => this.spawnMole(), nextSpawnTime);
  },

  // 点击地洞
  onHoleTap(e) {
    if (!this.data.gameRunning) return;

    const { index } = e.currentTarget.dataset;
    const holes = this.data.holes;
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
      score = 10;
      scoreText = '+10';
      this.setData({
        combo: this.data.combo + 1,
        maxCombo: Math.max(this.data.maxCombo, this.data.combo + 1),
      });
    } else if (hole.type === 'luck') {
      score = 30;
      scoreText = '+30';
      this.setData({
        combo: this.data.combo + 1,
        maxCombo: Math.max(this.data.maxCombo, this.data.combo + 1),
      });
    } else if (hole.type === 'pig') {
      score = -20;
      scoreText = '-20';
      this.setData({ combo: 0 });
    }

    // 连击加成
    if (this.data.combo > 0 && hole.type !== 'pig') {
      score += this.data.combo * 2;
      scoreText += ` ×${this.data.combo + 1}`;
    }

    holes[index].scoreText = scoreText;

    this.setData({
      score: this.data.score + score,
      holes,
    });

    // 震动反馈
    wx.vibrateShort({ type: 'light' });

    // 显示得分特效后重置
    setTimeout(() => {
      holes[index] = {
        ...holes[index],
        hit: false,
        scoreText: '',
      };
      this.setData({ holes });
    }, 500);
  },

  // 结束游戏
  endGame() {
    clearInterval(this.data.timer);
    clearTimeout(this.data.moleTimer);

    this.setData({
      gameRunning: false,
      gameOver: true,
    });
  },

  onUnload() {
    clearInterval(this.data.timer);
    clearTimeout(this.data.moleTimer);
  },
});
