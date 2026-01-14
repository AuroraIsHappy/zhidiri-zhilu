import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { postsAPI } from '../services/api';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '其他',
    tags: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [currentTags, setCurrentTags] = useState([]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formDataObj = new FormData();
      formDataObj.append('title', data.title);
      formDataObj.append('content', data.content);
      formDataObj.append('category', data.category);
      if (currentTags.length > 0) {
        formDataObj.append('tags', currentTags.join(','));
      }
      files.forEach((file) => {
        formDataObj.append('files', file);
      });

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataObj,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '创建失败');
      }

      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/post/${data.post._id}`);
    },
    onError: (err) => {
      setError(err.message || '创建帖子失败');
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      setError('最多只能上传5个文件');
      return;
    }
    setFiles(selectedFiles);
    setError('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
      setCurrentTags([...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setCurrentTags(currentTags.filter((tag) => tag !== tagToDelete));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('标题和内容不能为空');
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          创建新帖子
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="标题"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>分类</InputLabel>
            <Select
              label="分类"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <MenuItem value="学习资料">学习资料</MenuItem>
              <MenuItem value="经验分享">经验分享</MenuItem>
              <MenuItem value="问题讨论">问题讨论</MenuItem>
              <MenuItem value="资源推荐">资源推荐</MenuItem>
              <MenuItem value="其他">其他</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="内容"
            name="content"
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={10}
            required
          />

          {/* 标签 */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="标签"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                size="small"
              />
              <Button variant="outlined" onClick={handleAddTag}>
                添加
              </Button>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {currentTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* 文件上传 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              上传文件（最多5个，每个最大10MB）
            </Typography>
            <input
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
              multiple
              type="file"
              onChange={handleFileChange}
            />
            {files.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {files.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                    sx={{ mr: 1, mt: 1 }}
                    onDelete={() => {
                      const newFiles = [...files];
                      newFiles.splice(index, 1);
                      setFiles(newFiles);
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? '发布中...' : '发布'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={createMutation.isLoading}
            >
              取消
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePostPage;
