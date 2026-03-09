/**
 * 华容道关卡数据
 * 棋盘大小：5×4（列×行）
 * 坐标：x(0-4), y(0-3)
 *
 * 滑块类型：
 * - caocao: 2×2 曹操
 * - v-general: 1×2 竖将（五虎将）
 * - h-general: 2×1 横将
 * - soldier: 1×1 小兵
 */

// 滑块配色（渐变色 [起始色, 结束色]）
const BLOCK_COLORS = {
  caocao: ['#ff6b6b', '#ee5a5a'],      // 红色 - 曹操
  v_general: ['#4ecdc4', '#44b3ab'],   // 青色 - 竖将
  h_general: ['#ffe66d', '#ffd93d'],   // 黄色 - 横将
  soldier: ['#95e1d3', '#7ed7c6'],     // 绿色 - 小兵
};

const LEVELS = [
  {
    id: 1,
    name: '横刀立马',
    // 最经典布局
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'zhangfei', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'zhaoyun', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'machao', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 'huangzhong', type: 'v-general', x: 3, y: 2, width: 1, height: 2 },
      { id: 'guanyu', type: 'h-general', x: 1, y: 2, width: 2, height: 1 },
      { id: 's1', type: 'soldier', x: 1, y: 3, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
    ],
    minSteps: 81,  // 最优解步数
  },
  {
    id: 2,
    name: '一路顺风',
    // 简单布局 - 五竖将
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'v3', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 'v4', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 1, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 2, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
    ],
    minSteps: 30,
  },
  {
    id: 3,
    name: '兵分三路',
    // 三路布局
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 2, width: 2, height: 1 },
      { id: 'v3', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 4, y: 3, width: 1, height: 1 },
    ],
    minSteps: 46,
  },
  {
    id: 4,
    name: '四面楚歌',
    // 四将包围
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'v3', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 'v4', type: 'v-general', x: 3, y: 2, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 2, width: 2, height: 1 },
      { id: 's1', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 4, y: 3, width: 1, height: 1 },
    ],
    minSteps: 60,
  },
  {
    id: 5,
    name: '比翼双飞',
    // 双横将对称
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 0, y: 2, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 3, y: 2, width: 2, height: 1 },
      { id: 's1', type: 'soldier', x: 2, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 0, y: 3, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 1, y: 3, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
    ],
    minSteps: 52,
  },
  {
    id: 6,
    name: '指挥若定',
    // 五将横栏
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'h1', type: 'h-general', x: 0, y: 0, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 3, y: 0, width: 2, height: 1 },
      { id: 'v1', type: 'v-general', x: 0, y: 1, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 1, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 2, y: 0, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 0, y: 3, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 1, y: 3, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
      { id: 's5', type: 'soldier', x: 4, y: 3, width: 1, height: 1 },
    ],
    minSteps: 70,
  },
  {
    id: 7,
    name: '将拥曹营',
    // 三横将封锁
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'h1', type: 'h-general', x: 0, y: 0, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 3, y: 0, width: 2, height: 1 },
      { id: 'h3', type: 'h-general', x: 1, y: 3, width: 2, height: 1 },
      { id: 'v1', type: 'v-general', x: 0, y: 1, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 1, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 0, y: 3, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
    ],
    minSteps: 64,
  },
  {
    id: 8,
    name: '齐头并进',
    // 双横将底部
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'h1', type: 'h-general', x: 0, y: 2, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 3, y: 2, width: 2, height: 1 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 2, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 0, y: 3, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 1, y: 3, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
    ],
    minSteps: 54,
  },
  {
    id: 9,
    name: '五虎将',
    // 四竖将+横将
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 2, width: 2, height: 1 },
      { id: 'v3', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 'v4', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 4, y: 3, width: 1, height: 1 },
    ],
    minSteps: 58,
  },
  {
    id: 10,
    name: '四面埋伏',
    // 曹操在中心
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'h1', type: 'h-general', x: 0, y: 0, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 3, y: 0, width: 2, height: 1 },
      { id: 'h3', type: 'h-general', x: 0, y: 3, width: 2, height: 1 },
      { id: 'v1', type: 'v-general', x: 0, y: 1, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 1, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 2, y: 0, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
    ],
    minSteps: 68,
  },
  {
    id: 11,
    name: '一夫当关',
    // 曹操中位
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 0, width: 2, height: 1 },
      { id: 's1', type: 'soldier', x: 0, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 0, y: 3, width: 1, height: 1 },
      { id: 's5', type: 'soldier', x: 1, y: 3, width: 1, height: 1 },
      { id: 's6', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
    ],
    minSteps: 48,
  },
  {
    id: 12,
    name: '过五关',
    // 五竖将
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'v3', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 'v4', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 'v5', type: 'v-general', x: 4, y: 2, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 1, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 2, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
    ],
    minSteps: 56,
  },
  {
    id: 13,
    name: '水泄不通',
    // 四竖将密集
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'v3', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 'v4', type: 'v-general', x: 3, y: 2, width: 1, height: 2 },
      { id: 'v5', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 2, width: 2, height: 1 },
      { id: 's1', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 4, y: 3, width: 1, height: 1 },
    ],
    minSteps: 74,
  },
  {
    id: 14,
    name: '走投无路',
    // 曹操被困中间
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 0, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 1, y: 3, width: 2, height: 1 },
      { id: 's1', type: 'soldier', x: 0, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
    ],
    minSteps: 56,
  },
  {
    id: 15,
    name: '兵临城下',
    // 五将围城
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 1, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 0, y: 3, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 3, y: 0, width: 2, height: 1 },
      { id: 'v3', type: 'v-general', x: 3, y: 2, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 2, y: 0, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 0, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
    ],
    minSteps: 54,
  },
  {
    id: 16,
    name: '层层设防',
    // 三层封锁
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'h1', type: 'h-general', x: 0, y: 0, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 3, y: 0, width: 2, height: 1 },
      { id: 'h3', type: 'h-general', x: 0, y: 3, width: 2, height: 1 },
      { id: 'v1', type: 'v-general', x: 0, y: 1, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 1, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 2, y: 0, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 4, y: 3, width: 1, height: 1 },
    ],
    minSteps: 66,
  },
  {
    id: 17,
    name: '巧渡难关',
    // 上下夹击
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 0, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 1, y: 3, width: 2, height: 1 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 'v3', type: 'v-general', x: 4, y: 2, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 0, y: 3, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
    ],
    minSteps: 72,
  },
  {
    id: 18,
    name: '兵贵神速',
    // 四兵方阵
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'v3', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 'v4', type: 'v-general', x: 3, y: 2, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 1, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 2, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 1, y: 3, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
    ],
    minSteps: 50,
  },
  {
    id: 19,
    name: '欲罢不能',
    // 横将三路
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'h1', type: 'h-general', x: 0, y: 2, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 3, y: 2, width: 2, height: 1 },
      { id: 'h3', type: 'h-general', x: 1, y: 3, width: 2, height: 1 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 2, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 0, y: 3, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
    ],
    minSteps: 62,
  },
  {
    id: 20,
    name: '春夏秋冬',
    // 四竖将对角
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'v3', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 'v4', type: 'v-general', x: 3, y: 2, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 2, width: 2, height: 1 },
      { id: 's1', type: 'soldier', x: 4, y: 0, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 4, y: 1, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 1, y: 3, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
    ],
    minSteps: 58,
  },
  {
    id: 21,
    name: '峰回路转',
    // 曹操被困中心
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 0, width: 2, height: 1 },
      { id: 'v3', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
    ],
    minSteps: 64,
  },
  {
    id: 22,
    name: '独木难支',
    // 六兵包围
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 2, width: 2, height: 1 },
      { id: 's1', type: 'soldier', x: 0, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 0, y: 3, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 1, y: 3, width: 1, height: 1 },
      { id: 's5', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
      { id: 's6', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
    ],
    minSteps: 38,
  },
  {
    id: 23,
    name: '柳暗花明',
    // 双横将顶部
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 1, width: 2, height: 2 },
      { id: 'h1', type: 'h-general', x: 0, y: 0, width: 2, height: 1 },
      { id: 'h2', type: 'h-general', x: 3, y: 0, width: 2, height: 1 },
      { id: 'v1', type: 'v-general', x: 0, y: 1, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 4, y: 1, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 2, y: 0, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 1, y: 3, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 3, y: 3, width: 1, height: 1 },
    ],
    minSteps: 60,
  },
  {
    id: 24,
    name: '守株待兔',
    // 五竖将
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'v3', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 'v4', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 'h1', type: 'h-general', x: 1, y: 2, width: 2, height: 1 },
      { id: 's1', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
    ],
    minSteps: 52,
  },
  {
    id: 25,
    name: '破釜沉舟',
    // 背水一战
    blocks: [
      { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2 },
      { id: 'v1', type: 'v-general', x: 0, y: 0, width: 1, height: 2 },
      { id: 'v2', type: 'v-general', x: 3, y: 0, width: 1, height: 2 },
      { id: 'v3', type: 'v-general', x: 0, y: 2, width: 1, height: 2 },
      { id: 'v4', type: 'v-general', x: 4, y: 0, width: 1, height: 2 },
      { id: 's1', type: 'soldier', x: 3, y: 2, width: 1, height: 1 },
      { id: 's2', type: 'soldier', x: 4, y: 2, width: 1, height: 1 },
      { id: 's3', type: 'soldier', x: 1, y: 2, width: 1, height: 1 },
      { id: 's4', type: 'soldier', x: 2, y: 2, width: 1, height: 1 },
      { id: 's5', type: 'soldier', x: 2, y: 3, width: 1, height: 1 },
    ],
    minSteps: 46,
  },
];

module.exports = {
  LEVELS,
  BLOCK_COLORS,
};
