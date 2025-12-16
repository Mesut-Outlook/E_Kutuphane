#!/usr/bin/env node
/**
 * ChatGPT API ile Kitap Türü Sorgulama
 * Bu script, kitapların türlerini ChatGPT'ye sorarak veritabanına ekler
 */

const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BATCH_SIZE = 10; // Aynı anda işlenecek kitap sayısı
const DELAY_MS = 1000; // İstekler arası bekleme süresi (rate limit için)

// Veritabanı bağlantısı
const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath);

// ChatGPT'ye soru sorma fonksiyonu
async function askChatGPT(bookTitle, author) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
        throw new Error('OPENAI_API_KEY tanımlanmamış. Lütfen .env dosyasına API anahtarınızı ekleyin.');
    }

    const prompt = `Kitap Adı: "${bookTitle}"
Yazar: "${author}"

Bu kitabın türünü belirle. Sadece türü belirt, başka açıklama yapma. Türler şunlardan biri olmalı: Roman, Bilim Kurgu, Fantastik, Polisiye, Tarih, Felsefe, Bilim, Biyografi, Şiir, Deneme, Kişisel Gelişim, İş & Ekonomi, Çocuk, Gençlik, Sanat, Din, Psikoloji, Sağlık, Yemek, Seyahat, Edebiyat, Klasik, Diğer.

Sadece tür adını yaz, başka bir şey yazma.`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Sen bir kitap türü uzmanısın. Kitapların türlerini doğru bir şekilde belirleyebilirsin.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 50
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error(`API hatası: ${error.message}`);
        return null;
    }
}

// Bekle fonksiyonu
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Türü olmayan kitapları getir
function getBooksWithoutGenre(limit = BATCH_SIZE) {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT id, title, author FROM books WHERE genre IS NULL OR genre = "" LIMIT ?',
            [limit],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
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
            function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
}

// Toplam kitap sayısını al
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

// Ana işlem
async function processBooks() {
    try {
        console.log('📚 Kitap türü sorgulama başlatılıyor...\n');

        // Toplam sayıyı kontrol et
        const totalBooks = await getTotalBooksWithoutGenre();
        console.log(`Türü olmayan toplam kitap sayısı: ${totalBooks}\n`);

        if (totalBooks === 0) {
            console.log('✅ Tüm kitapların türü zaten belirlenmiş!');
            db.close();
            return;
        }

        let processedCount = 0;
        let successCount = 0;
        let errorCount = 0;

        while (true) {
            // Batch halinde kitapları al
            const books = await getBooksWithoutGenre(BATCH_SIZE);

            if (books.length === 0) {
                console.log('\n✅ Tüm kitaplar işlendi!');
                break;
            }

            console.log(`\n📖 ${books.length} kitap işleniyor...`);

            // Her kitap için tür sorgula
            for (const book of books) {
                processedCount++;

                console.log(`\n[${processedCount}/${totalBooks}] İşleniyor: "${book.title}" - ${book.author}`);

                try {
                    const genre = await askChatGPT(book.title, book.author);

                    if (genre) {
                        await updateBookGenre(book.id, genre);
                        successCount++;
                        console.log(`✅ Tür belirlendi: ${genre}`);
                    } else {
                        errorCount++;
                        console.log('❌ Tür belirlenemedi');
                    }

                    // Rate limit için bekle
                    await sleep(DELAY_MS);
                } catch (error) {
                    errorCount++;
                    console.error(`❌ Hata: ${error.message}`);
                }
            }

            console.log(`\n📊 İlerleme: ${processedCount}/${totalBooks} (Başarılı: ${successCount}, Hata: ${errorCount})`);
        }

        console.log(`\n🎉 İşlem tamamlandı!`);
        console.log(`📊 Toplam: ${processedCount} | Başarılı: ${successCount} | Hata: ${errorCount}`);

    } catch (error) {
        console.error('❌ Kritik hata:', error);
    } finally {
        db.close();
    }
}

// Test modu
async function testMode() {
    console.log('🧪 Test modu - 5 kitap için tür sorgulanacak...\n');

    try {
        const books = await getBooksWithoutGenre(5);

        for (const book of books) {
            console.log(`\nKitap: "${book.title}"`);
            console.log(`Yazar: ${book.author}`);

            const genre = await askChatGPT(book.title, book.author);

            if (genre) {
                console.log(`✅ Önerilen tür: ${genre}`);
                await updateBookGenre(book.id, genre);
            } else {
                console.log('❌ Tür belirlenemedi');
            }

            await sleep(DELAY_MS);
        }

        console.log('\n✅ Test tamamlandı!');
    } catch (error) {
        console.error('❌ Test hatası:', error);
    } finally {
        db.close();
    }
}

// Komut satırı argümanlarını kontrol et
const args = process.argv.slice(2);

if (args.includes('--test')) {
    testMode();
} else if (args.includes('--help')) {
    console.log(`
📚 Kitap Türü Sorgulama Aracı

Kullanım:
  node genre_classifier.js              # Tüm kitapları işle
  node genre_classifier.js --test       # 5 kitapla test et
  node genre_classifier.js --help       # Yardım göster

Önemli:
  - .env dosyasında OPENAI_API_KEY tanımlanmalı
  - İşlem uzun sürebilir (29,271 kitap için ~8-10 saat)
  - Rate limit'e takılmamak için istekler arası 1 saniye beklenir
    `);
} else {
    console.log('⚠️  UYARI: Bu işlem uzun sürebilir ve API maliyeti oluşturabilir!');
    console.log('Test için: node genre_classifier.js --test\n');

    // 5 saniye bekle, iptal edilebilsin
    console.log('İşlem 5 saniye içinde başlayacak... (Ctrl+C ile iptal edebilirsiniz)');
    setTimeout(() => {
        processBooks();
    }, 5000);
}

module.exports = { askChatGPT, updateBookGenre };
