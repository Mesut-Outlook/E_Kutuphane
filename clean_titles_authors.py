#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import os
import re
import shutil
import sqlite3
import sys
import unicodedata
from datetime import datetime
from typing import Optional, List, Dict, Tuple

BRACKET_PATTERN = re.compile(r"\s*[\(\[\{<][^\)\]\}>]*[\)\]\}>]\s*")

# Extra set of math-like symbols to remove explicitly
EXTRA_MATH_SYMBOLS = set(list("+-*/=^%≈≠≤≥±×÷√∑∏∫∂∆∞∇∈∋∩∪∧∨⊂⊃⊆⊇⊕⊗⊥∴∵≃≅≡≪≫∞∝∠∟∥∦∧∨∩∪∫∬∭∮∯∰∱∲∳∴∵∶∷∸≀≁≂≃≄≅≆≇≈≉≊≋≌≍≎≏≐≑≒≓≔≕≖≗≘≙≚≛≜≝≞≟"))

# Agresif mod için kaldırılacak ek işaretler (yaygın özel karakterler)
AGGRESSIVE_EXTRA = set(list("#@~`|•·…“”‘’'\"°§©®™½¼¾†‡_"))


def remove_bracketed_content(text: str) -> str:
    if not text:
        return text
    prev = None
    s = text
    # Remove segments like ( ... ), [ ... ], { ... }, < ... > repeatedly
    while prev != s:
        prev = s
        s = BRACKET_PATTERN.sub(" ", s)
    return s


def remove_math_symbols(text: str) -> str:
    if not text:
        return text
    out_chars: List[str] = []
    for ch in text:
        cat = unicodedata.category(ch)
        if cat in ("Sm", "Sk"):
            continue
        if ch in EXTRA_MATH_SYMBOLS:
            continue
        out_chars.append(ch)
    return "".join(out_chars)


def remove_aggressive_symbols(text: str) -> str:
    """Agresif mod: tüm noktalama işaretleri (P*) ve semboller (S*) büyük ölçüde kaldırılır.
    Rakamlar ve harfler korunur, boşluklar normalize edilir.
    """
    if not text:
        return text
    out_chars: List[str] = []
    for ch in text:
        cat = unicodedata.category(ch)
        # P*: Punctuation sınıfları, S*: Symbol sınıfları
        if cat.startswith('P') or cat.startswith('S'):
            # Boşluğu koru
            if ch.isspace():
                out_chars.append(' ')
            # Bazı durumlarda tireleri korumak istenirse buraya istisna eklenebilir
            continue
        if ch in AGGRESSIVE_EXTRA:
            continue
        out_chars.append(ch)
    s = "".join(out_chars)
    # Köşeli/braket karakterleri kalmışsa temizle
    s = re.sub(r"[\(\)\[\]\{\}<>]", " ", s)
    return s


def normalize_whitespace(text: str) -> str:
    if not text:
        return text
    # Collapse multiple spaces and trim
    s = re.sub(r"\s+", " ", text).strip()
    # Strip leading/trailing common separators left from removals
    s = re.sub(r"^[\-–—:;,.]+\s*", "", s)
    s = re.sub(r"\s*[\-–—:;,.]+$", "", s)
    return s


def clean_text(text: Optional[str], aggressive: bool = False) -> str:
    if text is None:
        return ""
    s = text
    s = remove_bracketed_content(s)
    s = remove_math_symbols(s)
    if aggressive:
        s = remove_aggressive_symbols(s)
    s = normalize_whitespace(s)
    return s


def backup_db(db_path: str) -> str:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    base, ext = os.path.splitext(db_path)
    backup_path = f"{base}_backup_{ts}{ext}"
    shutil.copy2(db_path, backup_path)
    return backup_path


def process(db_path: str, apply: bool, preview: int, batch_size: int, aggressive: bool, export_json: Optional[str], export_csv: Optional[str]) -> int:
    if not os.path.exists(db_path):
        print(f"Hata: Veritabanı bulunamadı: {db_path}", file=sys.stderr)
        return 1

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT id, title, author FROM books")
    rows = cur.fetchall()

    total = len(rows)
    changed = 0
    changed_title = 0
    changed_author = 0
    previews: List[Dict[str, str]] = []

    updates: List[Tuple[str, str, int]] = []  # (new_title, new_author, id)

    for r in rows:
        id_ = r["id"]
        title = r["title"] or ""
        author = r["author"] or ""

        new_title = clean_text(title, aggressive=aggressive)
        new_author = clean_text(author, aggressive=aggressive)

        if new_title != title or new_author != author:
            changed += 1
            if new_title != title:
                changed_title += 1
            if new_author != author:
                changed_author += 1

            # Avoid making fields empty; fall back to original if empty
            if new_title == "":
                new_title = title
            if new_author == "":
                new_author = author

            updates.append((new_title, new_author, id_))
            if len(previews) < preview:
                previews.append({
                    "id": str(id_),
                    "old_title": title,
                    "new_title": new_title,
                    "old_author": author,
                    "new_author": new_author,
                })

    print(f"Toplam kayıt: {total}")
    print(f"Değişecek kayıt: {changed} (Başlık: {changed_title}, Yazar: {changed_author})")

    if previews:
        print("\nÖrnek değişiklikler:")
        for p in previews:
            print(f"- id={p['id']}\n  Title: '{p['old_title']}' -> '{p['new_title']}'\n  Author: '{p['old_author']}' -> '{p['new_author']}'")

    if not updates and not (export_json or export_csv):
        print("Değişiklik yok. Çıkılıyor.")
        conn.close()
        return 0

    if apply and updates:
        # Backup before writing
        backup_path = backup_db(db_path)
        print(f"Yedek oluşturuldu: {backup_path}")

        try:
            print("Güncellemeler uygulanıyor...")
            cur.execute("BEGIN TRANSACTION")
            for i in range(0, len(updates), batch_size):
                chunk = updates[i:i+batch_size]
                cur.executemany("UPDATE books SET title = ?, author = ? WHERE id = ?", chunk)
            conn.commit()
            print("Güncelleme tamamlandı.")
        except Exception as e:
            conn.rollback()
            print(f"Hata, işlemler geri alındı: {e}", file=sys.stderr)
            conn.close()
            return 2

    # Export is optional and can run regardless of apply
    if export_json or export_csv:
        print("Dışa aktarma hazırlanıyor...")
        cur2 = conn.cursor()
        cur2.execute("SELECT id, title, author, fileName, fileExtension, filePath, addedDate, genre, description, coverImage, rating, downloadCount FROM books")
        cols = [d[0] for d in cur2.description]
        rows_all = cur2.fetchall()
        records = [dict(zip(cols, row)) for row in rows_all]

        if export_json:
            try:
                import json
                with open(export_json, 'w', encoding='utf-8') as f:
                    json.dump(records, f, ensure_ascii=False, indent=2)
                print(f"JSON dışa aktarıldı: {export_json} ({len(records)} kayıt)")
            except Exception as e:
                print(f"JSON dışa aktarma hatası: {e}", file=sys.stderr)

        if export_csv:
            try:
                import csv
                with open(export_csv, 'w', encoding='utf-8', newline='') as f:
                    writer = csv.DictWriter(f, fieldnames=cols)
                    writer.writeheader()
                    for rec in records:
                        writer.writerow(rec)
                print(f"CSV dışa aktarıldı: {export_csv} ({len(records)} kayıt)")
            except Exception as e:
                print(f"CSV dışa aktarma hatası: {e}", file=sys.stderr)

    conn.close()
    return 0


def main():
    parser = argparse.ArgumentParser(description="Kitap ve yazar isimlerinden matematiksel işaretleri ve parantezli bölümleri temizler.")
    parser.add_argument("--db", default="./library.db", help="SQLite veritabanı yolu (varsayılan: ./library.db)")
    parser.add_argument("--apply", action="store_true", help="Değişiklikleri veritabanına uygula. Belirtmezseniz yalnızca önizleme yapılır.")
    parser.add_argument("--preview", type=int, default=20, help="Konsolda gösterilecek örnek değişiklik sayısı (varsayılan: 20)")
    parser.add_argument("--batch-size", type=int, default=1000, help="Toplu güncelleme boyutu (varsayılan: 1000)")
    parser.add_argument("--aggressive", action="store_true", help="Agresif temizlik: ek semboller ve noktalama işaretlerini de kaldırır.")
    parser.add_argument("--export-json", nargs='?', const="./ebooks_dataset.json", help="Temizlik sonrası JSON dışa aktarma yolu (varsayılan: ./ebooks_dataset.json)")
    parser.add_argument("--export-csv", nargs='?', const="./ebooks_dataset.csv", help="Temizlik sonrası CSV dışa aktarma yolu (varsayılan: ./ebooks_dataset.csv)")

    args = parser.parse_args()
    export_json: Optional[str] = args.export_json
    export_csv: Optional[str] = args.export_csv

    sys.exit(process(args.db, args.apply, args.preview, args.batch_size, args.aggressive, export_json, export_csv))


if __name__ == "__main__":
    main()
