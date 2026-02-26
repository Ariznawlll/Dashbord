# CI/CD 自动构建部署指南

使用 GitHub Actions 自动构建和推送 Docker 镜像到公司镜像仓库。

---

## 🚀 快速开始

### 1️⃣ 配置 GitHub Secrets（一次性）

在 GitHub 仓库设置中添加 3 个 secrets：

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `DOCKER_REGISTRY` | 镜像仓库地址 | `harbor.company.com/dashboard` |
| `DOCKER_USERNAME` | 用户名/AccessKey | `admin` 或 AK |
| `DOCKER_PASSWORD` | 密码/SecretKey | 密码或 SK |

> 💡 AKSK 由公司运维提供

### 2️⃣ 触发构建

#### 方式 A：推送代码（自动触发）

```bash
# 推送到 main → 构建 latest 版本
git push origin main

# 推送 tag → 构建指定版本
git tag v1.0.0
git push origin v1.0.0
```

#### 方式 B：手动触发

1. 进入 GitHub 仓库
2. 点击 `Actions` 标签
3. 选择 `Build and Push Docker Images`
4. 点击 `Run workflow`
5. 输入版本号（可选）
6. 点击 `Run workflow` 按钮

### 3️⃣ 查看构建状态

```
GitHub 仓库 → Actions → 选择最新的 workflow run
```

### 4️⃣ 部署到服务器

```bash
# 拉取镜像
docker pull harbor.company.com/dashboard/dashboard-backend:v1.0.0
docker pull harbor.company.com/dashboard/dashboard-frontend:v1.0.0

# 启动服务
cd /opt/dashboard
docker-compose up -d
```

---

## 📊 版本管理

| 操作 | 镜像标签 | 用途 |
|------|---------|------|
| `git push origin main` | `latest` | 最新稳定版 |
| `git push origin develop` | `dev` | 开发版本 |
| `git push origin v1.0.0` | `v1.0.0` | 正式版本 |
| 手动触发 | 自定义 | 测试版本 |

---

## 🔄 完整发布流程

```bash
# 1. 开发完成，推送到 develop
git checkout develop
git push origin develop
# → 自动构建 dev 版本，用于测试

# 2. 测试通过，合并到 main
git checkout main
git merge develop
git push origin main
# → 自动构建 latest 版本

# 3. 发布正式版本
git tag v1.0.0
git push origin v1.0.0
# → 自动构建 v1.0.0 版本，用于生产
```

---

## 📁 相关文件

- `.github/workflows/build-and-push.yml` - GitHub Actions 配置
- `GITHUB_ACTIONS_SETUP.md` - 详细配置指南
- `DOCKER_DEPLOYMENT.md` - Docker 部署文档

---

## ❓ 常见问题

### Q: 如何获取 AKSK？
A: 联系公司运维团队获取镜像仓库的访问凭证。

### Q: 构建失败怎么办？
A: 查看 Actions 页面的构建日志，检查错误信息。常见问题：
- Secrets 配置错误
- 镜像仓库权限不足
- 网络连接问题

### Q: 如何回滚版本？
A: 拉取之前的版本镜像重新部署：
```bash
docker pull harbor.company.com/dashboard/dashboard-backend:v1.0.0
docker-compose up -d
```

### Q: 可以构建多个平台的镜像吗？
A: 可以，修改 workflow 中的 `platforms` 参数：
```yaml
platforms: linux/amd64,linux/arm64
```

---

## 🎯 优势

✅ **自动化** - 推送代码自动构建，无需手动操作  
✅ **版本管理** - 自动根据分支/tag 生成版本号  
✅ **安全** - AKSK 存储在 GitHub Secrets，不会泄露  
✅ **快速** - 使用构建缓存，加速构建过程  
✅ **可追溯** - 每次构建都有完整日志记录  

---

## 📞 需要帮助？

- 详细配置：查看 [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
- Docker 部署：查看 [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- 快速部署：查看 [快速部署指南.md](./快速部署指南.md)
