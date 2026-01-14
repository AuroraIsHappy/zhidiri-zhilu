const express = require('express');
const fileController = require('../controllers/fileController');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// 支持从 URL 参数获取 token 的认证中间件（用于文件下载）
const authWithQueryToken = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // 如果没有从 header 获取到，尝试从 URL 参数获取
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ message: '没有认证token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token无效' });
  }
};

// 文件路由 - 下载使用特殊的认证（支持 URL 参数）
router.get('/download/:postId/:fileId', authWithQueryToken, fileController.downloadFile);
router.delete('/:postId/:fileId', auth, fileController.deleteFile);

module.exports = router;
