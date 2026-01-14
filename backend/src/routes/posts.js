const express = require('express');
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// 所有路由都需要认证
router.use(auth);

// 验证中间件
const validatePost = (req, res, next) => {
  const { title, content } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push({ msg: '标题不能为空' });
  } else if (title.length > 200) {
    errors.push({ msg: '标题最多200个字符' });
  }

  if (!content || content.trim().length === 0) {
    errors.push({ msg: '内容不能为空' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

// 帖子路由
router.post(
  '/',
  upload.array('files', 5),
  validatePost,
  postController.createPost
);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.post('/:id/like', postController.toggleLike);

module.exports = router;
