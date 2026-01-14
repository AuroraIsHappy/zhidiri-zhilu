# 支队日知录

一个用于支队成员分享知识、上传文件和交流讨论的Web平台。

## 功能特性

- ✅ 用户注册和登录
- ✅ 帖子创建、编辑、删除
- ✅ 文件上传和下载（支持PDF、Word、Excel、PPT、图片等格式）
- ✅ 帖子分类和标签系统
- ✅ 多级评论和回复功能
- ✅ 点赞功能
- ✅ 搜索和筛选
- ✅ 温暖学术风格的界面设计

## 技术栈

### 前端
- React 18
- React Router
- Material-UI (MUI)
- TanStack Query
- Axios

### 后端
- Node.js
- Express
- MongoDB
- JWT认证
- Multer文件上传

## 安装和运行

### 前置要求

- Node.js (v14或更高)
- MongoDB (v4.4或更高)
- npm或yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd zhidiri-zhilu
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **配置后端环境变量**

创建 `.env` 文件：
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zhidiri-zhilu
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

4. **启动MongoDB**

确保MongoDB服务正在运行：
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

5. **启动后端服务器**
```bash
npm run dev
```

后端将在 http://localhost:5000 运行

6. **安装前端依赖**
```bash
cd ../frontend
npm install
```

7. **启动前端开发服务器**
```bash
npm run dev
```

前端将在 http://localhost:5173 运行

## 使用指南

### 注册账号

1. 访问 http://localhost:5173
2. 点击"注册"标签
3. 填写用户名、邮箱和密码
4. 点击"注册"按钮

### 创建帖子

1. 登录后，点击右下角的"+"按钮
2. 填写标题、内容
3. 选择分类
4. 添加标签（可选）
5. 上传文件（可选，最多5个文件）
6. 点击"发布"

### 评论和互动

1. 在帖子详情页可以查看所有评论
2. 在底部输入框发表评论
3. 点击回复按钮可以回复其他评论
4. 点击点赞按钮可以给帖子点赞

### 文件下载

1. 在帖子详情页的"附件"部分
2. 点击文件名即可下载

## 项目结构

```
zhidiri-zhilu/
├── backend/
│   ├── src/
│   │   ├── config/       # 数据库配置
│   │   ├── controllers/  # 控制器
│   │   ├── middleware/   # 中间件
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   └── server.js     # 服务器入口
│   ├── uploads/          # 上传的文件
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # 组件
    │   ├── contexts/     # Context
    │   ├── pages/        # 页面
    │   ├── services/     # API服务
    │   └── utils/        # 工具函数
    └── package.json
```

## API端点

### 认证
- POST `/api/auth/register` - 注册
- POST `/api/auth/login` - 登录
- GET `/api/auth/me` - 获取当前用户信息

### 帖子
- GET `/api/posts` - 获取所有帖子
- GET `/api/posts/:id` - 获取单个帖子
- POST `/api/posts` - 创建帖子
- PUT `/api/posts/:id` - 更新帖子
- DELETE `/api/posts/:id` - 删除帖子
- POST `/api/posts/:id/like` - 点赞/取消点赞

### 评论
- GET `/api/comments/post/:postId` - 获取帖子的评论
- POST `/api/comments` - 创建评论
- DELETE `/api/comments/:id` - 删除评论

### 文件
- GET `/api/files/download/:postId/:fileId` - 下载文件
- DELETE `/api/files/:postId/:fileId` - 删除文件

## 注意事项

1. **JWT密钥**: 生产环境中请更改 `.env` 文件中的 `JWT_SECRET`
2. **文件大小**: 默认最大上传文件大小为10MB
3. **文件类型**: 支持PDF、Office文档、图片、压缩包等格式
4. **MongoDB**: 确保MongoDB服务正在运行

## 开发

### 后端开发
```bash
cd backend
npm run dev  # 使用nodemon自动重启
```

### 前端开发
```bash
cd frontend
npm run dev  # Vite开发服务器
```

## 生产部署

### 后端
1. 设置 `NODE_ENV=production`
2. 使用强密码更改 `JWT_SECRET`
3. 配置生产数据库URL
4. 使用PM2或类似工具运行：
```bash
npm start
```

### 前端
1. 构建生产版本：
```bash
npm run build
```
2. 将 `dist` 目录部署到Web服务器

## 许可证

MIT

## 联系方式

如有问题或建议，请联系项目维护者。
