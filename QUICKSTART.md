# eFront 快速启动指南

## 🚀 快速开始（3步启动）

### 方式一：使用 Docker（推荐）

```bash
# 1. 复制环境变量文件
cp .env.example .env

# 2. 启动所有服务
docker-compose up -d

# 3. 初始化数据库
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

访问：http://localhost

登录账号：`admin@efront.com` / `admin123`

### 方式二：本地开发

#### 后端启动

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置 DATABASE_URL

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 初始化数据
npx prisma db seed

# 启动开发服务器
npm run dev
```

后端运行在：http://localhost:3000

#### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env.local

# 启动开发服务器
npm run dev
```

前端运行在：http://localhost:5173

## 📋 系统要求

- Node.js 20+
- MySQL 8.0+ 或 Docker
- npm 或 yarn

## 🎯 核心功能

1. **基金管理** - 创建和管理多个基金
2. **投资管理** - 跟踪投资组合公司
3. **投资者关系** - 管理LP关系
4. **绩效分析** - IRR、MOIC、DPI等指标
5. **资本运作** - 资本催缴和分配

## 🔑 默认账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| admin@efront.com | admin123 | 管理员 |

## 📚 项目结构

```
coke-efront-v5/
├── backend/          # Express + TypeScript + Prisma + MySQL
├── frontend/         # React + TypeScript + TailAdmin
├── doc/              # 文档（功能调研、UI文档、技术方案）
└── docker-compose.yml
```

## 🛠️ 常用命令

### Docker

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重建并启动
docker-compose up -d --build

# 进入后端容器
docker-compose exec backend sh

# 查看数据库
docker-compose exec backend npx prisma studio
```

### 后端

```bash
cd backend

# 开发模式
npm run dev

# 生产构建
npm run build
npm start

# Prisma Studio (数据库GUI)
npm run prisma:studio

# 创建迁移
npx prisma migrate dev --name migration_name
```

### 前端

```bash
cd frontend

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview
```

## 📊 API测试

### 健康检查
```bash
curl http://localhost:3000/health
```

### 登录
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@efront.com","password":"admin123"}'
```

### 获取基金列表
```bash
curl http://localhost:3000/api/v1/funds \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 故障排除

### 数据库连接失败
```bash
# 检查MySQL是否运行
docker-compose ps mysql

# 查看MySQL日志
docker-compose logs mysql

# 重启MySQL
docker-compose restart mysql
```

### 端口被占用
```bash
# 修改 docker-compose.yml 中的端口映射
# 例如：将 "80:80" 改为 "8080:80"
```

### 前端无法连接后端
```bash
# 检查 .env.local 中的 VITE_API_URL
# 确保与后端地址匹配
```

## 📖 详细文档

- [完整README](./README.md)
- [eFront功能调研报告](./doc/eFront功能调研报告.md)
- [UI交互文档](./doc/UI交互文档.md)
- [技术方案](./doc/技术方案.md)

## 🎨 技术栈

**前端**
- React 19 + TypeScript
- TailAdmin (Tailwind CSS)
- Redux Toolkit
- ApexCharts

**后端**
- Express + TypeScript
- Prisma ORM
- MySQL 8
- JWT认证

**部署**
- Docker + Docker Compose
- Nginx

## 📞 支持

遇到问题？
1. 查看[完整README](./README.md)
2. 检查[技术方案](./doc/技术方案.md)
3. 创建 Issue

---

**Happy Coding!** 🎉
