# E-Kütüphane Yönetim Sistemi

Modern ve kullanıcı dostu bir dijital kütüphane yönetim sistemi. 29,000+ EPUB ve PDF formatındaki kitapları kataloglama, arama ve tasnif etme özellikleri sunar.

## 🎯 Özellikler

### ✅ Tamamlanan Özellikler
- **Kitap Kataloglama**: 29,271 kitap (13,931 EPUB + 15,340 PDF)
- **Yazar Yönetimi**: 13,323 benzersiz yazar
- **Gelişmiş Arama**: Kitap adı, yazar, dosya türüne göre arama
- **Filtreleme**: Yazar, dosya türü, tür bazlı filtreleme
- **Sayfalama**: Performanslı sayfalama sistemi
- **İstatistikler**: Detaylı grafik ve istatistikler
- **Dosya Yolu Bilgisi**: Her kitabın hard diskteki konumu
- **Modern UI**: Material-UI ile responsive tasarım

### 🔄 Devam Eden Özellikler
- **ChatGPT Entegrasyonu**: Kitap türlerini otomatik belirleme
- **Tür Bazlı Tasnif**: Türlere göre kitap kategorileme

## 📦 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn
- Python 3.x (veri işleme için)

### Backend Kurulumu
```bash
# Bağımlılıkları yükle
npm install

# Veritabanını oluştur (otomatik)
node server.js
```

### Frontend Kurulumu
```bash
cd client
npm install
```

## 🚀 Kullanım

### Otomatik Başlatma
```bash
chmod +x start.sh
./start.sh
```

### Manuel Başlatma

**Backend:**
```bash
# Terminal 1
npm start
# veya
node server.js
```

**Frontend:**
```bash
# Terminal 2
cd client
npm start
```

Uygulama şu adreste açılacak: http://localhost:3000

## 🎨 API Endpoints

### Kitaplar
- `GET /api/books` - Tüm kitapları listele (sayfalama ile)
  - Query params: `page`, `limit`, `search`, `author`, `genre`, `fileType`
- `GET /api/books/:id` - Tek kitap detayı
- `PUT /api/books/:id/genre` - Kitap türünü güncelle

### Yazarlar
- `GET /api/authors` - Tüm yazarları listele

### Türler
- `GET /api/genres` - Tüm türleri listele

### İstatistikler
- `GET /api/stats` - Genel istatistikler

## 🤖 ChatGPT Entegrasyonu

Kitap türlerini otomatik olarak belirlemek için ChatGPT API kullanılır.

### Kurulum
1. `.env` dosyasını düzenleyin:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

2. Test modunda çalıştırın:
```bash
node genre_classifier.js --test
```

3. Tüm kitaplar için çalıştırın:
```bash
node genre_classifier.js
```

⚠️ **Uyarı**: 29,271 kitap için ~8-10 saat sürebilir ve API maliyeti oluşturabilir.

## 📊 Veri Yapısı

### Kitap Modeli
```javascript
{
  id: Integer (Primary Key),
  title: String,
  author: String,
  fileName: String,
  fileExtension: String (epub/pdf),
  filePath: String (Full path),
  addedDate: DateTime,
  genre: String (Optional),
  description: String (Optional),
  rating: Float,
  downloadCount: Integer
}
```

## 🗂️ Proje Yapısı

```
E_Kitap/
├── server.js                 # Express backend
├── genre_classifier.js       # ChatGPT tür sorgulama
├── filter_books.py          # PDF/EPUB filtreleme
├── library.db               # SQLite veritabanı
├── ebooks_dataset.csv       # Filtrelenmiş dataset
├── ebooks_dataset.json      # JSON formatı
├── package.json
├── .env                     # Yapılandırma
└── client/                  # React frontend
    ├── src/
    │   ├── components/      # Navbar
    │   ├── pages/          # Home, BookList, BookDetail, Authors, Stats
    │   └── App.js
    └── package.json
```

## 🎯 Kullanım Senaryoları

### 1. Kitap Arama
- Ana sayfadaki arama kutusundan kitap veya yazar arayın
- Filtreleri kullanarak sonuçları daraltın

### 2. Yazarlara Göre Tarama
- "Yazarlar" sayfasından yazar listesine erişin
- Bir yazarın tüm kitaplarını görüntüleyin

### 3. Dosya Konumu Bulma
- Kitap detay sayfasında tam dosya yolunu görün
- Hard diskteki klasör konumunu öğrenin

### 4. İstatistikleri İnceleme
- "İstatistikler" sayfasında grafikleri görün
- En çok kitabı olan yazarları keşfedin

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. Backend için `server.js`'e yeni route ekleyin
2. Frontend için `src/pages/` altına yeni sayfa oluşturun
3. `App.js`'de route tanımlayın

### Veritabanı Güncelleme
SQLite veritabanını güncellemek için:
```bash
sqlite3 library.db
```

## 📝 Yapılacaklar

- [ ] Kitap kapak görselleri ekleme
- [ ] Dosya indirme özelliği
- [ ] Favori kitaplar
- [ ] Okuma listesi
- [ ] Yorum ve puanlama sistemi
- [ ] Gelişmiş tür filtreleme
- [ ] PDF/EPUB okuyucu entegrasyonu
- [ ] Batch tür güncelleme

## 🐛 Bilinen Sorunlar

- Bazı kitap başlıkları özel karakterler içerebilir
- ChatGPT API rate limit'e takılabilir (1 saniye gecikme eklendi)
- Çok büyük veritabanlarında arama yavaşlayabilir

## 📄 Lisans

MIT License

## 👤 Yazar

Mesut Özdemir

## 🙏 Teşekkürler

- Material-UI - Modern UI bileşenleri
- Recharts - Grafik çizimi
- OpenAI - ChatGPT API
- Express.js - Backend framework
- React - Frontend framework
