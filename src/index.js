const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 确保数据库目录存在
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log('使用JSON文件数据库');

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 会话配置
app.use(session({
    secret: 'student-help-platform-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // 在生产环境中应设为true（需要HTTPS）
        maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
}));

// 模板引擎配置
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 全局变量中间件
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.message = req.session.message || null;
    req.session.message = null; // 清除消息
    next();
});

// 基本路由
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>学业互助平台</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        </head>
        <body>
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container">
                    <a class="navbar-brand" href="/">
                        <i class="fas fa-graduation-cap me-2"></i>
                        学业互助平台
                    </a>
                </div>
            </nav>

            <div class="container my-5">
                <div class="jumbotron bg-primary text-white rounded p-5 mb-4">
                    <div class="container-fluid py-5">
                        <h1 class="display-5 fw-bold text-white">欢迎来到学业互助平台</h1>
                        <p class="col-md-8 fs-4 text-white">在这里，大学生可以互相帮助，分享学习资源，解决学业问题，共同进步！</p>
                        <a href="/test" class="btn btn-light btn-lg">测试API</a>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="fas fa-users fa-2x text-primary mb-2"></i>
                                <h5 class="card-title">注册用户</h5>
                                <p class="card-text display-6">0</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="fas fa-file-alt fa-2x text-success mb-2"></i>
                                <h5 class="card-title">帖子总数</h5>
                                <p class="card-text display-6">0</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="fas fa-comments fa-2x text-info mb-2"></i>
                                <h5 class="card-title">评论总数</h5>
                                <p class="card-text display-6">0</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="fas fa-tags fa-2x text-warning mb-2"></i>
                                <h5 class="card-title">分类数量</h5>
                                <p class="card-text display-6">6</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-12">
                        <div class="alert alert-info">
                            <h4><i class="fas fa-info-circle me-2"></i>项目状态</h4>
                            <p>学业互助平台已成功部署！服务器正在运行中。</p>
                            <ul>
                                <li>✅ 服务器启动成功</li>
                                <li>✅ JSON数据库初始化完成</li>
                                <li>✅ 基础架构搭建完成</li>
                                <li>🔧 模板系统正在优化中</li>
                                <li>🔧 用户功能开发中</li>
                            </ul>
                            <p class="mb-0">
                                <a href="/test" class="btn btn-primary me-2">测试API</a>
                                <strong>准备部署到腾讯云服务器：118.89.81.112</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});

// 简单的测试路由
app.get('/test', (req, res) => {
    res.json({
        message: '学业互助平台API测试成功！',
        timestamp: new Date().toISOString(),
        status: 'running'
    });
});

// 导入路由模块
const { router: authRoutes } = require('./routes/auth');
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/categories', categoryRoutes);

// 404处理
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>页面未找到 - 学业互助平台</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container text-center py-5">
                <h1 class="display-1">404</h1>
                <h2>页面未找到</h2>
                <p class="lead">抱歉，您访问的页面不存在。</p>
                <a href="/" class="btn btn-primary">返回首页</a>
            </div>
        </body>
        </html>
    `);
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>服务器错误 - 学业互助平台</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container text-center py-5">
                <h1 class="display-1">500</h1>
                <h2>服务器错误</h2>
                <p class="lead">抱歉，服务器遇到了问题。</p>
                <a href="/" class="btn btn-primary">返回首页</a>
            </div>
        </body>
        </html>
    `);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    console.log('服务器已关闭');
    process.exit(0);
});

module.exports = app;