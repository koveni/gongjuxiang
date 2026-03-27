const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有广告
router.get('/', (req, res) => {
    db.all('SELECT * FROM ads ORDER BY id', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ ads: rows });
    });
});

// 添加广告
router.post('/', (req, res) => {
    const { name, url, image, position, status } = req.body;
    
    if (!name || !url || !position) {
        res.status(400).json({ error: '广告名称、链接和位置不能为空' });
        return;
    }
    
    db.run(
        'INSERT INTO ads (name, url, image, position, status) VALUES (?, ?, ?, ?, ?)',
        [name, url, image, position, status || 'inactive'],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, name, url, image, position, status: status || 'inactive' });
        }
    );
});

// 更新广告
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, url, image, position, status } = req.body;
    
    if (!name || !url || !position) {
        res.status(400).json({ error: '广告名称、链接和位置不能为空' });
        return;
    }
    
    db.run(
        'UPDATE ads SET name = ?, url = ?, image = ?, position = ?, status = ? WHERE id = ?',
        [name, url, image, position, status || 'inactive', id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '广告不存在' });
                return;
            }
            res.json({ id, name, url, image, position, status: status || 'inactive' });
        }
    );
});

// 删除广告
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run(
        'DELETE FROM ads WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '广告不存在' });
                return;
            }
            res.json({ message: '广告删除成功' });
        }
    );
});

module.exports = router;
