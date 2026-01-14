import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI, commentsAPI, filesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [replyTo, setReplyTo] = useState(null);
  const [commentText, setCommentText] = useState('');

  const { data: postData, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsAPI.getById(id),
  });

  const post = postData?.data?.post;

  const likeMutation = useMutation({
    mutationFn: () => postsAPI.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', id]);
    },
  });

  const commentMutation = useMutation({
    mutationFn: (data) => commentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', id]);
      setCommentText('');
      setReplyTo(null);
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentsAPI.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', id]);
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    commentMutation.mutate({
      content: commentText,
      postId: id,
      parentCommentId: replyTo,
    });
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('确定要删除这条评论吗？')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleFileDownload = (fileId) => {
    filesAPI.download(id, fileId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isLiked = post?.likes?.some((like) => like._id === user?.id);

  if (isLoading) {
    return (
      <Container>
        <Typography>加载中...</Typography>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container>
        <Typography>帖子不存在</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>
        返回首页
      </Button>

      {/* 帖子内容 */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {post.title}
          </Typography>
          <Chip label={post.category} color="primary" />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ mr: 2 }}>
            {post.author?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">{post.author?.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(post.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {post.content}
        </Typography>

        {/* 文件列表 */}
        {post.files && post.files.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              附件
            </Typography>
            <List>
              {post.files.map((file) => (
                <ListItem
                  key={file._id}
                  button
                  onClick={() => handleFileDownload(file._id)}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
                >
                  <ListItemText
                    primary={file.originalName}
                    secondary={`${formatFileSize(file.size)} • ${formatDate(file.uploadDate)}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} sx={{ mr: 1 }} variant="outlined" />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant={isLiked ? 'contained' : 'outlined'}
            startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleLike}
          >
            {post.likes?.length || 0} 点赞
          </Button>
          <Chip label={`${post.views} 浏览`} />
          <Chip label={`${post.comments?.length || 0} 评论`} />
        </Box>
      </Paper>

      {/* 评论区 */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          评论区
        </Typography>

        {/* 评论输入框 */}
        <Box sx={{ mb: 3 }}>
          {replyTo && (
            <Alert severity="info" sx={{ mb: 2 }} action={
              <Button size="small" onClick={() => setReplyTo(null)}>
                取消回复
              </Button>
            }>
              回复评论
            </Alert>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="发表评论..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={handleCommentSubmit}
            disabled={!commentText.trim()}
          >
            发表评论
          </Button>
        </Box>

        {/* 评论列表 */}
        <List>
          {post.comments?.map((comment) => (
            <React.Fragment key={comment._id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>{comment.author?.username?.[0]?.toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        {comment.author?.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {comment.content}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setReplyTo(comment._id)}
                        >
                          <ReplyIcon fontSize="small" />
                        </IconButton>
                        {comment.author?._id === user?.id && (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      {/* 回复列表 */}
                      {comment.replies && comment.replies.length > 0 && (
                        <List sx={{ mt: 2 }}>
                          {comment.replies.map((reply) => (
                            <ListItem key={reply._id} sx={{ pl: 4 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {reply.author?.username?.[0]?.toUpperCase()}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption">
                                      {reply.author?.username}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDate(reply.createdAt)}
                                    </Typography>
                                  </Box>
                                }
                                secondary={reply.content}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>

        {post.comments?.length === 0 && (
          <Typography color="text.secondary" align="center">
            还没有评论，快来发表第一条评论吧！
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default PostDetailPage;
