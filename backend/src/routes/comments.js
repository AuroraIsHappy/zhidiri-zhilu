const express = require('express');
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 验证中间件
const validateComment = (req, res, next) => {
  const { content } = req.body;
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push({ msg: '评论内容不能为空' });
  } else if (content.length > 1000) {
    errors.push({ msg: '评论最多1000个字符' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

// 评论路由
router.post('/', validateComment, commentController.createComment);
router.get('/post/:postId', commentController.getPostComments);
router.delete('/:id', commentController.deleteComment);
router.post('/:id/like', commentController.toggleLikeComment);

module.exports = router;
