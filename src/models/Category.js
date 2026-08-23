const path = require('path');
const JsonDB = require('../database/jsondb');

class Category {
    constructor() {
        this.db = new JsonDB(path.join(__dirname, '../database/data.json'));
    }

    // 获取所有分类
    getAll() {
        const categories = this.db.getAll('categories');
        
        // 为每个分类计算帖子数量
        return categories.map(category => {
            const posts = this.db.find('posts', { category_id: category.id });
            return {
                ...category,
                post_count: posts.length
            };
        }).sort((a, b) => a.sort_order - b.sort_order);
    }

    // 根据ID获取分类
    findById(id) {
        const category = this.db.findById('categories', id);
        
        if (category) {
            const posts = this.db.find('posts', { category_id: category.id });
            return {
                ...category,
                post_count: posts.length
            };
        }
        
        return null;
    }

    // 创建新分类
    create(categoryData) {
        const { name, description, color, icon, parent_id, sort_order } = categoryData;
        
        const category = this.db.insert('categories', {
            name,
            description,
            color: color || '#007bff',
            icon: icon || 'fas fa-folder',
            parent_id: parent_id ? parseInt(parent_id) : null,
            sort_order: parseInt(sort_order) || 0
        });
        
        return { id: category.id };
    }

    // 更新分类
    update(id, categoryData) {
        const { name, description, color, icon, parent_id, sort_order } = categoryData;
        
        const updatedCount = this.db.update('categories', { id: parseInt(id) }, {
            name,
            description,
            color,
            icon,
            parent_id: parent_id ? parseInt(parent_id) : null,
            sort_order: parseInt(sort_order) || 0
        });
        
        return { changes: updatedCount };
    }

    // 删除分类
    delete(id) {
        // 首先检查是否有帖子使用此分类
        const posts = this.db.find('posts', { category_id: parseInt(id) });
        
        if (posts.length > 0) {
            throw new Error('无法删除包含帖子的分类');
        }
        
        const deletedCount = this.db.delete('categories', { id: parseInt(id) });
        return { changes: deletedCount };
    }

    // 获取热门分类（按帖子数量排序）
    getPopular(limit = 6) {
        const categories = this.getAll();
        
        return categories
            .filter(category => category.post_count > 0)
            .sort((a, b) => b.post_count - a.post_count)
            .slice(0, limit);
    }

    // 关闭数据库连接
    close() {
        // JSON数据库不需要关闭连接
    }
}

module.exports = Category;
