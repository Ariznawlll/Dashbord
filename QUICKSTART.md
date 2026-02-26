# 快速启动指南

## 第一步：配置后端

```bash
cd dashboard/backend
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
PORT=3001

# GitHub 配置
GITHUB_TOKEN=ghp_your_token_here
GITHUB_REPO=your-org/your-repo

# Loki 配置（JSON 数组格式）
LOKI_ENDPOINTS=[{"name":"单元测试","url":"http://loki1.example.com:3100"},{"name":"集成测试","url":"http://loki2.example.com:3100"}]

# 监控系统配置
MONITORING_API_URL=http://your-monitoring-system.com/api
MONITORING_API_KEY=your_api_key
```

## 第二步：启动开发环境

### 启动后端
```bash
cd dashboard/backend
npm install
npm run dev
```

后端将运行在 http://localhost:3001

### 启动前端
```bash
cd dashboard/frontend
npm install
npm run dev
```

前端将运行在 http://localhost:3000

## 第三步：Docker 部署（生产环境）

```bash
cd dashboard
docker-compose up -d
```

访问 http://localhost:3000 查看看板

## 获取 GitHub Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token

## 自定义配置

### Bug 标签识别
修改 `backend/src/services/github.ts` 中的标签过滤逻辑

### Loki 查询语句
修改 `frontend/src/components/LokiMonitor.tsx` 中的查询语句

### 监控指标
修改 `backend/src/services/monitoring.ts` 对接你的监控系统 API
