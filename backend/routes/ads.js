const express = require('express');
const upload = require('../middleware/upload');
const { verifyPermission } = require('../middleware/auth');
const adController = require('../controllers/adController');

const router = express.Router();

// 创建广告（仅超级管理员）
router.post('/', 
  verifyPermission(['superadmin']),
  upload.single('media'),
  adController.createAd
);

// 更新广告（仅超级管理员）
router.put('/:id', 
  verifyPermission(['superadmin']),
  upload.single('media'),
  adController.updateAd
);

// 获取广告列表（仅超级管理员）
router.get('/', 
  verifyPermission(['superadmin']),
  adController.getAdList
);

// 获取指定位置的广告（公开）
router.get('/position/:position', 
  adController.getAdsByPosition
);

// 删除广告（仅超级管理员）
router.delete('/:id', 
  verifyPermission(['superadmin']),
  adController.deleteAd
);

// 更新广告状态（仅超级管理员）
router.patch('/:id/status', 
  verifyPermission(['superadmin']),
  adController.updateAdStatus
);

module.exports = router;