const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ========== 核心修改：适配 pkg 打包（解决快照只读问题） ==========
// 判断是否是 pkg 打包后的运行环境
const isPkgBuild = !!process.pkg;
// 获取可执行文件（index.exe）所在目录（外部可写），兼容开发环境
const appRoot = isPkgBuild 
  ? path.dirname(process.execPath)  // 打包后：index.exe 所在的文件夹（可写）
  : path.join(__dirname, '../');    // 开发环境：保持原有路径

// 文件存储路径（打包后在 index.exe 旁创建 storage 文件夹，开发环境不变）
const STORAGE_PATH = path.join(appRoot, 'storage');

// 确保存储目录存在（逻辑不变，仅路径改为外部可写）
const ensureDirectories = async () => {
  const dirs = [
    'apks', 'icons', 'images', 'videos', 'ads'
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(path.join(STORAGE_PATH, dir));
  }
};

// 保存文件（逻辑完全不变，路径自动适配）
const saveFile = async (file, directory) => {
  const fileName = `${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
  const filePath = path.join(STORAGE_PATH, directory, fileName);
  
  await fs.writeFile(filePath, file.buffer);
  
  return {
    fileName,
    filePath,
    url: `/storage/${directory}/${fileName}`
  };
};

// 删除文件（逻辑不变）
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('删除文件失败:', error);
    return false;
  }
};

// 读取文件（逻辑不变）
const readFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath);
    return data;
  } catch (error) {
    console.error('读取文件失败:', error);
    throw error;
  }
};

// 获取文件信息（逻辑不变）
const getFileInfo = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      mtime: stats.mtime
    };
  } catch (error) {
    console.error('获取文件信息失败:', error);
    return null;
  }
};

// ========== 关键修改：补充导出 STORAGE_PATH ==========
module.exports = {
  ensureDirectories,
  saveFile,
  deleteFile,
  readFile,
  getFileInfo,
  STORAGE_PATH  // 新增这一行，导出存储路径给 index.js 使用
};