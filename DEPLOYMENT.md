# 测试监控看板 - 部署指南

## 部署方式

本项目支持两种部署方式：
1. **Docker 部署（推荐）** - 适合生产环境，一键部署
2. **手动部署** - 适合开发环境或需要自定义配置

---

## 方式一：Docker 部署（推荐）

### 前置要求
- Docker 20.10+
- Docker Compose 2.0+

### 部署步骤

#### 1. 配置环境变量

编辑 `backend/.env` 文件，配置必要的环境变量：

```bash
cd dashboard/backend
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

必须配置的变量：
- `GITHUB_TOKEN`: GitHub Personal Access Token（用于提高 API 速率限制）
- `GITHUB_REPO`: 要监控的 GitHub 仓库（如 `matrixorigin/matrixone`）
- `LOKI_ENDPOINTS`: Loki 日志监控地址（JSON 格式）
- `PERFORMANCE_MONITORS`: 性能监控链接（JSON 格式）

#### 2. 构建并启动服务

```bash
cd dashboard

# 构建镜像并启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 3. 访问服务

- 前端页面：http://your-server-ip:3000
- 后端 API：http://your-server-ip:3001

#### 4. 停止服务

```bash
docker-compose down

# 如果需要删除数据卷
docker-compose down -v
```

#### 5. 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

---

## 方式二：手动部署

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- Nginx（用于前端静态文件服务）

### 后端部署

#### 1. 安装依赖并构建

```bash
cd dashboard/backend
npm install
npm run build
```

#### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件
```

#### 3. 启动后端服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

#### 4. 使用 PM2 管理进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start dist/index.js --name dashboard-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 前端部署

#### 1. 安装依赖并构建

```bash
cd dashboard/frontend
npm install
npm run build
```

#### 2. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/dashboard`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dashboard/frontend/dist;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 3. 启用配置并重启 Nginx

```bash
sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 生产环境优化建议

### 1. 使用 HTTPS

使用 Let's Encrypt 配置免费 SSL 证书：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 2. 配置防火墙

```bash
# 只开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. 设置日志轮转

创建 `/etc/logrotate.d/dashboard`:

```
/var/log/dashboard/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 4. 监控服务健康

使用 PM2 监控：

```bash
pm2 monit
```

或配置健康检查端点，使用外部监控工具（如 Prometheus、Grafana）。

### 5. 备份配置文件

定期备份 `.env` 文件和其他配置：

```bash
# 创建备份脚本
#!/bin/bash
BACKUP_DIR="/backup/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp dashboard/backend/.env $BACKUP_DIR/.env.$DATE
```

---

## 常见问题

### 1. GitHub API 速率限制

**问题**: 出现 403 错误，提示 "API rate limit exceeded"

**解决**: 
- 配置 `GITHUB_TOKEN` 环境变量
- 使用认证后的请求可以获得 5000 次/小时的限额

### 2. 端口冲突

**问题**: 端口 3000 或 3001 已被占用

**解决**: 
- 修改 `docker-compose.yml` 中的端口映射
- 或停止占用端口的服务

### 3. 前端无法连接后端

**问题**: 前端页面显示但无法加载数据

**解决**:
- 检查后端服务是否正常运行
- 检查 Nginx 代理配置是否正确
- 查看浏览器控制台和后端日志

### 4. Docker 构建失败

**问题**: npm install 或 build 失败

**解决**:
- 检查网络连接
- 尝试使用国内 npm 镜像：`npm config set registry https://registry.npmmirror.com`
- 清理 Docker 缓存：`docker-compose build --no-cache`

---

## 维护命令

### Docker 部署

```bash
# 查看日志
docker-compose logs -f [service_name]

# 重启服务
docker-compose restart [service_name]

# 进入容器
docker-compose exec backend sh
docker-compose exec frontend sh

# 查看资源使用
docker stats
```

### 手动部署

```bash
# PM2 管理
pm2 list                    # 查看所有进程
pm2 logs dashboard-backend  # 查看日志
pm2 restart dashboard-backend  # 重启服务
pm2 stop dashboard-backend  # 停止服务
pm2 delete dashboard-backend  # 删除进程

# Nginx 管理
sudo nginx -t               # 测试配置
sudo systemctl status nginx # 查看状态
sudo systemctl reload nginx # 重载配置
```

---

## 性能优化

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

### 2. 配置缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 调整后端缓存时间

编辑后端服务代码中的缓存 TTL（默认 5 分钟）：

```typescript
const cache = new NodeCache({ stdTTL: 300 }); // 秒
```

---

## 安全建议

1. **不要提交 .env 文件到 Git**
2. **定期更新 GitHub Token**
3. **使用强密码和 SSH 密钥**
4. **限制服务器访问 IP**
5. **定期更新依赖包**: `npm audit fix`
6. **配置 CORS 白名单**（如果需要）

---

## 联系支持

如有问题，请联系项目维护者或查看项目文档。
