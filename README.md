# eFront - Private Equity Fund Management System

A comprehensive, modern web-based system for managing private equity funds, investments, and investor relations.

## Features

- **Fund Management**: Create and manage multiple funds with detailed tracking of metrics (IRR, MOIC, DPI, RVPI, TVPI)
- **Investment Management**: Track portfolio companies and their performance
- **Investor Relations**: Manage LP relationships and capital accounts
- **Capital Operations**: Handle capital calls and distributions
- **Performance Analytics**: Real-time performance tracking and reporting
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Dashboard**: Interactive dashboards with data visualization

## Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **TailAdmin** - Beautiful Tailwind CSS admin template
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **ApexCharts** - Data visualization
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Node.js 20** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **Prisma** - Type-safe ORM
- **MySQL 8** - Relational database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Request validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server (frontend)
- **Redis** - Caching (optional)

## Project Structure

```
coke-efront-v5/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── modules/           # Business modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── funds/         # Fund management
│   │   │   ├── investments/   # Investment management
│   │   │   └── investors/     # Investor management
│   │   ├── shared/            # Shared utilities
│   │   ├── database/          # Database connection
│   │   ├── app.ts             # Express app
│   │   └── server.ts          # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                   # Frontend application
│   ├── src/
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── funds/         # Fund management
│   │   │   └── dashboard/     # Dashboard
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── nginx.conf
│
├── doc/                        # Documentation
│   ├── eFront功能调研报告.md
│   ├── UI交互文档.md
│   └── 技术方案.md
│
├── docker-compose.yml          # Docker Compose configuration
├── .env.example               # Environment variables example
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- **Docker** and **Docker Compose** (recommended)
- OR **Node.js 20+**, **MySQL 8**, and **npm/yarn**

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   cd /mnt/d/home/coke-efront-v5
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env and update the values (especially JWT secrets in production)
   ```

3. **Start services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations and seed**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npx prisma db seed
   ```

5. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api/v1

6. **Login with demo credentials**
   - Email: `admin@efront.com`
   - Password: `admin123`

### Manual Setup (Without Docker)

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env and configure DATABASE_URL and other variables
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Seed database**
   ```bash
   npx prisma db seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

The backend will be running at http://localhost:3000

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env.local file
   echo "VITE_API_URL=http://localhost:3000/api/v1" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The frontend will be running at http://localhost:5173

## Development

### Backend Development

```bash
cd backend

# Run in development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run Prisma Studio (database GUI)
npm run prisma:studio

# Create new migration
npx prisma migrate dev --name migration_name

# Run tests
npm test
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update profile
- `POST /auth/change-password` - Change password

### Fund Endpoints

- `GET /funds` - Get all funds (with pagination, filters)
- `POST /funds` - Create new fund
- `GET /funds/:id` - Get fund details
- `PUT /funds/:id` - Update fund
- `DELETE /funds/:id` - Delete fund (soft delete)
- `GET /funds/:id/metrics` - Get fund metrics
- `POST /funds/:id/metrics` - Add fund metric
- `GET /funds/:id/investors` - Get fund investors
- `GET /funds/:id/investments` - Get fund investments

### Request/Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-10-22T10:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  },
  "timestamp": "2025-10-22T10:00:00Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2025-10-22T10:00:00Z"
}
```

## Database Schema

Key tables:
- `users` - User accounts and authentication
- `roles` - Role-based access control
- `funds` - Fund information
- `fund_metrics` - Fund performance metrics
- `investments` - Portfolio companies
- `valuations` - Investment valuations
- `investors` - Limited partners
- `fund_investors` - Fund-investor relationships
- `capital_calls` - Capital call management
- `distributions` - Distribution management
- `transactions` - Financial transactions
- `reports` - Generated reports
- `documents` - Document management
- `notifications` - User notifications
- `audit_logs` - Audit trail

## Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database
DATABASE_URL="mysql://user:password@localhost:3306/efront"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

## Deployment

### Production Deployment with Docker

1. **Update environment variables**
   ```bash
   cp .env.example .env
   # Update with production values
   ```

2. **Build and start services**
   ```bash
   docker-compose up -d --build
   ```

3. **Run migrations**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

4. **Check service health**
   ```bash
   docker-compose ps
   docker-compose logs
   ```

### Production Checklist

- [ ] Change all default passwords and secrets
- [ ] Set strong JWT_SECRET and JWT_REFRESH_SECRET
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up reverse proxy (Nginx/Caddy)
- [ ] Enable rate limiting
- [ ] Review security headers
- [ ] Set up firewall rules

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## Security

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Role-based access control (RBAC)
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection
- Rate limiting
- Helmet.js security headers
- Audit logging

## Performance

- Database indexing on frequently queried fields
- Redis caching (optional)
- API response pagination
- Frontend code splitting
- Image lazy loading
- Gzip compression
- CDN support

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- Create an issue in the repository
- Email: support@efront.com

## Roadmap

### Phase 1 (MVP) - Completed
- [x] User authentication and authorization
- [x] Fund management CRUD
- [x] Basic dashboard
- [x] Docker deployment

### Phase 2 (In Progress)
- [ ] Investment management
- [ ] Investor management
- [ ] Capital calls and distributions
- [ ] Performance analytics

### Phase 3 (Planned)
- [ ] Report generation
- [ ] Document management
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Data import/export
- [ ] Mobile responsive optimization

### Phase 4 (Future)
- [ ] Multi-currency support
- [ ] Advanced reporting
- [ ] Integration with external systems
- [ ] Mobile app
- [ ] AI-powered insights

## Credits

- Frontend template: [TailAdmin React](https://tailadmin.com)
- Based on eFront functionality research

---

**Built with** ❤️ **using React, TypeScript, Express, and Prisma**
