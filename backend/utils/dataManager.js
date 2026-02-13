const fs = require('fs-extra');
const path = require('path');

// ========== 核心修改：适配 pkg 打包（解决快照只读问题） ==========
// 判断是否是 pkg 打包后的运行环境
const isPkgBuild = !!process.pkg;
// 获取可执行文件（index.exe）所在目录（外部可写），兼容开发环境
const appRoot = isPkgBuild 
  ? path.dirname(process.execPath)  // 打包后：index.exe 所在的文件夹（可写）
  : path.join(__dirname, '../');    // 开发环境：保持原有路径

// 数据文件路径（打包后在 index.exe 旁创建 data 文件夹，开发环境不变）
const DATA_PATH = path.join(appRoot, 'data');

// 确保数据目录存在（逻辑不变，仅路径改为外部可写）
const ensureDataDirectory = async () => {
  await fs.ensureDir(DATA_PATH);
};

// 读取数据文件（逻辑完全不变，路径自动适配）
const readData = async (fileName) => {
  const filePath = path.join(DATA_PATH, fileName);
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取 ${fileName} 失败:`, error);
    return [];
  }
};

// 写入数据文件（逻辑完全不变，路径自动适配）
const writeData = async (fileName, data) => {
  const filePath = path.join(DATA_PATH, fileName);
  
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`写入 ${fileName} 失败:`, error);
    return false;
  }
};

// 初始化数据文件（逻辑不变，路径自动适配）
const initDataFiles = async () => {
  await ensureDataDirectory();
  
  // 初始化用户数据
  const users = await readData('users.json');
  if (users.length === 0) {
    const defaultUsers = [
      {
        id: '1',
        username: 'admin',
        password: 'admin2026',
        role: 'superadmin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        username: 'appmanager',
        password: 'app2026',
        role: 'appmanager',
        createdAt: new Date().toISOString()
      }
    ];
    await writeData('users.json', defaultUsers);
  }
  
  // 初始化应用数据
  const apps = await readData('apps.json');
  if (apps.length === 0) {
    await writeData('apps.json', []);
  }
  
  // 初始化广告数据
  const ads = await readData('ads.json');
  if (ads.length === 0) {
    await writeData('ads.json', []);
  }
};

// ========== 可选导出：如果后续需要在其他文件使用 DATA_PATH，可取消注释 ==========
module.exports = {
  readData,
  writeData,
  initDataFiles,
  ensureDataDirectory,
  DATA_PATH  // 导出数据路径（可选，当前 index.js 未用到，保留以备后续扩展）
};