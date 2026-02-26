#!/bin/bash

# 清理敏感信息脚本

echo "🔒 清理 Git 中的敏感信息..."
echo ""

# 1. 备份当前的 .env 文件
if [ -f "backend/.env" ]; then
    echo "📦 备份 backend/.env 到 backend/.env.backup"
    cp backend/.env backend/.env.backup
fi

# 2. 从 Git 缓存中移除 .env 文件
echo "🗑️  从 Git 缓存中移除 .env 文件..."
git rm --cached backend/.env 2>/dev/null || echo "  backend/.env 未被追踪"
git rm --cached frontend/.env 2>/dev/null || echo "  frontend/.env 未被追踪"

# 3. 更新 .gitignore
echo "📝 更新 .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*/dist/
*/build/

# Environment variables (重要：不要提交到 Git)
.env
.env.local
.env.*.local
backend/.env
frontend/.env
**/.env

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Test coverage
coverage/

# Temporary files
*.tmp
*.temp
EOF

# 4. 创建安全的 .env.example 文件
echo "📄 创建 backend/.env.example..."
cat > backend/.env.example << 'EOF'
# Server
PORT=3001

# GitHub（必须配置）
GITHUB_TOKEN=your_github_token_here
GITHUB_REPO=matrixorigin/matrixone

# Loki 日志监控配置（JSON 格式）
LOKI_ENDPOINTS=[{"name":"TKE测试日志","url":"https://grafana.ci.matrixorigin.cn/..."}]

# 性能监控配置（JSON 格式）
PERFORMANCE_MONITORS=[{"category":"单机测试性能","items":[{"name":"SSB 1G","url":"https://..."}]}]
EOF

echo ""
echo "✅ 清理完成！"
echo ""
echo "⚠️  重要提示："
echo "1. 你的 GitHub Token 已经泄露，需要立即撤销！"
echo "   访问: https://github.com/settings/tokens"
echo "   删除旧 token，生成新的 token"
echo ""
echo "2. 在服务器上使用新的 token："
echo "   编辑 backend/.env 文件（已备份到 backend/.env.backup）"
echo "   将 GITHUB_TOKEN 改为新生成的 token"
echo ""
echo "3. 提交更改："
echo "   git add .gitignore backend/.env.example"
echo "   git commit -m 'chore: remove sensitive data and update gitignore'"
echo "   git push origin main"
echo ""
