#!/bin/bash

# 测试监控看板 - 快速部署脚本
# 使用方法: ./deploy.sh [start|stop|restart|logs|build]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 和 Docker Compose
check_requirements() {
    print_info "检查环境要求..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    print_info "环境检查通过 ✓"
}

# 检查配置文件
check_config() {
    print_info "检查配置文件..."
    
    if [ ! -f "backend/.env" ]; then
        print_warn "backend/.env 文件不存在"
        if [ -f "backend/.env.example" ]; then
            print_info "从 .env.example 创建 .env 文件..."
            cp backend/.env.example backend/.env
            print_warn "请编辑 backend/.env 文件，配置必要的环境变量"
            print_warn "特别是 GITHUB_TOKEN 和 GITHUB_REPO"
            read -p "按回车键继续..."
        else
            print_error "backend/.env.example 文件也不存在"
            exit 1
        fi
    fi
    
    print_info "配置文件检查完成 ✓"
}

# 启动服务
start_services() {
    print_info "启动服务..."
    docker-compose up -d
    
    print_info "等待服务启动..."
    sleep 5
    
    print_info "服务状态:"
    docker-compose ps
    
    echo ""
    print_info "部署完成！"
    print_info "前端访问地址: http://localhost:3000"
    print_info "后端 API 地址: http://localhost:3001"
    echo ""
    print_info "查看日志: ./deploy.sh logs"
}

# 停止服务
stop_services() {
    print_info "停止服务..."
    docker-compose down
    print_info "服务已停止 ✓"
}

# 重启服务
restart_services() {
    print_info "重启服务..."
    docker-compose restart
    print_info "服务已重启 ✓"
}

# 查看日志
show_logs() {
    docker-compose logs -f
}

# 构建镜像
build_images() {
    print_info "构建 Docker 镜像..."
    docker-compose build --no-cache
    print_info "镜像构建完成 ✓"
}

# 更新部署
update_deployment() {
    print_info "更新部署..."
    
    print_info "拉取最新代码..."
    git pull
    
    print_info "重新构建镜像..."
    docker-compose build
    
    print_info "重启服务..."
    docker-compose up -d
    
    print_info "更新完成 ✓"
}

# 显示帮助信息
show_help() {
    echo "测试监控看板 - 部署脚本"
    echo ""
    echo "使用方法:"
    echo "  ./deploy.sh [命令]"
    echo ""
    echo "可用命令:"
    echo "  start     - 启动服务（默认）"
    echo "  stop      - 停止服务"
    echo "  restart   - 重启服务"
    echo "  logs      - 查看日志"
    echo "  build     - 重新构建镜像"
    echo "  update    - 更新部署（拉取代码并重新构建）"
    echo "  status    - 查看服务状态"
    echo "  help      - 显示此帮助信息"
    echo ""
}

# 查看状态
show_status() {
    print_info "服务状态:"
    docker-compose ps
    echo ""
    print_info "资源使用:"
    docker stats --no-stream $(docker-compose ps -q)
}

# 主函数
main() {
    case "${1:-start}" in
        start)
            check_requirements
            check_config
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            show_logs
            ;;
        build)
            check_requirements
            build_images
            ;;
        update)
            check_requirements
            update_deployment
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
