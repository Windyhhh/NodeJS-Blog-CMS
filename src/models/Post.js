const path = require('path');
const JsonDB = require('../database/jsondb');

class Post {
    constructor() {
        this.db = new JsonDB(path.join(__dirname, '../database/data.json'));
    }

    // 创建新帖子
    create(postData) {
        const { 
            title, content, summary, user_id, category_id, 
            teacher_name, course_name, course_code, semester, 
            difficulty_level, is_urgent, tags 
        } = postData;
        
        const post = this.db.insert('posts', {
            title,
            content,
            summary,
            user_id: parseInt(user_id),
            category_id: parseInt(category_id),
            teacher_name,
            course_name,
            course_code,
            semester,
            difficulty_level: parseInt(difficulty_level) || 1,
            is_urgent: is_urgent ? 1 : 0,
            is_resolved: 0,
            view_count: 0,
            like_count: 0,
            comment_count: 0,
            attachment_path: null,
            tags: JSON.stringify(tags || [])
        });
        
        return { id: post.id };
    }

    // 获取帖子列表（带分页和筛选）
    getList(options = {}) {
        const { 
            page = 1, 
            limit = 10, 
            category_id, 
            search, 
            sort = 'created_at', 
            order = 'DESC',
            is_urgent,
            is_resolved
        } = options;
        
        // 构建查询条件
        let condition = {};
        
        if (category_id) {
            condition.category_id = parseInt(category_id);
        }
        
        if (is_urgent !== undefined) {
            condition.is_urgent = parseInt(is_urgent);
        }
        
        if (is_resolved !== undefined) {
            condition.is_resolved = parseInt(is_resolved);
        }
        
        // 获取帖子数据
        let posts = this.db.find('posts', condition);
        
        // 搜索过滤
        if (search) {
            const searchTerm = search.toLowerCase();
            posts = posts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                (post.course_name && post.course_name.toLowerCase().includes(searchTerm))
            );
        }
        
        // 排序
        posts.sort((a, b) => {
            const aVal = a[sort];
            const bVal = b[sort];
            
            if (order.toLowerCase() === 'desc') {
                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
            } else {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            }
        });
        
        // 分页
        const offset = (page - 1) * limit;
        const paginatedPosts = posts.slice(offset, offset + limit);
        
        // 关联用户和分类信息
        const result = paginatedPosts.map(post => {
            const user = this.db.findById('users', post.user_id);
            const category = this.db.findById('categories', post.category_id);
            
            return {
                ...post,
                username: user ? user.username : '未知用户',
                avatar: user ? user.avatar : '/images/default-avatar.png',
                category_name: category ? category.name : '未知分类',
                category_color: category ? category.color : '#6c757d',
                tags: post.tags ? JSON.parse(post.tags) : []
            };
        });
        
        return result;
    }

    // 获取帖子总数（用于分页）
    getCount(options = {}) {
        const { category_id, search, is_urgent, is_resolved } = options;
        
        let condition = {};
        
        if (category_id) {
            condition.category_id = parseInt(category_id);
        }
        
        if (is_urgent !== undefined) {
            condition.is_urgent = parseInt(is_urgent);
        }
        
        if (is_resolved !== undefined) {
            condition.is_resolved = parseInt(is_resolved);
        }
        
        let posts = this.db.find('posts', condition);
        
        // 搜索过滤
        if (search) {
            const searchTerm = search.toLowerCase();
            posts = posts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.content.toLowerCase().includes(searchTerm) ||
                (post.course_name && post.course_name.toLowerCase().includes(searchTerm))
            );
        }
        
        return posts.length;
    }

    // 根据ID获取帖子详情
    findById(id) {
        const post = this.db.findById('posts', id);
        
        if (post) {
            const user = this.db.findById('users', post.user_id);
            const category = this.db.findById('categories', post.category_id);
            
            return {
                ...post,
                username: user ? user.username : '未知用户',
                avatar: user ? user.avatar : '/images/default-avatar.png',
                real_name: user ? user.real_name : null,
                category_name: category ? category.name : '未知分类',
                category_color: category ? category.color : '#6c757d',
                tags: post.tags ? JSON.parse(post.tags) : []
            };
        }
        
        return null;
    }

    // 增加浏览量
    incrementViewCount(id) {
        const post = this.db.findById('posts', id);
        if (post) {
            const updatedCount = this.db.update('posts', { id: parseInt(id) }, {
                view_count: post.view_count + 1
            });
            return { changes: updatedCount };
        }
        return { changes: 0 };
    }

    // 更新帖子
    update(id, postData) {
        const { 
            title, content, summary, category_id,
            teacher_name, course_name, course_code, semester,
            difficulty_level, is_urgent, is_resolved, tags 
        } = postData;
        
        const updatedCount = this.db.update('posts', { id: parseInt(id) }, {
            title,
            content,
            summary,
            category_id: parseInt(category_id),
            teacher_name,
            course_name,
            course_code,
            semester,
            difficulty_level: parseInt(difficulty_level) || 1,
            is_urgent: is_urgent ? 1 : 0,
            is_resolved: is_resolved ? 1 : 0,
            tags: JSON.stringify(tags || [])
        });
        
        return { changes: updatedCount };
    }

    // 删除帖子
    delete(id) {
        const deletedCount = this.db.delete('posts', { id: parseInt(id) });
        return { changes: deletedCount };
    }

    // 关闭数据库连接
    close() {
        // JSON数据库不需要关闭连接
    }
}

module.exports = Post;
