// 记忆翻牌游戏
const app = getApp();

// 关卡配置
const LEVEL_CONFIG = {
  1: { pairs: 8, cols: 4, name: '新手' },   // 4x4
  2: { pairs: 10, cols: 4, name: '简单' },  // 4x5
  3: { pairs: 12, cols: 4, name: '中等' },  // 4x6
  4: { pairs: 15, cols: 5, name: '困难' },  // 5x6
  5: { pairs: 18, cols: 6, name: '大师' },  // 6x6
  6: { pairs: 21, cols: 6, name: '专家' },  // 6x7
  7: { pairs: 24, cols: 6, name: '挑战' },  // 6x8
  8: { pairs: 28, cols: 7, name: '极限' },  // 7x8
};

Page({
  data: {
    // 游戏状态
    cards: [],           // 卡片数组
    moves: 0,            // 步数
    timeDisplay: '00:00', // 时间显示
    gameWin: false,      // 是否胜利
    canFlip: true,       // 是否可以翻牌
    currentLevel: 1,     // 当前关卡
    maxLevel: 8,         // 最大关卡数
    gridCols: 4,         // 网格列数
    // 主题（从全局获取，支持切换）
    theme: app.globalData.theme,
  },

  onLoad() {
    // 读取最高关卡记录
    const savedLevel = wx.getStorageSync('memoryGameLevel');
    if (savedLevel) {
      this.setData({ currentLevel: savedLevel });
    }
    this.initGame(this.data.currentLevel);
  },

  onShow() {
    // 同步最新主题
    this.setData({
      theme: app.globalData.theme,
    });
  },

  onUnload() {
    // 清理计时器
    this.clearTimer();
  },

  // ===== 游戏初始化 =====

  /**
   * 初始化游戏
   * @param {number} level - 关卡数
   */
  initGame(level = this.data.currentLevel) {
    // 获取关卡配置
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];
    const totalPairs = config.pairs;
    const gridCols = config.cols;

    // emoji池 - 足够的emoji支持高关卡
    this.emojiPool = [
      '🍎', '🍊', '🍇', '🍓', '🍒', '🥝', '🍑', '🥭',
      '🍌', '🍉', '🍋', '🍍', '🥥', '🥑', '🍆', '🥕',
      '🌽', '🥦', '🍄', '🥜', '🌰', '🍞', '🧀', '🍖',
      '🍗', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯',
      '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧂',
      '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝',
      '🍩', '🍦', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫',
      '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵',
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'
    ];

    // 游戏状态
    this.flippedCards = []; // 已翻开的卡片
    this.matchedPairs = 0;  // 已配对数量
    this.totalPairs = totalPairs; // 总配对数（根据关卡）
    this.seconds = 0;       // 计时秒数
    this.timer = null;      // 计时器
    this.gameStarted = false; // 游戏是否开始

    // 创建并洗牌
    this.createCards(totalPairs);
    this.shuffleCards();

    // 更新当前关卡数据
    this.setData({
      currentLevel: level,
      gridCols: gridCols,
      cards: this.cards,
      moves: 0,
      timeDisplay: '00:00',
      gameWin: false,
      canFlip: true,
    });
  },

  /**
   * 创建卡片对
   * @param {number} pairCount - 需要创建的卡片对数
   */
  createCards(pairCount) {
    // 随机选择指定数量的emoji
    const shuffled = [...this.emojiPool].sort(() => Math.random() - 0.5);
    const selectedEmojis = shuffled.slice(0, pairCount);

    // 每个emoji创建一对卡片
    const cards = [];
    selectedEmojis.forEach(emoji => {
      cards.push({
        id: Math.random(),
        emoji: emoji,
        isFlipped: false, // 是否已翻开
        isMatched: false, // 是否已配对
      });
      cards.push({
        id: Math.random(),
        emoji: emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    this.cards = cards;
  },

  /**
   * 洗牌算法
   */
  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  },

  // ===== 游戏逻辑 =====

  /**
   * 点击卡片翻牌
   */
  onCardTap(e) {
    const index = e.currentTarget.dataset.index;

    // 验证是否可以翻牌
    if (!this.data.canFlip) return;
    if (this.cards[index].isFlipped) return;
    if (this.cards[index].isMatched) return;
    if (this.flippedCards.length >= 2) return;

    // 第一次翻牌时启动计时器
    if (!this.gameStarted) {
      this.startTimer();
      this.gameStarted = true;
    }

    // 翻牌
    this.flipCard(index);
  },

  /**
   * 翻开卡片
   */
  flipCard(index) {
    // 标记为已翻开
    this.cards[index].isFlipped = true;
    this.flippedCards.push({ index, card: this.cards[index] });

    // 更新显示
    this.setData({
      cards: this.cards,
    });

    // 翻开两张后检查配对
    if (this.flippedCards.length === 2) {
      // 增加步数
      const newMoves = this.data.moves + 1;
      this.setData({ moves: newMoves });

      // 检查配对
      this.checkMatch();
    }
  },

  /**
   * 检查是否配对
   */
  checkMatch() {
    // 禁止翻牌
    this.setData({ canFlip: false });

    const card1 = this.flippedCards[0];
    const card2 = this.flippedCards[1];
    const match = card1.card.emoji === card2.card.emoji;

    if (match) {
      // 配对成功
      setTimeout(() => {
        // 标记为已配对
        this.cards[card1.index].isMatched = true;
        this.cards[card2.index].isMatched = true;
        this.matchedPairs++;

        // 更新显示
        this.setData({
          cards: this.cards,
          canFlip: true,
        });

        // 清空已翻开列表
        this.flippedCards = [];

        // 检查是否全部配对
        if (this.matchedPairs === this.totalPairs) {
          this.gameWin();
        }
      }, 500);
    } else {
      // 配对失败，翻回去
      setTimeout(() => {
        this.cards[card1.index].isFlipped = false;
        this.cards[card2.index].isFlipped = false;

        this.setData({
          cards: this.cards,
          canFlip: true,
        });

        this.flippedCards = [];
      }, 1000);
    }
  },

  // ===== 计时器 =====

  /**
   * 启动计时器
   */
  startTimer() {
    this.timer = setInterval(() => {
      this.seconds++;
      this.updateTimeDisplay();
    }, 1000);
  },

  /**
   * 更新时间显示
   */
  updateTimeDisplay() {
    const minutes = Math.floor(this.seconds / 60);
    const secs = this.seconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    this.setData({ timeDisplay: display });
  },

  /**
   * 清理计时器
   */
  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  // ===== 游戏结束 =====

  /**
   * 游戏胜利
   */
  gameWin() {
    this.clearTimer();

    // 保存当前关卡进度
    wx.setStorageSync('memoryGameLevel', this.data.currentLevel);

    // 延迟显示胜利界面
    setTimeout(() => {
      this.setData({ gameWin: true });
    }, 500);
  },

  /**
   * 下一关
   */
  nextLevel() {
    const nextLevel = this.data.currentLevel + 1;
    const finalLevel = Math.min(nextLevel, this.data.maxLevel);

    this.clearTimer();
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.seconds = 0;
    this.gameStarted = false;

    this.initGame(finalLevel);
  },

  /**
   * 重新开始当前关卡
   */
  restart() {
    this.clearTimer();
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.seconds = 0;
    this.gameStarted = false;
    this.initGame(this.data.currentLevel);
  },

  /**
   * 重置到第一关
   */
  resetToFirstLevel() {
    wx.removeStorageSync('memoryGameLevel');
    this.setData({ currentLevel: 1 });
    this.restart();
  },
});
