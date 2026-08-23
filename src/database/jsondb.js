const fs = require('fs');
const path = require('path');

class JsonDB {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.data = this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('加载数据库文件失败:', error);
        }
        
        // 返回默认数据结构
        return {
            users: [],
            posts: [],
            categories: [
                {
                    id: 1,
                    name: '课程作业',
                    description: '各科目的作业求助和分享',
                    color: '#28a745',
                    icon: 'fas fa-book',
                    parent_id: null,
                    sort_order: 0,
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: '考试复习',
                    description: '考试复习资料和经验分享',
                    color: '#dc3545',
                    icon: 'fas fa-graduation-cap',
                    parent_id: null,
                    sort_order: 1,
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    name: '课程设计',
                    description: '课程设计项目的讨论和协作',
                    color: '#ffc107',
                    icon: 'fas fa-project-diagram',
                    parent_id: null,
                    sort_order: 2,
                    created_at: new Date().toISOString()
                },
                {
                    id: 4,
                    name: '实验报告',
                    description: '实验课程的报告和心得',
                    color: '#17a2b8',
                    icon: 'fas fa-flask',
                    parent_id: null,
                    sort_order: 3,
                    created_at: new Date().toISOString()
                },
                {
                    id: 5,
                    name: '学习资源',
                    description: '学习资料和工具推荐',
                    color: '#6f42c1',
                    icon: 'fas fa-share-alt',
                    parent_id: null,
                    sort_order: 4,
                    created_at: new Date().toISOString()
                },
                {
                    id: 6,
                    name: '答疑解惑',
                    description: '学习中遇到的问题求助',
                    color: '#fd7e14',
                    icon: 'fas fa-question-circle',
                    parent_id: null,
                    sort_order: 5,
                    created_at: new Date().toISOString()
                }
            ],
            comments: [],
            likes: [],
            favorites: [],
            counters: {
                users: 0,
                posts: 0,
                categories: 6,
                comments: 0,
                likes: 0,
                favorites: 0
            }
        };
    }

    saveData() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error('保存数据库文件失败:', error);
            return false;
        }
    }

    // 生成新ID
    getNextId(table) {
        this.data.counters[table] = (this.data.counters[table] || 0) + 1;
        return this.data.counters[table];
    }

    // 插入数据
    insert(table, data) {
        if (!this.data[table]) {
            this.data[table] = [];
        }
        
        const id = this.getNextId(table);
        const record = {
            id,
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        this.data[table].push(record);
        this.saveData();
        
        return record;
    }

    // 查找数据
    find(table, condition = {}) {
        if (!this.data[table]) {
            return [];
        }
        
        return this.data[table].filter(item => {
            return Object.keys(condition).every(key => {
                if (typeof condition[key] === 'function') {
                    return condition[key](item[key]);
                }
                return item[key] === condition[key];
            });
        });
    }

    // 查找单条数据
    findOne(table, condition = {}) {
        const results = this.find(table, condition);
        return results.length > 0 ? results[0] : null;
    }

    // 根据ID查找
    findById(table, id) {
        return this.findOne(table, { id: parseInt(id) });
    }

    // 更新数据
    update(table, condition, updateData) {
        if (!this.data[table]) {
            return 0;
        }
        
        let updatedCount = 0;
        this.data[table] = this.data[table].map(item => {
            const matches = Object.keys(condition).every(key => {
                if (typeof condition[key] === 'function') {
                    return condition[key](item[key]);
                }
                return item[key] === condition[key];
            });
            
            if (matches) {
                updatedCount++;
                return {
                    ...item,
                    ...updateData,
                    updated_at: new Date().toISOString()
                };
            }
            
            return item;
        });
        
        if (updatedCount > 0) {
            this.saveData();
        }
        
        return updatedCount;
    }

    // 删除数据
    delete(table, condition) {
        if (!this.data[table]) {
            return 0;
        }
        
        const originalLength = this.data[table].length;
        this.data[table] = this.data[table].filter(item => {
            return !Object.keys(condition).every(key => {
                if (typeof condition[key] === 'function') {
                    return condition[key](item[key]);
                }
                return item[key] === condition[key];
            });
        });
        
        const deletedCount = originalLength - this.data[table].length;
        
        if (deletedCount > 0) {
            this.saveData();
        }
        
        return deletedCount;
    }

    // 计数
    count(table, condition = {}) {
        return this.find(table, condition).length;
    }

    // 获取所有数据
    getAll(table) {
        return this.data[table] || [];
    }

    // 分页查询
    paginate(table, condition = {}, options = {}) {
        const { page = 1, limit = 10, sort = 'created_at', order = 'DESC' } = options;
        
        let results = this.find(table, condition);
        
        // 排序
        results.sort((a, b) => {
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
        const paginatedResults = results.slice(offset, offset + limit);
        
        return {
            data: paginatedResults,
            total: results.length,
            page,
            limit,
            totalPages: Math.ceil(results.length / limit)
        };
    }
}

module.exports = JsonDB;
