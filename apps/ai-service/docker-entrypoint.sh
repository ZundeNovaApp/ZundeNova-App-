#!/bin/bash
set -e

echo "🌱 ZundeNova AI Service Docker Entrypoint"
echo "========================================="

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🔍 Checking model files..."
if [ ! -f "app/models/plantdiag.onnx" ]; then
    echo "⚠️ Plant disease model not found, using mock implementation"
fi

if [ ! -f "app/models/livestock.onnx" ]; then
    echo "⚠️ Livestock model not found, using mock implementation"
fi

echo "🚀 Starting AI service..."
exec python startup.py
