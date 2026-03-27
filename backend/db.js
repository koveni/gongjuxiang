const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../data.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('连接数据库失败:', err.message);
    } else {
        console.log('成功连接到SQLite数据库');
        initDatabase();
    }
});

// 初始化数据库表结构
function initDatabase() {
    // 创建分类表
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('创建categories表失败:', err.message);
        }
    });

    // 创建工具表
    db.run(`
        CREATE TABLE IF NOT EXISTS tools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            url TEXT NOT NULL,
            icon TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('创建tools表失败:', err.message);
        }
    });

    // 创建设置表
    db.run(`
        CREATE TABLE IF NOT EXISTS setting (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('创建setting表失败:', err.message);
        }
    });

    // 创建页面表
    db.run(`
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE,
            content TEXT,
            status TEXT DEFAULT 'draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('创建pages表失败:', err.message);
        }
    });

    // 创建用户表
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'editor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('创建users表失败:', err.message);
        } else {
            // 检查是否存在管理员用户
            db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
                if (err) {
                    console.error('查询用户失败:', err.message);
                } else if (!row) {
                    // 创建默认管理员用户
                    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
                    db.run(
                        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                        ['admin', defaultPassword, 'admin'],
                        (err) => {
                            if (err) {
                                console.error('创建默认管理员失败:', err.message);
                            } else {
                                console.log('默认管理员创建成功');
                            }
                        }
                    );
                }
            });
        }
    });

    // 创建广告表
    db.run(`
        CREATE TABLE IF NOT EXISTS ads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            image TEXT,
            position TEXT NOT NULL,
            status TEXT DEFAULT 'inactive',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('创建ads表失败:', err.message);
        }
    });

    // 从JSON文件导入初始数据
    importInitialData();
}

// 从JSON文件导入初始数据
function importInitialData() {
    const dataDir = path.join(__dirname, '../data');
    
    // 导入分类数据
    const categoriesPath = path.join(dataDir, 'categories.json');
    if (fs.existsSync(categoriesPath)) {
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
        categoriesData.categories.forEach(category => {
            db.run(
                'INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)',
                [category.id, category.name],
                (err) => {
                    if (err) {
                        console.error('导入分类数据失败:', err.message);
                    }
                }
            );
        });
    }

    // 导入工具数据
    const toolsPath = path.join(dataDir, 'tools.json');
    if (fs.existsSync(toolsPath)) {
        const toolsData = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
        toolsData.tools.forEach(tool => {
            db.run(
                'INSERT OR IGNORE INTO tools (id, category_id, name, description, url, icon) VALUES (?, ?, ?, ?, ?, ?)',
                [tool.id, tool.category_id, tool.name, tool.description, tool.url, tool.icon],
                (err) => {
                    if (err) {
                        console.error('导入工具数据失败:', err.message);
                    }
                }
            );
        });
    }

    // 导入设置数据
    const settingPath = path.join(dataDir, 'setting.json');
    if (fs.existsSync(settingPath)) {
        const settingData = JSON.parse(fs.readFileSync(settingPath, 'utf8'));
        if (settingData.setting) {
            Object.entries(settingData.setting).forEach(([key, value]) => {
                db.run(
                    'INSERT OR REPLACE INTO setting (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
                    [key, value],
                    (err) => {
                        if (err) {
                            console.error('导入设置数据失败:', err.message);
                        }
                    }
                );
            });
        }
    }

    // 导入页面数据
    const pagesPath = path.join(dataDir, 'pages.json');
    if (fs.existsSync(pagesPath)) {
        const pagesData = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
        pagesData.pages.forEach(page => {
            db.run(
                'INSERT OR IGNORE INTO pages (id, title, slug, content, status) VALUES (?, ?, ?, ?, ?)',
                [page.id, page.title, page.slug, page.content, page.status],
                (err) => {
                    if (err) {
                        console.error('导入页面数据失败:', err.message);
                    }
                }
            );
        });
    }

    // 导入广告数据
    const adsPath = path.join(dataDir, 'ads.json');
    if (fs.existsSync(adsPath)) {
        const adsData = JSON.parse(fs.readFileSync(adsPath, 'utf8'));
        adsData.ads.forEach(ad => {
            db.run(
                'INSERT OR IGNORE INTO ads (id, name, url, image, position, status) VALUES (?, ?, ?, ?, ?, ?)',
                [ad.id, ad.name, ad.url, ad.image, ad.position, ad.status],
                (err) => {
                    if (err) {
                        console.error('导入广告数据失败:', err.message);
                    }
                }
            );
        });
    }
}

// 导出数据库连接
module.exports = db;
