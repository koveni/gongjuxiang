const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有工具
router.get('/', (req, res) => {
    const { category_id } = req.query;
    let query = 'SELECT * FROM tools';
    const params = [];
    
    if (category_id) {
        query += ' WHERE category_id = ?';
        params.push(category_id);
    }
    
    query += ' ORDER BY id';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ tools: rows });
    });
});

// 添加工具
router.post('/', (req, res) => {
    const { category_id, name, description, url, icon } = req.body;
    
    if (!name || !url || !category_id) {
        res.status(400).json({ error: '工具名称、链接和分类不能为空' });
        return;
    }
    
    db.run(
        'INSERT INTO tools (category_id, name, description, url, icon) VALUES (?, ?, ?, ?, ?)',
        [category_id, name, description, url, icon],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, category_id, name, description, url, icon });
        }
    );
});

// 更新工具
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { category_id, name, description, url, icon } = req.body;
    
    if (!name || !url || !category_id) {
        res.status(400).json({ error: '工具名称、链接和分类不能为空' });
        return;
    }
    
    db.run(
        'UPDATE tools SET category_id = ?, name = ?, description = ?, url = ?, icon = ? WHERE id = ?',
        [category_id, name, description, url, icon, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '工具不存在' });
                return;
            }
            res.json({ id, category_id, name, description, url, icon });
        }
    );
});

// 删除工具
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run(
        'DELETE FROM tools WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '工具不存在' });
                return;
            }
            res.json({ message: '工具删除成功' });
        }
    );
});

module.exports = router;
