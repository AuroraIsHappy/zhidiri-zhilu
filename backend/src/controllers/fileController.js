const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');

// 下载文件
exports.downloadFile = async (req, res) => {
  try {
    const { postId, fileId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    const file = post.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: '文件不存在' });
    }

    const filePath = path.resolve(file.path);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: '文件不存在' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除文件
exports.deleteFile = async (req, res) => {
  try {
    const { postId, fileId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    // 检查权限
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限删除此文件' });
    }

    const file = post.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: '文件不存在' });
    }

    // 删除物理文件
    const filePath = path.resolve(file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 从数据库中移除
    file.deleteOne();

    await post.save();

    res.json({ message: '文件删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};
