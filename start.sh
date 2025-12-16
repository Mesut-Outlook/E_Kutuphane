#!/bin/bash

# E-Kütüphane Uygulamasını Başlat

echo "🚀 E-Kütüphane uygulaması başlatılıyor..."
echo ""

# Backend'i başlat
echo "📡 Backend sunucusu başlatılıyor (Port 5050)..."
cd /Users/mesutozdemir/_PROJELER/E_Kitap
node server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Biraz bekle
sleep 3

# Frontend'i başlat
echo ""
echo "🎨 Frontend uygulaması başlatılıyor (Port 3000)..."
cd /Users/mesutozdemir/_PROJELER/E_Kitap/client
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Uygulamalar başlatıldı!"
echo ""
echo "📝 Erişim adresleri:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5050/api"
echo ""
echo "🛑 Durdurmak için:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📋 Log dosyaları:"
echo "   Backend: /Users/mesutozdemir/_PROJELER/E_Kitap/backend.log"
echo "   Frontend: /Users/mesutozdemir/_PROJELER/E_Kitap/client/frontend.log"
