const bcrypt = require('bcryptjs');
const path = require('path');
const JsonDB = require('../database/jsondb');

class User {
    constructor() {
        this.db = new JsonDB(path.join(__dirname, '../database/data.json'));
    }

    // 创建新用户
    async create(userData) {
        const { username, email, password, real_name, student_id, major, grade } = userData;
        
        // 加密密码
        const hash = await bcrypt.hash(password, 10);

        const user = this.db.insert('users', {
            username,
            email,
            password_hash: hash,
            real_name,
            student_id,
            major,
            grade: parseInt(grade) || null,
            avatar: '/images/default-avatar.png',
            bio: null,
            is_active: 1
        });
        
        return { id: user.id, username, email };
    }

    // 根据用户名或邮箱查找用户
    findByUsernameOrEmail(identifier) {
        const users = this.db.find('users', (user) => {
            return (user.username === identifier || user.email === identifier) && user.is_active === 1;
        });
        return users.length > 0 ? users[0] : null;
    }

    // 根据ID查找用户
    findById(id) {
        const user = this.db.findById('users', id);
        if (user && user.is_active === 1) {
            // 不返回密码哈希
            const { password_hash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    // 验证密码
    async validatePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    // 更新用户信息
    update(id, userData) {
        const { real_name, student_id, major, grade, bio } = userData;
        
        const updatedCount = this.db.update('users', { id: parseInt(id) }, {
            real_name,
            student_id,
            major,
            grade: parseInt(grade) || null,
            bio
        });
        
        return { changes: updatedCount };
    }

    // 更新头像
    updateAvatar(id, avatarPath) {
        const updatedCount = this.db.update('users', { id: parseInt(id) }, {
            avatar: avatarPath
        });
        
        return { changes: updatedCount };
    }

    // 获取用户统计信息
    getStats(userId) {
        const posts = this.db.find('posts', { user_id: parseInt(userId) });
        const comments = this.db.find('comments', { user_id: parseInt(userId) });
        const likes = this.db.find('likes', { user_id: parseInt(userId) });
        const favorites = this.db.find('favorites', { user_id: parseInt(userId) });
        
        return {
            post_count: posts.length,
            comment_count: comments.length,
            like_count: likes.length,
            favorite_count: favorites.length
        };
    }

    // 关闭数据库连接（JSON数据库不需要关闭）
    close() {
        // JSON数据库不需要关闭连接
    }
}

module.exports = User;
