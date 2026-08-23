const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('数据库初始化脚本开始执行...');

// 创建数据库连接
const dbPath = path.join(__dirname, 'database.db');
let db;

try {
    db = new Database(dbPath);
    console.log('数据库连接成功');

    // 读取SQL初始化脚本
    const sqlScript = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

    // 分割SQL语句并执行
    const statements = sqlScript.split(';').filter(stmt => stmt.trim());

    statements.forEach((statement, index) => {
        if (statement.trim()) {
            try {
                db.exec(statement);
                console.log(`SQL语句 ${index + 1} 执行成功`);
            } catch (err) {
                console.error(`执行SQL语句 ${index + 1} 时出错:`, err.message);
                console.error('SQL语句:', statement.trim());
            }
        }
    });

    console.log('数据库初始化完成');

} catch (err) {
    console.error('数据库初始化失败:', err.message);
} finally {
    if (db) {
        db.close();
        console.log('数据库连接已关闭');
    }
}
