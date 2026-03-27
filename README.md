# 外贸工具箱 - 项目文档

## 项目简介
外贸工具箱是一个集合了各种外贸相关工具的网站，包括汇率换算、物流查询、贸易数据、营销工具等多个分类。

## 技术栈
- **前端**：HTML5, CSS3, JavaScript
- **后端**：Node.js, Express.js, SQLite
- **部署**：GitHub, 阿里云ESA函数, 阿里云Pages

## 项目结构
```
├── admin/            # 后台管理
│   ├── admin.js      # 后台管理脚本
│   ├── index.html    # 后台管理页面
│   └── login.html    # 登录页面
├── css/              # 样式文件
│   └── style.css     # 主样式文件
├── data/             # 数据文件（开发环境）
│   ├── categories.json
│   ├── tools.json
│   ├── setting.json
│   ├── pages.json
│   ├── users.json
│   └── ads.json
├── js/               # 前端脚本
│   └── main.js       # 主脚本文件
├── backend/          # 后端代码
│   ├── app.js        # 主应用
│   ├── routes/       # API路由
│   ├── models/       # 数据模型
│   └── db.js         # 数据库连接
├── .gitignore        # Git忽略文件
├── index.html        # 首页
├── package.json      # 项目配置
├── server.js         # 服务器
└── robots.txt        # 机器人协议
```

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm start
```

### 3. 访问网站
- 前台：http://localhost:10000
- 后台：http://localhost:10000/admin/login.html

## 部署指南

### 部署到GitHub
1. 创建GitHub仓库
2. 推送代码
3. 配置GitHub Actions（可选）

### 部署到阿里云
1. **阿里云Pages**：静态网站托管
2. **阿里云ESA函数**：后端API服务

### 环境变量
在部署时需要设置以下环境变量：
- `ADMIN_USERNAME`：后台管理员用户名
- `ADMIN_PASSWORD`：后台管理员密码
- `DATABASE_URL`：数据库连接字符串（可选）

## 功能特性
- 工具分类管理
- 工具添加、编辑、删除
- 网站设置管理
- 页面管理
- 广告管理
- 用户管理
- 数据导出导入

## 开发指南

### 前端开发
- 样式文件：`css/style.css`
- 前端脚本：`js/main.js`
- 后台脚本：`admin/admin.js`

### 后端开发
- 主应用：`backend/app.js`
- API路由：`backend/routes/`
- 数据模型：`backend/models/`
- 数据库连接：`backend/db.js`

## 数据库结构

### categories表
- id (INTEGER, PRIMARY KEY)
- name (TEXT, NOT NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### tools表
- id (INTEGER, PRIMARY KEY)
- category_id (INTEGER, FOREIGN KEY)
- name (TEXT, NOT NULL)
- description (TEXT)
- url (TEXT, NOT NULL)
- icon (TEXT)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### setting表
- id (INTEGER, PRIMARY KEY)
- key (TEXT, UNIQUE, NOT NULL)
- value (TEXT)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### pages表
- id (INTEGER, PRIMARY KEY)
- title (TEXT, NOT NULL)
- slug (TEXT, UNIQUE)
- content (TEXT)
- status (TEXT, DEFAULT 'draft')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### users表
- id (INTEGER, PRIMARY KEY)
- username (TEXT, UNIQUE, NOT NULL)
- password (TEXT, NOT NULL)
- role (TEXT, DEFAULT 'editor')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### ads表
- id (INTEGER, PRIMARY KEY)
- name (TEXT, NOT NULL)
- url (TEXT, NOT NULL)
- image (TEXT)
- position (TEXT, NOT NULL)
- status (TEXT, DEFAULT 'inactive')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

## API接口

### 分类管理
- GET /api/categories - 获取所有分类
- POST /api/categories - 添加分类
- PUT /api/categories/:id - 更新分类
- DELETE /api/categories/:id - 删除分类

### 工具管理
- GET /api/tools - 获取所有工具
- GET /api/tools?category_id=1 - 按分类获取工具
- POST /api/tools - 添加工具
- PUT /api/tools/:id - 更新工具
- DELETE /api/tools/:id - 删除工具

### 网站设置
- GET /api/setting - 获取所有设置
- GET /api/setting/:key - 获取单个设置
- PUT /api/setting - 更新设置

### 页面管理
- GET /api/pages - 获取所有页面
- POST /api/pages - 添加页面
- PUT /api/pages/:id - 更新页面
- DELETE /api/pages/:id - 删除页面

### 用户管理
- GET /api/users - 获取所有用户
- POST /api/users - 添加用户
- PUT /api/users/:id - 更新用户
- DELETE /api/users/:id - 删除用户

### 广告管理
- GET /api/ads - 获取所有广告
- POST /api/ads - 添加广告
- PUT /api/ads/:id - 更新广告
- DELETE /api/ads/:id - 删除广告

## 安全注意事项
- 后台登录使用环境变量存储凭据
- API接口需要身份验证
- 密码使用bcrypt加密存储
- 防止SQL注入攻击
- 防止XSS攻击
- 防止CSRF攻击

## 许可证
ISC License
