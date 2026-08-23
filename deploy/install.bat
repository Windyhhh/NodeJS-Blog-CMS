@echo off
echo ========================================
echo 学业互助平台 - Windows Server 部署脚本
echo ========================================
echo.

:: 检查Node.js是否已安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [信息] Node.js版本:
node --version
echo.

:: 检查npm是否可用
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] npm不可用
    pause
    exit /b 1
)

echo [信息] npm版本:
npm --version
echo.

:: 安装依赖
echo [步骤1] 安装项目依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [成功] 依赖安装完成
echo.

:: 创建数据库目录
echo [步骤2] 创建数据库目录...
if not exist "database" mkdir "database"
echo [成功] 数据库目录创建完成
echo.

:: 创建必要的目录
echo [步骤3] 创建必要的目录...
if not exist "public\images" mkdir "public\images"
if not exist "uploads" mkdir "uploads"
echo [成功] 目录创建完成
echo.

:: 复制默认头像（如果存在）
if exist "deploy\default-avatar.png" (
    copy "deploy\default-avatar.png" "public\images\default-avatar.png" >nul
    echo [成功] 默认头像复制完成
)

:: 设置环境变量
echo [步骤4] 设置环境变量...
set NODE_ENV=production
set PORT=3000
echo [成功] 环境变量设置完成
echo.

:: 创建Windows服务（可选）
echo [步骤5] 是否要创建Windows服务？(y/n)
set /p create_service=
if /i "%create_service%"=="y" (
    echo [信息] 安装PM2...
    call npm install -g pm2
    call npm install -g pm2-windows-service
    
    echo [信息] 创建PM2服务...
    call pm2-service-install -n "StudentHelpPlatform"
    
    echo [信息] 启动应用...
    call pm2 start server.js --name "student-help-platform"
    call pm2 save
    
    echo [成功] Windows服务创建完成
) else (
    echo [信息] 跳过Windows服务创建
)
echo.

:: 防火墙设置提醒
echo [重要] 防火墙设置提醒:
echo 请确保在Windows防火墙中允许端口3000的入站连接
echo 或者运行以下命令（需要管理员权限）:
echo netsh advfirewall firewall add rule name="Student Help Platform" dir=in action=allow protocol=TCP localport=3000
echo.

:: 完成
echo ========================================
echo 部署完成！
echo ========================================
echo.
echo 应用信息:
echo - 端口: 3000
echo - 访问地址: http://localhost:3000
echo - 外网访问: http://118.89.81.112:3000
echo.
echo 启动命令:
echo - 开发模式: npm run dev
echo - 生产模式: npm start
echo.
if /i "%create_service%"=="y" (
    echo PM2管理命令:
    echo - 查看状态: pm2 status
    echo - 重启应用: pm2 restart student-help-platform
    echo - 停止应用: pm2 stop student-help-platform
    echo - 查看日志: pm2 logs student-help-platform
    echo.
)
echo 按任意键退出...
pause >nul
