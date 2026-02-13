const multer = require('multer');
const path = require('path');

// 内存存储配置
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = {
    'apks': ['application/vnd.android.package-archive'],
    'icons': ['image/jpeg', 'image/png', 'image/jpg'],
    'images': ['image/jpeg', 'image/png', 'image/jpg'],
    'videos': ['video/mp4'],
    'ads': ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4']
  };
  
  // 根据请求路径确定目录
  let directory = 'apks';
  if (req.path.includes('/apps/') && req.path.includes('/images')) {
    directory = 'images';
  } else if (req.path.includes('/apps/') && req.path.includes('/videos')) {
    directory = 'videos';
  } else if (req.path.includes('/ads')) {
    directory = 'ads';
  }
  
  if (!allowedTypes[directory] || !allowedTypes[directory].includes(file.mimetype)) {
    return cb(new Error('文件类型不允许'), false);
  }
  
  cb(null, true);
};

// 上传限制
const limits = {
  fileSize: 100 * 1024 * 1024 // 100MB
};

// 创建上传中间件
const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload;