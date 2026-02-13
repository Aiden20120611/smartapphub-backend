const { readData, writeData } = require('../utils/dataManager');
const { saveFile, deleteFile } = require('../utils/fileManager');
const { parseApk } = require('../utils/apkParser');
const fs = require('fs-extra');
const path = require('path');

// 上传 APK 文件
const uploadApk = async (req, res) => {
  try {
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ error: '请选择要上传的 APK 文件' });
    }
    
    // 保存 APK 文件到临时目录
    const tempFilePath = path.join(__dirname, '../storage/apks', `temp_${Date.now()}.apk`);
    await fs.writeFile(tempFilePath, file.buffer);
    
    // 解析 APK 文件
    const appInfo = await parseApk(tempFilePath);
    
    // 保存正式 APK 文件
    const savedApk = await saveFile(file, 'apks');
    
    // 删除临时文件
    await fs.unlink(tempFilePath);
    
    // 读取现有应用数据
    const apps = await readData('apps.json');
    
    // 检查是否为更新
    const existingApp = apps.find(app => app.packageName === appInfo.packageName);
    
    if (existingApp) {
      // 更新现有应用
      existingApp.versionName = appInfo.versionName;
      existingApp.versionCode = appInfo.versionCode;
      existingApp.size = appInfo.size;
      existingApp.apkUrl = savedApk.url;
      existingApp.apkPath = savedApk.filePath;
      existingApp.updatedAt = new Date().toISOString();
      existingApp.downloadCount = existingApp.downloadCount || 0;
      
      // 如果有新图标，更新图标
      if (appInfo.icon) {
        existingApp.icon = appInfo.icon;
      }
      
      await writeData('apps.json', apps);
      
      return res.json({
        success: true,
        message: '应用更新成功',
        app: existingApp
      });
    } else {
      // 创建新应用
      const newApp = {
        id: String(apps.length + 1),
        name: appInfo.name,
        packageName: appInfo.packageName,
        versionName: appInfo.versionName,
        versionCode: appInfo.versionCode,
        size: appInfo.size,
        icon: appInfo.icon,
        apkUrl: savedApk.url,
        apkPath: savedApk.filePath,
        description: '',
        images: [],
        videos: [],
        category: '',
        tags: [],
        downloadCount: 0,
        rating: 0,
        reviews: [],
        updateLog: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: req.user.username
      };
      
      apps.push(newApp);
      await writeData('apps.json', apps);
      
      return res.json({
        success: true,
        message: '应用上传成功',
        app: newApp
      });
    }
  } catch (error) {
    console.error('上传 APK 失败:', error);
    res.status(500).json({ error: '上传失败，请重试' });
  }
};

// 更新应用信息
const updateAppInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const apps = await readData('apps.json');
    const appIndex = apps.findIndex(app => app.id === id);
    
    if (appIndex === -1) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 更新应用信息
    apps[appIndex] = {
      ...apps[appIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await writeData('apps.json', apps);
    
    res.json({
      success: true,
      message: '应用信息更新成功',
      app: apps[appIndex]
    });
  } catch (error) {
    console.error('更新应用信息失败:', error);
    res.status(500).json({ error: '更新失败，请重试' });
  }
};

// 上传应用图片
const uploadAppImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ error: '请选择要上传的图片' });
    }
    
    // 保存图片文件
    const savedImage = await saveFile(file, 'images');
    
    // 更新应用信息
    const apps = await readData('apps.json');
    const appIndex = apps.findIndex(app => app.id === id);
    
    if (appIndex === -1) {
      // 删除已上传的图片
      await deleteFile(savedImage.filePath);
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 添加图片到应用
    apps[appIndex].images = apps[appIndex].images || [];
    apps[appIndex].images.push(savedImage.url);
    apps[appIndex].updatedAt = new Date().toISOString();
    
    await writeData('apps.json', apps);
    
    res.json({
      success: true,
      message: '图片上传成功',
      imageUrl: savedImage.url
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({ error: '上传失败，请重试' });
  }
};

// 上传应用视频
const uploadAppVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ error: '请选择要上传的视频' });
    }
    
    // 保存视频文件
    const savedVideo = await saveFile(file, 'videos');
    
    // 更新应用信息
    const apps = await readData('apps.json');
    const appIndex = apps.findIndex(app => app.id === id);
    
    if (appIndex === -1) {
      // 删除已上传的视频
      await deleteFile(savedVideo.filePath);
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 添加视频到应用
    apps[appIndex].videos = apps[appIndex].videos || [];
    apps[appIndex].videos.push(savedVideo.url);
    apps[appIndex].updatedAt = new Date().toISOString();
    
    await writeData('apps.json', apps);
    
    res.json({
      success: true,
      message: '视频上传成功',
      videoUrl: savedVideo.url
    });
  } catch (error) {
    console.error('上传视频失败:', error);
    res.status(500).json({ error: '上传失败，请重试' });
  }
};

// 获取应用列表
const getAppList = async (req, res) => {
  try {
    const apps = await readData('apps.json');
    res.json(apps);
  } catch (error) {
    console.error('获取应用列表失败:', error);
    res.status(500).json({ error: '获取失败，请重试' });
  }
};

// 获取应用详情
const getAppDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const apps = await readData('apps.json');
    const app = apps.find(app => app.id === id);
    
    if (!app) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    res.json(app);
  } catch (error) {
    console.error('获取应用详情失败:', error);
    res.status(500).json({ error: '获取失败，请重试' });
  }
};

// 删除应用
const deleteApp = async (req, res) => {
  try {
    const { id } = req.params;
    const apps = await readData('apps.json');
    const appIndex = apps.findIndex(app => app.id === id);
    
    if (appIndex === -1) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    const app = apps[appIndex];
    
    // 删除相关文件
    if (app.apkPath) {
      await deleteFile(app.apkPath);
    }
    
    // 从应用列表中删除
    apps.splice(appIndex, 1);
    await writeData('apps.json', apps);
    
    res.json({
      success: true,
      message: '应用删除成功'
    });
  } catch (error) {
    console.error('删除应用失败:', error);
    res.status(500).json({ error: '删除失败，请重试' });
  }
};

// 增加下载次数
const incrementDownloadCount = async (appId) => {
  try {
    const apps = await readData('apps.json');
    const app = apps.find(app => app.id === appId);
    
    if (app) {
      app.downloadCount = (app.downloadCount || 0) + 1;
      await writeData('apps.json', apps);
    }
  } catch (error) {
    console.error('增加下载次数失败:', error);
  }
};

module.exports = {
  uploadApk,
  updateAppInfo,
  uploadAppImage,
  uploadAppVideo,
  getAppList,
  getAppDetail,
  deleteApp,
  incrementDownloadCount
};