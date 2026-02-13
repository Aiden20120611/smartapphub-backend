const express = require('express');
const { verifyLogin, getCurrentUser, verifyPermission } = require('../middleware/auth');
const { readData, writeData } = require('../utils/dataManager');

const router = express.Router();

// 用户登录
router.post('/login', verifyLogin, (req, res) => {
  const { user } = req;
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// 获取用户信息
router.get('/info', getCurrentUser);

// 获取所有用户（仅超级管理员）
router.get('/', verifyPermission(['superadmin']), async (req, res) => {
  const users = await readData('users.json');
  res.json(users);
});

// 添加用户（仅超级管理员）
router.post('/', verifyPermission(['superadmin']), async (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  const users = await readData('users.json');
  
  // 检查用户名是否已存在
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }
  
  const newUser = {
    id: String(users.length + 1),
    username,
    password,
    role,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  await writeData('users.json', users);
  
  res.json({ success: true, user: newUser });
});

// 删除用户（仅超级管理员）
router.delete('/:id', verifyPermission(['superadmin']), async (req, res) => {
  const { id } = req.params;
  
  // 不允许删除超级管理员
  if (id === '1') {
    return res.status(400).json({ error: '无法删除超级管理员' });
  }
  
  const users = await readData('users.json');
  const updatedUsers = users.filter(user => user.id !== id);
  
  if (updatedUsers.length === users.length) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  await writeData('users.json', updatedUsers);
  res.json({ success: true });
});

module.exports = router;