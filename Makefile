# Dashboard 项目 Makefile
# 简化常用操作

# 配置
REGISTRY ?= your-registry.com
PROJECT ?= dashboard
VERSION ?= latest

BACKEND_IMAGE = $(REGISTRY)/$(PROJECT)-backend:$(VERSION)
FRONTEND_IMAGE = $(REGISTRY)/$(PROJECT)-frontend:$(VERSION)

.PHONY: help build build-backend build-frontend push pull deploy clean logs

# 默认目标
help:
	@echo "Dashboard 项目管理命令："
	@echo ""
	@echo "  make build          - 构建所有镜像"
	@echo "  make build-backend  - 只构建后端镜像"
	@echo "  make build-frontend - 只构建前端镜像"
	@echo "  make push           - 推送镜像到仓库"
	@echo "  make pull           - 从仓库拉取镜像"
	@echo "  make deploy         - 部署服务（docker-compose）"
	@echo "  make stop           - 停止服务"
	@echo "  make restart        - 重启服务"
	@echo "  make logs           - 查看日志"
	@echo "  make clean          - 清理容器和镜像"
	@echo "  make save           - 保存镜像为文件"
	@echo ""
	@echo "环境变量："
	@echo "  REGISTRY=$(REGISTRY)"
	@echo "  VERSION=$(VERSION)"
	@echo ""
	@echo "示例："
	@echo "  make build VERSION=v1.0.0"
	@echo "  make push REGISTRY=harbor.company.com/project"

# 构建所有镜像
build: build-backend build-frontend
	@echo "✓ 所有镜像构建完成"

# 构建后端镜像
build-backend:
	@echo "构建后端镜像: $(BACKEND_IMAGE)"
	docker build -t $(BACKEND_IMAGE) -f backend/Dockerfile backend/
	@echo "✓ 后端镜像构建完成"

# 构建前端镜像
build-frontend:
	@echo "构建前端镜像: $(FRONTEND_IMAGE)"
	docker build -t $(FRONTEND_IMAGE) -f frontend/Dockerfile frontend/
	@echo "✓ 前端镜像构建完成"

# 推送镜像到仓库
push:
	@echo "推送镜像到仓库..."
	docker push $(BACKEND_IMAGE)
	docker push $(FRONTEND_IMAGE)
	@echo "✓ 镜像推送完成"

# 从仓库拉取镜像
pull:
	@echo "从仓库拉取镜像..."
	docker pull $(BACKEND_IMAGE)
	docker pull $(FRONTEND_IMAGE)
	@echo "✓ 镜像拉取完成"

# 部署服务
deploy:
	@echo "部署服务..."
	docker-compose up -d
	@echo "✓ 服务部署完成"
	@echo ""
	@make status

# 停止服务
stop:
	@echo "停止服务..."
	docker-compose stop
	@echo "✓ 服务已停止"

# 重启服务
restart:
	@echo "重启服务..."
	docker-compose restart
	@echo "✓ 服务已重启"

# 查看服务状态
status:
	@echo "服务状态："
	@docker-compose ps

# 查看日志
logs:
	docker-compose logs -f

# 清理容器和镜像
clean:
	@echo "清理容器和镜像..."
	docker-compose down
	docker rmi $(BACKEND_IMAGE) $(FRONTEND_IMAGE) || true
	@echo "✓ 清理完成"

# 保存镜像为文件
save:
	@echo "保存镜像为文件..."
	docker save $(BACKEND_IMAGE) -o dashboard-backend-$(VERSION).tar
	docker save $(FRONTEND_IMAGE) -o dashboard-frontend-$(VERSION).tar
	gzip dashboard-backend-$(VERSION).tar
	gzip dashboard-frontend-$(VERSION).tar
	@echo "✓ 镜像已保存："
	@ls -lh dashboard-*.tar.gz

# 加载镜像文件
load:
	@echo "加载镜像文件..."
	gunzip -k dashboard-backend-$(VERSION).tar.gz || true
	gunzip -k dashboard-frontend-$(VERSION).tar.gz || true
	docker load -i dashboard-backend-$(VERSION).tar
	docker load -i dashboard-frontend-$(VERSION).tar
	@echo "✓ 镜像加载完成"

# 完整构建和推送流程
release: build push
	@echo "✓ 发布完成"
	@echo ""
	@echo "镜像信息："
	@echo "  后端: $(BACKEND_IMAGE)"
	@echo "  前端: $(FRONTEND_IMAGE)"

# 开发环境启动
dev:
	@echo "启动开发环境..."
	docker-compose -f docker-compose.yml up -d
	@echo "✓ 开发环境已启动"

# 生产环境启动
prod:
	@echo "启动生产环境..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✓ 生产环境已启动"
