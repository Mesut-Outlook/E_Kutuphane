#!/bin/bash

# Projenin tam yolu (Script başka yere taşınsa bile çalışması için)
PROJECT_DIR="/Users/mesutozdemir/_PROJELER/E_Kitap"

# Proje dizinine git
cd "$PROJECT_DIR" || { echo "❌ Proje klasörü bulunamadı: $PROJECT_DIR"; exit 1; }

# Çıkış yapıldığında (Ctrl+C veya pencere kapatma) tüm alt işlemleri öldür
trap 'kill 0' SIGINT SIGTERM EXIT

echo "============================================"
echo "📚 E-Kütüphane Başlatılıyor..."
echo "============================================"
echo ""

# Backend'i başlat (Arka planda)
echo "🌍 Backend (Sunucu) başlatılıyor..."
node server.js &
BACKEND_PID=$!

# Frontend'i başlat (Arka planda)
echo "💻 Frontend (Arayüz) başlatılıyor..."
cd client
npm start &
FRONTEND_PID=$!

# Tarayıcının açılmasını garantilemek için biraz bekle ve aç
sleep 5
open "http://localhost:3000"

echo ""
echo "✅ Uygulama başlatıldı!"
echo "👉 Tarayıcınız otomatik olarak açılacaktır."
echo "❌ Kapatmak için bu pencereyi kapatın veya Ctrl+C tuşlarına basın."
echo "============================================"

# İşlemlerin bitmesini bekle (Sonsuza kadar, kapatılana dek)
wait
