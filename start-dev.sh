#!/bin/bash
echo "🚀 Starting NestJS Auth System..."

# Check if database is accessible
if command -v psql &> /dev/null; then
    if ! psql -h localhost -U postgres -d auth_system_dev -c '\q' 2>/dev/null; then
        echo "⚠️  Database connection failed. Please check your database configuration."
        echo "   You can continue anyway - the app will show connection errors."
    fi
fi

echo "🌐 Starting development server..."
echo "   API will be available at: http://localhost:3000/api/v1"
echo "   Swagger docs at: http://localhost:3000/api/docs"
echo ""
echo "Press Ctrl+C to stop the server"

npm run start:dev
