const fs = require('fs-extra');
const path = require('path');

// 简化版 APK 解析函数
// 由于没有实际的 APK 解析库，返回默认值
const parseApk = async (filePath) => {
  try {
    // 获取文件大小
    const stats = await fs.stat(filePath);
    
    // 提取应用信息（简化版，实际项目中应使用 APK 解析库）
    const appInfo = {
      name: '未知应用',
      packageName: `com.example.app${Date.now()}`,
      versionName: '1.0.0',
      versionCode: 1,
      size: stats.size,
      icon: null
    };
    
    return appInfo;
  } catch (error) {
    console.error('解析 APK 失败:', error);
    // 返回默认值，确保系统可以正常运行
    return {
      name: '未知应用',
      packageName: `com.example.app${Date.now()}`,
      versionName: '1.0.0',
      versionCode: 1,
      size: 0,
      icon: null
    };
  }
};

module.exports = {
  parseApk
};