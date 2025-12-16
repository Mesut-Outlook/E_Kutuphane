# 📚 E-Kütüphane Projesi - Kurulum ve Kullanım Kılavuzu

## 🎉 Tamamlanan İşlemler

### 1. ✅ Dataset Oluşturma
- **Toplam Kayıt**: 49,871 dosya tarandı
- **Filtrelenen**: 29,271 EPUB ve PDF kitap
  - 13,931 EPUB dosyası
  - 15,340 PDF dosyası
- **Benzersiz Yazar**: 13,323 yazar
- **Çıktı Dosyaları**:
  - `ebooks_dataset.csv` - CSV formatında dataset
  - `ebooks_dataset.json` - JSON formatında dataset

### 2. ✅ Backend (Node.js + Express + SQLite)
- RESTful API oluşturuldu
- SQLite veritabanı otomatik oluşturulup dolduruldu
- Sayfalama, arama, filtreleme özellikleri eklendi
- **Port**: 5050

**API Endpoints**:
- `/api/books` - Kitap listesi (sayfalama ile)
- `/api/books/:id` - Kitap detayı
- `/api/authors` - Yazar listesi
- `/api/genres` - Tür listesi
- `/api/stats` - İstatistikler

### 3. ✅ Frontend (React + Material-UI)
- Modern ve responsive tasarım
- 5 ana sayfa:
  1. **Ana Sayfa**: Arama, istatistikler, son eklenen kitaplar
  2. **Kitaplar**: Filtreleme, sayfalama, detaylı arama
  3. **Kitap Detay**: Tam dosya yolu, kitap bilgileri
  4. **Yazarlar**: Yazar listesi ve kitap sayıları
  5. **İstatistikler**: Grafikler ve detaylı analiz
- **Port**: 3000

### 4. ✅ ChatGPT Entegrasyonu (Hazır)
- `genre_classifier.js` - Kitap türlerini otomatik belirleme
- Test modu ve toplu işleme desteği
- Rate limit koruması (1 saniye gecikme)

## 🚀 Nasıl Başlatılır?

### Yöntem 1: VS Code Task'ları (ÖNERİLEN)
VS Code'da zaten iki task başlatıldı:
1. **Backend Sunucusu** - Port 5050'de çalışıyor
2. **Frontend (React)** - Port 3000'de açılacak

### Yöntem 2: Terminal'den Manuel
```bash
# Terminal 1 - Backend
cd /Users/mesutozdemir/_PROJELER/E_Kitap
node server.js

# Terminal 2 - Frontend
cd /Users/mesutozdemir/_PROJELER/E_Kitap/client
npm start
```

### Yöntem 3: Bash Script
```bash
cd /Users/mesutozdemir/_PROJELER/E_Kitap
./start.sh
```

## 🌐 Erişim Adresleri

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5050/api

## 🔑 Önemli Dosya Konumları

### Hangi Dosya Nerede?
Her kitabın **tam dosya yolu** veritabanında saklanıyor:
```
Örnek: E:\2. KUTUPHANE\5000 Kitap\P Harfi\Platon - Gorgias.epub
```

**Kitap detay sayfasında** görebilirsiniz:
1. Kitap listesinden bir kitap seçin
2. "Detayları Gör" butonuna tıklayın
3. "Konum Bilgileri" bölümünde:
   - Klasör yolu
   - Tam dosya yolu

## 🤖 ChatGPT ile Tür Sorgulama

### 1. API Anahtarı Ekleyin
`.env` dosyasını düzenleyin:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 2. Test Modunda Çalıştırın (5 kitap)
```bash
cd /Users/mesutozdemir/_PROJELER/E_Kitap
node genre_classifier.js --test
```

### 3. Tüm Kitaplar İçin Çalıştırın
```bash
node genre_classifier.js
```

⚠️ **Uyarı**: 
- 29,271 kitap için ~8-10 saat sürer
- OpenAI API maliyeti oluşturur (~$10-15 tahmini)
- İnternet bağlantısı gerektirir

## 📊 Özellikler

### ✅ Tamamlanan
- [x] EPUB ve PDF filtreleme
- [x] SQLite veritabanı
- [x] RESTful API
- [x] Modern React UI
- [x] Gelişmiş arama
- [x] Yazar bazlı filtreleme
- [x] Dosya türü filtreleme
- [x] Sayfalama (20 kitap/sayfa)
- [x] İstatistik grafikleri
- [x] Dosya yolu gösterimi
- [x] Responsive tasarım
- [x] ChatGPT entegrasyonu hazır

### 🔄 Gelecek Özellikler
- [ ] Kitap türlerini toplu güncelleme
- [ ] Tür bazlı filtreleme (ChatGPT sonrası)
- [ ] Dosya indirme
- [ ] Kapak görselleri
- [ ] Favori kitaplar
- [ ] Okuma listesi
- [ ] PDF/EPUB okuyucu

## 📁 Proje Yapısı

```
E_Kitap/
├── 📊 Data
│   ├── Harddisk_Kutuphanesi.csv      # Orijinal dataset (49,871 kayıt)
│   ├── ebooks_dataset.csv            # Filtrelenmiş dataset (29,271 kitap)
│   ├── ebooks_dataset.json           # JSON formatı
│   └── library.db                    # SQLite veritabanı
│
├── 🔧 Backend
│   ├── server.js                     # Express sunucusu
│   ├── genre_classifier.js           # ChatGPT tür sorgulama
│   └── package.json                  # Backend bağımlılıklar
│
├── 🎨 Frontend
│   └── client/
│       ├── src/
│       │   ├── components/
│       │   │   └── Navbar.js         # Navigation bar
│       │   ├── pages/
│       │   │   ├── Home.js           # Ana sayfa
│       │   │   ├── BookList.js       # Kitap listesi
│       │   │   ├── BookDetail.js     # Kitap detayı
│       │   │   ├── Authors.js        # Yazarlar
│       │   │   └── Stats.js          # İstatistikler
│       │   └── App.js                # Ana uygulama
│       └── package.json              # Frontend bağımlılıklar
│
├── 🐍 Python Scripts
│   └── filter_books.py               # PDF/EPUB filtreleme
│
└── 📚 Documentation
    ├── README.md                     # Ana doküman
    ├── KURULUM.md                    # Bu dosya
    └── start.sh                      # Başlatma scripti
```

## 🔍 Kullanım Senaryoları

### 1. Kitap Arama
```
Ana Sayfa → Arama kutusuna "Platon" yaz → Enter
```

### 2. Bir Yazarın Tüm Kitaplarını Görme
```
Yazarlar → Listedenazarı bul → "Kitapları Gör"
```

### 3. Dosya Konumunu Öğrenme
```
Kitaplar → Kitap seç → Detayları Gör → "Konum Bilgileri" bölümü
```

### 4. PDF/EPUB Filtreleme
```
Kitaplar → "Dosya Türü" dropdown → EPUB veya PDF seç
```

### 5. İstatistikleri İnceleme
```
İstatistikler → Grafikleri ve sayıları gör
```

## 🛠️ Teknik Detaylar

### Teknolojiler
- **Backend**: Node.js, Express.js, SQLite3
- **Frontend**: React, Material-UI (MUI), Recharts
- **AI**: OpenAI GPT-3.5-turbo
- **Database**: SQLite
- **Data Processing**: Python, Pandas

### Veritabanı Şeması
```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  fileName TEXT,
  fileExtension TEXT,
  filePath TEXT,            -- ÖNEMLI: Tam dosya yolu
  addedDate TEXT,
  genre TEXT,               -- ChatGPT ile doldurulacak
  description TEXT,
  rating REAL,
  downloadCount INTEGER
);
```

### API Örnekleri

**Kitap Arama**:
```
GET /api/books?search=platon&page=1&limit=20
```

**Yazara Göre Filtreleme**:
```
GET /api/books?author=Agatha Christie
```

**Dosya Türüne Göre**:
```
GET /api/books?fileType=epub
```

## 🎯 Sonraki Adımlar

### 1. Uygulamayı Test Edin
- [ ] Frontend'in açıldığını kontrol edin (http://localhost:3000)
- [ ] Arama özelliğini deneyin
- [ ] Kitap detaylarında dosya yollarını görün
- [ ] İstatistikleri inceleyin

### 2. ChatGPT Entegrasyonu (İsteğe Bağlı)
- [ ] OpenAI API anahtarı alın (https://platform.openai.com/)
- [ ] `.env` dosyasına ekleyin
- [ ] Test modunda 5 kitap deneyin
- [ ] Sonuçlar uygunsa tüm kitaplar için çalıştırın

### 3. Özelleştirme
- [ ] Tema renklerini değiştirin (`client/src/App.js`)
- [ ] Sayfa başına kitap sayısını ayarlayın (`server.js` - limit)
- [ ] Yeni sayfalar ekleyin

## 📞 Destek

Sorun yaşarsanız:
1. Task'ların çalıştığını kontrol edin (VS Code Terminal)
2. Portların kullanımda olup olmadığını kontrol edin:
   ```bash
   lsof -i :3000  # Frontend
   lsof -i :5050  # Backend
   ```
3. Log dosyalarını kontrol edin (VS Code Terminal output)

## 🎊 Başarılar!

Artık 29,271 kitaplık modern bir dijital kütüphaneniz var! Her kitabın hard diskteki tam yolunu görebilir, arayabilir ve filtreleyebilirsiniz. ChatGPT entegrasyonu ile kitap türlerini otomatik olarak belirleyebilirsiniz.

**Keyifli okumalar! 📖✨**
