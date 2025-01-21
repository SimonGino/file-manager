# File Manager

[English](README.md) | [中文](README_zh.md)

A modern file management system built with FastAPI and React, featuring secure file sharing, access control, and real-time updates.

## Features

- 📁 File Management
  - Upload, download, and organize files
  - Support for multiple file types
  - Drag and drop interface
  - File preview

- 🔒 Secure Sharing
  - Generate shareable links
  - Password protection option
  - Expiration date setting
  - Access control management

- 👥 User Management
  - User authentication
  - Role-based access control
  - Session management

- 🚀 Modern Tech Stack
  - Frontend: React + TypeScript + Ant Design
  - Backend: FastAPI + Python
  - Database: PostgreSQL
  - Storage: MinIO
  - Container: Docker

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL 15+
- MinIO

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/file-manager.git
cd file-manager
```

2. Create necessary directories:
```bash
mkdir -p ~/middleware/postgres/data
mkdir -p ~/middleware/minio/data
```

3. Create `.env` file in the root directory:
```env
DATABASE_URL=postgresql+asyncpg://root:123456@postgres:5432/doc_management
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET_NAME=documents
JWT_SECRET_KEY=your_jwt_secret
```

4. Start the services using Docker Compose:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- MinIO Console: http://localhost:9001

## Development Setup

### Backend

1. Install PDM:
```bash
pip install pdm
```

2. Install dependencies:
```bash
cd backend
pdm install
```

3. Run the development server:
```bash
pdm run python -m uvicorn src.main:app --reload
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Images

The project uses Docker for containerization:

- Backend: `ghcr.io/your-username/file-manager-backend:main`
- Frontend: `ghcr.io/your-username/file-manager-frontend:main`

## Project Structure

```
.
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static files
│
├── src/                    # FastAPI backend application
│   ├── api/               # API routes
│   ├── core/              # Core functionality
│   ├── db/                # Database models and config
│   ├── schemas/           # Pydantic models
│   └── services/          # Business logic
│
├── docker/                # Docker related files
├── .github/               # GitHub Actions workflows
└── docker-compose.yml     # Docker Compose configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [MinIO](https://min.io/)
- [PDM](https://pdm.fming.dev/)
