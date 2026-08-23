const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { requireAuth } = require('./auth');

const router = express.Router();

// 帖子列表页面
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const category_id = req.query.category;
    const search = req.query.search;
    const sort = req.query.sort || 'created_at';
    const is_urgent = req.query.urgent === '1' ? 1 : undefined;
    const is_resolved = req.query.resolved === '1' ? 1 : req.query.resolved === '0' ? 0 : undefined;

    const postModel = new Post();
    const categoryModel = new Category();

    try {
        const options = { 
            page, 
            limit, 
            category_id, 
            search, 
            sort, 
            is_urgent, 
            is_resolved 
        };
        
        const [posts, totalCount, categories] = await Promise.all([
            postModel.getList(options),
            postModel.getCount(options),
            categoryModel.getAll()
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const currentCategory = category_id ? await categoryModel.findById(category_id) : null;

        res.render('pages/posts/list_simple', {
            title: '帖子列表',
            posts,
            categories,
            currentCategory,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: {
                category_id,
                search,
                sort,
                is_urgent,
                is_resolved
            }
        });

    } catch (error) {
        console.error('获取帖子列表错误:', error);
        res.render('pages/error', { 
            title: '错误',
            error: { message: '获取帖子列表失败' }
        });
    } finally {
        postModel.close();
        categoryModel.close();
    }
});

// 显示创建帖子页面
router.get('/create', requireAuth, async (req, res) => {
    const categoryModel = new Category();
    
    try {
        const categories = await categoryModel.getAll();
        
        res.render('pages/posts/create', {
            title: '发布帖子',
            categories,
            errors: []
        });
    } catch (error) {
        console.error('获取分类列表错误:', error);
        res.redirect('/posts');
    } finally {
        categoryModel.close();
    }
});

// 处理创建帖子
router.post('/create', requireAuth, [
    body('title')
        .isLength({ min: 5, max: 200 })
        .withMessage('标题长度必须在5-200个字符之间'),
    body('content')
        .isLength({ min: 10 })
        .withMessage('内容至少需要10个字符'),
    body('category_id')
        .isInt({ min: 1 })
        .withMessage('请选择有效的分类'),
    body('course_name')
        .optional()
        .isLength({ max: 100 })
        .withMessage('课程名称不能超过100个字符'),
    body('teacher_name')
        .optional()
        .isLength({ max: 50 })
        .withMessage('教师姓名不能超过50个字符'),
    body('course_code')
        .optional()
        .isLength({ max: 20 })
        .withMessage('课程代码不能超过20个字符'),
    body('semester')
        .optional()
        .isLength({ max: 20 })
        .withMessage('学期信息不能超过20个字符'),
    body('difficulty_level')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('难度等级必须在1-5之间')
], async (req, res) => {
    const errors = validationResult(req);
    const categoryModel = new Category();
    
    try {
        const categories = await categoryModel.getAll();
        
        if (!errors.isEmpty()) {
            return res.render('pages/posts/create', {
                title: '发布帖子',
                categories,
                errors: errors.array(),
                formData: req.body
            });
        }

        const postModel = new Post();
        
        // 生成摘要（取内容前150个字符）
        const summary = req.body.content.substring(0, 150) + (req.body.content.length > 150 ? '...' : '');
        
        // 处理标签
        const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        const postData = {
            ...req.body,
            summary,
            tags,
            user_id: req.session.user.id,
            is_urgent: req.body.is_urgent ? 1 : 0,
            difficulty_level: req.body.difficulty_level || 1
        };

        const result = await postModel.create(postData);
        
        req.session.message = { type: 'success', text: '帖子发布成功！' };
        res.redirect(`/posts/${result.id}`);

    } catch (error) {
        console.error('创建帖子错误:', error);
        const categories = await categoryModel.getAll();
        
        res.render('pages/posts/create', {
            title: '发布帖子',
            categories,
            errors: [{ msg: '发布帖子时发生错误，请稍后重试' }],
            formData: req.body
        });
    } finally {
        categoryModel.close();
    }
});

// 显示帖子详情
router.get('/:id', async (req, res) => {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
        return res.status(404).render('pages/404', { title: '帖子未找到' });
    }

    const postModel = new Post();

    try {
        const post = await postModel.findById(postId);
        
        if (!post) {
            return res.status(404).render('pages/404', { title: '帖子未找到' });
        }

        // 增加浏览量
        await postModel.incrementViewCount(postId);
        post.view_count += 1;

        res.render('pages/posts/detail', {
            title: post.title,
            post
        });

    } catch (error) {
        console.error('获取帖子详情错误:', error);
        res.render('pages/error', { 
            title: '错误',
            error: { message: '获取帖子详情失败' }
        });
    } finally {
        postModel.close();
    }
});

// 显示编辑帖子页面
router.get('/:id/edit', requireAuth, async (req, res) => {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
        return res.status(404).render('pages/404', { title: '帖子未找到' });
    }

    const postModel = new Post();
    const categoryModel = new Category();

    try {
        const [post, categories] = await Promise.all([
            postModel.findById(postId),
            categoryModel.getAll()
        ]);
        
        if (!post) {
            return res.status(404).render('pages/404', { title: '帖子未找到' });
        }

        // 检查权限
        if (post.user_id !== req.session.user.id) {
            req.session.message = { type: 'error', text: '您没有权限编辑此帖子' };
            return res.redirect(`/posts/${postId}`);
        }

        res.render('pages/posts/edit', {
            title: '编辑帖子',
            post,
            categories,
            errors: []
        });

    } catch (error) {
        console.error('获取帖子编辑页面错误:', error);
        res.redirect('/posts');
    } finally {
        postModel.close();
        categoryModel.close();
    }
});

// 处理编辑帖子
router.post('/:id/edit', requireAuth, [
    body('title')
        .isLength({ min: 5, max: 200 })
        .withMessage('标题长度必须在5-200个字符之间'),
    body('content')
        .isLength({ min: 10 })
        .withMessage('内容至少需要10个字符'),
    body('category_id')
        .isInt({ min: 1 })
        .withMessage('请选择有效的分类')
], async (req, res) => {
    const postId = parseInt(req.params.id);
    const errors = validationResult(req);
    
    const postModel = new Post();
    const categoryModel = new Category();

    try {
        const [post, categories] = await Promise.all([
            postModel.findById(postId),
            categoryModel.getAll()
        ]);
        
        if (!post || post.user_id !== req.session.user.id) {
            return res.status(404).render('pages/404', { title: '帖子未找到' });
        }

        if (!errors.isEmpty()) {
            return res.render('pages/posts/edit', {
                title: '编辑帖子',
                post,
                categories,
                errors: errors.array(),
                formData: req.body
            });
        }

        // 生成摘要
        const summary = req.body.content.substring(0, 150) + (req.body.content.length > 150 ? '...' : '');
        
        // 处理标签
        const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        const postData = {
            ...req.body,
            summary,
            tags,
            is_urgent: req.body.is_urgent ? 1 : 0,
            is_resolved: req.body.is_resolved ? 1 : 0,
            difficulty_level: req.body.difficulty_level || post.difficulty_level
        };

        await postModel.update(postId, postData);
        
        req.session.message = { type: 'success', text: '帖子更新成功！' };
        res.redirect(`/posts/${postId}`);

    } catch (error) {
        console.error('更新帖子错误:', error);
        req.session.message = { type: 'error', text: '更新帖子时发生错误' };
        res.redirect(`/posts/${postId}`);
    } finally {
        postModel.close();
        categoryModel.close();
    }
});

// 删除帖子
router.post('/:id/delete', requireAuth, async (req, res) => {
    const postId = parseInt(req.params.id);
    const postModel = new Post();

    try {
        const post = await postModel.findById(postId);
        
        if (!post || post.user_id !== req.session.user.id) {
            return res.status(404).json({ success: false, message: '帖子未找到或无权限' });
        }

        await postModel.delete(postId);
        
        req.session.message = { type: 'success', text: '帖子删除成功！' };
        res.json({ success: true });

    } catch (error) {
        console.error('删除帖子错误:', error);
        res.status(500).json({ success: false, message: '删除帖子时发生错误' });
    } finally {
        postModel.close();
    }
});

module.exports = router;
