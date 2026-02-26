# Docker 镜像构建与部署指南

本文档详细说明如何构建 Docker 镜像并部署到公司服务器。

---

## 📦 方式一：使用构建脚本（推荐）

### 1. 配置镜像仓库

编辑 `build-images.sh` 文件，修改镜像仓库地址：

```bash
REGISTRY="your-registry.com"  # 改为你的镜像仓库地址
# 例如：
# REGISTRY="harbor.company.com/project"
# REGISTRY="registry.cn-hangzhou.aliyuncs.com/your-namespace"
```

### 2. 构建镜像

```bash
# 构建 latest 版本
./build-images.sh

# 构建指定版本
./build-images.sh v1.0.0
```

脚本会自动：
- 构建前端和后端镜像
- 打上版本标签
- 询问是否推送到镜像仓库

### 3. 推送到镜像仓库

如果在构建时选择了推送，镜像会自动上传。

如果跳过了推送，可以手动推送：

```bash
# 登录镜像仓库
docker login your-registry.com

# 推送镜像
docker push your-registry.com/dashboard-backend:v1.0.0
docker push your-registry.com/dashboard-frontend:v1.0.0
```

---

## 🔧 方式二：手动构建镜像

### 1. 构建后端镜像

```bash
cd dashboard

# 构建镜像
docker build -t dashboard-backend:v1.0.0 -f backend/Dockerfile backend/

# 打标签（如果需要推送到仓库）
docker tag dashboard-backend:v1.0.0 your-registry.com/dashboard-backend:v1.0.0

# 推送到仓库
docker push your-registry.com/dashboard-backend:v1.0.0
```

### 2. 构建前端镜像

```bash
cd dashboard

# 构建镜像
docker build -t dashboard-frontend:v1.0.0 -f frontend/Dockerfile frontend/

# 打标签
docker tag dashboard-frontend:v1.0.0 your-registry.com/dashboard-frontend:v1.0.0

# 推送到仓库
docker push your-registry.com/dashboard-frontend:v1.0.0
```

---

## 💾 方式三：保存镜像为文件（无镜像仓库）

如果公司没有镜像仓库，可以将镜像保存为文件传输：

### 1. 构建并保存镜像

```bash
# 构建镜像
docker build -t dashboard-backend:v1.0.0 -f backend/Dockerfile backend/
docker build -t dashboard-frontend:v1.0.0 -f frontend/Dockerfile frontend/

# 保存为 tar 文件
docker save dashboard-backend:v1.0.0 -o dashboard-backend-v1.0.0.tar
docker save dashboard-frontend:v1.0.0 -o dashboard-frontend-v1.0.0.tar

# 压缩（可选）
gzip dashboard-backend-v1.0.0.tar
gzip dashboard-frontend-v1.0.0.tar
```

### 2. 传输到服务器

```bash
# 使用 scp 传输
scp dashboard-backend-v1.0.0.tar.gz user@server:/path/to/deploy/
scp dashboard-frontend-v1.0.0.tar.gz user@server:/path/to/deploy/
```

### 3. 在服务器上加载镜像

```bash
# 解压（如果压缩了）
gunzip dashboard-backend-v1.0.0.tar.gz
gunzip dashboard-frontend-v1.0.0.tar.gz

# 加载镜像
docker load -i dashboard-backend-v1.0.0.tar
docker load -i dashboard-frontend-v1.0.0.tar

# 验证镜像
docker images | grep dashboard
```

---

## 🚀 服务器部署

### 方式 A：使用 Docker Compose（推荐）

#### 1. 准备部署文件

在服务器上创建部署目录：

```bash
mkdir -p /opt/dashboard
cd /opt/dashboard
```

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  backend:
    image: your-registry.com/dashboard-backend:v1.0.0
    container_name: dashboard-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: always
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - dashboard-network

  frontend:
    image: your-registry.com/dashboard-frontend:v1.0.0
    container_name: dashboard-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
    networks:
      - dashboard-network

networks:
  dashboard-network:
    driver: bridge
```

#### 2. 配置环境变量

创建 `.env` 文件：

```bash
# Server
PORT=3001

# GitHub
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=matrixorigin/matrixone

# Loki 配置
LOKI_ENDPOINTS=[...]

# 性能监控配置
PERFORMANCE_MONITORS=[...]
```

#### 3. 启动服务

```bash
# 拉取镜像（如果使用镜像仓库）
docker-compose pull

# 启动服务
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 方式 B：使用 Docker 命令

```bash
# 创建网络
docker network create dashboard-network

# 启动后端
docker run -d \
  --name dashboard-backend \
  --network dashboard-network \
  -p 3001:3001 \
  --env-file .env \
  --restart always \
  your-registry.com/dashboard-backend:v1.0.0

# 启动前端
docker run -d \
  --name dashboard-frontend \
  --network dashboard-network \
  -p 80:80 \
  --restart always \
  your-registry.com/dashboard-frontend:v1.0.0
```

---

## 🔄 更新部署

### 使用 Docker Compose

```bash
cd /opt/dashboard

# 拉取新镜像
docker-compose pull

# 重启服务
docker-compose up -d

# 清理旧镜像
docker image prune -f
```

### 使用 Docker 命令

```bash
# 停止并删除旧容器
docker stop dashboard-backend dashboard-frontend
docker rm dashboard-backend dashboard-frontend

# 拉取新镜像
docker pull your-registry.com/dashboard-backend:v1.0.0
docker pull your-registry.com/dashboard-frontend:v1.0.0

# 启动新容器（使用上面的 docker run 命令）
```

---

## 📝 完整部署流程示例

### 场景：使用公司 Harbor 镜像仓库

#### 开发机器上：

```bash
# 1. 配置镜像仓库
vim build-images.sh
# 修改 REGISTRY="harbor.company.com/project"

# 2. 构建并推送镜像
./build-images.sh v1.0.0
# 选择 'y' 推送到仓库

# 或者手动推送
docker login harbor.company.com
docker push harbor.company.com/project/dashboard-backend:v1.0.0
docker push harbor.company.com/project/dashboard-frontend:v1.0.0
```

#### 服务器上：

```bash
# 1. 登录镜像仓库
docker login harbor.company.com

# 2. 创建部署目录
mkdir -p /opt/dashboard
cd /opt/dashboard

# 3. 创建 docker-compose.yml（见上文）
vim docker-compose.yml

# 4. 创建 .env 配置文件
vim .env

# 5. 拉取并启动
docker-compose pull
docker-compose up -d

# 6. 验证
docker-compose ps
curl http://localhost:3001/health
curl http://localhost:80
```

---

## 🔍 镜像信息

### 镜像大小（预估）

- 后端镜像：~150MB（基于 node:20-alpine）
- 前端镜像：~25MB（基于 nginx:alpine）

### 镜像标签策略

建议使用以下标签策略：

- `latest` - 最新版本（开发/测试环境）
- `v1.0.0` - 具体版本号（生产环境）
- `dev` - 开发版本
- `staging` - 预发布版本

示例：
```bash
# 构建多个标签
docker build -t dashboard-backend:v1.0.0 -t dashboard-backend:latest backend/

# 推送所有标签
docker push dashboard-backend:v1.0.0
docker push dashboard-backend:latest
```

---

## 🛠️ 常见问题

### 1. 构建失败：npm install 超时

**解决方案**：使用国内镜像

修改 `backend/Dockerfile` 和 `frontend/Dockerfile`，在 `npm ci` 前添加：

```dockerfile
RUN npm config set registry https://registry.npmmirror.com
```

### 2. 镜像太大

**解决方案**：

- 使用 `.dockerignore` 排除不必要的文件
- 使用多阶段构建（前端已使用）
- 清理缓存：`RUN npm cache clean --force`

### 3. 推送镜像失败：unauthorized

**解决方案**：

```bash
# 重新登录
docker logout your-registry.com
docker login your-registry.com

# 检查权限
# 确保你的账号有推送权限
```

### 4. 服务器拉取镜像失败

**解决方案**：

```bash
# 检查网络
ping your-registry.com

# 检查 Docker 配置
cat /etc/docker/daemon.json

# 如果是 HTTPS 证书问题，添加 insecure-registries
{
  "insecure-registries": ["your-registry.com"]
}

# 重启 Docker
sudo systemctl restart docker
```

---

## 📊 监控和日志

### 查看容器状态

```bash
docker-compose ps
docker stats
```

### 查看日志

```bash
# 实时日志
docker-compose logs -f

# 查看最近 100 行
docker-compose logs --tail=100

# 只看后端日志
docker-compose logs -f backend
```

### 进入容器调试

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入前端容器
docker-compose exec frontend sh
```

---

## 🔐 安全建议

1. **不要在镜像中包含敏感信息**
   - 使用 `.env` 文件或环境变量
   - 不要提交 `.env` 到 Git

2. **定期更新基础镜像**
   ```bash
   docker pull node:20-alpine
   docker pull nginx:alpine
   ```

3. **扫描镜像漏洞**
   ```bash
   docker scan dashboard-backend:v1.0.0
   ```

4. **使用非 root 用户运行**（可选优化）

---

## 📞 技术支持

如有问题，请参考：
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 通用部署文档
- [部署说明.md](./部署说明.md) - 中文部署指南
- [README.md](./README.md) - 项目说明

---

## ✅ 部署检查清单

构建前：
- [ ] 已配置镜像仓库地址
- [ ] 已测试本地构建
- [ ] 已准备 `.env` 配置文件

构建时：
- [ ] 后端镜像构建成功
- [ ] 前端镜像构建成功
- [ ] 镜像已推送到仓库（或保存为文件）

部署时：
- [ ] 服务器已安装 Docker
- [ ] 已创建 docker-compose.yml
- [ ] 已配置 .env 文件
- [ ] 已开放必要端口（80, 3001）

部署后：
- [ ] 容器正常运行
- [ ] 健康检查通过
- [ ] 前端页面可访问
- [ ] 后端 API 正常
- [ ] 数据正常加载

---

祝部署顺利！🎉
