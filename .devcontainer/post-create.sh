#!/bin/bash
set -e

echo "🚀 Setting up Travelingo development environment..."

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
timeout 60 bash -c 'until mysqladmin ping -h mysql --silent; do
  echo "Waiting for MySQL..."
  sleep 2
done'
echo "✅ MySQL is ready"

# Navigate to the latest version backend
cd /workspace/travelingo_v4_3_21/travelingo-back

echo "📦 Building backend with Gradle..."
./gradlew clean build -x test --no-daemon

echo "✅ Backend build completed successfully!"

# Navigate to frontend
cd /workspace/travelingo_v4_3_21/travelingo-front

echo "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps 2>/dev/null || echo "Note: npm install skipped or completed with warnings"

echo "✅ Frontend setup completed!"

echo ""
echo "=========================================="
echo "🎉 Development environment ready!"
echo "=========================================="
echo ""
echo "Quick start commands:"
echo ""
echo "Backend (Spring Boot):"
echo "  cd travelingo_v4_3_21/travelingo-back"
echo "  ./gradlew bootRun"
echo ""
echo "Frontend (Live Server):"
echo "  cd travelingo_v4_3_21/travelingo-front"
echo "  npx live-server"
echo ""
echo "MySQL credentials:"
echo "  Host: mysql"
echo "  User: travellingo"
echo "  Password: travellingo_pass"
echo "  Database: travelingo_db"
echo ""
echo "=========================================="
