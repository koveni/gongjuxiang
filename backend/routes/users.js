const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有用户
router.get('/', (req, res) => {
    db.all('SELECT id, username, role, created_at FROM users ORDER BY id', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ users: rows });
    });
});

// 添加用户
router.post('/', (req, res) => {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
        res.status(400).json({ error: '用户名和密码不能为空' });
        return;
    }
    
    db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, password, role || 'editor'],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, username, role: role || 'editor' });
        }
    );
});

// 更新用户
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { username, password, role } = req.body;
    
    if (!username) {
        res.status(400).json({ error: '用户名不能为空' });
        return;
    }
    
    const updateData = [];
    let updateQuery = 'UPDATE users SET username = ?';
    updateData.push(username);
    
    if (password) {
        updateQuery += ', password = ?';
        updateData.push(password);
    }
    
    if (role) {
        updateQuery += ', role = ?';
        updateData.push(role);
    }
    
    updateQuery += ' WHERE id = ?';
    updateData.push(id);
    
    db.run(
        updateQuery,
        updateData,
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '用户不存在' });
                return;
            }
            res.json({ id, username, role });
        }
    );
});

// 删除用户
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // 不允许删除管理员用户
    if (id == 1) {
        res.status(403).json({ error: '不能删除管理员用户' });
        return;
    }
    
    db.run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '用户不存在' });
                return;
            }
            res.json({ message: '用户删除成功' });
        }
    );
});

module.exports = router;
