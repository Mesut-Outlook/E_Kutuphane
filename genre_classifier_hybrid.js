#!/usr/bin/env node

/**
 * HİBRİT TÜR BELİRLEME SİSTEMİ
 * =============================
 * 1. Önce kural tabanlı sistemle %80-90 kitabı ÜCRETSİZ belirle
 * 2. Sadece belirsiz kitaplar için ChatGPT kullan
 * 
 * Maliyet: $2-3 yerine $0.20-0.50
 * Süre: 55 dakika yerine 5-10 dakika
 */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { OpenAI } = require('openai');

const db = new sqlite3.Database('./library.db');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// KURAL TABANLI TÜRLER
const GENRE_RULES = {
  // Anahtar kelimeler -> Tür
  keywords: {
    // Roman türleri
    'roman': ['Roman', 0.8],
    'hikaye': ['Hikaye', 0.8],
    'öykü': ['Hikaye', 0.8],
    'anı': ['Biyografi', 0.7],
    'mektup': ['Mektup', 0.8],
    
    // Bilim Kurgu & Fantastik
    'uzay': ['Bilim Kurgu', 0.9],
    'galaksi': ['Bilim Kurgu', 0.9],
    'robot': ['Bilim Kurgu', 0.9],
    'vakıf': ['Bilim Kurgu', 0.9],
    'zaman makine': ['Bilim Kurgu', 0.9],
    'ejderha': ['Fantastik', 0.9],
    'büyü': ['Fantastik', 0.9],
    'sihir': ['Fantastik', 0.9],
    'yüzük': ['Fantastik', 0.9],
    'hobbit': ['Fantastik', 0.9],
    'harry potter': ['Fantastik', 0.95],
    'narnia': ['Fantastik', 0.95],
    
    // Felsefe & Din
    'felsefe': ['Felsefe', 0.9],
    'tasavvuf': ['Din', 0.9],
    'kuran': ['Din', 0.95],
    'mevlana': ['Din', 0.9],
    'allah': ['Din', 0.9],
    'islam': ['Din', 0.85],
    
    // Tarih
    'tarih': ['Tarih', 0.9],
    'osmanlı': ['Tarih', 0.9],
    'türk': ['Tarih', 0.7],
    'savaş': ['Tarih', 0.7],
    
    // Bilim
    'bilim': ['Bilim', 0.9],
    'fizik': ['Bilim', 0.9],
    'evren': ['Bilim', 0.8],
    'kuantum': ['Bilim', 0.9],
    
    // Psikoloji & Kişisel Gelişim
    'psikoloji': ['Psikoloji', 0.9],
    'başarı': ['Kişisel Gelişim', 0.8],
    'motivasyon': ['Kişisel Gelişim', 0.8],
    
    // Polisiye
    'cinayet': ['Polisiye', 0.9],
    'dedektif': ['Polisiye', 0.9],
    'sır': ['Polisiye', 0.7],
    
    // Şiir
    'şiir': ['Şiir', 0.9],
    'divan': ['Şiir', 0.85],
    
    // Çocuk
    'çocuk': ['Çocuk', 0.8],
    'masal': ['Çocuk', 0.8],
  },
  
  // Ünlü yazar -> Tür
  authors: {
    'isaac asimov': 'Bilim Kurgu',
    'j.r.r. tolkien': 'Fantastik',
    'j.k. rowling': 'Fantastik',
    'stephen king': 'Korku',
    'agatha christie': 'Polisiye',
    'dan brown': 'Polisiye',
    'fyodor dostoyevski': 'Roman',
    'leo tolstoy': 'Roman',
    'orhan pamuk': 'Roman',
    'mevlana': 'Din',
    'yunus emre': 'Şiir',
    'nazim hikmet': 'Şiir',
    'platon': 'Felsefe',
    'aristoteles': 'Felsefe',
  }
};

// Kural tabanlı tür belirleme
function getRuleBasedGenre(title, author) {
  const text = `${title} ${author}`.toLowerCase();
  
  // Yazar kontrolü
  for (const [authorName, genre] of Object.entries(GENRE_RULES.authors)) {
    if (text.includes(authorName.toLowerCase())) {
      return { genre, confidence: 0.9, method: 'author' };
    }
  }
  
  // Anahtar kelime kontrolü
  let bestMatch = { genre: null, confidence: 0, method: null };
  
  for (const [keyword, [genre, confidence]] of Object.entries(GENRE_RULES.keywords)) {
    if (text.includes(keyword)) {
      if (confidence > bestMatch.confidence) {
        bestMatch = { genre, confidence, method: 'keyword' };
      }
    }
  }
  
  // Eşik değerinden yüksekse döndür
  if (bestMatch.confidence >= 0.75) {
    return bestMatch;
  }
  
  return null;
}

// ChatGPT ile tür belirleme (sadece belirsiz kitaplar için)
async function getAIGenre(books) {
  const prompt = `Aşağıdaki ${books.length} kitabın türünü belirle. Her kitap için sadece TÜR adını yaz.

Türler: Roman, Hikaye, Şiir, Felsefe, Bilim Kurgu, Fantastik, Polisiye, Tarih, Biyografi, Din, Bilim, Psikoloji, Kişisel Gelişim, Çocuk, Deneme, Diğer

CEVAP FORMATI (satır satır, numara olmadan):
Tür1
Tür2
Tür3

KİTAPLAR:
${books.map(b => `"${b.title}" - ${b.author}`).join('\n')}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const genres = response.choices[0].message.content
      .trim()
      .split('\n')
      .map(g => g.trim())
      .filter(g => g);

    return genres;
  } catch (error) {
    console.error('❌ ChatGPT hatası:', error.message);
    return Array(books.length).fill('Diğer');
  }
}

// Ana fonksiyon
async function classifyBooks() {
  console.log('🎯 HİBRİT TÜR BELİRLEME SİSTEMİ\n');
  
  // Türü olmayan kitapları al
  const books = await new Promise((resolve, reject) => {
    db.all(
      `SELECT id, title, author FROM books WHERE genre IS NULL OR genre = '' ORDER BY id`,
      [],
      (err, rows) => err ? reject(err) : resolve(rows)
    );
  });
  
  console.log(`📚 Toplam kitap: ${books.length}\n`);
  
  let ruleBasedCount = 0;
  let aiNeededCount = 0;
  const aiNeededBooks = [];
  
  console.log('⚡ Adım 1: Kural tabanlı sistem ile hızlı belirleme...\n');
  
  // Kural tabanlı belirleme
  for (const book of books) {
    const result = getRuleBasedGenre(book.title, book.author);
    
    if (result) {
      // Veritabanına güncelle
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE books SET genre = ? WHERE id = ?',
          [result.genre, book.id],
          (err) => err ? reject(err) : resolve()
        );
      });
      
      ruleBasedCount++;
      if (ruleBasedCount % 100 === 0) {
        console.log(`   ✅ ${ruleBasedCount} kitap belirlendi (kural tabanlı)`);
      }
    } else {
      aiNeededBooks.push(book);
      aiNeededCount++;
    }
  }
  
  console.log(`\n✅ Kural tabanlı: ${ruleBasedCount} kitap (${((ruleBasedCount/books.length)*100).toFixed(1)}%)`);
  console.log(`⏳ ChatGPT gerekli: ${aiNeededCount} kitap (${((aiNeededCount/books.length)*100).toFixed(1)}%)\n`);
  
  if (aiNeededCount === 0) {
    console.log('🎉 Tüm kitaplar kural tabanlı sistemle belirlendi!');
    return;
  }
  
  console.log('🤖 Adım 2: Belirsiz kitaplar için ChatGPT kullanılıyor...\n');
  
  // Batch'ler halinde ChatGPT'ye gönder
  const BATCH_SIZE = 20;
  const DELAY_MS = 800;
  let processed = 0;
  
  for (let i = 0; i < aiNeededBooks.length; i += BATCH_SIZE) {
    const batch = aiNeededBooks.slice(i, i + BATCH_SIZE);
    const genres = await getAIGenre(batch);
    
    // Veritabanına güncelle
    for (let j = 0; j < batch.length; j++) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE books SET genre = ? WHERE id = ?',
          [genres[j] || 'Diğer', batch[j].id],
          (err) => err ? reject(err) : resolve()
        );
      });
    }
    
    processed += batch.length;
    const percent = ((processed / aiNeededCount) * 100).toFixed(1);
    console.log(`   🤖 ${processed}/${aiNeededCount} (${percent}%) - ChatGPT ile belirlendi`);
    
    // Rate limit için bekle
    if (i + BATCH_SIZE < aiNeededBooks.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  console.log('\n✅ TAMAMLANDI!\n');
  console.log('📊 ÖZET:');
  console.log(`   • Kural tabanlı: ${ruleBasedCount} kitap (ÜCRETSİZ)`);
  console.log(`   • ChatGPT: ${aiNeededCount} kitap (~$${(aiNeededCount * 0.0002).toFixed(2)})`);
  console.log(`   • TOPLAM: ${books.length} kitap\n`);
  
  // Tür dağılımını göster
  const distribution = await new Promise((resolve, reject) => {
    db.all(
      `SELECT genre, COUNT(*) as count FROM books WHERE genre IS NOT NULL GROUP BY genre ORDER BY count DESC LIMIT 15`,
      [],
      (err, rows) => err ? reject(err) : resolve(rows)
    );
  });
  
  console.log('📚 En çok kullanılan 15 tür:');
  distribution.forEach((row, i) => {
    console.log(`   ${i+1}. ${row.genre}: ${row.count} kitap`);
  });
}

// Çalıştır
classifyBooks()
  .then(() => {
    console.log('\n🎯 Web sitesini yeniden yükleyerek türleri görebilirsiniz!');
    db.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Hata:', err);
    db.close();
    process.exit(1);
  });
