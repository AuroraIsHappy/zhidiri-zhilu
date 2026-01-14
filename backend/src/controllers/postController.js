const Post = require('../models/Post');
const Comment = require('../models/Comment');

// 创建帖子
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const postData = {
      title,
      content,
      author: req.user._id,
      category: category || '其他',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      files: [],
    };

    // 如果有上传的文件
    if (req.files && req.files.length > 0) {
      postData.files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      }));
    }

    const post = new Post(postData);
    await post.save();
    await post.populate('author', 'username avatar email');

    res.status(201).json({
      message: '帖子创建成功',
      post,
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取所有帖子
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const tag = req.query.tag;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .populate('comments')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取单个帖子
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar email bio')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'username avatar' },
          {
            path: 'replies',
            populate: { path: 'author', select: 'username avatar' },
          },
        ],
      });

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    // 增加浏览量
    post.views += 1;
    await post.save();

    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 更新帖子
exports.updatePost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    // 检查权限
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限修改此帖子' });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags.split(',').map(tag => tag.trim());

    await post.save();
    await post.populate('author', 'username avatar');

    res.json({
      message: '帖子更新成功',
      post,
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 删除帖子
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    // 检查权限
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限删除此帖子' });
    }

    // 删除相关评论
    await Comment.deleteMany({ post: post._id });

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: '帖子删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 点赞/取消点赞帖子
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.json({
      message: likeIndex === -1 ? '已点赞' : '已取消点赞',
      likes: post.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};
