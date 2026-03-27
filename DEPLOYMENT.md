# 阿里云 ESA 函数部署指南

## 部署步骤

1. **登录阿里云控制台**
   - 访问 https://console.aliyun.com
   - 进入函数计算 ESA 控制台

2. **创建函数**
   - 点击 "创建函数"
   - 选择 "从模板创建"
   - 选择 "Express 应用"

3. **配置函数**
   - 函数名称：`gongjuxiang`
   - 运行时：`Node.js 16.x`
   - 代码上传方式：`Git 仓库`
   - 仓库地址：`https://github.com/koveni/gongjuxiang`
   - 分支：`main`

4. **构建配置**
   - 构建命令：`npm install && npm run build`
   - 输出目录：`./`

5. **服务器配置**
   - 框架：`Express`
   - 入口文件：`server.js`
   - 端口：`3000`

6. **静态资源配置**
   - 静态资源目录：`./`
   - 索引文件：`index.html`

7. **环境变量**
   - 添加以下环境变量：
     - `ADMIN_USERNAME`: 管理员用户名（默认：admin）
     - `ADMIN_PASSWORD`: 管理员密码（默认：admin123）
     - `PORT`: 服务器端口（默认：3000）

8. **部署函数**
   - 点击 "部署" 按钮
   - 等待部署完成

## 访问方式

部署完成后，您可以通过以下方式访问：
- 函数 URL：阿里云 ESA 控制台中提供的访问地址
- 后台管理：`https://<function-url>/admin/login.html`
- API 健康检查：`https://<function-url>/api/health`

## 注意事项

1. **数据库初始化**：首次部署时，系统会自动创建 SQLite 数据库文件 `data.db`
2. **图片上传**：上传的图片会存储在 `images` 目录中
3. **环境变量**：请在生产环境中设置安全的管理员密码
4. **日志查看**：可以在阿里云 ESA 控制台中查看函数日志

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 访问本地服务器
http://localhost:3000
```
