# 🎮 小游戏集合

微信小程序项目，包含5个经典小游戏，全部使用 Canvas 2D 渲染。

## 🎯 游戏列表

| 游戏 | 说明 | 状态 |
|------|------|------|
| **2048** | 4x4数字合并，挑战2048 | ✅ |
| **俄罗斯方块** | 经典方块消除，20行高度 | ✅ |
| **接物品** | 左右移动接水果，避开炸弹 | ✅ |
| **记忆翻牌** | 4x4配对，考验记忆力 | ✅ |
| **扫雷** | 9x9经典扫雷，插旗标记 | ✅ |

## 📦 安装依赖

```bash
npm install
```

## 🚀 打包上传

### 方式一：命令行（推荐）

```bash
# 1. 获取上传密钥
# - 登录微信小程序后台
# - 开发 -> 开发管理 -> 开发设置
# - 点击"生成小程序代码上传密钥"
# - 下载私钥保存到 .keys/private.key

# 2. 设置环境变量（可选）
export PRIVATE_KEY_PATH=./.keys/private.key

# 3. 执行打包上传
npm run build:prod
```

### 方式二：微信开发者工具

1. 打开微信开发者工具
2. 导入项目
3. 点击"上传"按钮

## 📁 项目结构

```
miniprogram/
├── pages/
│   ├── index/              # 游戏列表首页（2列网格）
│   ├── game-2048/          # 2048游戏
│   ├── game-tetris/        # 俄罗斯方块
│   ├── game-catch/         # 接物品游戏
│   ├── game-memory/        # 记忆翻牌
│   └── game-minesweeper/   # 扫雷
├── app.js                  # 小程序入口
├── app.json                # 全局配置
├── app.wxss                # 全局样式
├── build.js                # 构建脚本
├── package.json            # 依赖配置
└── project.config.json     # 项目配置
```

## 📝 可用命令

| 命令 | 说明 |
|------|------|
| `npm run build` | 本地构建提示 |
| `npm run build:prod` | 上传到微信服务器 |
| `npm run upload` | 上传到微信服务器 |
| `npm run preview` | 生成预览二维码 |

## 🔧 技术要点

### Canvas 2D 兼容性处理

```javascript
// ❌ 真机不支持 roundRect
ctx.roundRect(x, y, w, h, [6]);

// ✅ 使用 arcTo 兼容方案
function drawRoundRect(ctx, x, y, w, h, radius) {
  const r = radius[0] || 0;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
```

### 游戏循环

```javascript
// ❌ 微信不支持 requestAnimationFrame
requestAnimationFrame(() => this.gameLoop());

// ✅ 使用 setTimeout 替代
startGameLoop() {
  this.gameLoopId = setTimeout(() => this.gameLoop(), 16);
}
```

### 系统信息获取

```javascript
// ❌ 已废弃
wx.getSystemInfoSync();

// ✅ 新API
wx.getWindowInfo();
```

### Canvas 获取注意

```html
<!-- ❌ wx:if 会导致 Canvas 获取失败 -->
<canvas wx:if="{{gameReady}}"></canvas>

<!-- ✅ Canvas 始终渲染，用 overlay 控制显示 -->
<canvas></canvas>
<view wx:if="{{gameOver}}">...</view>
```

### Flex 布局陷阱

```css
/* ❌ flex:1 在某些场景会导致高度为0 */
.game-board {
  flex: 1;
  min-height: 800rpx;
}

/* ✅ 使用固定高度 */
.game-board {
  flex: 1;
  height: 800rpx;
}
```

## ⚠️ 注意事项

- `.keys/private.key` 私钥文件不要提交到 git
- 上传前确保 appid 正确（`wxec9b3ea3053f0890`）
- 真机测试必须使用 HTTPS 或本地调试
- Canvas 2D 需要微信版本 7.0.0 以上

## 📊 开发进度

- [x] 2048 游戏完成
- [x] 俄罗斯方块完成
- [x] 接物品游戏完成
- [x] 记忆翻牌完成
- [x] 扫雷游戏完成
- [x] 构建脚本配置
- [x] 真机兼容性修复
