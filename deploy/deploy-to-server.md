# 学业互助平台 - 腾讯云服务器部署指南

## 服务器信息
- **IP地址**: 118.89.81.112
- **操作系统**: Windows Server 2012 R2 DataCenter 64bit CN
- **用户名**: Administrator
- **密码**: 7@du;nMq+A*FbT,6

## 部署步骤

### 第一步：连接到服务器

1. **使用远程桌面连接**：
   - 在本地电脑按 `Win + R`，输入 `mstsc`
   - 计算机：`118.89.81.112`
   - 用户名：`Administrator`
   - 密码：`7@du;nMq+A*FbT,6`

2. **或使用腾讯云控制台VNC登录**

### 第二步：安装Node.js

1. 在服务器上打开浏览器，访问 https://nodejs.org/
2. 下载Windows版本的LTS版本（推荐18.x或20.x）
3. 运行安装程序，使用默认设置
4. 安装完成后，打开命令提示符验证：
   ```cmd
   node --version
   npm --version
   ```

### 第三步：上传项目文件

1. **创建项目目录**：
   ```cmd
   mkdir C:\inetpub\wwwroot\student-help-platform
   cd C:\inetpub\wwwroot\student-help-platform
   ```

2. **上传项目文件**：
   - 将整个项目文件夹压缩成zip文件
   - 通过远程桌面复制到服务器
   - 或使用FTP工具上传

### 第四步：安装依赖和启动

1. **安装项目依赖**：
   ```cmd
   cd C:\inetpub\wwwroot\student-help-platform
   npm install
   ```

2. **启动应用**：
   ```cmd
   npm start
   ```
   或
   ```cmd
   node server.js
   ```

3. **验证运行**：
   - 在服务器浏览器中访问 http://localhost:3000
   - 外网访问：http://118.89.81.112:3000

### 第五步：配置防火墙

1. **Windows防火墙设置**：
   - 打开"控制面板" → "系统和安全" → "Windows防火墙"
   - 点击"高级设置"
   - 在"入站规则"中新建规则
   - 选择"端口" → "TCP" → "特定本地端口" → "3000"
   - 允许连接，应用到所有配置文件

2. **或使用命令行**（以管理员身份运行）：
   ```cmd
   netsh advfirewall firewall add rule name="Student Help Platform" dir=in action=allow protocol=TCP localport=3000
   ```

### 第六步：配置为Windows服务（推荐）

1. **安装PM2**：
   ```cmd
   npm install -g pm2
   npm install -g pm2-windows-service
   ```

2. **创建Windows服务**：
   ```cmd
   pm2-service-install -n "StudentHelpPlatform"
   ```

3. **启动应用服务**：
   ```cmd
   pm2 start server.js --name "student-help-platform"
   pm2 save
   ```

4. **设置开机自启**：
   ```cmd
   pm2 startup
   ```

## 访问网站

部署完成后，可以通过以下地址访问：
- **外网访问**: http://118.89.81.112:3000
- **服务器本地**: http://localhost:3000

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
# 查看应用运行状态
netstat -ano | findstr :3000

# 手动启动应用
node server.js

# 查看应用日志
pm2 logs student-help-platform --lines 50
```

## 故障排除

### 常见问题

1. **端口被占用**：
   ```cmd
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **应用无法启动**：
   - 检查Node.js是否正确安装
   - 检查项目依赖是否完整安装
   - 查看错误日志

3. **外网无法访问**：
   - 检查Windows防火墙设置
   - 检查腾讯云安全组设置
   - 确认应用正在运行

4. **数据丢失**：
   - 数据存储在 `database/data.json` 文件中
   - 定期备份此文件

## 安全建议

1. **更改默认密码**：
   - 立即更改Administrator账户密码

2. **定期备份**：
   ```cmd
   # 备份数据文件
   copy database\data.json database\data_backup_%date%.json
   ```

3. **更新依赖**：
   ```cmd
   npm audit
   npm update
   ```

4. **监控日志**：
   - 定期查看PM2日志
   - 监控系统资源使用情况

## 功能测试

部署完成后，请测试以下功能：

1. **用户注册和登录**
2. **发布帖子**
3. **浏览帖子列表**
4. **搜索和筛选**
5. **分类浏览**

## 联系支持

如果在部署过程中遇到问题：
1. 检查Node.js版本是否正确
2. 确认所有依赖都已安装
3. 查看应用日志获取错误信息
4. 检查防火墙和网络设置

---

**注意**: 这是一个基于JSON文件的简单数据库系统，适合中小型应用。如需处理大量数据，建议后续升级到MySQL或PostgreSQL数据库。
