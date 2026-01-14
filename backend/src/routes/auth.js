const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// 简单验证中间件
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || username.length < 3 || username.length > 20) {
    errors.push({ msg: '用户名必须在3-20个字符之间' });
  }
  if (!email || !email.includes('@')) {
    errors.push({ msg: '请输入有效的邮箱地址' });
  }
  if (!password || password.length < 6) {
    errors.push({ msg: '密码至少6个字符' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.includes('@')) {
    errors.push({ msg: '请输入有效的邮箱地址' });
  }
  if (!password) {
    errors.push({ msg: '请输入密码' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

// 公开路由
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// 需要认证的路由
router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
