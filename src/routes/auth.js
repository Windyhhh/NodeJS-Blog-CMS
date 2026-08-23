const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// 中间件：检查用户是否已登录
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// 中间件：检查用户是否未登录
const requireGuest = (req, res, next) => {
    if (!req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};

// 显示登录页面
router.get('/login', requireGuest, (req, res) => {
    res.render('pages/auth/login', { 
        title: '用户登录',
        errors: []
    });
});

// 处理登录
router.post('/login', requireGuest, [
    body('identifier').notEmpty().withMessage('请输入用户名或邮箱'),
    body('password').notEmpty().withMessage('请输入密码')
], async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('pages/auth/login', {
            title: '用户登录',
            errors: errors.array(),
            formData: req.body
        });
    }

    const { identifier, password } = req.body;
    const userModel = new User();

    try {
        // 查找用户
        const user = await userModel.findByUsernameOrEmail(identifier);
        
        if (!user) {
            return res.render('pages/auth/login', {
                title: '用户登录',
                errors: [{ msg: '用户名或密码错误' }],
                formData: req.body
            });
        }

        // 验证密码
        const isValidPassword = await userModel.validatePassword(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.render('pages/auth/login', {
                title: '用户登录',
                errors: [{ msg: '用户名或密码错误' }],
                formData: req.body
            });
        }

        // 设置会话
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            real_name: user.real_name,
            avatar: user.avatar
        };

        req.session.message = { type: 'success', text: '登录成功！' };
        res.redirect('/');

    } catch (error) {
        console.error('登录错误:', error);
        res.render('pages/auth/login', {
            title: '用户登录',
            errors: [{ msg: '登录过程中发生错误，请稍后重试' }],
            formData: req.body
        });
    } finally {
        userModel.close();
    }
});

// 显示注册页面
router.get('/register', requireGuest, (req, res) => {
    res.render('pages/auth/register', { 
        title: '用户注册',
        errors: []
    });
});

// 处理注册
router.post('/register', requireGuest, [
    body('username')
        .isLength({ min: 3, max: 20 })
        .withMessage('用户名长度必须在3-20个字符之间')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('用户名只能包含字母、数字和下划线'),
    body('email')
        .isEmail()
        .withMessage('请输入有效的邮箱地址'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('密码长度至少6个字符'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('两次输入的密码不一致');
            }
            return true;
        }),
    body('real_name')
        .optional()
        .isLength({ max: 50 })
        .withMessage('真实姓名不能超过50个字符'),
    body('student_id')
        .optional()
        .isLength({ max: 20 })
        .withMessage('学号不能超过20个字符'),
    body('major')
        .optional()
        .isLength({ max: 100 })
        .withMessage('专业名称不能超过100个字符'),
    body('grade')
        .optional()
        .isInt({ min: 1, max: 6 })
        .withMessage('年级必须在1-6之间')
], async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.render('pages/auth/register', {
            title: '用户注册',
            errors: errors.array(),
            formData: req.body
        });
    }

    const userModel = new User();

    try {
        // 检查用户名和邮箱是否已存在
        const existingUser = await userModel.findByUsernameOrEmail(req.body.username);
        if (existingUser) {
            return res.render('pages/auth/register', {
                title: '用户注册',
                errors: [{ msg: '用户名或邮箱已存在' }],
                formData: req.body
            });
        }

        const existingEmail = await userModel.findByUsernameOrEmail(req.body.email);
        if (existingEmail) {
            return res.render('pages/auth/register', {
                title: '用户注册',
                errors: [{ msg: '邮箱已被注册' }],
                formData: req.body
            });
        }

        // 创建用户
        const newUser = await userModel.create(req.body);
        
        req.session.message = { type: 'success', text: '注册成功！请登录' };
        res.redirect('/auth/login');

    } catch (error) {
        console.error('注册错误:', error);
        res.render('pages/auth/register', {
            title: '用户注册',
            errors: [{ msg: '注册过程中发生错误，请稍后重试' }],
            formData: req.body
        });
    } finally {
        userModel.close();
    }
});

// 退出登录
router.post('/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('退出登录错误:', err);
        }
        res.redirect('/');
    });
});

// 显示用户资料页面
router.get('/profile', requireAuth, async (req, res) => {
    const userModel = new User();
    
    try {
        const user = await userModel.findById(req.session.user.id);
        const stats = await userModel.getStats(req.session.user.id);
        
        res.render('pages/auth/profile', {
            title: '个人资料',
            user,
            stats,
            errors: []
        });
    } catch (error) {
        console.error('获取用户资料错误:', error);
        res.redirect('/');
    } finally {
        userModel.close();
    }
});

// 更新用户资料
router.post('/profile', requireAuth, [
    body('real_name')
        .optional()
        .isLength({ max: 50 })
        .withMessage('真实姓名不能超过50个字符'),
    body('student_id')
        .optional()
        .isLength({ max: 20 })
        .withMessage('学号不能超过20个字符'),
    body('major')
        .optional()
        .isLength({ max: 100 })
        .withMessage('专业名称不能超过100个字符'),
    body('grade')
        .optional()
        .isInt({ min: 1, max: 6 })
        .withMessage('年级必须在1-6之间'),
    body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('个人简介不能超过500个字符')
], async (req, res) => {
    const errors = validationResult(req);
    const userModel = new User();
    
    try {
        const user = await userModel.findById(req.session.user.id);
        const stats = await userModel.getStats(req.session.user.id);
        
        if (!errors.isEmpty()) {
            return res.render('pages/auth/profile', {
                title: '个人资料',
                user,
                stats,
                errors: errors.array(),
                formData: req.body
            });
        }

        await userModel.update(req.session.user.id, req.body);
        
        // 更新会话中的用户信息
        req.session.user.real_name = req.body.real_name;
        
        req.session.message = { type: 'success', text: '资料更新成功！' };
        res.redirect('/auth/profile');

    } catch (error) {
        console.error('更新用户资料错误:', error);
        const user = await userModel.findById(req.session.user.id);
        const stats = await userModel.getStats(req.session.user.id);
        
        res.render('pages/auth/profile', {
            title: '个人资料',
            user,
            stats,
            errors: [{ msg: '更新资料时发生错误，请稍后重试' }],
            formData: req.body
        });
    } finally {
        userModel.close();
    }
});

module.exports = { router, requireAuth, requireGuest };
