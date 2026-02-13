const express = require('express');
const upload = require('../middleware/upload');
const { verifyPermission } = require('../middleware/auth');
const appController = require('../controllers/appController');

const router = express.Router();

// 上传 APK 文件（应用管理员和超级管理员）
router.post('/upload', 
  verifyPermission(['appmanager', 'superadmin']),
  upload.single('apk'),
  appController.uploadApk
);

// 更新应用信息（应用管理员和超级管理员）
router.put('/:id', 
  verifyPermission(['appmanager', 'superadmin']),
  appController.updateAppInfo
);

// 上传应用图片（应用管理员和超级管理员）
router.post('/:id/images', 
  verifyPermission(['appmanager', 'superadmin']),
  upload.single('image'),
  appController.uploadAppImage
);

// 上传应用视频（应用管理员和超级管理员）
router.post('/:id/videos', 
  verifyPermission(['appmanager', 'superadmin']),
  upload.single('video'),
  appController.uploadAppVideo
);

// 获取应用列表（公开）
router.get('/', appController.getAppList);

// 获取应用详情（公开）
router.get('/:id', appController.getAppDetail);

// 删除应用（应用管理员和超级管理员）
router.delete('/:id', 
  verifyPermission(['appmanager', 'superadmin']),
  appController.deleteApp
);

module.exports = router;