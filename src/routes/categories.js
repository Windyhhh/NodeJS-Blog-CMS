const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

// 获取所有分类（API接口）
router.get('/api', async (req, res) => {
    const categoryModel = new Category();
    
    try {
        const categories = await categoryModel.getAll();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('获取分类列表错误:', error);
        res.status(500).json({ success: false, message: '获取分类列表失败' });
    } finally {
        categoryModel.close();
    }
});

// 获取热门分类（API接口）
router.get('/api/popular', async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const categoryModel = new Category();
    
    try {
        const categories = await categoryModel.getPopular(limit);
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('获取热门分类错误:', error);
        res.status(500).json({ success: false, message: '获取热门分类失败' });
    } finally {
        categoryModel.close();
    }
});

// 根据ID获取分类详情（API接口）
router.get('/api/:id', async (req, res) => {
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId)) {
        return res.status(400).json({ success: false, message: '无效的分类ID' });
    }

    const categoryModel = new Category();
    
    try {
        const category = await categoryModel.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ success: false, message: '分类未找到' });
        }

        res.json({ success: true, data: category });
    } catch (error) {
        console.error('获取分类详情错误:', error);
        res.status(500).json({ success: false, message: '获取分类详情失败' });
    } finally {
        categoryModel.close();
    }
});

module.exports = router;
