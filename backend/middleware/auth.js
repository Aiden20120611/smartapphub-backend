const { readData } = require('../utils/dataManager');

// 验证用户登录
const verifyLogin = async (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }
  
  const users = await readData('users.json');
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }
  
  req.user = user;
  next();
};

// 验证用户权限
const verifyPermission = (requiredRoles) => {
  return async (req, res, next) => {
    const { user } = req;
    
    if (!user) {
      return res.status(401).json({ error: '请先登录' });
    }
    
    if (!requiredRoles.includes(user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    next();
  };
};

// 获取当前用户信息
const getCurrentUser = async (req, res, next) => {
  const { username, password } = req.query;
  
  if (!username || !password) {
    return res.status(400).json({ error: '缺少认证信息' });
  }
  
  const users = await readData('users.json');
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: '用户不存在' });
  }
  
  res.json({ user });
};

module.exports = {
  verifyLogin,
  verifyPermission,
  getCurrentUser
};