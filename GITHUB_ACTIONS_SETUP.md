# GitHub Actions 自动构建配置指南

本文档说明如何配置 GitHub Actions 自动构建和推送 Docker 镜像到公司镜像仓库。

---

## 📋 前置要求

1. 项目代码已推送到 GitHub
2. 有公司镜像仓库的访问权限（AKSK）
3. 有 GitHub 仓库的管理员权限

---

## 🔐 第一步：配置 GitHub Secrets

### 1. 进入仓库设置

```
GitHub 仓库页面 → Settings → Secrets and variables → Actions → New repository secret
```

### 2. 添加以下 Secrets

需要添加 3 个 secrets：

#### DOCKER_REGISTRY
- **名称**: `DOCKER_REGISTRY`
- **值**: 镜像仓库地址
- **示例**: 
  - Harbor: `harbor.company.com/project`
  - 阿里云: `registry.cn-hangzhou.aliyuncs.com/namespace`
  - 腾讯云: `ccr.ccs.tencentyun.com/namespace`

#### DOCKER_USERNAME
- **名称**: `DOCKER_USERNAME`
- **值**: 镜像仓库用户名
- **示例**: 
  - Harbor: `admin` 或你的用户名
  - 阿里云: 阿里云账号的 AccessKey ID
  - 腾讯云: 腾讯云账号的 SecretId

#### DOCKER_PASSWORD
- **名称**: `DOCKER_PASSWORD`
- **值**: 镜像仓库密码或 Token
- **示例**: 
  - Harbor: 你的密码
  - 阿里云: 阿里云账号的 AccessKey Secret
  - 腾讯云: 腾讯云账号的 SecretKey

### 3. 验证配置

配置完成后，Secrets 列表应该显示：

```
DOCKER_REGISTRY
DOCKER_USERNAME
DOCKER_PASSWORD
```

---

## 🚀 第二步：触发构建

### 方式一：推送代码触发

```bash
# 推送到 main/master 分支 → 构建 latest 版本
git push origin main

# 推送到 develop 分支 → 构建 dev 版本
git push origin develop

# 推送 tag → 构建对应版本
git tag v1.0.0
git push origin v1.0.0
```

### 方式二：手动触发

1. 进入 GitHub 仓库页面
2. 点击 `Actions` 标签
3. 选择 `Build and Push Docker Images` workflow
4. 点击 `Run workflow`
5. 输入版本号（可选，默认 latest）
6. 点击 `Run workflow` 按钮

### 方式三：Pull Request 触发

创建 Pull Request 时会自动触发构建（但不会推送镜像）

---

## 📊 第三步：查看构建状态

### 1. 查看 Actions 页面

```
GitHub 仓库 → Actions → 选择最新的 workflow run
```

### 2. 查看构建日志

点击具体的 job 可以查看详细日志：
- Checkout 代码
- 设置 Docker Buildx
- 登录镜像仓库
- 构建并推送后端镜像
- 构建并推送前端镜像
- 输出镜像信息

### 3. 下载部署说明

如果是 tag 触发的构建，可以下载 `deployment-info.txt` 文件，包含：
- 版本信息
- 镜像地址
- 部署命令

---

## 🎯 版本管理策略

### 自动版本标签

| 触发方式 | 镜像标签 | 说明 |
|---------|---------|------|
| push main/master | `latest` | 最新稳定版本 |
| push develop | `dev` | 开发版本 |
| push tag v1.0.0 | `v1.0.0` | 具体版本号 |
| Pull Request | `pr-123` | PR 预览版本 |
| 手动触发 | 自定义 | 指定版本号 |

### 推荐的版本发布流程

```bash
# 1. 开发完成后，合并到 develop 分支
git checkout develop
git merge feature/xxx
git push origin develop
# → 自动构建 dev 版本

# 2. 测试通过后，合并到 main 分支
git checkout main
git merge develop
git push origin main
# → 自动构建 latest 版本

# 3. 发布正式版本，打 tag
git tag v1.0.0
git push origin v1.0.0
# → 自动构建 v1.0.0 版本
```

---

## 🔧 Workflow 配置说明

### 触发条件

```yaml
on:
  push:
    branches: [main, master, develop]  # 推送到这些分支时触发
    tags: ['v*']                       # 推送 v 开头的 tag 时触发
  pull_request:
    branches: [main, master]           # PR 到这些分支时触发
  workflow_dispatch:                   # 允许手动触发
```

### 构建特性

- ✅ 多平台支持（linux/amd64）
- ✅ 构建缓存（加速构建）
- ✅ 自动版本管理
- ✅ 构建日志详细
- ✅ 失败通知

---

## 📝 不同镜像仓库的配置示例

### Harbor（推荐）

```
DOCKER_REGISTRY: harbor.company.com/dashboard
DOCKER_USERNAME: admin
DOCKER_PASSWORD: Harbor12345
```

### 阿里云容器镜像服务

```
DOCKER_REGISTRY: registry.cn-hangzhou.aliyuncs.com/your-namespace
DOCKER_USERNAME: your-aliyun-access-key-id
DOCKER_PASSWORD: your-aliyun-access-key-secret
```

### 腾讯云容器镜像服务

```
DOCKER_REGISTRY: ccr.ccs.tencentyun.com/your-namespace
DOCKER_USERNAME: your-tencent-secret-id
DOCKER_PASSWORD: your-tencent-secret-key
```

### Docker Hub（公开）

```
DOCKER_REGISTRY: docker.io/your-username
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-dockerhub-password
```

---

## 🛠️ 故障排查

### 问题 1：登录镜像仓库失败

**错误信息**: `Error: Cannot perform an interactive login from a non TTY device`

**解决方案**:
- 检查 Secrets 配置是否正确
- 确认用户名和密码没有多余的空格
- 验证镜像仓库地址格式正确

### 问题 2：推送镜像失败

**错误信息**: `denied: requested access to the resource is denied`

**解决方案**:
- 确认账号有推送权限
- 检查命名空间/项目是否存在
- 验证镜像名称格式正确

### 问题 3：构建超时

**错误信息**: `The job running on runner xxx has exceeded the maximum execution time`

**解决方案**:
- 检查网络连接
- 使用构建缓存加速
- 考虑使用自托管 runner

### 问题 4：Secrets 未生效

**解决方案**:
- 确认 Secrets 名称完全匹配（区分大小写）
- 重新保存 Secrets
- 重新触发 workflow

---

## 📞 获取帮助

### 查看 Workflow 文件

```bash
cat .github/workflows/build-and-push.yml
```

### 测试本地构建

```bash
# 使用相同的 Dockerfile 本地测试
docker build -t test-backend -f backend/Dockerfile backend/
docker build -t test-frontend -f frontend/Dockerfile frontend/
```

### 联系运维

如果遇到镜像仓库相关问题，请联系公司运维团队获取：
- 镜像仓库地址
- 访问凭证（AKSK）
- 命名空间/项目权限

---

## ✅ 配置检查清单

配置前：
- [ ] 已有 GitHub 仓库
- [ ] 已获取镜像仓库 AKSK
- [ ] 已有仓库管理员权限

配置时：
- [ ] 已添加 DOCKER_REGISTRY secret
- [ ] 已添加 DOCKER_USERNAME secret
- [ ] 已添加 DOCKER_PASSWORD secret
- [ ] Secrets 值无多余空格

配置后：
- [ ] 手动触发 workflow 测试
- [ ] 构建成功
- [ ] 镜像成功推送
- [ ] 可以从仓库拉取镜像

---

## 🎉 完成

配置完成后，每次推送代码或打 tag，GitHub Actions 会自动：

1. ✅ 构建 Docker 镜像
2. ✅ 推送到公司镜像仓库
3. ✅ 生成部署信息

你只需要在服务器上拉取镜像并部署即可！

```bash
# 服务器上
docker pull harbor.company.com/dashboard/dashboard-backend:v1.0.0
docker pull harbor.company.com/dashboard/dashboard-frontend:v1.0.0
docker-compose up -d
```
