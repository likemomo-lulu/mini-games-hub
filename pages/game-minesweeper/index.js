// 扫雷游戏
Page({
  data: {
    // 游戏配置
    rows: 9,
    cols: 9,
    totalMines: 10,

    // 游戏数据
    grid: [],           // 网格数据（二维数组扁平化）
    remainingMines: 10, // 剩余地雷数
    timeDisplay: '00:00', // 时间显示

    // 游戏状态
    gameOver: false,   // 游戏结束
    gameWon: false,    // 游戏胜利
    firstClick: true,  // 第一次点击
  },

  onLoad() {
    this.initGame();
  },

  onUnload() {
    this.clearTimer();
  },

  // ===== 游戏初始化 =====

  /**
   * 初始化游戏
   */
  initGame() {
    // 游戏状态
    this.board = [];          // 雷区数据（-1雷，0-8数字）
    this.revealed = [];       // 已揭开的格子
    this.flagged = [];        // 已插旗的格子
    this.mines = [];          // 地雷位置
    this.seconds = 0;         // 计时秒数
    this.timer = null;        // 计时器

    // 初始化网格
    this.createGrid();

    // 重置数据
    this.setData({
      remainingMines: this.data.totalMines,
      timeDisplay: '00:00',
      gameOver: false,
      gameWon: false,
      firstClick: true,
    });
  },

  /**
   * 创建网格
   */
  createGrid() {
    const { rows, cols } = this.data;
    const grid = [];

    // 初始化数据结构
    for (let r = 0; r < rows; r++) {
      this.board[r] = [];
      this.revealed[r] = [];
      this.flagged[r] = [];

      for (let c = 0; c < cols; c++) {
        this.board[r][c] = 0;
        this.revealed[r][c] = false;
        this.flagged[r][c] = false;

        // 扁平化网格用于渲染
        grid.push({
          row: r,
          col: c,
          value: 0,
          revealed: false,
          flagged: false,
        });
      }
    }

    this.setData({ grid });
  },

  // ===== 布雷逻辑 =====

  /**
   * 随机布雷（保证第一次点击不是雷）
   */
  placeMines(safeRow, safeCol) {
    const { rows, cols, totalMines } = this.data;
    let minesPlaced = 0;

    while (minesPlaced < totalMines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      // 避开第一次点击的位置及其周围3x3区域
      if (Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1) {
        continue;
      }

      if (this.board[row][col] !== -1) {
        this.board[row][col] = -1; // -1 表示地雷
        this.mines.push({ row, col });
        minesPlaced++;
      }
    }

    // 计算每个格子周围的雷数
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (this.board[r][c] !== -1) {
          this.board[r][c] = this.countAdjacentMines(r, c);
        }
      }
    }

    // 更新网格数据
    this.updateGridData();
  },

  /**
   * 计算周围地雷数量
   */
  countAdjacentMines(row, col) {
    const { rows, cols } = this.data;
    let count = 0;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const nr = row + dr;
        const nc = col + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (this.board[nr][nc] === -1) {
            count++;
          }
        }
      }
    }

    return count;
  },

  /**
   * 更新网格数据（用于渲染）
   */
  updateGridData() {
    const { rows, cols } = this.data;
    const grid = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid.push({
          row: r,
          col: c,
          value: this.board[r][c],
          revealed: this.revealed[r][c],
          flagged: this.flagged[r][c],
        });
      }
    }

    this.setData({ grid });
  },

  // ===== 点击事件 =====

  /**
   * 点击格子（揭开）
   */
  onCellTap(e) {
    const { row, col } = e.currentTarget.dataset;

    if (this.data.gameOver || this.data.gameWon) return;
    if (this.revealed[row][col] || this.flagged[row][col]) return;

    // 第一次点击：布雷并启动计时器
    if (this.data.firstClick) {
      this.placeMines(row, col);
      this.setData({ firstClick: false });
      this.startTimer();
    }

    // 揭开格子
    this.revealCell(row, col);
  },

  /**
   * 长按格子（插旗）
   */
  onCellLongPress(e) {
    const { row, col } = e.currentTarget.dataset;

    if (this.data.gameOver || this.data.gameWon) return;
    if (this.revealed[row][col]) return;

    // 切换旗帜
    this.flagged[row][col] = !this.flagged[row][col];

    // 更新剩余地雷数
    const flagCount = this.flagged.flat().filter(f => f).length;
    this.setData({
      remainingMines: this.data.totalMines - flagCount,
    });

    // 触觉反馈
    wx.vibrateShort({ type: 'light' });

    // 更新显示
    this.updateGridData();
  },

  /**
   * 点击已揭开的数字格子（快速揭开周围）
   */
  onRevealedCellTap(e) {
    const { row, col } = e.currentTarget.dataset;

    if (this.data.gameOver || this.data.gameWon) return;
    if (!this.revealed[row][col]) return;

    const value = this.board[row][col];
    if (value <= 0) return;

    this.quickReveal(row, col);
  },

  // ===== 游戏逻辑 =====

  /**
   * 揭开格子
   */
  revealCell(row, col) {
    const { rows, cols } = this.data;

    // 边界检查
    if (row < 0 || row >= rows || col < 0 || col >= cols) return;
    if (this.revealed[row][col] || this.flagged[row][col]) return;

    // 揭开格子
    this.revealed[row][col] = true;

    // 踩雷了
    if (this.board[row][col] === -1) {
      this.gameLose();
      return;
    }

    // 空白格子：自动扩散揭开周围
    if (this.board[row][col] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            this.revealCell(row + dr, col + dc);
          }
        }
      }
    }

    // 检查胜利
    this.checkWin();

    // 更新显示
    this.updateGridData();
  },

  /**
   * 快速揭开周围（高级技巧）
   */
  quickReveal(row, col) {
    const { rows, cols } = this.data;
    const mineCount = this.board[row][col];
    let flagCount = 0;

    // 计算周围旗帜数量
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const nr = row + dr;
        const nc = col + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (this.flagged[nr][nc]) {
            flagCount++;
          }
        }
      }
    }

    // 如果旗帜数量等于数字，揭开周围未插旗的格子
    if (flagCount === mineCount) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 || dc === 0) continue;

          const nr = row + dr;
          const nc = col + dc;

          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (!this.revealed[nr][nc] && !this.flagged[nr][nc]) {
              this.revealCell(nr, nc);
            }
          }
        }
      }
    }

    this.updateGridData();
  },

  /**
   * 检查是否胜利
   */
  checkWin() {
    const { rows, cols } = this.data;
    let unrevealedSafe = 0;

    // 计算未揭开的非雷格子数
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!this.revealed[r][c] && this.board[r][c] !== -1) {
          unrevealedSafe++;
        }
      }
    }

    // 所有非雷格子都揭开了，胜利
    if (unrevealedSafe === 0) {
      this.gameWin();
    }
  },

  /**
   * 游戏失败
   */
  gameLose() {
    this.clearTimer();

    // 揭开所有地雷
    this.mines.forEach(({ row, col }) => {
      this.revealed[row][col] = true;
    });

    this.updateGridData();

    // 显示失败界面
    setTimeout(() => {
      this.setData({ gameOver: true });
      wx.vibrateShort({ type: 'heavy' });
    }, 500);
  },

  /**
   * 游戏胜利
   */
  gameWin() {
    this.clearTimer();
    this.setData({ gameWon: true });
    wx.vibrateShort({ type: 'light' });
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

  // ===== 游戏控制 =====

  /**
   * 重新开始
   */
  restart() {
    this.clearTimer();
    this.initGame();
  },
});
