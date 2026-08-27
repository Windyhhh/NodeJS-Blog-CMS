<div align="center">

# 📝 NodeJS-Blog-CMS

### A Node.js blog content-management system.

Express + EJS + SQLite with user auth, articles and categories.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)

</div>

---

**NodeJS-Blog-CMS** is a blog content-management system built with **Express + EJS + SQLite** — user authentication, article publishing and category management out of the box.

> [!NOTE]
> 中文项目：Node.js 博客系统——Express + EJS + SQLite，用户认证、文章、分类。

---

## Quickstart

```bash
git clone https://github.com/Windyhhh/NodeJS-Blog-CMS.git
cd NodeJS-Blog-CMS

npm install

# init the SQLite database
node src/database/init.js

# start the server
node src/index.js
```

Deploy scripts are in `deploy/`.

---

## Features

- **User auth** — register / login sessions.
- **Articles & categories** — full CMS models.
- **SQLite storage** — zero-config database (`jsondb.js`).

---

## Project Structure

```
NodeJS-Blog-CMS/
├── src/
│   ├── index.js              # entry
│   ├── routes/               # auth, categories, posts
│   ├── models/               # User, Post, Category
│   ├── database/             # init.js, init.sql, jsondb.js
│   └── public/               # css, js, images
├── deploy/                   # install / deploy scripts
└── package.json
```

---

## License

MIT — free to use, modify and distribute.
