# GitHub Actions CI/CD 自动构建方案

## 🎯 方案概述

使用 GitHub Actions 自动构建 Docker 镜像并推送到公司镜像仓库，无需在本地配置 AKSK。

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│  开发推送    │ ───> │ GitHub       │ ───> │ 自动构建     │ ───> │ 推送到仓库    │
│  代码/Tag   │      │ Actions      │      │ Docker镜像   │      │ (使用AKSK)   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
                                                                        │
                                                                        ▼
                                                                 ┌──────────────┐
                                                                 │ 服务器拉取    │
                                                                 │ 并部署       │
                                                                 └──────────────┘
```

## ✅ 优势

1. **安全性高** - AKSK 存储在 GitHub Secrets，不会泄露到本地
2. **自动化** - 推送代码自动触发构建，无需手动操作
3. **版本管理** - 自动根据分支/tag 生成版本号
4. **可追溯** - 每次构建都有完整日志
5. **团队协作** - 所有人都可以触发构建，无需配置本地环境

## 📁 创建的文件

### 1. GitHub Actions Workflow
- `.github/workflows/build-and-push.yml` - 自动构建配置

### 2. 配置文档
- `GITHUB_ACTIONS_SETUP.md` - 详细配置指南（如何设置 Secrets）
- `CI_CD_README.md` - 快速开始指南
- `.github/workflows/README.md` - Workflow 说明

### 3. 原有构建工具（保留）
- `build-images.sh` - 本地构建脚本（备用）
- `Makefile` - 命令简化工具（备用）

## 🚀 使用流程

### 第一次配置（运维协助）

1. **获取 AKSK**
   - 联系运维获取镜像仓库的 AccessKey 和 SecretKey
   - 获取镜像仓库地址（如 `harbor.company.com/dashboard`）

2. **配置 GitHub Secrets**
   ```
   GitHub 仓库 → Settings → Secrets and variables → Actions
   
   添加 3 个 secrets：
   - DOCKER_REGISTRY: harbor.company.com/dashboard
   - DOCKER_USERNAME: your-access-key
   - DOCKER_PASSWORD: your-secret-key
   ```

3. **测试构建**
   - 手动触发一次 workflow 验证配置正确

### 日常使用（开发人员）

#### 开发版本
```bash
git checkout develop
git push origin develop
# → 自动构建 dev 版本
```

#### 测试版本
```bash
git checkout main
git push origin main
# → 自动构建 latest 版本
```

#### 正式发布
```bash
git tag v1.0.0
git push origin v1.0.0
# → 自动构建 v1.0.0 版本
```

#### 手动触发
```
GitHub → Actions → Build and Push Docker Images → Run workflow
```

### 服务器部署

```bash
# 1. 登录镜像仓库
docker login harbor.company.com

# 2. 拉取镜像
docker pull harbor.company.com/dashboard/dashboard-backend:v1.0.0
docker pull harbor.company.com/dashboard/dashboard-frontend:v1.0.0

# 3. 部署
cd /opt/dashboard
docker-compose up -d
```

## 📊 版本管理策略

| 场景 | 操作 | 镜像标签 | 用途 |
|------|------|---------|------|
| 日常开发 | `push develop` | `dev` | 开发环境测试 |
| 集成测试 | `push main` | `latest` | 测试环境 |
| 正式发布 | `push v1.0.0` | `v1.0.0` | 生产环境 |
| 紧急修复 | `push v1.0.1` | `v1.0.1` | 生产环境 |
| 功能预览 | Pull Request | `pr-123` | 预览环境 |

## 🔧 Workflow 配置说明

### 触发条件

```yaml
on:
  push:
    branches: [main, master, develop]  # 推送分支触发
    tags: ['v*']                       # 推送 tag 触发
  pull_request:                        # PR 触发（仅构建不推送）
  workflow_dispatch:                   # 手动触发
```

### 构建步骤

1. ✅ Checkout 代码
2. ✅ 设置 Docker Buildx
3. ✅ 登录镜像仓库（使用 Secrets）
4. ✅ 提取版本信息
5. ✅ 构建后端镜像
6. ✅ 构建前端镜像
7. ✅ 推送到镜像仓库
8. ✅ 输出镜像信息

### 构建优化

- 使用 GitHub Actions 缓存加速构建
- 多阶段构建减小镜像体积
- 并行构建前后端镜像

## 📝 不同镜像仓库配置示例

### Harbor（推荐）
```
DOCKER_REGISTRY: harbor.company.com/dashboard
DOCKER_USERNAME: admin
DOCKER_PASSWORD: Harbor12345
```

### 阿里云 ACR
```
DOCKER_REGISTRY: registry.cn-hangzhou.aliyuncs.com/namespace
DOCKER_USERNAME: aliyun-access-key-id
DOCKER_PASSWORD: aliyun-access-key-secret
```

### 腾讯云 TCR
```
DOCKER_REGISTRY: ccr.ccs.tencentyun.com/namespace
DOCKER_USERNAME: tencent-secret-id
DOCKER_PASSWORD: tencent-secret-key
```

## 🛠️ 故障排查

### 问题 1：登录失败
```
Error: Cannot perform an interactive login
```
**解决**：检查 Secrets 配置，确保没有多余空格

### 问题 2：推送失败
```
denied: requested access to the resource is denied
```
**解决**：检查账号权限，确认命名空间存在

### 问题 3：构建超时
```
The job has exceeded the maximum execution time
```
**解决**：检查网络，使用构建缓存

## 📞 获取帮助

### 文档
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - 详细配置指南
- [CI_CD_README.md](./CI_CD_README.md) - 快速开始
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Docker 部署

### 查看构建日志
```
GitHub → Actions → 选择 workflow run → 查看详细日志
```

### 联系运维
- 获取 AKSK
- 配置镜像仓库权限
- 解决网络问题

## ✅ 配置检查清单

### 首次配置
- [ ] 已获取镜像仓库 AKSK
- [ ] 已添加 DOCKER_REGISTRY secret
- [ ] 已添加 DOCKER_USERNAME secret
- [ ] 已添加 DOCKER_PASSWORD secret
- [ ] 已手动触发测试构建
- [ ] 构建成功并推送到仓库

### 日常使用
- [ ] 推送代码自动触发构建
- [ ] 可以查看构建日志
- [ ] 可以从仓库拉取镜像
- [ ] 服务器可以正常部署

## 🎉 总结

使用 GitHub Actions 后：

✅ **开发人员**：只需推送代码，无需配置 AKSK  
✅ **运维人员**：统一管理 AKSK，提高安全性  
✅ **团队协作**：所有人都可以触发构建  
✅ **版本管理**：自动化版本标签，清晰可追溯  

---

**下一步**：联系运维获取 AKSK，按照 [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) 配置 Secrets！
