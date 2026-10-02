#!/bin/bash
# Quick Start Script for Patient Record Management System

echo "🏥 Patient Record Management System - Quick Start"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed or not in PATH."
    echo "   Please ensure PostgreSQL is installed and running."
fi

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
npm install
cd ..

echo ""
echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Create .env files:"
echo "   - cp backend/.env.example backend/.env"
echo "   - cp frontend/.env.example frontend/.env"
echo ""
echo "2. Update backend/.env with PostgreSQL credentials"
echo ""
echo "3. Run database setup (in PostgreSQL):"
echo "   psql -U postgres -d patient_records -f backend/sql/schema.sql"
echo ""
echo "4. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "5. In a new terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "6. Open http://localhost:5173 in your browser"
echo ""
echo "📚 For more information, see README.md"
