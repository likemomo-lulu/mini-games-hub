// 接物品游戏
const app = getApp();

Page({
  // 页面数据
  data: {
    score: 0,        // 分数
    lives: 3,        // 生命值
    livesDisplay: '❤️❤️❤️', // 生命值显示（爱心字符串）
    level: 1,        // 难度等级
    gameOver: false, // 游戏结束
    paused: false,   // 暂停状态
    gameReady: false,// 游戏是否准备好
    // 画布在视图层的高度（px），用于根据机型自适应
    boardHeight: 400,
    // 主题（从全局获取，支持切换）
    theme: app.globalData.theme,
  },

  onLoad() {
    this.initGame();
  },

  onReady() {
    // 页面渲染完成后初始化Canvas
    this.onCanvasReady();
  },

  onUnload() {
    // 页面卸载时清理定时器
    this.clearGameLoop();
  },

  onHide() {
    // 页面隐藏时暂停
    if (this.data.gameReady && !this.data.gameOver) {
      this.togglePause();
    }
  },

  onShow() {
    // 同步最新主题
    this.setData({
      theme: app.globalData.theme,
    });
  },

  // ===== 游戏初始化 =====

  /**
   * 初始化游戏
   */
  initGame() {
    // 游戏配置
    this.canvas = null;
    this.ctx = null;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.dpr = 1; // 设备像素比

    // 玩家（篮子）配置
    this.player = {
      x: 0,
      y: 0,
      width: 70,
      height: 45,
      speed: 6,
    };

    // 物品配置
    this.items = [];
    this.itemTypes = [
      { emoji: '🍎', score: 10, type: 'good' },
      { emoji: '🍓', score: 10, type: 'good' },
      { emoji: '🍒', score: 10, type: 'good' },
      { emoji: '🍑', score: 10, type: 'good' },
      { emoji: '🥝', score: 10, type: 'good' },
      { emoji: '🍊', score: 10, type: 'good' },
      { emoji: '🍋', score: 10, type: 'good' },
      { emoji: '🍉', score: 10, type: 'good' },
      { emoji: '🍍', score: 10, type: 'good' },
      { emoji: '🍌', score: 10, type: 'good' },
      { emoji: '🍇', score: 10, type: 'good' },
      { emoji: '⭐', score: 30, type: 'rare' },
      { emoji: '❤️', score: 0, type: 'life' },
      { emoji: '💣', score: -20, type: 'bad', damage: true },
      { emoji: '🪨', score: -10, type: 'bad' }
    ];

    // 游戏状态
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.spawnTimer = 0;
    this.spawnInterval = 1000; // 初始生成间隔(ms)
    this.baseSpeed = 1.5;      // 基础掉落速度

    // 输入状态
    this.keys = { left: false, right: false };

    // 重置数据
    this.setData({
      score: 0,
      lives: 3,
      level: 1,
      gameOver: false,
      paused: false,
      gameReady: false,
    });

    // 根据屏幕尺寸计算一个适合的画布高度（保持在不同机型上占据大致相似的区域）
    const info = wx.getSystemInfoSync();
    const windowWidth = info.windowWidth || 375;
    const windowHeight = info.windowHeight || 667;

    // 以宽度为基准控制纵横比，例如 1.6:1（可以略高一点，玩起来更舒服）
    let boardHeight = windowWidth * 1.6;
    // 不能比屏幕高太多，预留头部和按钮区域
    const maxBoardHeight = windowHeight - 220; // 预留一些空间给头部、按钮和上下间距
    if (boardHeight > maxBoardHeight) {
      boardHeight = maxBoardHeight;
    }
    if (boardHeight < 300) {
      boardHeight = 300;
    }

    this.setData({ boardHeight });
  },

  /**
   * Canvas准备就绪回调
   */
  onCanvasReady() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          console.error('Canvas获取失败，重试中...');
          setTimeout(() => this.onCanvasReady(), 100);
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio || 1;

        // 直接使用 CSS 渲染后的尺寸（Canvas 写死尺寸后一定能获取到）
        const width = res[0].width;
        const height = res[0].height;

        // 设置canvas物理尺寸
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        this.canvas = canvas;
        this.ctx = ctx;
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.dpr = dpr;

        // 基于画布宽度的比例（参考设计宽度 375px），让篮子和物品随屏幕大小自适应
        const baseWidth = 375;
        const scale = this.canvasWidth / baseWidth;
        this.scale = scale;

        // 按比例调整玩家（篮子）尺寸和移动速度（更扁更宽一点）
        this.player.width = 90 * scale;   // 宽一些
        this.player.height = 35 * scale;  // 矮一些
        this.player.speed = 6 * scale;

        // 物品基础尺寸也按比例缩放
        this.itemSize = 28 * scale;

        // 初始化玩家位置（更贴近底部一点，同样使用比例）
        this.player.x = width / 2 - this.player.width / 2;
        // 距离底部预留约 10 * scale 的间隙
        this.player.y = height - this.player.height - 10 * scale;

        // 标记游戏准备好
        this.setData({ gameReady: true });

        console.log('Canvas初始化完成', { width: this.canvasWidth, height: this.canvasHeight, dpr });

        // 延迟启动，确保Canvas完全准备好
        setTimeout(() => {
          // 立即生成一个测试物品
          this.spawnItem();
          // 启动游戏循环
          this.startGameLoop();
        }, 200);
      });
  },

  // ===== 游戏循环 =====

  /**
   * 启动游戏循环
   */
  startGameLoop() {
    this.lastTime = Date.now();
    // 微信小程序不支持requestAnimationFrame，使用setTimeout
    this.gameLoopId = setTimeout(() => this.gameLoop(), 16);
  },

  /**
   * 清理游戏循环
   */
  clearGameLoop() {
    if (this.gameLoopId) {
      clearTimeout(this.gameLoopId);
      this.gameLoopId = null;
    }
  },

  /**
   * 游戏主循环
   */
  gameLoop() {
    if (this.gameOver) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (!this.paused) {
      this.update(deltaTime);
      this.draw();
    }

    // 约60fps (16ms)
    this.gameLoopId = setTimeout(() => this.gameLoop(), 16);
  },

  // ===== 游戏更新 =====

  /**
   * 更新游戏状态
   */
  update(deltaTime) {
    // 每60帧输出一次状态
    if (!this._frameCount) this._frameCount = 0;
    this._frameCount++;

    if (this._frameCount % 60 === 0) {
      console.log('update执行', { paused: this.paused, items: this.items.length, deltaTime });
    }

    // 更新玩家位置
    if (this.keys.left && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (this.keys.right && this.player.x < this.canvasWidth - this.player.width) {
      this.player.x += this.player.speed;
    }

    // 生成新物品
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnItem();
      this.spawnTimer = 0;
      console.log('生成物品，当前数量:', this.items.length);
    }

    // 更新物品位置
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];

      // 根据难度调整速度
      const speed = this.baseSpeed + (this.level - 1) * 0.2;
      const oldY = item.y;
      item.y += speed;
      item.rotation += 0.05;

      // 检测碰撞
      if (this.checkCollision(item)) {
        console.log('碰撞检测触发，移除物品', { itemY: oldY, playerY: this.player.y });
        this.handleCatch(item);
        this.items.splice(i, 1);
        continue;
      }

      // 移除超出屏幕的物品（和原HTML一样）
      if (item.y > this.canvasHeight) {
        console.log('超出屏幕，移除物品', { itemY: item.y, canvasHeight: this.canvasHeight });
        this.items.splice(i, 1);
      }
    }

    // 调试：如果物品数量突然变为0，输出原因
    if (this.items.length === 0 && this._prevItemsCount > 0) {
      console.log('物品全部消失！');
    }
    this._prevItemsCount = this.items.length;
  },

  /**
   * 生成物品
   */
  spawnItem() {
    const itemType = this.selectRandomItemType();
    const size = this.itemSize || 28;
    const item = {
      ...itemType,
      x: Math.random() * (this.canvasWidth - size),
      y: -size,
      size,
      rotation: 0,
    };
    this.items.push(item);
  },

  /**
   * 随机选择物品类型
   */
  selectRandomItemType() {
    const rand = Math.random();
    if (rand < 0.05) return this.itemTypes[11]; // ⭐ 5%
    if (rand < 0.08) return this.itemTypes[12]; // ❤️ 3%
    if (rand < 0.25) return this.itemTypes[13]; // 💣 17%
    if (rand < 0.40) return this.itemTypes[14]; // 🪨 15%
    // 好物品 60%
    const goodItems = this.itemTypes.slice(0, 11);
    return goodItems[Math.floor(Math.random() * goodItems.length)];
  },

  /**
   * 碰撞检测 - 标准矩形碰撞（和原HTML一样）
   */
  checkCollision(item) {
    return item.x < this.player.x + this.player.width &&
           item.x + item.size > this.player.x &&
           item.y < this.player.y + this.player.height &&
           item.y + item.size > this.player.y;
  },

  /**
   * 处理接住物品
   */
  handleCatch(item) {
    if (item.type === 'good' || item.type === 'rare') {
      // 好物品加分
      this.score += item.score;
    } else if (item.type === 'life') {
      // 加生命
      if (this.lives < 5) this.lives++;
    } else if (item.type === 'bad') {
      // 坏物品
      this.score += item.score; // 分数可能是负数
      if (item.damage) {
        this.lives--;
      }
    }

    // 检查升级
    this.checkLevelUp();

    // 检查游戏结束
    if (this.lives <= 0) {
      this.endGame();
    }

    // 更新UI
    this.updateDisplay();
  },

  /**
   * 检查升级
   */
  checkLevelUp() {
    const newLevel = Math.floor(this.score / 100) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      // 减少生成间隔，最低300ms
      this.spawnInterval = Math.max(300, 1000 - (this.level - 1) * 100);
      this.setData({ level: this.level });
    }
  },

  /**
   * 更新显示
   */
  updateDisplay() {
    this.setData({
      score: this.score,
      lives: this.lives,
      livesDisplay: '❤️'.repeat(Math.max(0, this.lives)),
    });
  },

  // ===== 游戏绘制 =====

  /**
   * 绘制游戏画面
   */
  draw() {
    if (!this.ctx) {
      console.log('draw(): ctx 不存在');
      return;
    }

    const ctx = this.ctx;

    // 清空画布
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 应用圆角裁剪，让实际绘制区域也有圆角效果
    ctx.save();
    this.applyGameCanvasClip(ctx);

    // 绘制背景（半透明白色，与主题一致）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 绘制玩家（篮子）
    this.drawPlayer();

    // 绘制物品
    this.items.forEach((item, index) => {
      // 每秒输出一次物品位置（通过时间戳取模避免刷屏）
      if (Date.now() % 1000 < 20) {
        console.log(`物品${index}: x=${item.x.toFixed(1)}, y=${item.y.toFixed(1)}`);
      }
      this.drawItem(item);
    });

    ctx.restore();

    // 真机兼容：显式触发绘制
    // Canvas 2D 一般不需要，但某些真机可能需要
    // wx.canvasToTempFilePath 在真机上会触发渲染
  },

  /**
   * 为接物品主画布应用圆角剪裁（与 .game-canvas 的圆角视觉保持一致）
   */
  applyGameCanvasClip(ctx) {
    const w = this.canvasWidth;
    const h = this.canvasHeight;
    if (!w || !h) return;

    // 圆角半径适中即可，避免在小屏幕上过大
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
   * 绘制玩家（篮子）
   */
  drawPlayer() {
    const ctx = this.ctx;
    const w = this.player.width;
    const h = this.player.height;
    const x = this.player.x;
    const y = this.player.y;

    // 绘制篮子主体
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - 5, y + h);
    ctx.lineTo(x + 5, y + h);
    ctx.closePath();
    ctx.fill();

    // 绘制篮子纹理
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 10, y + h - 5);
    ctx.moveTo(x + w - 10, y);
    ctx.lineTo(x + w - 10, y + h - 5);
    ctx.stroke();

    // 篮子边缘
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  },

  /**
   * 绘制物品
   */
  drawItem(item) {
    const ctx = this.ctx;
    const size = item.size;
    const x = item.x + size / 2;
    const y = item.y + size / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(item.rotation);

    // 绘制 emoji
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, 0, 0);

    ctx.restore();
  },

  // ===== 游戏控制 =====

  /**
   * 游戏结束
   */
  endGame() {
    this.gameOver = true;
    this.clearGameLoop();
    this.setData({ gameOver: true });
  },

  /**
   * 重新开始
   */
  restart() {
    this.items = [];
    this.initGame();
    this.onCanvasReady();
  },

  /**
   * 暂停/继续
   */
  togglePause() {
    if (this.gameOver || !this.data.gameReady) return;

    this.paused = !this.paused;
    this.setData({ paused: this.paused });
  },

  // ===== 输入事件 =====

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    const touch = e.touches[0];
    const x = touch.x;

    // 根据触摸位置判断左右
    const centerX = this.canvasWidth / 2;
    if (x < centerX) {
      this.keys.left = true;
      this.keys.right = false;
    } else {
      this.keys.right = true;
      this.keys.left = false;
    }
  },

  /**
   * 触摸移动
   */
  onTouchMove(e) {
    const touch = e.touches[0];
    const x = touch.x;

    // 直接根据触摸位置移动玩家
    this.player.x = x - this.player.width / 2;

    // 边界限制
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > this.canvasWidth - this.player.width) {
      this.player.x = this.canvasWidth - this.player.width;
    }
  },

  /**
   * 触摸结束
   */
  onTouchEnd() {
    this.keys.left = false;
    this.keys.right = false;
  },

  /**
   * 左移按钮
   */
  onLeftStart() {
    this.keys.left = true;
  },

  onLeftEnd() {
    this.keys.left = false;
  },

  /**
   * 右移按钮
   */
  onRightStart() {
    this.keys.right = true;
  },

  onRightEnd() {
    this.keys.right = false;
  },
});
