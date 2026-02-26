// 2048 游戏页
const GAME_SIZE = 4;
const CELL_GAP = 12;

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

// 渐变配色方案 [起始色, 结束色]
const CELL_COLORS = {
  2: ['#ffeaa7', '#fdcb6e'],
  4: ['#fab1a0', '#e17055'],
  8: ['#fd79a8', '#e84393'],
  16: ['#a29bfe', '#6c5ce7'],
  32: ['#74b9ff', '#0984e3'],
  64: ['#81ecec', '#00cec9'],
  128: ['#55efc4', '#00b894'],
  256: ['#ff7675', '#d63031'],
  512: ['#fdcb6e', '#e17055'],
  1024: ['#e17055', '#d63031'],
  2048: ['#ffd700', '#ff8c00'],
  4096: ['#2d3436', '#000000'],
  8192: ['#2d3436', '#000000'],
  16384: ['#2d3436', '#000000'],
  32768: ['#2d3436', '#000000'],
  0: ['#cdc1b4', '#cdc1b4']
};

// 数字颜色
const TEXT_COLORS = {
  2: '#2d3436',
  4: '#ffffff',
  8: '#ffffff',
  16: '#ffffff',
  32: '#ffffff',
  64: '#ffffff',
  128: '#ffffff',
  256: '#ffffff',
  512: '#ffffff',
  1024: '#ffffff',
  2048: '#ffffff',
  4096: '#ffd700',
  8192: '#ffd700',
  16384: '#ffd700',
  32768: '#ffd700',
  0: '#ffffff'
};

Page({
  data: {
    score: 0,
    gameOver: false,
    showWin: false,
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
    this.initCanvas();
    this.initGame();
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
        setTimeout(() => this.render(), 100);
      });
  },

  initGame() {
    this.grid = Array(GAME_SIZE).fill(null).map(() => Array(GAME_SIZE).fill(0));
    this.setData({ score: 0, gameOver: false, showWin: false });
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
    if (this.data.gameOver || !this.startX) return;
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
        let row = newGrid[y];
        if (direction === 'right') row.reverse();
        const newRow = slideRow(row);
        if (direction === 'right') newRow.reverse();
        if (newRow.join(',') !== newGrid[y].join(',')) moved = true;
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
      this.addRandomTile();
      this.render();
      this.checkGameOver();
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
    this.setData({ gameOver: true });
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

    // 背景
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 绘制格子
    for (let y = 0; y < GAME_SIZE; y++) {
      for (let x = 0; x < GAME_SIZE; x++) {
        const value = this.grid[y][x];
        const posX = this.cellGap + x * (this.cellSize + this.cellGap);
        const posY = this.cellGap + y * (this.cellSize + this.cellGap);

        // 格子背景 - 使用渐变
        const colors = CELL_COLORS[value] || CELL_COLORS[0];
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
          ctx.fillStyle = TEXT_COLORS[value] || '#ffffff';
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
});
