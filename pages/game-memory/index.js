// 记忆翻牌游戏
Page({
  data: {
    // 游戏状态
    cards: [],           // 卡片数组
    moves: 0,            // 步数
    timeDisplay: '00:00', // 时间显示
    gameWin: false,      // 是否胜利
    canFlip: true,       // 是否可以翻牌
  },

  onLoad() {
    this.initGame();
  },

  onUnload() {
    // 清理计时器
    this.clearTimer();
  },

  // ===== 游戏初始化 =====

  /**
   * 初始化游戏
   */
  initGame() {
    // emoji池 - 每次随机选8种
    this.emojiPool = [
      '🍎', '🍊', '🍇', '🍓', '🍒', '🥝', '🍑', '🥭',
      '🍌', '🍉', '🍋', '🍍', '🥥', '🥑', '🍆', '🥕',
      '🌽', '🥦', '🍄', '🥜', '🌰', '🍞', '🧀', '🍖',
      '🍗', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯',
      '🥚', '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧂',
      '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝'
    ];

    // 游戏状态
    this.flippedCards = []; // 已翻开的卡片
    this.matchedPairs = 0;  // 已配对数量
    this.totalPairs = 8;    // 总配对数
    this.seconds = 0;       // 计时秒数
    this.timer = null;      // 计时器
    this.gameStarted = false; // 游戏是否开始

    // 创建并洗牌
    this.createCards();
    this.shuffleCards();

    // 重置数据 - 关键：把 cards 设置到 data 中
    this.setData({
      cards: this.cards,
      moves: 0,
      timeDisplay: '00:00',
      gameWin: false,
      canFlip: true,
    });
  },

  /**
   * 创建卡片对
   */
  createCards() {
    // 随机选择8种emoji
    const shuffled = [...this.emojiPool].sort(() => Math.random() - 0.5);
    const selectedEmojis = shuffled.slice(0, 8);

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

    // 延迟显示胜利界面
    setTimeout(() => {
      this.setData({ gameWin: true });
    }, 500);
  },

  /**
   * 重新开始
   */
  restart() {
    this.clearTimer();
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.seconds = 0;
    this.gameStarted = false;
    this.initGame();
  },
});
