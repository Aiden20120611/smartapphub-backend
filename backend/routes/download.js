const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { readData } = require('../utils/dataManager');
const { incrementDownloadCount } = require('../controllers/appController');

const router = express.Router();

// 下载应用 APK
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 读取应用数据
    const apps = await readData('apps.json');
    const app = apps.find(app => app.id === id);
    
    if (!app) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    if (!app.apkPath || !fs.existsSync(app.apkPath)) {
      return res.status(404).json({ error: 'APK 文件不存在' });
    }
    
    // 增加下载次数
    await incrementDownloadCount(id);
    
    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${app.name}_v${app.versionName}.apk"`);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Length', app.size);
    
    // 发送文件流
    const fileStream = fs.createReadStream(app.apkPath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('文件读取失败:', error);
      res.status(500).json({ error: '下载失败，请重试' });
    });
    
  } catch (error) {
    console.error('下载 APK 失败:', error);
    res.status(500).json({ error: '下载失败，请重试' });
  }
});

module.exports = router;