// 2048 游戏页
const GAME_SIZE = 4;
const CELL_GAP = 12;
const { withThemePage, getCanvasPalette } = require('../../utils/theme-manager.js');
const { createTimerManager } = require('../../utils/timer-manager.js');
const {
  getGameRecordText,
  updateGameBestRecord,
} = require('../../utils/game-records.js');
const { unlockAchievements } = require('../../utils/achievements.js');

/**
 * 兼容性：绘制圆角矩形（部分真机不支持 roundRect）
 * @param {CanvasRenderingContext2D} ctx - Canvas上下文
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @param {number[]} radius - 圆角半径数组 [左上, 右上, 右下, 左下]
 */
function drawRoundRect(ctx, x, y, width, height, radius) {
  const r = radius[0] || radius || 0; // 取第一个圆角值
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

const DEFAULT_2048_PALETTE = getCanvasPalette('default', 'game2048');

Page(withThemePage({
  data: {
    score: 0,
    gameOver: false,
    showWin: false,
    steps: 0, // 已操作步数
    bestRecordText: '暂无最佳记录',
  },

  // 游戏状态
  grid: [],
  canvas: null,
  ctx: null,
  canvasWidth: 0,
  canvasHeight: 0,
  cellSize: 0,
  cellGap: CELL_GAP, // 添加cellGap属性
  pixelRatio: 1,

  onLoad() {
    this.timers = createTimerManager();
    this.refreshBestRecord();
    this.initCanvas();
    this.initGame();
  },

  onUnload() {
    this.saveBestRecord();
    if (this.timers) this.timers.clearAll();
  },

  onHide() {
    this.saveBestRecord();
  },

  onShow() {
    this.refreshBestRecord();
    this.render();
  },

  onThemeChange() {
    this.render();
  },

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
        this.pixelRatio = dpr;
        this.canvasWidth = res[0].width;
        this.canvasHeight = res[0].height;
        const totalGap = this.cellGap * (GAME_SIZE + 1);
        this.cellSize = (this.canvasWidth - totalGap) / GAME_SIZE;
        this.timers.setTimeout('initialRender', () => this.render(), 100);
      });
  },

  initGame() {
    this.grid = Array(GAME_SIZE).fill(null).map(() => Array(GAME_SIZE).fill(0));
    this.hasWon = false;
    this.setData({ score: 0, gameOver: false, showWin: false, steps: 0 });
    this.addRandomTile();
    this.addRandomTile();
    this.render();
  },

  addRandomTile() {
    const empty = [];
    for (let y = 0; y < GAME_SIZE; y++) {
      for (let x = 0; x < GAME_SIZE; x++) {
        if (this.grid[y][x] === 0) empty.push({ x, y });
      }
    }
    if (empty.length > 0) {
      const { x, y } = empty[Math.floor(Math.random() * empty.length)];
      this.grid[y][x] = Math.random() < 0.9 ? 2 : 4;
    }
  },

  onTouchStart(e) {
    if (this.data.gameOver) return;
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  },

  onTouchMove(e) {
    e.preventDefault();
  },

  onTouchEnd(e) {
    if (this.data.gameOver || this.startX === null || this.startX === undefined) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - this.startX;
    const dy = endY - this.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 30) {
      if (absDx > absDy) {
        this.move(dx > 0 ? 'right' : 'left');
      } else {
        this.move(dy > 0 ? 'down' : 'up');
      }
    }
    this.startX = null;
    this.startY = null;
  },

  move(direction) {
    let moved = false;
    const newGrid = this.grid.map(row => [...row]);

    const slideRow = (row) => {
      let arr = row.filter(val => val !== 0);
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
          arr[i] *= 2;
          this.setData({ score: this.data.score + arr[i] });
          arr.splice(i + 1, 1);
        }
      }
      while (arr.length < GAME_SIZE) arr.push(0);
      return arr;
    };

    if (direction === 'left' || direction === 'right') {
      for (let y = 0; y < GAME_SIZE; y++) {
        const originalRow = [...newGrid[y]];
        let row = [...newGrid[y]];
        if (direction === 'right') row.reverse();
        const newRow = slideRow(row);
        if (direction === 'right') newRow.reverse();
        if (newRow.join(',') !== originalRow.join(',')) moved = true;
        newGrid[y] = newRow;
      }
    } else {
      for (let x = 0; x < GAME_SIZE; x++) {
        let col = newGrid.map(row => row[x]);
        if (direction === 'down') col.reverse();
        const newCol = slideRow(col);
        if (direction === 'down') newCol.reverse();
        for (let y = 0; y < GAME_SIZE; y++) {
          if (newGrid[y][x] !== newCol[y]) moved = true;
          newGrid[y][x] = newCol[y];
        }
      }
    }

    if (moved) {
      this.grid = newGrid;
      // 有实际移动才算一步
      this.setData({ steps: this.data.steps + 1 });
      this.addRandomTile();
      this.render();
      this.checkWin();
      this.checkGameOver();
    }
  },

  checkWin() {
    if (this.hasWon) return;
    const has2048 = this.grid.some(row => row.some(value => value >= 2048));
    if (has2048) {
      this.hasWon = true;
      this.saveBestRecord();
      unlockAchievements(['tile_2048']);
      this.setData({ showWin: true });
    }
  },

  checkGameOver() {
    // 检查是否还有空格
    for (let y = 0; y < GAME_SIZE; y++) {
      for (let x = 0; x < GAME_SIZE; x++) {
        if (this.grid[y][x] === 0) return;
      }
    }
    // 检查是否还能合并
    for (let y = 0; y < GAME_SIZE; y++) {
      for (let x = 0; x < GAME_SIZE; x++) {
        const val = this.grid[y][x];
        if (x < GAME_SIZE - 1 && this.grid[y][x + 1] === val) return;
        if (y < GAME_SIZE - 1 && this.grid[y + 1][x] === val) return;
      }
    }
    this.saveBestRecord();
    this.setData({ gameOver: true });
  },

  saveBestRecord() {
    if (this.data.score <= 0) return;
    updateGameBestRecord('game-2048', {
      score: this.data.score,
      steps: this.data.steps,
    });
    this.refreshBestRecord();
    if (this.data.score >= 1000) unlockAchievements('score_1000');
    if (this.data.score >= 5000) unlockAchievements('score_5000');
  },

  refreshBestRecord() {
    this.setData({
      bestRecordText: getGameRecordText('game-2048'),
    });
  },

  getFontSize(value) {
    if (value === 0) return `0 ${this.cellSize * 0.5}px sans-serif`;
    const digits = value.toString().length;
    const sizes = [0.60, 0.50, 0.42, 0.35];
    const size = sizes[Math.min(digits - 1, 3)];
    return `bold ${this.cellSize * size}px sans-serif`;
  },

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const palette = getCanvasPalette(this.data.themeKey, 'game2048');
    const cellColors = palette.cellColors || DEFAULT_2048_PALETTE.cellColors;
    const textColors = palette.textColors || DEFAULT_2048_PALETTE.textColors;

    // 背景
    ctx.fillStyle = palette.boardBg || DEFAULT_2048_PALETTE.boardBg || '#fff';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 绘制格子
    for (let y = 0; y < GAME_SIZE; y++) {
      for (let x = 0; x < GAME_SIZE; x++) {
        const value = this.grid[y][x];
        const posX = this.cellGap + x * (this.cellSize + this.cellGap);
        const posY = this.cellGap + y * (this.cellSize + this.cellGap);

        // 格子背景 - 使用渐变
        const colors = cellColors[value] || cellColors[0];
        const gradient = ctx.createLinearGradient(posX, posY, posX + this.cellSize, posY + this.cellSize);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
        // 使用兼容的圆角矩形方法
        drawRoundRect(ctx, posX, posY, this.cellSize, this.cellSize, [6]);
        ctx.fill();

        // 2048格子发光效果
        if (value === 2048) {
          ctx.shadowColor = 'rgba(241, 225, 84, 0.5)';
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.shadowBlur = 0; // 重置阴影
        }

        // 数字
        if (value !== 0) {
          ctx.fillStyle = textColors[value] || '#ffffff';
          ctx.font = this.getFontSize(value);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(value, posX + this.cellSize / 2, posY + this.cellSize / 2);
        }
      }
    }
  },

  restart() {
    this.initGame();
  },

  continueGame() {
    this.setData({ showWin: false });
  },
}));
