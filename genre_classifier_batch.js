#!/usr/bin/env node
/**
 * ChatGPT API ile TOPLU Kitap Türü Sorgulama
 * Tek istekte birden fazla kitabın türünü belirler (Maliyet ve Hız Optimizasyonu)
 */

const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
require('dotenv').config();

// KONFIGÜRASYON
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BOOKS_PER_REQUEST = 20; // Tek API çağrısında kaç kitap (20 = daha hızlı, daha ucuz!)
const DELAY_MS = 800; // İstekler arası bekleme (ms) - Biraz hızlandırıldı
const MAX_RETRIES = 3; // Hata durumunda tekrar deneme
const PROGRESS_FILE = './genre_progress.json'; // İlerleme dosyası

// Veritabanı
const db = new sqlite3.Database('./library.db');

// Türler listesi
const GENRES = [
    'Roman', 'Bilim Kurgu', 'Fantastik', 'Polisiye', 'Tarih', 'Felsefe',
    'Bilim', 'Biyografi', 'Şiir', 'Deneme', 'Kişisel Gelişim', 'İş & Ekonomi',
    'Çocuk', 'Gençlik', 'Sanat', 'Din', 'Psikoloji', 'Sağlık', 'Yemek',
    'Seyahat', 'Edebiyat', 'Klasik', 'Ansiklopedi', 'Referans', 'Diğer'
];

// API KEY kontrolü (sadece işlem yaparken)
function checkApiKey() {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
        console.error('❌ HATA: .env dosyasında OPENAI_API_KEY bulunamadı!');
        console.error('\n📝 Çözüm:');
        console.error('1. .env dosyasını açın');
        console.error('2. Şu satırı ekleyin: OPENAI_API_KEY=sk-your-actual-key');
        console.error('3. API key için: https://platform.openai.com/api-keys\n');
        process.exit(1);
    }
}

// Bekle fonksiyonu
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// İlerleme kaydetme
function saveProgress(data) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2));
}

function loadProgress() {
    try {
        if (fs.existsSync(PROGRESS_FILE)) {
            return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
        }
    } catch (error) {
        console.warn('⚠️  İlerleme dosyası okunamadı, sıfırdan başlanıyor...');
    }
    return { processedIds: [], lastProcessedId: 0, totalProcessed: 0 };
}

// Türü olmayan kitapları getir
function getBooksWithoutGenre(limit, lastId = 0) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT id, title, author FROM books 
             WHERE (genre IS NULL OR genre = '') AND id > ?
             ORDER BY id ASC
             LIMIT ?`,
            [lastId, limit],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

// Toplam sayı
function getTotalBooksWithoutGenre() {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT COUNT(*) as total FROM books WHERE genre IS NULL OR genre = ""',
            (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            }
        );
    });
}

// Kitap türünü güncelle
function updateBookGenre(bookId, genre) {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE books SET genre = ? WHERE id = ?',
            [genre, bookId],
            function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
}

// ChatGPT'ye TOPLU sorgulama
async function askChatGPTBatch(books, retryCount = 0) {
    const bookList = books.map((book, idx) => 
        `${idx + 1}. "${book.title}" - ${book.author}`
    ).join('\n');

    const prompt = `Aşağıdaki kitapların türlerini belirle. Her kitap için SADECE türünü yaz, açıklama yapma.

Kitaplar:
${bookList}

Kullanılabilir türler: ${GENRES.join(', ')}

Cevap formatı (her satırda sadece tür adı):
1. [Tür]
2. [Tür]
3. [Tür]
...

Örnek:
1. Roman
2. Bilim Kurgu
3. Tarih`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Sen bir kitap türü uzmanısın. Kitapların türlerini kısa ve net bir şekilde belirlersin. Her satırda sadece tür adını yazarsın.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 300
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const content = response.data.choices[0].message.content.trim();
        
        // Cevabı parse et
        const lines = content.split('\n').filter(line => line.trim());
        const genres = [];
        
        for (const line of lines) {
            // "1. Roman" veya "Roman" formatını kabul et
            const match = line.match(/^\d+\.\s*(.+)$/);
            if (match) {
                genres.push(match[1].trim());
            } else {
                genres.push(line.trim());
            }
        }

        return genres;

    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            console.warn(`⚠️  API hatası, ${retryCount + 1}. yeniden deneme...`);
            await sleep(DELAY_MS * 2);
            return askChatGPTBatch(books, retryCount + 1);
        }
        
        console.error(`❌ API hatası (${error.response?.status || error.message})`);
        if (error.response?.data) {
            console.error('Hata detayı:', error.response.data);
        }
        return null;
    }
}

// Ana işlem
async function processBooksInBatches() {
    checkApiKey(); // API key kontrolü
    console.log('📚 TOPLU Kitap Türü Sorgulama Başlatılıyor...\n');
    console.log(`⚙️  Konfigürasyon:`);
    console.log(`   - İstek başına kitap: ${BOOKS_PER_REQUEST}`);
    console.log(`   - İstekler arası bekleme: ${DELAY_MS}ms`);
    console.log(`   - Maksimum yeniden deneme: ${MAX_RETRIES}\n`);

    try {
        // İlerlemeyi yükle
        const progress = loadProgress();
        
        // Toplam sayı
        const totalBooks = await getTotalBooksWithoutGenre();
        console.log(`📊 Türü olmayan kitap: ${totalBooks.toLocaleString()}\n`);

        if (totalBooks === 0) {
            console.log('✅ Tüm kitapların türü zaten belirlenmiş!');
            db.close();
            return;
        }

        let processedCount = progress.totalProcessed || 0;
        let successCount = 0;
        let errorCount = 0;
        let lastId = progress.lastProcessedId || 0;

        const startTime = Date.now();

        while (true) {
            // Batch al
            const books = await getBooksWithoutGenre(BOOKS_PER_REQUEST, lastId);
            
            if (books.length === 0) {
                console.log('\n✅ Tüm kitaplar işlendi!');
                break;
            }

            console.log(`\n📦 ${books.length} kitaplık batch işleniyor...`);
            console.log(`   İlk: "${books[0].title}"`);
            console.log(`   Son: "${books[books.length - 1].title}"`);

            // ChatGPT'ye toplu sor
            const genres = await askChatGPTBatch(books);

            if (genres && genres.length === books.length) {
                // Her kitabı güncelle
                for (let i = 0; i < books.length; i++) {
                    try {
                        await updateBookGenre(books[i].id, genres[i]);
                        processedCount++;
                        successCount++;
                        lastId = Math.max(lastId, books[i].id);
                        
                        console.log(`   ✅ ${i + 1}/${books.length}: "${books[i].title}" → ${genres[i]}`);
                    } catch (error) {
                        errorCount++;
                        console.error(`   ❌ Güncelleme hatası: ${books[i].title}`);
                    }
                }
            } else {
                console.error(`   ❌ API cevabı beklendiği gibi değil (${genres?.length || 0}/${books.length})`);
                errorCount += books.length;
                lastId = books[books.length - 1].id;
            }

            // İlerleme kaydet
            saveProgress({
                lastProcessedId: lastId,
                totalProcessed: processedCount,
                timestamp: new Date().toISOString()
            });

            // İstatistikler
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const rate = processedCount / elapsed;
            const remaining = totalBooks - processedCount;
            const estimatedSeconds = remaining / rate;
            
            console.log(`\n📊 İlerleme: ${processedCount}/${totalBooks} (${((processedCount/totalBooks)*100).toFixed(1)}%)`);
            console.log(`   Başarılı: ${successCount} | Hata: ${errorCount}`);
            console.log(`   Hız: ${rate.toFixed(1)} kitap/sn`);
            console.log(`   Tahmini kalan süre: ${Math.floor(estimatedSeconds/60)} dakika`);

            // Rate limit için bekle
            await sleep(DELAY_MS);
        }

        const totalTime = Math.floor((Date.now() - startTime) / 1000);
        console.log(`\n🎉 İşlem Tamamlandı!`);
        console.log(`📊 Özet:`);
        console.log(`   Toplam işlenen: ${processedCount.toLocaleString()}`);
        console.log(`   Başarılı: ${successCount.toLocaleString()}`);
        console.log(`   Hata: ${errorCount.toLocaleString()}`);
        console.log(`   Süre: ${Math.floor(totalTime/60)} dakika ${totalTime%60} saniye`);
        console.log(`   Ortalama hız: ${(processedCount/totalTime).toFixed(1)} kitap/sn\n`);

        // İlerleme dosyasını temizle
        if (fs.existsSync(PROGRESS_FILE)) {
            fs.unlinkSync(PROGRESS_FILE);
        }

    } catch (error) {
        console.error('\n❌ Kritik hata:', error.message);
        console.error('İlerleme kaydedildi, scripti tekrar çalıştırarak devam edebilirsiniz.');
    } finally {
        db.close();
    }
}

// Test modu (5 kitap)
async function testMode() {
    checkApiKey(); // API key kontrolü
    console.log('🧪 TEST MODU - 5 kitap için tür sorgulanacak...\n');
    
    try {
        const books = await getBooksWithoutGenre(5, 0);
        
        if (books.length === 0) {
            console.log('✅ Türü olmayan kitap bulunamadı!');
            db.close();
            return;
        }

        console.log('📖 Test edilecek kitaplar:');
        books.forEach((book, i) => {
            console.log(`${i + 1}. "${book.title}" - ${book.author}`);
        });

        console.log('\n🤖 ChatGPT sorgulanıyor...\n');
        const genres = await askChatGPTBatch(books);

        if (genres) {
            console.log('📋 Önerilen türler:');
            for (let i = 0; i < books.length; i++) {
                console.log(`${i + 1}. "${books[i].title}" → ${genres[i]}`);
                await updateBookGenre(books[i].id, genres[i]);
            }
            console.log('\n✅ Test başarılı! Türler veritabanına kaydedildi.');
        } else {
            console.log('❌ Test başarısız!');
        }

    } catch (error) {
        console.error('❌ Test hatası:', error.message);
    } finally {
        db.close();
    }
}

// İstatistik göster
async function showStats() {
    try {
        const withGenre = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM books WHERE genre IS NOT NULL AND genre != ""', 
                (err, row) => err ? reject(err) : resolve(row.count));
        });

        const withoutGenre = await getTotalBooksWithoutGenre();
        const total = withGenre + withoutGenre;

        console.log('\n📊 Veritabanı İstatistikleri:');
        console.log(`   Toplam kitap: ${total.toLocaleString()}`);
        console.log(`   Türü belirlenmiş: ${withGenre.toLocaleString()} (${((withGenre/total)*100).toFixed(1)}%)`);
        console.log(`   Türü belirlenmemiş: ${withoutGenre.toLocaleString()} (${((withoutGenre/total)*100).toFixed(1)}%)\n`);

        // En çok kullanılan türler
        const topGenres = await new Promise((resolve, reject) => {
            db.all('SELECT genre, COUNT(*) as count FROM books WHERE genre IS NOT NULL AND genre != "" GROUP BY genre ORDER BY count DESC LIMIT 10',
                (err, rows) => err ? reject(err) : resolve(rows));
        });

        if (topGenres.length > 0) {
            console.log('📚 En Çok Kullanılan Türler:');
            topGenres.forEach((g, i) => {
                console.log(`   ${i + 1}. ${g.genre}: ${g.count.toLocaleString()} kitap`);
            });
            console.log('');
        }

    } catch (error) {
        console.error('❌ İstatistik hatası:', error.message);
    } finally {
        db.close();
    }
}

// Komut satırı argümanları
const args = process.argv.slice(2);

if (args.includes('--test')) {
    testMode();
} else if (args.includes('--stats')) {
    showStats();
} else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📚 TOPLU Kitap Türü Sorgulama Aracı

🚀 Kullanım:
  node genre_classifier_batch.js              # Tüm kitapları işle
  node genre_classifier_batch.js --test       # 5 kitapla test et
  node genre_classifier_batch.js --stats      # İstatistikleri göster
  node genre_classifier_batch.js --help       # Bu yardımı göster

⚙️  Özellikler:
  ✅ Tek istekte ${BOOKS_PER_REQUEST} kitap (Hızlı & Ekonomik)
  ✅ Otomatik ilerleme kaydetme (Kesinti durumunda devam eder)
  ✅ Hata durumunda ${MAX_RETRIES} kez yeniden deneme
  ✅ Gerçek zamanlı istatistikler ve tahmini süre

📝 Gereksinimler:
  - .env dosyasında OPENAI_API_KEY tanımlı olmalı
  - OpenAI hesabınızda bakiye bulunmalı

💰 Tahmini Maliyet:
  - ${BOOKS_PER_REQUEST} kitap/istek ile ~29,271 kitap
  - Yaklaşık ${Math.ceil(29271/BOOKS_PER_REQUEST).toLocaleString()} API çağrısı
  - Tahmini maliyet: $5-10 (GPT-3.5-turbo ile)

⏱️  Tahmini Süre:
  - ${Math.floor((29271/BOOKS_PER_REQUEST * DELAY_MS) / 60000)} dakika

📖 Örnek:
  # Önce test edin
  node genre_classifier_batch.js --test
  
  # Sonuçlar iyi ise tamamını çalıştırın
  node genre_classifier_batch.js

⚠️  Önemli:
  - İşlem kesintiye uğrarsa tekrar çalıştırabilirsiniz (Kaldığı yerden devam eder)
  - İlerleme genre_progress.json dosyasına kaydedilir
`);
} else {
    console.log('⚠️  UYARI: Bu işlem API maliyeti oluşturabilir!');
    console.log(`📊 ~${Math.ceil(29271/BOOKS_PER_REQUEST).toLocaleString()} API çağrısı yapılacak`);
    console.log(`💰 Tahmini maliyet: $5-10 (GPT-3.5-turbo)\n`);
    console.log('🧪 Önce test etmek için: node genre_classifier_batch.js --test');
    console.log('📊 İstatistik için: node genre_classifier_batch.js --stats\n');
    
    console.log('İşlem 5 saniye içinde başlayacak... (Ctrl+C ile iptal)');
    setTimeout(() => {
        processBooksInBatches();
    }, 5000);
}
