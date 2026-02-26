# GitHub Actions Workflows

本目录包含项目的 CI/CD 自动化配置。

## 📁 Workflow 文件

### build-and-push.yml

自动构建和推送 Docker 镜像到公司镜像仓库。

**触发条件：**
- 推送到 `main`/`master`/`develop` 分支
- 推送 tag（如 `v1.0.0`）
- 创建 Pull Request
- 手动触发

**功能：**
- ✅ 自动构建前后端 Docker 镜像
- ✅ 推送到配置的镜像仓库
- ✅ 自动版本管理
- ✅ 构建缓存加速
- ✅ 生成部署信息

## 🔧 配置要求

需要在 GitHub 仓库设置中配置以下 Secrets：

| Secret | 说明 |
|--------|------|
| `DOCKER_REGISTRY` | 镜像仓库地址 |
| `DOCKER_USERNAME` | 用户名/AccessKey |
| `DOCKER_PASSWORD` | 密码/SecretKey |

## 📖 使用文档

- [CI/CD 快速开始](../../CI_CD_README.md)
- [详细配置指南](../../GITHUB_ACTIONS_SETUP.md)
- [Docker 部署文档](../../DOCKER_DEPLOYMENT.md)

## 🎯 版本策略

| 分支/Tag | 镜像标签 | 说明 |
|---------|---------|------|
| `main`/`master` | `latest` | 生产环境 |
| `develop` | `dev` | 开发环境 |
| `v1.0.0` | `v1.0.0` | 版本发布 |
| PR | `pr-123` | 预览版本 |

## 🚀 快速使用

```bash
# 发布新版本
git tag v1.0.0
git push origin v1.0.0

# 查看构建状态
# GitHub → Actions → 选择最新的 workflow run
```

## 📞 需要帮助？

查看 [GITHUB_ACTIONS_SETUP.md](../../GITHUB_ACTIONS_SETUP.md) 获取详细配置说明。
