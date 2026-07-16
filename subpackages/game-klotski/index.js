// 华容道游戏页
const { LEVELS, BLOCK_COLORS } = require('./levels.js');
const { withThemePage, getCanvasPalette } = require('../../utils/theme-manager.js');
const { vibrateShort } = require('../../utils/settings-manager.js');
const { createTimerManager } = require('../../utils/timer-manager.js');
const {
  getGameRecordText,
  updateGameBestRecord,
} = require('../../utils/game-records.js');
const { unlockAchievements } = require('../../utils/achievements.js');
const { showToast } = require('../../utils/modal-manager.js');

// 棋盘配置
const BOARD_COLS = 5;  // 5列
const BOARD_ROWS = 4;  // 4行
const CELL_GAP = 8;    // 格子间距
const EXIT_COL = 1;    // 底部出口起始列，出口宽度与曹操一致为 2 格

/**
 * 兼容性：绘制圆角矩形
 */
function drawRoundRect(ctx, x, y, width, height, radius) {
  const r = radius[0] || radius || 0;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

Page(withThemePage({
  data: {
    steps: 0,
    gameOver: false,
    currentLevel: 0,
    LEVELS: LEVELS,
    showLevelModal: false,
    bestRecordText: '暂无最佳记录',
  },

  // 游戏状态
  blocks: [],
  canvas: null,
  ctx: null,
  canvasWidth: 0,
  canvasHeight: 0,
  cellWidth: 0,
  cellHeight: 0,

  // 拖动状态
  selectedBlock: null,
  dragStartX: 0,
  dragStartY: 0,
  blockStartX: 0,
  blockStartY: 0,

  onLoad() {
    this.timers = createTimerManager();
    this.refreshBestRecord();
    this.initCanvas();
    this.initLevel(this.data.currentLevel);
  },

  onUnload() {
    if (this.timers) this.timers.clearAll();
  },

  onShow() {
    this.refreshBestRecord();
  },

  onThemeChange() {
    const palette = getCanvasPalette(this.data.themeKey, 'klotski');
    this.blockColors = palette.blockColors || BLOCK_COLORS;
    if (this.canvas) {
      this.render();
    }
  },

  /**
   * 初始化Canvas
   */
  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio || 1;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        this.canvas = canvas;
        this.ctx = ctx;
        this.canvasWidth = res[0].width;
        this.canvasHeight = res[0].height;

        // 计算格子大小（减去间距）
        const totalGapX = CELL_GAP * (BOARD_COLS + 1);
        const totalGapY = CELL_GAP * (BOARD_ROWS + 1);
        this.cellWidth = (this.canvasWidth - totalGapX) / BOARD_COLS;
        this.cellHeight = (this.canvasHeight - totalGapY) / BOARD_ROWS;

        this.timers.setTimeout('initialRender', () => this.render(), 100);
      });
  },

  /**
   * 初始化关卡
   */
  initLevel(levelIndex) {
    const level = LEVELS[levelIndex];
    if (!level) {
      // 所有关卡完成
      showToast({
        title: '恭喜通关！',
        icon: 'success'
      });
      return;
    }

    // 深拷贝滑块数据
    this.blocks = JSON.parse(JSON.stringify(level.blocks));
    this.setData({
      steps: 0,
      gameOver: false,
      currentLevel: levelIndex,
    });
    this.render();
  },

  /**
   * 选择关卡
   */
  selectLevel(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.initLevel(index);
    // 关闭浮窗
    this.setData({ showLevelModal: false });
  },

  /**
   * 切换关卡浮窗显示
   */
  toggleLevelModal() {
    this.setData({
      showLevelModal: !this.data.showLevelModal,
    });
  },

  /**
   * 阻止事件冒泡（点击浮窗内容时不关闭）
   */
  stopPropagation() {
    // 空函数，仅用于阻止冒泡
  },

  /**
   * 重新开始
   */
  restart() {
    this.initLevel(this.data.currentLevel);
  },

  /**
   * 下一关
   */
  nextLevel() {
    const nextLevel = this.data.currentLevel + 1;
    if (nextLevel < LEVELS.length) {
      this.initLevel(nextLevel);
    } else {
      showToast({
        title: '恭喜通关所有关卡！',
        icon: 'success'
      });
      this.initLevel(0);
    }
  },

  /**
   * 触摸开始
   */
  onTouchStart(e) {
    if (this.data.gameOver) return;

    const touch = e.touches[0];

    // 使用查询获取canvas位置信息
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas').boundingClientRect((rect) => {
      if (!rect) return;

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // 查找点击的滑块
      for (let i = this.blocks.length - 1; i >= 0; i--) {
        const block = this.blocks[i];
        const bx = CELL_GAP + block.x * (this.cellWidth + CELL_GAP);
        const by = CELL_GAP + block.y * (this.cellHeight + CELL_GAP);
        const bw = block.width * this.cellWidth + (block.width - 1) * CELL_GAP;
        const bh = block.height * this.cellHeight + (block.height - 1) * CELL_GAP;

        if (x >= bx && x <= bx + bw && y >= by && y <= by + bh) {
          this.selectedBlock = block;
          this.dragStartX = x;
          this.dragStartY = y;
          this.blockStartX = block.x;
          this.blockStartY = block.y;
          break;
        }
      }
    }).exec();
  },

  /**
   * 触摸移动（阻止滚动）
   */
  onTouchMove(e) {
    // 微信小程序中，catchtouchmove 已经阻止了事件冒泡
    // 不需要调用 preventDefault
  },

  /**
   * 触摸结束
   */
  onTouchEnd(e) {
    if (!this.selectedBlock || this.data.gameOver) {
      this.selectedBlock = null;
      return;
    }

    const touch = e.changedTouches[0];

    // 使用查询获取canvas位置信息
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas').boundingClientRect((rect) => {
      if (!rect) {
        this.selectedBlock = null;
        return;
      }

      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const dx = x - this.dragStartX;
      const dy = y - this.dragStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // 判断移动方向（最小移动距离30px）
      if (Math.max(absDx, absDy) > 30) {
        let moveX = 0;
        let moveY = 0;

        // 水平移动
        if (absDx > absDy) {
          moveX = dx > 0 ? 1 : -1;
        }
        // 垂直移动
        else {
          moveY = dy > 0 ? 1 : -1;
        }

        // 尝试移动
        if (this.canMove(this.selectedBlock, moveX, moveY)) {
          this.selectedBlock.x += moveX;
          this.selectedBlock.y += moveY;
          this.setData({ steps: this.data.steps + 1 });
          this.render();
          this.checkWin();
        }
      }

      this.selectedBlock = null;
    }).exec();
  },

  /**
   * 检查是否可以移动
   */
  canMove(block, moveX, moveY) {
    const newX = block.x + moveX;
    const newY = block.y + moveY;

    // 检查边界
    if (newX < 0 || newX + block.width > BOARD_COLS) return false;
    if (newY < 0) return false;
    if (newY + block.height > BOARD_ROWS && !this.isMovingCaocaoThroughExit(block, newX, newY)) {
      return false;
    }

    // 检查碰撞（排除自己）
    for (const other of this.blocks) {
      if (other.id === block.id) continue;

      // 矩形碰撞检测
      const overlapX = newX < other.x + other.width && newX + block.width > other.x;
      const overlapY = newY < other.y + other.height && newY + block.height > other.y;

      if (overlapX && overlapY) {
        return false;
      }
    }

    return true;
  },

  /**
   * 曹操只有在底部出口列向下移动时，才允许越过棋盘底边。
   * 这样胜利必须发生在“曹操真正出关”之后，而不是刚到出口内侧就提前触发。
   * @param {Object} block - 当前尝试移动的滑块。
   * @param {number} newX - 移动后的列坐标。
   * @param {number} newY - 移动后的行坐标。
   * @returns {boolean} 是否允许曹操通过出口越界。
   */
  isMovingCaocaoThroughExit(block, newX, newY) {
    if (!block || block.type !== 'caocao') return false;
    return newX === EXIT_COL
      && block.width === 2
      && block.height === 2
      && newY === BOARD_ROWS - 1;
  },

  /**
   * 检查胜利条件：曹操必须从底部出口向下移出棋盘。
   */
  checkWin() {
    const caocao = this.blocks.find(b => b.type === 'caocao');
    if (caocao && caocao.x === EXIT_COL && caocao.y + caocao.height > BOARD_ROWS) {
      const level = LEVELS[this.data.currentLevel] || {};
      updateGameBestRecord('game-klotski', {
        steps: this.data.steps,
        level: this.data.currentLevel + 1,
      });
      this.refreshBestRecord();
      const achievements = ['klotski_solver'];
      if (level.minSteps && this.data.steps <= level.minSteps) {
        achievements.push('klotski_clean_move');
      }
      unlockAchievements(achievements);
      this.setData({ gameOver: true });
      vibrateShort({ type: 'heavy' });
    }
  },

  refreshBestRecord() {
    this.setData({
      bestRecordText: getGameRecordText('game-klotski'),
    });
  },

  /**
   * 渲染游戏画面
   */
  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const palette = getCanvasPalette(this.data.themeKey, 'klotski');
    const blockColors = this.blockColors || palette.blockColors || BLOCK_COLORS;

    // 清空画布
    ctx.fillStyle = palette.boardBg || '#fff';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 绘制滑块
    for (const block of this.blocks) {
      const x = CELL_GAP + block.x * (this.cellWidth + CELL_GAP);
      const y = CELL_GAP + block.y * (this.cellHeight + CELL_GAP);
      const width = block.width * this.cellWidth + (block.width - 1) * CELL_GAP;
      const height = block.height * this.cellHeight + (block.height - 1) * CELL_GAP;

      // 获取配色
      const colors = blockColors[block.type] || blockColors.soldier;

      // 绘制滑块背景（渐变）
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      ctx.fillStyle = gradient;
      drawRoundRect(ctx, x, y, width, height, [12]);
      ctx.fill();

      // 绘制边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, x, y, width, height, [12]);
      ctx.stroke();

      // 绘制文字标签
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let label = '';
      if (block.type === 'caocao') label = '曹操';
      else if (block.type === 'v-general') label = '将';
      else if (block.type === 'h-general') label = '将';
      else if (block.type === 'soldier') label = '兵';

      ctx.fillText(label, x + width / 2, y + height / 2);
    }

    // 绘制出口提示（底部中间）
    const exitX = CELL_GAP + EXIT_COL * (this.cellWidth + CELL_GAP);
    const exitY = CELL_GAP + 3 * (this.cellHeight + CELL_GAP) + this.cellHeight + CELL_GAP;
    ctx.fillStyle = palette.exitBg || 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(exitX, exitY, this.cellWidth * 2 + CELL_GAP, 8);

    // 出口文字
    ctx.fillStyle = palette.exitText || 'rgba(255, 255, 255, 0.6)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('出口', exitX + this.cellWidth + CELL_GAP / 2, exitY + 25);
  },
}));
