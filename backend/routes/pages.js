const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有页面
router.get('/', (req, res) => {
    db.all('SELECT * FROM pages ORDER BY id', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ pages: rows });
    });
});

// 添加页面
router.post('/', (req, res) => {
    const { title, slug, content, status } = req.body;
    
    if (!title) {
        res.status(400).json({ error: '页面标题不能为空' });
        return;
    }
    
    db.run(
        'INSERT INTO pages (title, slug, content, status) VALUES (?, ?, ?, ?)',
        [title, slug, content, status || 'draft'],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, title, slug, content, status: status || 'draft' });
        }
    );
});

// 更新页面
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, slug, content, status } = req.body;
    
    if (!title) {
        res.status(400).json({ error: '页面标题不能为空' });
        return;
    }
    
    db.run(
        'UPDATE pages SET title = ?, slug = ?, content = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, slug, content, status || 'draft', id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '页面不存在' });
                return;
            }
            res.json({ id, title, slug, content, status: status || 'draft' });
        }
    );
});

// 删除页面
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run(
        'DELETE FROM pages WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '页面不存在' });
                return;
            }
            res.json({ message: '页面删除成功' });
        }
    );
});

module.exports = router;
