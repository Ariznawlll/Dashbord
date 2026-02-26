# 测试监控看板

一个集成 GitHub Issues、Loki 日志和性能监控的实时看板系统。

## 功能模块

### 1. Bug 监控
- 实时查看 GitHub Issues（带 `kind/bug` 标签）
- 按负责人统计 Bug 数量
- 最近 24 小时关闭的 Bug 追踪
- 搜索和筛选功能
- 可展开查看每个负责人的详细 Bug 列表

### 2. 日志监控
- 集成多个 Loki 环境的日志链接
- 一键跳转到对应的 Grafana 日志查询页面
- 支持 TKE 测试日志、单机测试日志、稳定性测试日志等

### 3. 性能监控
- 单机测试性能监控（SSB、TPCH、TPCC、Sysbench 等）
- 分布式测试性能监控
- 直接链接到 Grafana 性能看板

## 快速部署

### 方式一：使用 GitHub Actions 自动构建（推荐）

适合有公司镜像仓库的场景，自动化构建和推送。

```bash
# 1. 配置 GitHub Secrets（一次性）
# Settings → Secrets → 添加：
# - DOCKER_REGISTRY: harbor.company.com/dashboard
# - DOCKER_USERNAME: your-username
# - DOCKER_PASSWORD: your-password

# 2. 推送代码或打 tag，自动触发构建
git tag v1.0.0
git push origin v1.0.0

# 3. 服务器上拉取并部署
docker pull harbor.company.com/dashboard/dashboard-backend:v1.0.0
docker pull harbor.company.com/dashboard/dashboard-frontend:v1.0.0
docker-compose up -d
```

详细说明：[CI_CD_README.md](./CI_CD_README.md) | [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)

### 方式二：使用部署脚本

```bash
# 1. 配置环境变量
cd dashboard/backend
cp .env.example .env
# 编辑 .env 文件，填入 GITHUB_TOKEN 等配置

# 2. 一键部署
cd ..
./deploy.sh start

# 3. 访问服务
# 前端: http://localhost:3000
# 后端: http://localhost:3001
```

其他命令：
```bash
./deploy.sh stop      # 停止服务
./deploy.sh restart   # 重启服务
./deploy.sh logs      # 查看日志
./deploy.sh status    # 查看状态
./deploy.sh update    # 更新部署
```

### 方式二：Docker Compose

```bash
# 1. 配置环境变量
cd dashboard/backend
cp .env.example .env
# 编辑 .env 文件

# 2. 启动服务
cd ..
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

### 方式三：开发环境

```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端（新终端）
cd frontend
npm install
npm run dev
```

## 配置说明

### 必需配置

编辑 `backend/.env` 文件：

```bash
# GitHub 配置
GITHUB_TOKEN=your_github_token_here    # GitHub Personal Access Token
GITHUB_REPO=matrixorigin/matrixone     # 要监控的仓库

# Loki 日志监控配置（JSON 格式）
LOKI_ENDPOINTS=[{"name":"TKE测试日志","url":"https://..."},...]

# 性能监控配置（JSON 格式）
PERFORMANCE_MONITORS=[{"category":"单机测试性能","items":[...]},...]
```

### 获取 GitHub Token

1. 访问 https://github.com/settings/tokens/new
2. 勾选 `repo` 权限（或 `public_repo` 如果只监控公开仓库）
3. 生成 token 并复制到 `.env` 文件

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts（图表库）
- Axios

### 后端
- Node.js 20
- Express
- TypeScript
- Axios
- Node-Cache

### 部署
- Docker
- Docker Compose
- Nginx

## 项目结构

```
dashboard/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── index.ts     # 入口文件
│   │   ├── routes/      # API 路由
│   │   └── services/    # 业务逻辑
│   ├── .env             # 环境变量配置
│   ├── Dockerfile       # Docker 配置
│   └── package.json
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── App.tsx      # 主应用
│   │   ├── components/  # React 组件
│   │   └── services/    # API 服务
│   ├── Dockerfile       # Docker 配置
│   └── package.json
├── docker-compose.yml   # Docker Compose 配置
├── deploy.sh           # 部署脚本
├── DEPLOYMENT.md       # 详细部署文档
└── README.md           # 本文件
```

## 详细文档

- [完整部署指南](./DEPLOYMENT.md) - 包含生产环境部署、优化建议、常见问题等
- [快速开始指南](./QUICKSTART.md) - 5 分钟快速上手

## 端口说明

- 前端: `3000` (可在 docker-compose.yml 中修改)
- 后端: `3001` (可在 docker-compose.yml 中修改)

## 常见问题

### 1. GitHub API 速率限制

如果遇到 403 错误提示速率限制，请配置 `GITHUB_TOKEN`。未认证请求限制为 60 次/小时，认证后为 5000 次/小时。

### 2. 端口被占用

修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8080:80"  # 将前端改为 8080 端口
```

### 3. 无法访问服务

检查防火墙设置，确保端口已开放：
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp
```

## 维护

### 查看日志
```bash
./deploy.sh logs
# 或
docker-compose logs -f
```

### 更新服务
```bash
./deploy.sh update
# 或
git pull
docker-compose up -d --build
```

### 备份配置
```bash
cp backend/.env backend/.env.backup
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT
