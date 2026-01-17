const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Veritabanı oluşturma ve başlatma
const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, 'library.db');

console.log('Veritabanı yolu:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
        return;
    }
    console.log('SQLite veritabanına başarıyla bağlanıldı.');
    initializeDatabase();
});

// Veritabanı tabloları oluştur ve verileri yükle
function initializeDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            fileName TEXT,
            fileExtension TEXT,
            filePath TEXT,
            addedDate TEXT,
            genre TEXT,
            description TEXT,
            coverImage TEXT,
            rating REAL DEFAULT 0,
            downloadCount INTEGER DEFAULT 0
        )`);

        // Eğer books tablosu boşsa, JSON verilerini yükle
        db.get("SELECT COUNT(*) as count FROM books", (err, row) => {
            if (err) {
                console.error('Veritabanı sayım hatası:', err);
                return;
            }

            if (row.count === 0) {
                console.log('Kitap verileri yükleniyor...');
                loadBooksFromJSON();
            } else {
                console.log(`Veritabanında ${row.count} kitap mevcut.`);
            }
        });
    });
}

// JSON dosyasından kitapları veritabanına yükle
function loadBooksFromJSON() {
    try {
        const datasetPath = path.join(__dirname, 'ebooks_dataset.json');
        const data = fs.readFileSync(datasetPath, 'utf8');
        const books = JSON.parse(data);

        const stmt = db.prepare(`INSERT INTO books 
            (title, author, fileName, fileExtension, filePath, addedDate) 
            VALUES (?, ?, ?, ?, ?, ?)`);

        books.forEach(book => {
            stmt.run([
                book.title,
                book.author,
                book.fileName,
                book.fileExtension,
                book.filePath,
                book.addedDate
            ]);
        });

        stmt.finalize();
        console.log(`${books.length} kitap veritabanına yüklendi`);
    } catch (error) {
        console.error('JSON yükleme hatası:', error);
    }
}

// API Routes

// Tüm kitapları getir (sayfalama ile)
app.get('/api/books', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    const author = req.query.author || '';
    const fileType = req.query.fileType || '';

    const offset = (page - 1) * limit;

    let query = `SELECT * FROM books WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM books WHERE 1=1`;
    const params = [];

    if (search) {
        query += ` AND (title LIKE ? OR author LIKE ? OR filePath LIKE ?)`;
        countQuery += ` AND (title LIKE ? OR author LIKE ? OR filePath LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (genre) {
        query += ` AND genre LIKE ?`;
        countQuery += ` AND genre LIKE ?`;
        params.push(`%${genre}%`);
    }

    if (author) {
        query += ` AND author LIKE ?`;
        countQuery += ` AND author LIKE ?`;
        params.push(`%${author}%`);
    }

    if (fileType) {
        query += ` AND fileExtension = ?`;
        countQuery += ` AND fileExtension = ?`;
        params.push(fileType);
    }

    query += ` ORDER BY title LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Toplam sayıyı al
    db.get(countQuery, params.slice(0, -2), (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Kitapları al
        db.all(query, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                books: rows,
                pagination: {
                    page,
                    limit,
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// Tek kitap detayı
app.get('/api/books/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Kitap bulunamadı' });
        }

        res.json(row);
    });
});

// Yazarları getir
app.get('/api/authors', (req, res) => {
    db.all(`SELECT author, COUNT(*) as bookCount 
            FROM books 
            GROUP BY author 
            ORDER BY bookCount DESC 
            LIMIT 100`, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Türleri getir
app.get('/api/genres', (req, res) => {
    db.all(`SELECT genre, COUNT(*) as bookCount 
            FROM books 
            WHERE genre IS NOT NULL AND genre != ''
            GROUP BY genre 
            ORDER BY bookCount DESC`, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// İstatistikler
app.get('/api/stats', (req, res) => {
    const stats = {};

    // Toplam kitap sayısı
    db.get('SELECT COUNT(*) as total FROM books', (err, totalBooks) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        stats.totalBooks = totalBooks.total;

        // Toplam yazar sayısı
        db.get('SELECT COUNT(DISTINCT author) as total FROM books', (err, totalAuthors) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            stats.totalAuthors = totalAuthors.total;

            // Dosya türü dağılımı
            db.all('SELECT fileExtension, COUNT(*) as count FROM books GROUP BY fileExtension', (err, fileTypes) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                stats.fileTypes = fileTypes;

                res.json(stats);
            });
        });
    });
});

// Kitap türü güncelleme (ChatGPT entegrasyonu için)
app.put('/api/books/:id/genre', (req, res) => {
    const { id } = req.params;
    const { genre, description } = req.body;

    db.run('UPDATE books SET genre = ?, description = ? WHERE id = ?',
        [genre, description, id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'Kitap bulunamadı' });
            }

            res.json({ message: 'Kitap türü güncellendi', id, genre, description });
        });
});

const { exec } = require('child_process');

// Hızlı mod ve güvenli mod için tarama limiti
const SCAN_LIMIT = 10000;

// Klasörü yinelemeli olarak tara
function scanDirectory(dir, fileList = []) {
    if (fileList.length > SCAN_LIMIT) return fileList;

    try {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            if (fileList.length > SCAN_LIMIT) return;

            // Gizli dosyaları atla (. ile başlayanlar)
            if (file.startsWith('.')) return;

            const filePath = path.join(dir, file);

            try {
                const stat = fs.statSync(filePath);

                if (stat && stat.isDirectory()) {
                    // node_modules ve benzeri gereksiz klasörleri atla
                    if (file !== 'node_modules' && file !== '$RECYCLE.BIN' && file !== 'System Volume Information') {
                        scanDirectory(filePath, fileList);
                    }
                } else {
                    const ext = path.extname(file).toLowerCase().substring(1); // .pdf -> pdf
                    const supportedExtensions = ['pdf', 'epub', 'mobi', 'azw3', 'docx', 'txt', 'cbr', 'cbz'];

                    if (supportedExtensions.includes(ext)) {
                        fileList.push({
                            filePath: filePath,
                            fileName: file,
                            fileExtension: ext,
                            size: stat.size,
                            modifiedTime: stat.mtime
                        });
                    }
                }
            } catch (err) {
                // Dosya erişim hatası, atla
                // console.error(`Erişim hatası: ${filePath}`, err.message);
            }
        });
    } catch (err) {
        console.error(`Klasör okuma hatası: ${dir}`, err.message);
    }

    return fileList;
}

// Veritabanını Tara ve Güncelle
app.post('/api/scan', (req, res) => {
    const { dirPath } = req.body;

    if (!dirPath || !fs.existsSync(dirPath)) {
        return res.status(400).json({ error: 'Geçersiz klasör yolu' });
    }

    try {
        console.log(`Tarama başlıyor: ${dirPath}`);
        const foundFiles = scanDirectory(dirPath);
        console.log(`Bulunan dosya sayısı: ${foundFiles.length}`);

        // Veritabanındaki mevcut dosyaları çek
        db.all('SELECT id, filePath FROM books', [], (err, existingBooks) => {
            if (err) {
                return res.status(500).json({ error: 'Veritabanı okuma hatası' });
            }

            // Map oluştur (Performans için)
            const existingPaths = new Set(existingBooks.map(b => b.filePath));
            const foundPaths = new Set(foundFiles.map(f => f.filePath));

            const addedFiles = [];
            const removedIds = [];

            // 1. Yeni Eklenenleri Bul
            foundFiles.forEach(file => {
                if (!existingPaths.has(file.filePath)) {
                    addedFiles.push(file);
                }
            });

            // 2. Silinenleri Bul (Sadece taranan klasör altındakiler için)
            // Eğer veritabanındaki dosya, taranan klasör (dirPath) içindeyse ama foundPaths'de yoksa silinmiştir.
            existingBooks.forEach(book => {
                // Sadece taranan ana dizin altındaki kitapları kontrol et
                // Windows/Mac yol uyumluluğu için basit bir includes kontrolü
                if (book.filePath.startsWith(dirPath) && !foundPaths.has(book.filePath)) {
                    removedIds.push(book.id);
                }
            });

            // Veritabanı İşlemleri
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // Ekleme Hazırlığı
                if (addedFiles.length > 0) {
                    const stmt = db.prepare(`INSERT INTO books 
                        (title, author, fileName, fileExtension, filePath, addedDate) 
                        VALUES (?, ?, ?, ?, ?, ?)`);

                    addedFiles.forEach(file => {
                        // Dosya adından basit başlık/yazar tahmini
                        // Örn: "George Orwell - 1984.pdf"
                        let title = file.fileName;
                        let author = 'Bilinmiyor';
                        const nameWithoutExt = path.basename(file.fileName, '.' + file.fileExtension);

                        // " - " ayırıcı varsa kullan
                        const parts = nameWithoutExt.split(' - ');
                        if (parts.length >= 2) {
                            author = parts[0].trim();
                            title = parts.slice(1).join(' - ').trim(); // Geri kalan her şey başlık
                        } else {
                            title = nameWithoutExt;
                        }

                        stmt.run([
                            title,
                            author,
                            file.fileName,
                            file.fileExtension,
                            file.filePath,
                            new Date().toISOString().split('T')[0] // YYYY-MM-DD
                        ]);
                    });
                    stmt.finalize();
                }

                // Silme İşlemi
                if (removedIds.length > 0) {
                    const placeholders = removedIds.map(() => '?').join(',');
                    db.run(`DELETE FROM books WHERE id IN (${placeholders})`, removedIds);
                }

                db.run('COMMIT', (commitErr) => {
                    if (commitErr) {
                        console.error('Transaction commit error:', commitErr);
                        return res.status(500).json({ error: 'Veritabanı güncelleme hatası' });
                    }

                    res.json({
                        message: 'Tarama tamamlandı',
                        addedCount: addedFiles.length,
                        removedCount: removedIds.length,
                        totalFound: foundFiles.length
                    });
                });
            });
        });

    } catch (error) {
        console.error('Tarama genel hatası:', error);
        res.status(500).json({ error: 'Tarama sırasında beklenmeyen hata oluştu' });
    }
});

// Dosya klasörünü aç
app.post('/api/open-folder', (req, res) => {
    const { filePath } = req.body;

    if (!filePath) {
        return res.status(400).json({ error: 'Dosya yolu belirtilmedi' });
    }

    // Windows yolunu MacOS yoluna dönüştür
    let convertedPath = filePath;

    if (process.platform === 'darwin') {
        // Windows formatındaki yolu MacOS formatına çevir
        // E:\ -> /Volumes/Seagate Exp/
        convertedPath = filePath.replace(/^E:\\/, '/Volumes/Seagate Exp/');
        // Backslash'leri forward slash'e çevir
        convertedPath = convertedPath.replace(/\\/g, '/');
    }

    // Dosyanın var olup olmadığını kontrol et
    if (!fs.existsSync(convertedPath)) {
        console.error('Dosya bulunamadı:', convertedPath);
        return res.status(404).json({
            error: 'Dosya bulunamadı. Harddisk bağlı olduğundan emin olun.',
            path: convertedPath
        });
    }

    // İşletim sistemine göre komut belirle
    let command;
    if (process.platform === 'darwin') { // MacOS
        command = `open -R "${convertedPath}"`;
    } else if (process.platform === 'win32') { // Windows
        command = `explorer /select,"${convertedPath}"`;
    } else { // Linux
        command = `xdg-open "${path.dirname(convertedPath)}"`;
    }

    exec(command, (error) => {
        if (error) {
            console.error('Klasör açma hatası:', error);
            return res.status(500).json({ error: 'Klasör açılamadı' });
        }
        res.json({ message: 'Klasör açıldı' });
    });
});

// React uygulamasını serve et
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});
