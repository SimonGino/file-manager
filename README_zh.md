# 文件管理系统

[English](README.md) | [中文](README_zh.md)

一个使用 FastAPI 和 React 构建的现代文件管理系统，具有安全文件共享、访问控制和实时更新功能。

## 功能特性

- 📁 文件管理
  - 上传、下载和组织文件
  - 支持多种文件类型
  - 拖拽式界面
  - 文件预览

- 🔒 安全共享
  - 生成可共享链接
  - 密码保护选项
  - 过期时间设置
  - 访问控制管理

- 👥 用户管理
  - 用户认证
  - 基于角色的访问控制
  - 会话管理

- 🚀 现代技术栈
  - 前端：React + TypeScript + Ant Design
  - 后端：FastAPI + Python
  - 数据库：PostgreSQL
  - 存储：MinIO
  - 容器：Docker

## 环境要求

- Docker 和 Docker Compose
- Node.js 20+ (本地开发)
- Python 3.11+ (本地开发)
- PostgreSQL 15+
- MinIO

## 快速开始

1. 克隆仓库：
```bash
git clone https://github.com/your-username/file-manager.git
cd file-manager
```

2. 创建必要的目录：
```bash
mkdir -p ~/middleware/postgres/data
mkdir -p ~/middleware/minio/data
```

3. 在根目录创建 `.env` 文件：
```env
DATABASE_URL=postgresql+asyncpg://root:123456@postgres:5432/doc_management
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET_NAME=documents
JWT_SECRET_KEY=your_jwt_secret
```

4. 使用 Docker Compose 启动服务：
```bash
docker-compose up -d
```

5. 访问应用：
- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- MinIO 控制台：http://localhost:9001

## 开发设置

### 后端

1. 安装 PDM：
```bash
pip install pdm
```

2. 安装依赖：
```bash
cd backend
pdm install
```

3. 运行开发服务器：
```bash
pdm run python -m uvicorn src.main:app --reload
```

### 前端

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

## API 文档

后端服务运行后，可以通过以下地址访问 API 文档：
- Swagger UI：http://localhost:8000/docs
- ReDoc：http://localhost:8000/redoc

## Docker 镜像

项目使用 Docker 进行容器化：

- 后端：`ghcr.io/your-username/file-manager-backend:main`
- 前端：`ghcr.io/your-username/file-manager-frontend:main`

## 项目结构

```
.
├── frontend/                # React 前端应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── utils/         # 工具函数
│   │   └── types/         # TypeScript 类型定义
│   └── public/            # 静态文件
│
├── src/                    # FastAPI 后端应用
│   ├── api/               # API 路由
│   ├── core/              # 核心功能
│   ├── db/                # 数据库模型和配置
│   ├── schemas/           # Pydantic 模型
│   └── services/          # 业务逻辑
│
├── docker/                # Docker 相关文件
├── .github/               # GitHub Actions 工作流
└── docker-compose.yml     # Docker Compose 配置
```

## 参与贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加一些很棒的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 致谢

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [MinIO](https://min.io/)
- [PDM](https://pdm.fming.dev/) 