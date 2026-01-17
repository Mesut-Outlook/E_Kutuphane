#!/usr/bin/env python3
"""
Harici diskteki EPUB ve PDF dosyalarını sayar ve veritabanı ile karşılaştırır.
"""

import os
import sqlite3
from pathlib import Path

# Konfigürasyon
HARDDISK_PATH = "/Volumes/Seagate Exp/2. KUTUPHANE"
DATABASE_PATH = "/Users/mesutozdemir/_PROJELER/E_Kitap/library.db"

def count_files_on_disk(directory: str) -> dict:
    """Belirtilen dizindeki EPUB ve PDF dosyalarını sayar."""
    counts = {"epub": 0, "pdf": 0, "total": 0}
    
    if not os.path.exists(directory):
        print(f"❌ Dizin bulunamadı: {directory}")
        return counts
    
    print(f"📂 Taranıyor: {directory}")
    print("   Bu işlem birkaç dakika sürebilir...")
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            lower_name = file.lower()
            if lower_name.endswith('.epub'):
                counts["epub"] += 1
            elif lower_name.endswith('.pdf'):
                counts["pdf"] += 1
    
    counts["total"] = counts["epub"] + counts["pdf"]
    return counts

def get_database_counts(db_path: str) -> dict:
    """Veritabanındaki kitap sayılarını alır."""
    counts = {"epub": 0, "pdf": 0, "total": 0}
    
    if not os.path.exists(db_path):
        print(f"❌ Veritabanı bulunamadı: {db_path}")
        return counts
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM books WHERE LOWER(fileExtension) = 'epub'")
    counts["epub"] = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM books WHERE LOWER(fileExtension) = 'pdf'")
    counts["pdf"] = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM books")
    counts["total"] = cursor.fetchone()[0]
    
    conn.close()
    return counts

def print_comparison(disk_counts: dict, db_counts: dict):
    """Karşılaştırma raporunu yazdırır."""
    print("\n" + "=" * 60)
    print("📊 KARŞILAŞTIRMA RAPORU")
    print("=" * 60)
    
    print(f"\n{'Tür':<10} {'Harici Disk':<15} {'Veritabanı':<15} {'Fark':<10}")
    print("-" * 50)
    
    for file_type in ["epub", "pdf"]:
        disk = disk_counts[file_type]
        db = db_counts[file_type]
        diff = disk - db
        diff_str = f"+{diff}" if diff > 0 else str(diff)
        print(f"{file_type.upper():<10} {disk:<15,} {db:<15,} {diff_str:<10}")
    
    print("-" * 50)
    disk_total = disk_counts["total"]
    db_total = db_counts["total"]
    total_diff = disk_total - db_total
    diff_str = f"+{total_diff}" if total_diff > 0 else str(total_diff)
    print(f"{'TOPLAM':<10} {disk_total:<15,} {db_total:<15,} {diff_str:<10}")
    
    print("\n" + "=" * 60)
    
    if total_diff > 0:
        print(f"⚠️  Harici diskte veritabanından {total_diff:,} fazla dosya var.")
        print("   Bu dosyalar henüz veritabanına eklenmemiş olabilir.")
    elif total_diff < 0:
        print(f"⚠️  Veritabanında harici diskten {abs(total_diff):,} fazla kayıt var.")
        print("   Bu kayıtların dosyaları silinmiş veya taşınmış olabilir.")
    else:
        print("✅ Harici disk ve veritabanı eşleşiyor!")

if __name__ == "__main__":
    print("🔍 Kitap Sayısı Karşılaştırma Aracı")
    print("=" * 60)
    
    # Veritabanı sayılarını al
    print("\n📚 Veritabanı okunuyor...")
    db_counts = get_database_counts(DATABASE_PATH)
    print(f"   EPUB: {db_counts['epub']:,}")
    print(f"   PDF: {db_counts['pdf']:,}")
    print(f"   Toplam: {db_counts['total']:,}")
    
    # Harici disk sayılarını al
    print("\n💾 Harici disk taranıyor...")
    disk_counts = count_files_on_disk(HARDDISK_PATH)
    print(f"   EPUB: {disk_counts['epub']:,}")
    print(f"   PDF: {disk_counts['pdf']:,}")
    print(f"   Toplam: {disk_counts['total']:,}")
    
    # Karşılaştırma
    print_comparison(disk_counts, db_counts)
