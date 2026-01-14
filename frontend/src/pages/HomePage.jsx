import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Fab,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  TextField,
  MenuItem,
  Pagination,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    tag: '',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['posts', page, filters],
    queryFn: () => postsAPI.getAll({ page, ...filters }),
  });

  const posts = data?.data?.posts || [];
  const totalPages = data?.data?.totalPages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          支队日知录
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          欢迎回来，{user?.username}
        </Typography>
      </Box>

      {/* 搜索和筛选 */}
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="搜索"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                endAdornment: <SearchIcon color="action" />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="分类"
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value });
                setPage(1);
              }}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="学习资料">学习资料</MenuItem>
              <MenuItem value="经验分享">经验分享</MenuItem>
              <MenuItem value="问题讨论">问题讨论</MenuItem>
              <MenuItem value="资源推荐">资源推荐</MenuItem>
              <MenuItem value="其他">其他</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Button type="submit" variant="contained" fullWidth>
              搜索
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 帖子列表 */}
      {isLoading ? (
        <Typography>加载中...</Typography>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            暂无帖子
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} key={post._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {post.title}
                    </Typography>
                    <Chip label={post.category} size="small" color="primary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    作者：{post.author?.username} • {formatDate(post.createdAt)}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                    {post.content.substring(0, 200)}
                    {post.content.length > 200 && '...'}
                  </Typography>
                  {post.files && post.files.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        附件：
                      </Typography>
                      {post.files.map((file) => (
                        <Chip
                          key={file._id}
                          label={`${file.originalName} (${formatFileSize(file.size)})`}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {post.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mt: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/post/${post._id}`)}>
                    查看详情
                  </Button>
                  <Chip label={`${post.likes?.length || 0} 点赞`} size="small" />
                  <Chip label={`${post.comments?.length || 0} 评论`} size="small" />
                  <Chip label={`${post.views} 浏览`} size="small" />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* 悬浮按钮 - 创建新帖子 */}
      <Fab
        color="primary"
        aria-label="添加帖子"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/create')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default HomePage;
