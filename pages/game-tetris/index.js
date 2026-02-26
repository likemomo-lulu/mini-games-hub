// 俄罗斯方块游戏页
const app = getApp();
// ==================== 配置 ====================
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20; // 方块尺寸，会根据实际画布缩放
const COLORS = {
  I: '#FF6B9D', O: '#4ECDC4', T: '#FFE66D', S: '#95E1D3',
  Z: '#F38181', J: '#AA96DA', L: '#FCBAD3', board: '#2d3436'
};

// 7种方块定义（每个方块有4种旋转状态）
const SHAPES = {
  I: [
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
    [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
    [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
  ],
  O: [[[1,1], [1,1]], [[1,1], [1,1]], [[1,1], [1,1]], [[1,1], [1,1]]],
  T: [
    [[0,1,0], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,1], [0,1,0]],
    [[0,1,0], [1,1,0], [0,1,0]]
  ],
  S: [
    [[0,1,1], [1,1,0], [0,0,0]],
    [[0,1,0], [0,1,1], [0,0,1]],
    [[0,0,0], [0,1,1], [1,1,0]],
    [[1,0,0], [1,1,0], [0,1,0]]
  ],
  Z: [
    [[1,1,0], [0,1,1], [0,0,0]],
    [[0,0,1], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,0], [0,1,1]],
    [[0,1,0], [1,1,0], [1,0,0]]
  ],
  J: [
    [[1,0,0], [1,1,1], [0,0,0]],
    [[0,1,1], [0,1,0], [0,1,0]],
    [[0,0,0], [1,1,1], [0,0,1]],
    [[0,1,0], [0,1,0], [1,1,0]]
  ],
  L: [
    [[0,0,1], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,0], [0,1,1]],
    [[0,0,0], [1,1,1], [1,0,0]],
    [[1,1,0], [0,1,0], [0,1,0]]
  ]
};

Page({
  data: {
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false,
    // 画布在视图层的尺寸（px），用于自适应不同机型
    gameCanvasWidth: 0,
    gameCanvasHeight: 0,
    // 主题（从全局获取，支持切换）
    theme: app.globalData.theme,
  },

  // 游戏状态
  board: [],
  currentPiece: null,
  nextPiece: null,
  dropInterval: 1000,
  lastDrop: 0,
  clearingLines: [],
  gameInitialized: false, // 游戏循环初始化标志

  // Canvas 相关
  gameCanvas: null,
  gameCtx: null,
  nextCanvas: null,
  nextCtx: null,
  canvasWidth: 200,
  canvasHeight: 400,
  pixelRatio: 1, // 缓存设备像素比

  // 长按定时器
  longPressTimer: null,

  onLoad() {
    // 先根据屏幕宽高计算画布尺寸，保证一屏内放下（canvas 是原生组件，不会随页面滚动，所以必须不出现滚动）
    const info = wx.getSystemInfoSync();
    const windowWidth = info.windowWidth || 375;
    const windowHeight = info.windowHeight || 667;

    // 1 rpx 对应的 px（小程序里 750rpx = windowWidth px）
    const rpxToPx = windowWidth / 750;

    // .game-area padding: 12rpx，两侧一共 24rpx
    const gameAreaPaddingPx = 24 * rpxToPx;
    // 右侧面板宽度 80rpx
    const rightPanelWidthPx = 80 * rpxToPx;
    // 画布与右侧面板之间的间距 12rpx
    const canvasGapPx = 12 * rpxToPx;

    // 画布在屏幕中可用的最大宽度（保证画布 + 间距 + 右侧面板 不会超出屏幕）
    let gameCanvasWidth = windowWidth - gameAreaPaddingPx - rightPanelWidthPx - canvasGapPx;
    gameCanvasWidth = gameCanvasWidth * 0.9;
    if (gameCanvasWidth < 160) gameCanvasWidth = 160;

    // 再根据白色游戏区域的最大宽度（max-width: 580rpx）做一次收紧，避免大屏下内容超出卡片
    const maxGameAreaWidthPx = windowWidth * (580 / 750); // 580rpx 对应的 px
    const maxCanvasWidthInGameArea = maxGameAreaWidthPx - gameAreaPaddingPx - rightPanelWidthPx - canvasGapPx;
    if (maxCanvasWidthInGameArea > 0 && gameCanvasWidth > maxCanvasWidthInGameArea) {
      gameCanvasWidth = maxCanvasWidthInGameArea;
    }

    // 按列行比例保持 10:20 的棋盘长宽比先算一版高度
    let gameCanvasHeight = gameCanvasWidth * (ROWS / COLS);

    // 一屏内可用高度：减去头部、统计、游戏区外边距、控制按钮、底部边距等（用 rpx 换算）
    const headerStatsHeight = (40 + 20 + 60 + 30) * rpxToPx;   // 标题+统计区约 150px
    const controlsHeight = (80 + 20 + 80 + 12 + 20) * rpxToPx; // 控制按钮+下落按钮+边距约 212px
    const containerPadding = 40 * rpxToPx;
    const gameAreaPadding = 24 * rpxToPx;
    const maxCanvasHeight = windowHeight - headerStatsHeight - controlsHeight - containerPadding - gameAreaPadding;

    // 若按宽度算出的高度超出一屏，则按高度反算宽度，保证不出现滚动
    if (gameCanvasHeight > maxCanvasHeight && maxCanvasHeight > 0) {
      gameCanvasHeight = maxCanvasHeight;
      gameCanvasWidth = gameCanvasHeight * (COLS / ROWS);
      if (gameCanvasWidth < 160) {
        gameCanvasWidth = 160;
        gameCanvasHeight = gameCanvasWidth * (ROWS / COLS);
      }
    }

    this.setData({
      gameCanvasWidth,
      gameCanvasHeight,
    });

    wx.nextTick(() => {
      this.initCanvases();
    });
  },

  onShow() {
    // 同步最新主题
    this.setData({
      theme: app.globalData.theme,
    });
  },

  onUnload() {
    // 清理定时器
    if (this.longPressTimer) {
      clearInterval(this.longPressTimer);
    }
  },

  /**
   * 初始化 Canvas
   */
  initCanvases() {
    // 缓存设备像素比，避免在渲染循环中反复调用
    this.pixelRatio = wx.getWindowInfo().pixelRatio;

    // 计数器，等两个 Canvas 都初始化完成后再启动游戏
    let canvasReadyCount = 0;
    const checkReady = () => {
      canvasReadyCount++;
      if (canvasReadyCount === 2) {
        // 两个 Canvas 都准备好了，初始化游戏
        this.initGame();
        // 先设置时间戳，避免第一次瞬间下落
        this.lastDrop = Date.now();
        this.gameInitialized = false;
        // 先渲染一次初始状态（玩家能看到第一个方块）
        this.render();
        // 启动游戏循环
        this.startGameLoop();
      }
    };

    // 初始化游戏画布
    const gameQuery = wx.createSelectorQuery();
    gameQuery.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = this.pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        this.gameCanvas = canvas;
        this.gameCtx = ctx;
        this.canvasWidth = res[0].width;
        this.canvasHeight = res[0].height;
        checkReady();
      });

    // 初始化预览画布
    const nextQuery = wx.createSelectorQuery();
    nextQuery.select('#nextCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = this.pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        this.nextCanvas = canvas;
        this.nextCtx = ctx;
        checkReady();
      });
  },

  /**
   * 初始化游戏
   */
  initGame() {
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    this.currentPiece = this.randomPiece();
    this.nextPiece = this.randomPiece();
    this.setData({
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      isPaused: false,
    });
    this.dropInterval = 1000;
    this.gameInitialized = false; // 重置初始化标志
    this.clearingLines = [];
  },

  /**
   * 创建随机方块
   */
  createPiece(type) {
    const shape = SHAPES[type];
    return {
      type: type,
      shape: shape,
      rotation: 0,
      x: Math.floor(COLS / 2) - Math.floor(shape[0][0].length / 2),
      y: 0
    };
  },

  randomPiece() {
    const types = Object.keys(SHAPES);
    const type = types[Math.floor(Math.random() * types.length)];
    return this.createPiece(type);
  },

  /**
   * 检查移动是否合法
   */
  isValidMove(piece, offsetX = 0, offsetY = 0, newRotation = null) {
    const shape = newRotation !== null
      ? SHAPES[piece.type][newRotation]
      : SHAPES[piece.type][piece.rotation];
    const newX = piece.x + offsetX;
    const newY = piece.y + offsetY;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return false;
          if (boardY >= 0 && this.board[boardY][boardX]) return false;
        }
      }
    }
    return true;
  },

  /**
   * 将方块合并到棋盘
   */
  mergePiece() {
    const shape = SHAPES[this.currentPiece.type][this.currentPiece.rotation];
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = this.currentPiece.y + y;
          const boardX = this.currentPiece.x + x;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            this.board[boardY][boardX] = this.currentPiece.type;
          }
        }
      }
    }
  },

  /**
   * 消除满行
   */
  clearLines() {
    const linesToClear = [];
    for (let y = ROWS - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 0)) {
        linesToClear.push(y);
      }
    }

    if (linesToClear.length > 0) {
      this.clearingLines = linesToClear;
      setTimeout(() => {
        for (const y of linesToClear.sort((a, b) => b - a)) {
          this.board.splice(y, 1);
          this.board.unshift(Array(COLS).fill(0));
        }
        const lineScores = [0, 100, 300, 500, 800];
        const newScore = this.data.score + lineScores[linesToClear.length] * this.data.level;
        const newLines = this.data.lines + linesToClear.length;
        const newLevel = Math.floor(newLines / 10) + 1;

        this.setData({
          score: newScore,
          lines: newLines,
          level: newLevel,
        });
        this.dropInterval = Math.max(100, 1000 - (newLevel - 1) * 100);
        this.clearingLines = [];
      }, 300);
    }
  },

  /**
   * 方块下落
   */
  dropPiece() {
    if (this.isValidMove(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
    } else {
      this.mergePiece();
      this.clearLines();
      this.currentPiece = this.nextPiece;
      this.nextPiece = this.randomPiece();
      if (!this.isValidMove(this.currentPiece)) {
        this.gameOver();
      }
    }
  },

  /**
   * 游戏结束
   */
  gameOver() {
    this.setData({ gameOver: true });
  },

  /**
   * 暂停/继续
   */
  togglePause() {
    if (this.data.gameOver) return;
    const isPaused = !this.data.isPaused;
    this.setData({ isPaused });
    if (!isPaused) {
      this.lastDrop = Date.now();
    }
  },

  /**
   * 游戏主循环
   */
  startGameLoop() {
    const gameLoop = () => {
      if (this.data.gameOver) {
        setTimeout(gameLoop, 16);
        return;
      }

      if (this.data.isPaused) {
        this.render();
        setTimeout(gameLoop, 16);
        return;
      }

      // 第一次循环：初始化时间戳，不触发自动下落
      if (!this.gameInitialized) {
        this.lastDrop = Date.now();
        this.gameInitialized = true;
        this.render();
        setTimeout(gameLoop, 16);
        return;
      }

      // 自动下落
      const now = Date.now();
      if (now - this.lastDrop > this.dropInterval) {
        this.dropPiece();
        this.lastDrop = now;
      }

      this.render();
      setTimeout(gameLoop, 16); // 约60fps
    };
    setTimeout(gameLoop, 16);
  },

  /**
   * 渲染画面
   */
  render() {
    if (!this.gameCtx) return;

    const ctx = this.gameCtx;
    ctx.save();
    this.applyGameCanvasClip(ctx);

    this.drawBoard();
    this.drawCurrentPiece();

    ctx.restore();

    // 预览下一个方块使用的是单独的 canvas，不受剪裁影响
    this.drawNextPiece();
  },

  /**
   * 为游戏主画布应用圆角剪裁（与 CSS 的 border-radius 视觉保持一致）
   */
  applyGameCanvasClip(ctx) {
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    if (!w || !h) return;

    // 圆角半径可以稍微大一点，视觉上接近 .game-canvas 的 20rpx
    const radius = 16;
    const r = Math.min(radius, w / 2, h / 2);

    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
  },

  /**
   * 绘制棋盘
   */
  drawBoard() {
    const ctx = this.gameCtx;
    const scale = this.canvasWidth / (COLS * BLOCK_SIZE);

    // 背景
    ctx.fillStyle = COLORS.board;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 网格线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK_SIZE * scale, 0);
      ctx.lineTo(x * BLOCK_SIZE * scale, this.canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK_SIZE * scale);
      ctx.lineTo(this.canvasWidth, y * BLOCK_SIZE * scale);
      ctx.stroke();
    }

    // 绘制已堆叠的方块
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (this.board[y][x]) {
          this.drawBlock(ctx, x, y, COLORS[this.board[y][x]], scale);
        }
      }
    }
  },

  /**
   * 绘制当前方块
   */
  drawCurrentPiece() {
    if (!this.currentPiece) return;
    const ctx = this.gameCtx;
    const scale = this.canvasWidth / (COLS * BLOCK_SIZE);
    const shape = SHAPES[this.currentPiece.type][this.currentPiece.rotation];

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          this.drawBlock(
            ctx,
            this.currentPiece.x + x,
            this.currentPiece.y + y,
            COLORS[this.currentPiece.type],
            scale
          );
        }
      }
    }
  },

  /**
   * 绘制单个方块
   */
  drawBlock(ctx, x, y, color, scale = 1) {
    const size = BLOCK_SIZE * scale;
    const drawX = x * size;
    const drawY = y * size;

    // 渐变背景
    const gradient = ctx.createLinearGradient(drawX, drawY, drawX + size, drawY + size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, this.shadeColor(color, -20));
    ctx.fillStyle = gradient;
    ctx.fillRect(drawX + 1, drawY + 1, size - 2, size - 2);

    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(drawX + 3, drawY + 3, size / 2 - 4, size / 2 - 4);

    // 边框
    ctx.strokeStyle = this.shadeColor(color, -30);
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX + 1, drawY + 1, size - 2, size - 2);
  },

  /**
   * 绘制下一个方块预览
   */
  drawNextPiece() {
    if (!this.nextCtx || !this.nextPiece) return;
    const ctx = this.nextCtx;
    const width = this.nextCanvas.width / this.pixelRatio;
    const height = this.nextCanvas.height / this.pixelRatio;

    ctx.fillStyle = COLORS.board;
    ctx.fillRect(0, 0, width, height);

    const shape = SHAPES[this.nextPiece.type][0];
    const blockSize = Math.floor(width / 4);
    const offsetX = (width / blockSize - shape[0].length) / 2;
    const offsetY = (height / blockSize - shape.length) / 2;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const size = blockSize;
          const drawX = Math.floor((x + offsetX) * size);
          const drawY = Math.floor((y + offsetY) * size);
          const color = COLORS[this.nextPiece.type];

          const gradient = ctx.createLinearGradient(drawX, drawY, drawX + size, drawY + size);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, this.shadeColor(color, -20));
          ctx.fillStyle = gradient;
          ctx.fillRect(drawX + 1, drawY + 1, size - 2, size - 2);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(drawX + 3, drawY + 3, size / 2 - 4, size / 2 - 4);

          ctx.strokeStyle = this.shadeColor(color, -30);
          ctx.lineWidth = 1;
          ctx.strokeRect(drawX + 1, drawY + 1, size - 2, size - 2);
        }
      }
    }
  },

  /**
   * 颜色变暗工具函数
   */
  shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  },

  /**
   * 按钮控制
   */
  onBtnLeft() {
    if (this.data.gameOver || this.data.isPaused) return;
    if (this.isValidMove(this.currentPiece, -1, 0)) {
      this.currentPiece.x--;
    }
    this.render();
  },

  onBtnRight() {
    if (this.data.gameOver || this.data.isPaused) return;
    if (this.isValidMove(this.currentPiece, 1, 0)) {
      this.currentPiece.x++;
    }
    this.render();
  },

  onBtnRotate() {
    if (this.data.gameOver || this.data.isPaused) return;
    const newRotation = (this.currentPiece.rotation + 1) % 4;
    if (this.isValidMove(this.currentPiece, 0, 0, newRotation)) {
      this.currentPiece.rotation = newRotation;
    }
    this.render();
  },

  onBtnDown() {
    if (this.data.gameOver || this.data.isPaused) return;
    // 瞬间下落
    let dropDistance = 0;
    while (this.isValidMove(this.currentPiece, 0, dropDistance + 1)) {
      dropDistance++;
    }
    if (dropDistance > 0) {
      this.currentPiece.y += dropDistance;
      this.setData({ score: this.data.score + dropDistance * 2 });
    }
    this.mergePiece();
    this.clearLines();
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.randomPiece();
    if (!this.isValidMove(this.currentPiece)) {
      this.gameOver();
    }
    this.render();
  },

  onBtnEnd() {
    // 按钮释放
  },

  /**
   * 重新开始
   */
  restart() {
    this.initGame();
    this.lastDrop = Date.now();
    this.gameInitialized = false;
  },
});
