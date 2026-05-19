#!/bin/bash

# Script để build và deploy product-service lên production

echo "🔨 Building product-service Docker image..."
cd backEnd/product-service
docker build -t quangquangs/product-service:latest .

echo "📤 Pushing image to Docker Hub..."
docker push quangquangs/product-service:latest

echo "✅ Image pushed successfully!"
echo ""
echo "📋 Để cập nhật trên production server, chạy lệnh sau:"
echo "   docker-compose -f docker-compose.prod.yml pull product-service"
echo "   docker-compose -f docker-compose.prod.yml up -d product-service"
echo ""
echo "Hoặc restart toàn bộ:"
echo "   docker-compose -f docker-compose.prod.yml pull"
echo "   docker-compose -f docker-compose.prod.yml up -d"
