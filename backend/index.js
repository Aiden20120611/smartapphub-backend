const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initDataFiles } = require('./utils/dataManager');
const { ensureDirectories, STORAGE_PATH } = require('./utils/fileManager');

const app = express();
// 👉 关键修改：从环境变量获取端口，不再硬编码
const PORT = process.env.PORT || 3001;

// 初始化系统
const initSystem = async () => {
  try {
    await ensureDirectories();
    await initDataFiles();
    console.log('系统初始化完成');
  } catch (error) {
    console.error('系统初始化失败:', error);
    process.exit(1);
  }
};

initSystem();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务：托管应用存储文件
app.use('/storage', express.static(STORAGE_PATH));

// 静态文件服务：托管前端构建产物 dist 文件夹
app.use(express.static(path.join(__dirname, 'dist')));

// 路由导入
const userRoutes = require('./routes/users');
const appRoutes = require('./routes/apps');
const adRoutes = require('./routes/ads');
const downloadRoutes = require('./routes/download');

// 路由配置
app.use('/api/users', userRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/download', downloadRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartAppHub 后端服务运行正常' });
});

// 正确的兜底路由：只在找不到静态文件时返回 index.html
app.use((req, res, next) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('index.html 不存在:', err);
      res.status(404).send('页面未找到');
    } else {
      res.sendFile(indexPath);
    }
  });
});

// 启动服务器，监听 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`后端服务运行在 http://0.0.0.0:${PORT}`);
});

module.exports = app;
