# 学业互助平台 - 部署说明

## 系统要求

- **操作系统**: Windows Server 2012 R2 或更高版本
- **Node.js**: 16.x 或更高版本
- **内存**: 至少 2GB RAM
- **存储**: 至少 10GB 可用空间

## 部署步骤

### 1. 准备服务器环境

1. **连接到服务器**
   - 服务器IP: `118.89.81.112`
   - 用户名: `Administrator`
   - 密码: `7@du;nMq+A*FbT,6`

2. **安装Node.js**
   - 访问 https://nodejs.org/
   - 下载Windows版本的LTS版本
   - 运行安装程序，按默认设置安装

3. **验证安装**
   ```cmd
   node --version
   npm --version
   ```

### 2. 部署应用

1. **上传项目文件**
   - 将整个项目文件夹上传到服务器（建议放在 `C:\inetpub\wwwroot\student-help-platform\`）

2. **运行部署脚本**
   ```cmd
   cd C:\inetpub\wwwroot\student-help-platform
   deploy\install.bat
   ```

3. **手动部署（如果脚本失败）**
   ```cmd
   # 安装依赖
   npm install
   
   # 初始化数据库
   npm run init-db
   
   # 启动应用
   npm start
   ```

### 3. 配置防火墙

1. **Windows防火墙设置**
   - 打开"Windows防火墙高级安全"
   - 创建新的入站规则
   - 选择"端口" -> "TCP" -> "特定本地端口" -> "3000"
   - 允许连接

2. **或使用命令行**（需要管理员权限）
   ```cmd
   netsh advfirewall firewall add rule name="Student Help Platform" dir=in action=allow protocol=TCP localport=3000
   ```

### 4. 配置为Windows服务（推荐）

1. **安装PM2**
   ```cmd
   npm install -g pm2
   npm install -g pm2-windows-service
   ```

2. **创建服务**
   ```cmd
   pm2-service-install -n "StudentHelpPlatform"
   ```

3. **启动应用**
   ```cmd
   pm2 start server.js --name "student-help-platform"
   pm2 save
   ```

### 5. 访问应用

- **本地访问**: http://localhost:3000
- **外网访问**: http://118.89.81.112:3000

## 常用管理命令

### PM2服务管理
```cmd
# 查看应用状态
pm2 status

# 重启应用
pm2 restart student-help-platform

# 停止应用
pm2 stop student-help-platform

# 查看日志
pm2 logs student-help-platform

# 监控应用
pm2 monit
```

### 应用管理
```cmd
# 开发模式启动
npm run dev

# 生产模式启动
npm start

# 重新初始化数据库
npm run init-db
```

## 目录结构

```
student-help-platform/
├── server.js              # 主服务器文件
├── package.json           # 项目配置
├── database/              # 数据库相关
│   ├── database.db        # SQLite数据库文件
│   ├── init.sql          # 数据库初始化脚本
│   └── init.js           # 数据库初始化程序
├── routes/               # 路由文件
├── models/               # 数据模型
├── views/                # 模板文件
├── public/               # 静态文件
└── deploy/               # 部署相关文件
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```cmd
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **数据库文件权限问题**
   - 确保应用有读写database目录的权限

3. **依赖安装失败**
   ```cmd
   npm cache clean --force
   npm install
   ```

4. **服务无法启动**
   - 检查日志文件
   - 确认端口未被占用
   - 验证数据库文件存在

### 日志文件位置

- **应用日志**: PM2日志或控制台输出
- **错误日志**: 同上
- **访问日志**: 暂未配置（可后续添加）

## 安全建议

1. **更改默认密码**
   - 登录服务器后立即更改Administrator密码

2. **配置HTTPS**（生产环境推荐）
   - 申请SSL证书
   - 配置反向代理（如IIS）

3. **定期备份**
   - 备份数据库文件
   - 备份上传的文件

4. **更新依赖**
   ```cmd
   npm audit
   npm update
   ```

## 联系支持

如果在部署过程中遇到问题，请检查：
1. Node.js版本是否正确
2. 防火墙设置是否正确
3. 端口是否被占用
4. 数据库文件是否正确创建

## 更新应用

1. **停止应用**
   ```cmd
   pm2 stop student-help-platform
   ```

2. **更新代码**
   - 上传新的代码文件

3. **更新依赖**
   ```cmd
   npm install
   ```

4. **重启应用**
   ```cmd
   pm2 restart student-help-platform
   ```
