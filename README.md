# NestJS Role-Based Auth System

## Overview
A backend API built with **NestJS + PostgreSQL + JWT** implementing role-based authentication (user/admin), refresh tokens, and Swagger API documentation.

---

## Tech Stack
- **NestJS** (TypeScript)
- **TypeORM** + PostgreSQL
- **Passport JWT** authentication
- **Swagger** for API docs
- **Jest** for unit testing (Auth service)
- **Docker** & docker-compose (optional)

---

## Project Structure (Summary)
```
/src
  /auth        # register/login/refresh + guards & strategies
  /users       # user profile, role management
  /roles       # role entity & seeding
  /common      # decorators, interceptors, constants
```

---

## Features
- **User Registration & Login**
- **Role-based Authorization** (user/admin)
- **Refresh Tokens**
- **Hashed Passwords** (bcrypt)
- **Swagger Docs** at `/api/docs`
- **Unit tests** for Auth service
- **Dockerized** for easy setup

---

## Prerequisites
- Node.js v18+
- npm v9+
- PostgreSQL (local or Docker)

---

## Environment Variables
Create a `.env` file in the project root:
```
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=041196
DB_NAME=auth_system_dev

JWT_SECRET=dev-jwt-secret
JWT_REFRESH_SECRET=dev-refresh-secret

FRONTEND_URL=http://localhost:5173
```

---

## Installation (Local)
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev
```

API will be available at: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)  
Swagger docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## Using Docker
```bash
# Start services (app + postgres + pgadmin)
docker-compose up --build

# Stop containers
docker-compose down
```

---

## Testing
```bash
# Run unit tests
npm run test

# Run e2e tests (if implemented)
npm run test:e2e
```

---

## Default Roles
When the application starts for the first time, the following roles are automatically seeded:
- **admin** (full permissions)
- **user** (basic permissions)

---

## License
MIT
