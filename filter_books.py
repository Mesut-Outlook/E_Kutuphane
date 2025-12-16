#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
E-Kitap Kütüphanesi Dataset Filtreleme Aracı
Sadece PDF ve EPUB dosyalarını filtreler ve yeni dataset oluşturur.
"""

import pandas as pd
import json
import os
from pathlib import Path

def filter_ebooks():
    """
    CSV dosyasından sadece PDF ve EPUB dosyalarını filtreler
    """
    # CSV dosyasını oku
    df = pd.read_csv('Harddisk_Kutuphanesi.csv')
    
    print(f"Toplam kayıt sayısı: {len(df)}")
    
    # Sadece PDF ve EPUB dosyalarını filtrele
    ebooks = df[df['fileExtension'].isin(['pdf', 'epub'])].copy()
    
    print(f"PDF ve EPUB dosya sayısı: {len(ebooks)}")
    
    # Boş title ve author alanlarını temizle
    ebooks = ebooks.dropna(subset=['title', 'author'])
    ebooks = ebooks[ebooks['title'].str.strip() != '']
    ebooks = ebooks[ebooks['author'].str.strip() != '']
    
    print(f"Temizlenmiş kayıt sayısı: {len(ebooks)}")
    
    # ID ekle
    ebooks['id'] = range(1, len(ebooks) + 1)
    
    # Sütun sırasını düzenle
    ebooks = ebooks[['id', 'title', 'author', 'fileName', 'fileExtension', 'filePath', 'addedDate']]
    
    # Yeni CSV dosyası olarak kaydet
    ebooks.to_csv('ebooks_dataset.csv', index=False, encoding='utf-8')
    
    # JSON formatında da kaydet (web sitesi için)
    ebooks_json = ebooks.to_dict('records')
    with open('ebooks_dataset.json', 'w', encoding='utf-8') as f:
        json.dump(ebooks_json, f, ensure_ascii=False, indent=2)
    
    print(f"Filtrelenmiş dataset kaydedildi:")
    print(f"- ebooks_dataset.csv ({len(ebooks)} kayıt)")
    print(f"- ebooks_dataset.json ({len(ebooks)} kayıt)")
    
    # İstatistikler
    print(f"\nİstatistikler:")
    print(f"- EPUB dosyaları: {len(ebooks[ebooks['fileExtension'] == 'epub'])}")
    print(f"- PDF dosyaları: {len(ebooks[ebooks['fileExtension'] == 'pdf'])}")
    print(f"- Benzersiz yazar sayısı: {ebooks['author'].nunique()}")
    
    # En çok kitabı olan yazarlar
    top_authors = ebooks['author'].value_counts().head(10)
    print(f"\nEn çok kitabı olan yazarlar:")
    for author, count in top_authors.items():
        print(f"- {author}: {count} kitap")
    
    return ebooks

if __name__ == "__main__":
    filtered_books = filter_ebooks()
