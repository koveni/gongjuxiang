const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有分类
router.get('/', (req, res) => {
    db.all('SELECT * FROM categories ORDER BY id', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ categories: rows });
    });
});

// 添加分类
router.post('/', (req, res) => {
    const { name } = req.body;
    
    if (!name) {
        res.status(400).json({ error: '分类名称不能为空' });
        return;
    }
    
    db.run(
        'INSERT INTO categories (name) VALUES (?)',
        [name],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, name });
        }
    );
});

// 更新分类
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
        res.status(400).json({ error: '分类名称不能为空' });
        return;
    }
    
    db.run(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '分类不存在' });
                return;
            }
            res.json({ id, name });
        }
    );
});

// 删除分类
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run(
        'DELETE FROM categories WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '分类不存在' });
                return;
            }
            res.json({ message: '分类删除成功' });
        }
    );
});

module.exports = router;
