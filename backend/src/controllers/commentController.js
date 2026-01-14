const Comment = require('../models/Comment');
const Post = require('../models/Post');

// 创建评论
exports.createComment = async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      post: postId,
      parentComment: parentCommentId || null,
    });

    await comment.save();
    await comment.populate('author', 'username avatar');

    // 如果是回复评论，添加到父评论的回复列表
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment) {
        parentComment.replies.push(comment._id);
        await parentComment.save();
      }
    } else {
      // 如果是顶级评论，添加到帖子的评论列表
      post.comments.push(comment._id);
      await post.save();
    }

    res.status(201).json({
      message: '评论成功',
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取帖子的所有评论
exports.getPostComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username avatar' },
      })
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 检查权限
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限删除此评论' });
    }

    // 如果是顶级评论，从帖子中移除
    if (!comment.parentComment) {
      const post = await Post.findById(comment.post);
      if (post) {
        post.comments.pull(comment._id);
        await post.save();
      }
    } else {
      // 如果是回复，从父评论中移除
      const parentComment = await Comment.findById(comment.parentComment);
      if (parentComment) {
        parentComment.replies.pull(comment._id);
        await parentComment.save();
      }
    }

    // 删除所有回复
    await Comment.deleteMany({ parentComment: comment._id });

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: '评论删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 点赞评论
exports.toggleLikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    const likeIndex = comment.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      comment.likes.push(req.user._id);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();

    res.json({
      message: likeIndex === -1 ? '已点赞' : '已取消点赞',
      likes: comment.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};
