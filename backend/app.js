const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../images'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// 导入路由
const categoriesRoutes = require('./routes/categories');
const toolsRoutes = require('./routes/tools');
const settingRoutes = require('./routes/setting');
const pagesRoutes = require('./routes/pages');
const usersRoutes = require('./routes/users');
const adsRoutes = require('./routes/ads');

// 注册路由
app.use('/api/categories', categoriesRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/setting', settingRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ads', adsRoutes);

// 登录验证
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === validUsername && password === validPassword) {
        res.json({ success: true, message: '登录成功' });
    } else {
        res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '服务运行正常' });
});

// 文件上传接口
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: '请选择要上传的文件' });
        return;
    }
    
    const imageUrl = `/images/${req.file.filename}`;
    res.json({ success: true, imageUrl });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
});

// 导出应用
module.exports = app;
