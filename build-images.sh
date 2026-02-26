#!/bin/bash

# Docker 镜像构建脚本
# 用于构建前端和后端的 Docker 镜像

set -e

# 配置
REGISTRY="your-registry.com"  # 修改为你的镜像仓库地址
PROJECT_NAME="dashboard"
VERSION="${1:-latest}"  # 默认版本为 latest，可通过参数指定

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 镜像名称
BACKEND_IMAGE="${REGISTRY}/${PROJECT_NAME}-backend:${VERSION}"
FRONTEND_IMAGE="${REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}"

print_info "开始构建 Docker 镜像..."
print_info "版本: ${VERSION}"
echo ""

# 构建后端镜像
print_info "构建后端镜像: ${BACKEND_IMAGE}"
docker build -t ${BACKEND_IMAGE} -f backend/Dockerfile backend/

if [ $? -eq 0 ]; then
    print_info "✓ 后端镜像构建成功"
else
    print_warn "✗ 后端镜像构建失败"
    exit 1
fi

echo ""

# 构建前端镜像
print_info "构建前端镜像: ${FRONTEND_IMAGE}"
docker build -t ${FRONTEND_IMAGE} -f frontend/Dockerfile frontend/

if [ $? -eq 0 ]; then
    print_info "✓ 前端镜像构建成功"
else
    print_warn "✗ 前端镜像构建失败"
    exit 1
fi

echo ""
print_info "所有镜像构建完成！"
echo ""
print_info "镜像列表:"
echo "  - ${BACKEND_IMAGE}"
echo "  - ${FRONTEND_IMAGE}"
echo ""

# 询问是否推送到镜像仓库
read -p "是否推送镜像到仓库? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "推送后端镜像..."
    docker push ${BACKEND_IMAGE}
    
    print_info "推送前端镜像..."
    docker push ${FRONTEND_IMAGE}
    
    print_info "✓ 镜像推送完成"
    echo ""
    print_info "部署命令:"
    echo "  docker pull ${BACKEND_IMAGE}"
    echo "  docker pull ${FRONTEND_IMAGE}"
else
    print_info "跳过推送"
    echo ""
    print_info "本地测试命令:"
    echo "  docker-compose up -d"
fi

echo ""
print_info "保存镜像到文件（可选）:"
echo "  docker save ${BACKEND_IMAGE} -o dashboard-backend-${VERSION}.tar"
echo "  docker save ${FRONTEND_IMAGE} -o dashboard-frontend-${VERSION}.tar"
