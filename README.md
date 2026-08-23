# 📝 Node.js 博客内容管理系统 | Node.js Blog CMS

> **基于 Express + EJS + SQLite 的轻量级博客系统，支持用户注册登录、文章发布、分类管理。**
>
> *A lightweight blog system built with Express + EJS + SQLite, supporting user registration/login, post publishing, and category management.*

---

## 📌 项目简介 | Overview

一个功能完整的 Node.js 博客内容管理系统，采用经典的 MVC 架构。前端使用 EJS 模板引擎，后端基于 Express 框架，数据存储采用 SQLite 轻量级数据库。系统支持用户注册登录、文章发布与管理、分类管理等核心功能，并附带完整的部署文档。

A fully functional Node.js blog content management system using classic MVC architecture. The frontend uses EJS template engine, the backend is based on Express framework, and data storage uses SQLite lightweight database. The system supports user registration/login, post publishing and management, category management, and comes with complete deployment documentation.

---

## ✨ 核心特性 | Features

| 特性 | Feature | 说明 |
|------|---------|------|
| 👤 用户认证 | User Auth | 注册、登录、会话管理 |
| ✍️ 文章管理 | Post Management | 创建、编辑、删除、查看文章 |
| 📂 分类管理 | Category Management | 文章分类创建与管理 |
| 🎨 EJS 模板 | EJS Templates | 服务端渲染，SEO 友好 |
| 💾 SQLite 数据库 | SQLite Database | 轻量级文件数据库，无需额外服务 |
| 🔐 密码加密 | Password Hashing | bcrypt 密码安全存储 |
| 📱 响应式设计 | Responsive Design | 适配桌面和移动端 |
| 🚀 一键部署 | One-Click Deploy | 附带部署脚本和文档 |

---

## 📂 项目结构 | Project Structure

```
NodeJS-Blog-CMS/
├── package.json                     # 项目配置
├── package-lock.json                # 依赖锁定
├── README.md                        # 项目说明
├── 博客要求                         # 需求文档
├── deploy/                          # 部署目录
│   ├── deploy-to-server.md          # 服务器部署指南
│   ├── install.bat                  # Windows 安装脚本
│   └── README.md                    # 部署说明
└── src/                             # 源代码
    ├── index.js                     # 应用入口
    ├── database/                    # 数据库层
    │   ├── init.js                  # 数据库初始化
    │   ├── init.sql                 # 建表 SQL
    │   └── jsondb.js               # JSON 数据库（备选）
    ├── models/                      # 数据模型
    │   ├── User.js                  # 用户模型
    │   ├── Post.js                  # 文章模型
    │   └── Category.js              # 分类模型
    ├── routes/                      # 路由层
    │   ├── auth.js                  # 认证路由
    │   ├── posts.js                 # 文章路由
    │   └── categories.js            # 分类路由
    ├── views/                       # 视图层 (EJS)
    │   ├── layouts/
    │   │   └── main.ejs             # 主布局
    │   └── pages/
    │       ├── index.ejs            # 首页
    │       ├── 404.ejs              # 404 页面
    │       ├── error.ejs            # 错误页面
    │       ├── auth/
    │       │   ├── login.ejs        # 登录页
    │       │   └── register.ejs     # 注册页
    │       └── posts/
    │           ├── create.ejs       # 创建文章
    │           ├── detail.ejs       # 文章详情
    │           ├── list.ejs         # 文章列表
    │           └── list_simple.ejs  # 简洁列表
    └── public/                      # 静态资源
        ├── css/style.css            # 样式文件
        ├── js/main.js               # 前端脚本
        └── images/                  # 图片资源
```

---

## 🚀 快速开始 | Quick Start

### 环境要求 | Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖 | Install Dependencies

```bash
npm install
```

### 初始化数据库 | Initialize Database

```bash
node src/database/init.js
```

### 启动服务 | Start Server

```bash
node src/index.js
```

服务默认运行在 `http://localhost:3000`

---

## 🔧 技术栈 | Tech Stack

| 层级 | 技术 | 说明 |
|------|------|------|
| 运行时 | Node.js | JavaScript 服务端运行时 |
| 框架 | Express | 轻量级 Web 框架 |
| 模板引擎 | EJS | 嵌入式 JavaScript 模板 |
| 数据库 | SQLite | 轻量级关系型数据库 |
| 密码加密 | bcrypt | 安全密码哈希 |
| 会话管理 | express-session | 用户会话管理 |
| 前端 | 原生 CSS/JS | 无框架依赖，轻量高效 |

---

## 📖 API 路由 | API Routes

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/` | 首页 |
| GET | `/auth/login` | 登录页面 |
| POST | `/auth/login` | 提交登录 |
| GET | `/auth/register` | 注册页面 |
| POST | `/auth/register` | 提交注册 |
| GET | `/auth/logout` | 退出登录 |
| GET | `/posts` | 文章列表 |
| GET | `/posts/:id` | 文章详情 |
| GET | `/posts/create` | 创建文章（需登录） |
| POST | `/posts` | 提交文章（需登录） |
| GET | `/categories` | 分类列表 |
| POST | `/categories` | 创建分类（需登录） |

---

## 🚀 部署 | Deployment

项目附带完整的部署文档和脚本：

```bash
# Windows 一键安装
deploy\install.bat

# 查看部署指南
deploy\deploy-to-server.md
```

支持部署到 Windows Server、Linux 服务器等多种环境。

---

## 📄 License

MIT License — 自由使用、修改和分发。
