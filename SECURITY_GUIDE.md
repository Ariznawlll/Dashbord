# 安全指南 - 处理泄露的 Token

## ⚠️ 紧急情况：Token 已泄露

你的 GitHub Token 已经被 GitHub 检测到并阻止推送。这是一个**严重的安全问题**。

### 🔴 立即执行以下步骤

#### 1. 撤销泄露的 Token（最重要！）

```
1. 访问: https://github.com/settings/tokens
2. 找到名为 "dashboard" 或类似的 token
3. 点击 "Delete" 按钮删除
4. 确认删除
```

**为什么必须删除？**
- Token 已经暴露在 Git 历史中
- 任何人都可能已经看到并复制了这个 token
- 攻击者可以使用这个 token 访问你的 GitHub 账号

#### 2. 生成新的 Token

```
1. 访问: https://github.com/settings/tokens/new
2. 填写信息：
   - Note: Dashboard API Access
   - Expiration: 90 days（推荐）
   - 勾选权限: repo 或 public_repo
3. 点击 "Generate token"
4. 复制新的 token（只显示一次！）
```

#### 3. 更新本地配置

```bash
cd dashboard/backend

# 编辑 .env 文件
vim .env

# 将 GITHUB_TOKEN 改为新生成的 token
GITHUB_TOKEN=ghp_新的token
```

#### 4. 清理 Git 历史（可选但推荐）

如果 token 已经被提交到 Git 历史中，需要清理：

```bash
cd dashboard

# 方法 1：使用 git filter-branch（简单但会改变历史）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# 方法 2：使用 BFG Repo-Cleaner（推荐，更快）
# 下载 BFG: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files backend/.env

# 强制推送（会覆盖远程历史）
git push origin --force --all
```

⚠️ **注意**：强制推送会改变 Git 历史，如果有其他人在协作，需要通知他们重新 clone 仓库。

---

## 🔒 防止未来泄露

### 1. 使用 .gitignore

确保 `.env` 文件在 `.gitignore` 中：

```gitignore
# Environment variables
.env
.env.local
.env.*.local
backend/.env
frontend/.env
**/.env
```

### 2. 使用 .env.example

提供一个示例文件，不包含真实的敏感信息：

```bash
# backend/.env.example
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=your-org/your-repo
```

### 3. 提交前检查

```bash
# 查看将要提交的文件
git status

# 查看文件内容
git diff

# 确保没有敏感信息
grep -r "ghp_" .
grep -r "sk-" .
grep -r "password" .
```

### 4. 使用 pre-commit hook

创建 `.git/hooks/pre-commit` 文件：

```bash
#!/bin/bash

# 检查是否包含敏感信息
if git diff --cached | grep -E "(ghp_|sk-|password|secret|token)" > /dev/null; then
    echo "❌ 检测到敏感信息！"
    echo "请检查你的提交内容"
    exit 1
fi
```

### 5. 使用环境变量管理工具

- **开发环境**: 使用 `.env` 文件（不提交到 Git）
- **生产环境**: 使用环境变量或密钥管理服务
  - GitHub Secrets（用于 CI/CD）
  - AWS Secrets Manager
  - HashiCorp Vault
  - Kubernetes Secrets

---

## 📋 安全检查清单

### 提交代码前

- [ ] 检查 `.gitignore` 是否包含 `.env`
- [ ] 确认 `.env` 文件未被 Git 追踪
- [ ] 查看 `git status` 确认没有敏感文件
- [ ] 使用 `git diff` 检查更改内容
- [ ] 搜索代码中是否有硬编码的密钥

### 发现泄露后

- [ ] 立即撤销泄露的密钥/token
- [ ] 生成新的密钥/token
- [ ] 更新所有使用该密钥的地方
- [ ] 从 Git 历史中移除敏感信息
- [ ] 检查是否有异常访问记录
- [ ] 通知团队成员

### 长期维护

- [ ] 定期轮换密钥（建议 90 天）
- [ ] 使用最小权限原则
- [ ] 启用 GitHub Secret Scanning
- [ ] 定期审计访问日志
- [ ] 使用密钥管理服务

---

## 🛡️ GitHub Secret Scanning

GitHub 会自动扫描代码中的敏感信息：

### 支持的密钥类型

- GitHub Personal Access Tokens
- AWS Access Keys
- Azure Keys
- Google Cloud Keys
- Slack Tokens
- 等等...

### 如何处理告警

1. **收到告警邮件**
   - GitHub 会发送邮件通知
   - 告警会显示在仓库的 Security 标签

2. **处理步骤**
   - 立即撤销泄露的密钥
   - 从代码中移除
   - 生成新密钥
   - 更新配置

3. **标记为已解决**
   - 在 Security → Secret scanning 中
   - 选择告警
   - 点击 "Close as" → "Revoked"

---

## 📞 需要帮助？

### 如果 Token 已被滥用

1. **检查 GitHub 访问日志**
   ```
   Settings → Security log
   ```

2. **撤销所有 Token**
   ```
   Settings → Developer settings → Personal access tokens
   ```

3. **启用两步验证**
   ```
   Settings → Password and authentication
   ```

4. **联系 GitHub Support**
   ```
   https://support.github.com
   ```

### 相关资源

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

---

## ✅ 当前状态

运行 `cleanup-secrets.sh` 后：

- ✅ `.env` 文件已从 Git 追踪中移除
- ✅ `.gitignore` 已更新
- ✅ 创建了 `.env.example` 示例文件
- ✅ 原 `.env` 已备份到 `.env.backup`

### 下一步

1. **立即撤销旧 token**（最重要！）
2. 生成新 token
3. 更新 `backend/.env` 文件
4. 提交更改并推送

```bash
git add .gitignore backend/.env.example
git commit -m "chore: remove sensitive data and update gitignore"
git push origin main
```

---

**记住**：永远不要将敏感信息提交到 Git！
