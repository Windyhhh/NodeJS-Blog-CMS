# 📝 Node.js 博客系统 | Node.js Blog CMS

> **基于 Node.js 的完整博客内容管理系统——Express + EJS + SQLite，用户认证、文章发布、分类管理、评论互动，开箱即用。**
>
> *Complete blog content management system based on Node.js — Express + EJS + SQLite, user authentication, article publishing, category management, comment interaction, ready to use.*

---

## ⭐ 核心卖点 | Why Star This

| 卖点 | Feature | 一句话 |
|------|---------|--------|
| 🚀 **Node.js 开发** | Node.js | Express 高性能 Web 框架 |
| 🔐 **用户认证** | Authentication | 注册、登录、会话管理 |
| 📝 **文章管理** | Article Management | 文章发布、编辑、删除 |
| 🏷️ **分类管理** | Category Management | 文章分类、标签体系 |
| 💬 **评论互动** | Comment System | 读者评论互动 |

---

## 🏆 技术栈 | Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4.0+-black?logo=express)
![EJS](https://img.shields.io/badge/EJS-3.0+-yellow?logo=ejs)
![SQLite](https://img.shields.io/badge/SQLite-3.0+-blue?logo=sqlite)
![Bootstrap](https://img.shields.io/badge/Bootstrap-4.0+-purple?logo=bootstrap)
![Passport](https://img.shields.io/badge/Passport-0.6+-green?logo=passport)

---

## 🚀 快速开始 | Quick Start

```bash
git clone https://github.com/Windyhhh/NodeJS-Blog-CMS.git
cd NodeJS-Blog-CMS

# 1. 安装依赖
npm install

# 2. 配置环境
cp .env.example .env
# 编辑 .env，配置数据库、会话密钥

# 3. 初始化数据库
npm run db:init

# 4. 启动开发服务器
npm run dev

# 5. 访问
# 博客: http://localhost:3000
# 管理后台: http://localhost:3000/admin
```

---

## 📂 项目结构 | Project Structure

```
NodeJS-Blog-CMS/
├── src/                       # 源码
│   ├── app.js                # 应用入口
│   ├── config/               # 配置
│   ├── models/               # 数据模型
│   │   ├── user.js
│   │   ├── post.js
│   │   └── category.js
│   ├── routes/               # 路由
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── admin.js
│   ├── controllers/          # 控制器
│   ├── middleware/           # 中间件
│   └── views/                # EJS 视图
├── public/                   # 静态资源
├── .env.example
├── package.json
└── README.md
```

---

## 🔬 核心实现 | Core Implementation

### 认证与文章模块 | Auth & Post Module

```javascript
// 用户认证 (Passport)
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

passport.use(new LocalStrategy(
  async (username, password, done) => {
    const user = await User.findByUsername(username);
    if (!user) return done(null, false, { message: '用户不存在' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return done(null, false, { message: '密码错误' });
    
    return done(null, user);
  }
));

// 文章发布
router.post('/posts', ensureAuth, async (req, res) => {
  const { title, content, category, tags } = req.body;
  const post = await Post.create({
    title, content, category, tags,
    author: req.user.id,
    slug: slugify(title)
  });
  res.redirect(`/posts/${post.slug}`);
});
```

---

## 🎯 应用场景 | Use Cases

- 📝 **个人博客**：快速搭建个人博客
- 🏢 **内容网站**：企业内容管理
- 🎓 **Node.js 教学**：全栈 Web 开发项目
- 💼 **作品集**：Node.js 全栈作品

---

## 📄 License

MIT License — 自由使用、修改和分发。

---

> 💡 **Node.js 完整博客系统，Star ⭐ 快速搭建你的内容平台！**
