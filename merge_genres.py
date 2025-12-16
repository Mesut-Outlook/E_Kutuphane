#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sqlite3
import shutil
from datetime import datetime

# Yedek al
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
shutil.copy2('library.db', f'library_backup_genre_{timestamp}.db')
print(f"✓ Yedek alındı: library_backup_genre_{timestamp}.db")

# Veritabanına bağlan
conn = sqlite3.connect('library.db')
cur = conn.cursor()

# Birleştirme kuralları
merge_rules = {
    'Biografi': ['Biyografi'],
    'Siir': ['Şiir'],
    'Öykü': ['Hikaye'],
    'Bilinmiyor': ['Diğer'],
    'Bilinmeyen': ['Diğer'],
    'Tür1': ['Diğer'],
    'Macera': ['Fantastik'],
    'Romantik': ['Roman'],
    'Klasik': ['Roman'],
    'Drama': ['Roman'],
    'Otobiyografi': ['Biyografi'],
    'Aforizma': ['Deneme'],
    'Makale': ['Deneme'],
    'Gezi': ['Seyahat'],
    'Hukuk Öyküleri': ['Hikaye'],
    'Masal': ['Çocuk'],
    'Destan': ['Edebiyat'],
    'Defter': ['Edebiyat'],
    'Feminist Olarak Okumak': ['Felsefe'],
}

total_updated = 0
for old_genre, new_genre_list in merge_rules.items():
    new_genre = new_genre_list[0]
    result = cur.execute("UPDATE books SET genre = ? WHERE genre = ?", (new_genre, old_genre))
    count = result.rowcount
    if count > 0:
        print(f"✓ {old_genre} -> {new_genre} ({count} kitap)")
        total_updated += count

conn.commit()

# Sonuçları göster
print(f"\nToplam güncellenen: {total_updated} kitap")

cur.execute("SELECT COUNT(DISTINCT genre) FROM books WHERE genre IS NOT NULL AND genre != ''")
genre_count = cur.fetchone()[0]
print(f"Yeni tür sayısı: {genre_count}")

print("\nEn popüler 20 tür:")
cur.execute("""
    SELECT genre, COUNT(*) as count 
    FROM books 
    WHERE genre IS NOT NULL AND genre != '' 
    GROUP BY genre 
    ORDER BY count DESC 
    LIMIT 20
""")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

conn.close()
print("\n✓ Tamamlandı!")
