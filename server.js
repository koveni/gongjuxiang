const http = require('http');
const app = require('./backend/app');

// 端口配置
const PORT = process.env.PORT || 3000;

// 导出 handler 函数，用于阿里云 ESA 函数
module.exports.handler = async (event, context) => {
    // 阿里云 ESA 函数会自动将请求转发给 Express 应用
    return app;
};

// 对于本地开发，创建 HTTP 服务器
if (require.main === module) {
    // 创建HTTP服务器
    const server = http.createServer(app);
    
    // 启动服务器
    server.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}/`);
        console.log(`API文档地址: http://localhost:${PORT}/api/health`);
    });
    
    // 错误处理
    server.on('error', (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }
        
        switch (error.code) {
            case 'EACCES':
                console.error(`端口 ${PORT} 需要管理员权限`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`端口 ${PORT} 已被占用`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
}
