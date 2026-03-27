const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有设置
router.get('/', (req, res) => {
    db.all('SELECT * FROM setting', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const setting = {};
        rows.forEach(row => {
            setting[row.key] = row.value;
        });
        res.json({ setting });
    });
});

// 获取单个设置
router.get('/:key', (req, res) => {
    const { key } = req.params;
    
    db.get('SELECT * FROM setting WHERE key = ?', [key], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: '设置不存在' });
            return;
        }
        res.json({ key: row.key, value: row.value });
    });
});

// 更新设置
router.put('/', (req, res) => {
    const { setting } = req.body;
    
    if (!setting || typeof setting !== 'object') {
        res.status(400).json({ error: '设置数据格式错误' });
        return;
    }
    
    // 开始事务
    db.serialize(() => {
        const promises = Object.entries(setting).map(([key, value]) => {
            return new Promise((resolve, reject) => {
                db.run(
                    'INSERT OR REPLACE INTO setting (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
                    [key, value],
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        });
        
        Promise.all(promises)
            .then(() => {
                res.json({ message: '设置更新成功', setting });
            })
            .catch(err => {
                res.status(500).json({ error: err.message });
            });
    });
});

module.exports = router;
