# 🎮 盖姆小院

微信小程序小游戏集合。当前包含 8 个小游戏，支持主题换肤、设置页、震动反馈开关、最佳记录、最近游玩和成就系统。

## 游戏列表

| 游戏 | 类型 | 实现方式 | 说明 |
|------|------|----------|------|
| 2048 | 益智 | Canvas 2D | 4x4 数字合并，挑战 2048 |
| 俄罗斯方块 | 反应 | Canvas 2D | 经典方块下落消除 |
| 接物品 | 反应 | Canvas 2D | 移动篮子接好物、避开坏物 |
| 记忆翻牌 | 记忆 | WXML/CSS | 翻牌配对，逐步提升难度 |
| 扫雷 | 推理 | WXML/CSS | 经典扫雷，支持标记格子 |
| 打地鼠 | 反应 | WXML/CSS | 限时点击，考验反应速度 |
| 水果大战 | 反应 | WXML/CSS | 点击水果得分，包含粒子效果 |
| 华容道 | 益智 | Canvas 2D | 多关卡滑块解谜 |

## 主要能力

- 首页数据化：游戏卡片统一由 `utils/theme-manager.js` 维护，便于新增和排序。
- 设置页：集中放置换肤、震动反馈、成就展示和本地存储清理能力。
- 主题系统：通过 `theme-manager + CSS 变量 + Canvas palette` 同步适配页面和 Canvas 游戏。
- 主题皮肤：内置 `日落珊瑚`、`薄荷迷雾`、`蜜糖暖阳`、`雪山留白` 4 套主题。
- 本地存储：用于保存最近游玩、最高分/最佳步数/最快用时、成就、设置项和主题选择。
- 最佳记录：不在首页卡片展示，进入具体游戏页后在顶部区域展示；计分类游戏获得有效分数后离开页面也会保存，通关类游戏在胜利后保存。
- 统一基础设施：定时器通过 `utils/timer-manager.js` 管理，弹窗通过 `utils/modal-manager.js` 管理。

## 安装依赖

```bash
npm install
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run check` | 本地静态检查：JS 语法、JSON 配置、路由、主题、首页数据、运行日志和首页展示规则 |
| `npm run build` | 本地构建提示，适合配合微信开发者工具预览 |
| `npm run build:prod` | 上传到微信服务器 |
| `npm run upload` | 上传到微信服务器 |
| `npm run preview` | 生成预览二维码 |

## 项目结构

```text
miniprogram/
├── pages/
│   ├── index/                # 首页
│   └── settings/             # 设置页
├── subpackages/
│   ├── game-2048/            # 2048
│   ├── game-tetris/          # 俄罗斯方块
│   ├── game-catch/           # 接物品
│   ├── game-memory/          # 记忆翻牌
│   ├── game-minesweeper/     # 扫雷
│   ├── game-whack/           # 打地鼠
│   ├── game-fruit/           # 水果大战
│   └── game-klotski/         # 华容道
├── utils/
│   ├── theme.js              # 主题基础配置
│   ├── theme-manager.js      # 主题状态、CSS 变量、首页数据和 Canvas palette
│   ├── settings-manager.js   # 设置项与震动封装
│   ├── game-records.js       # 最近游玩、最高分/最佳记录辅助方法
│   ├── achievements.js       # 成就定义、解锁和读取
│   ├── modal-manager.js      # 统一 toast / confirm
│   └── timer-manager.js      # 页面级定时器统一管理
├── scripts/
│   └── check.js              # npm run check 检查脚本
├── app.js                    # 小程序入口
├── app.json                  # 全局路由和窗口配置
├── app.wxss                  # 全局样式变量与通用样式
├── build.js                  # 构建、上传、预览脚本
├── package.json              # npm 命令和依赖配置
└── project.config.json       # 微信开发者工具项目配置
```

## 主题系统约定

页面优先通过 `withThemePage` 注入 `themeKey`、`theme` 和 `themeStyle`：

```js
const { withThemePage } = require('../../utils/theme-manager.js');

Page(withThemePage({
  data: {},
  onLoad() {},
}));
```

WXML 根节点挂载 CSS 变量：

```html
<view class="page" style="{{themeStyle}}">
  ...
</view>
```

Canvas 游戏通过 `getCanvasPalette(themeKey, gameKey)` 获取当前主题下的画布配色，避免 Canvas 内写死页面主题色。

## 新增游戏清单

1. 在 `app.json` 的 `subPackages[0].pages` 添加游戏页面。
2. 在 `utils/theme-manager.js` 的 `HOME_GAMES` 添加首页卡片数据。
3. 页面使用 `withThemePage`，根节点挂载 `style="{{themeStyle}}"`。
4. 如果是 Canvas 游戏，在 `CANVAS_PALETTES` 为各主题补充对应 palette。
5. 运行 `npm run check` 和必要的页面验证。

## 打包上传

### 命令行上传

```bash
# 1. 获取上传密钥：
# 登录微信小程序后台 -> 开发 -> 开发管理 -> 开发设置 -> 生成小程序代码上传密钥
# 将私钥保存到 .keys/private.key，或通过 PRIVATE_KEY_PATH 指定路径

export PRIVATE_KEY_PATH=./.keys/private.key
npm run build:prod
```

### 微信开发者工具

1. 打开微信开发者工具。
2. 导入当前项目目录。
3. 使用“编译”“预览”或“上传”。

## 开发注意事项

- `.keys/private.key`、`project.private.config.json` 等本地私密配置不要提交。
- Canvas 游戏不要使用 `wx:if` 控制 `<canvas>` 本身显隐，避免节点重建导致获取失败。
- 微信小程序导航栏文字颜色只支持 `#000000` / `#ffffff`，主题配置里的 `navFrontColor` 必须遵守该限制。
- 页面和游戏运行代码不要保留 `console.log`，必要错误使用 `console.error` 并携带可排查信息。
- 游戏页新增定时器必须通过 `createTimerManager()` 管理；新增确认/提示弹窗应走 `modal-manager`。
- 游戏结算时应调用 `updateGameBestRecord()`，满足条件时调用 `unlockAchievements()`。
- 修改主题、首页卡片或路由后，先运行 `npm run check`。
