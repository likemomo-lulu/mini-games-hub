/**
 * 微信小程序构建脚本
 * 功能：打包、上传、预览
 *
 * 使用前配置：
 * 1. 在 project.config.json 中填入正确的 appid
 * 2. 设置 PRIVATE_KEY_PATH 环境变量指向私钥文件（.keys/private.key）
 * 3. 或者在下方直接配置（不推荐提交到git）
 */

const ci = require('miniprogram-ci');
const fs = require('fs');
const path = require('path');

// ===== 配置区 =====
const PROJECT_PATH = __dirname;
const APPID = 'wxec9b3ea3053f0890'; // 从 project.config.json 读取
const PROJECT_NAME = 'minigames';

// 私钥路径 - 优先从环境变量读取
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH ||
                         path.join(PROJECT_PATH, '.keys', 'private.key');

// 版本号（自动递增或手动指定）
const VERSION = process.env.VERSION || '1.0.0';
const DESC = process.env.DESC || '自动化构建上传';

// ===== 项目配置 =====
// 延迟创建，只在需要时才初始化
let project = null;

function getProject() {
  if (!project) {
    project = new ci.Project({
      appid: APPID,
      type: 'miniProgram',
      projectPath: PROJECT_PATH,
      privateKeyPath: PRIVATE_KEY_PATH,
      ignores: ['node_modules/**/*']
    });
  }
  return project;
}

// ===== 构建函数 =====

/**
 * 预览 - 生成二维码在手机上预览
 */
async function preview() {
  console.log('🚀 开始预览...\n');

  const previewResult = await ci.preview({
    project: getProject(),
    desc: DESC,
    setting: {
      es6: true,
      minified: false
    },
    qrcodeFormat: 'image',
    qrcodeQuality: 'Q',
    onProgressUpdate: (log) => {
      console.log(log.message);
    }
  });

  console.log('\n✅ 预览完成！二维码已保存');
}

/**
 * 上传 - 上传代码到微信后台
 */
async function upload() {
  console.log('🚀 开始上传...\n');
  console.log(`版本: ${VERSION}`);
  console.log(`描述: ${DESC}\n`);

  const uploadResult = await ci.upload({
    project: getProject(),
    version: VERSION,
    desc: DESC,
    setting: {
      es6: true,
      minified: true
    },
    onProgressUpdate: (log) => {
      console.log(log.message);
    }
  });

  console.log('\n✅ 上传成功！');
  console.log(`时间: ${new Date().toLocaleString()}`);
}

/**
 * 构建检查 - 验证项目配置
 */
async function buildCheck() {
  console.log('🔍 检查项目配置...\n');

  // 检查私钥文件
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    console.error('❌ 错误: 私钥文件不存在');
    console.log(`路径: ${PRIVATE_KEY_PATH}`);
    console.log('\n📝 获取私钥步骤:');
    console.log('1. 登录微信小程序后台');
    console.log('2. 开发 -> 开发管理 -> 开发设置');
    console.log('3. 生成小程序代码上传密钥');
    console.log('4. 保存到 .keys/private.key');
    console.log('\n或者设置环境变量:');
    console.log('export PRIVATE_KEY_PATH=/path/to/private.key');
    process.exit(1);
  }

  // 检查 app.json 和 pages
  const appJson = require('./app.json');
  console.log(`✅ 页面数量: ${appJson.pages.length}`);
  console.log('✅ 项目配置检查通过\n');
}

// ===== 主程序 =====
async function main() {
  const args = process.argv.slice(2);

  // 本地构建模式（不需要上传）
  if (args.includes('--local') || args.length === 0) {
    console.log('📦 本地构建模式');
    console.log('使用微信开发者工具打开项目即可预览\n');
    console.log('提示: 运行 npm run upload 可上传到微信服务器');
    return;
  }

  // 需要私钥的操作
  await buildCheck();

  if (args.includes('--preview')) {
    await preview();
  } else if (args.includes('--upload') || args.includes('--prod')) {
    await upload();
  } else {
    console.log(`
用法:
  npm run build         - 本地构建提示
  npm run build:prod    - 上传到微信服务器
  npm run upload        - 上传到微信服务器
  npm run preview       - 生成预览二维码

环境变量:
  PRIVATE_KEY_PATH      - 私钥文件路径
  VERSION               - 版本号 (默认: 1.0.0)
  DESC                  - 描述信息
    `);
  }
}

main().catch(err => {
  console.error('❌ 构建失败:', err.message);
  process.exit(1);
});
