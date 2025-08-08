#!/bin/bash
# scripts/local-setup.sh - Local development setup without Docker

echo "Setting up NestJS Auth System (Local Development)..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Node.js v18 or higher is required. Current version: $(node --version)"
    exit 1
fi
echo "Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "npm is not installed."
    exit 1
fi
echo "npm version: $(npm --version)"

# Install dependencies
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install dependencies."
    exit 1
fi

# Create .env file if missing
if [ ! -f .env ]; then
    cat > .env << EOF
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=auth_system_dev

# JWT Configuration
JWT_SECRET=dev-jwt-secret-key
JWT_REFRESH_SECRET=dev-refresh-jwt-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Optional Redis
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
    echo ".env file created. Please update database credentials if needed."
fi

# Create logs directory
mkdir -p logs

# Check PostgreSQL
if command -v psql &> /dev/null; then
    if psql -h localhost -U postgres -d postgres -c '\q' 2>/dev/null; then
        createdb -h localhost -U postgres auth_system_dev 2>/dev/null || true
    else
        echo "PostgreSQL is not running or connection failed."
    fi
else
    echo "PostgreSQL CLI not found. Please install PostgreSQL or use an online DB."
fi

# Create start script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "Starting NestJS Auth System..."
npm run start:dev
EOF
chmod +x start-dev.sh

echo "Setup completed."
echo "Run ./start-dev.sh to start the server."
