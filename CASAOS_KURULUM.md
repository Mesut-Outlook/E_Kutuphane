# CasaOS Kurulum Rehberi - E_Kitap

Bu rehber, E_Kitap uygulamasını Ubuntu sunucunuzdaki CasaOS üzerinde Docker container olarak çalıştırmanızı sağlar.

## Ön Gereksinimler

- ✅ CasaOS kurulu Ubuntu sunucusu (192.168.68.130)
- ✅ SSH erişimi
- ✅ Mount edilmiş harddisk: `/mnt/seagate/2. KUTUPHANE`

---

## Kurulum Adımları

### 1. Proje Dosyalarını Sunucuya Kopyalayın

Mac terminalinden:

```bash
# Proje klasörünü sunucuya kopyala
scp -r /Users/mesutozdemir/_PROJELER/E_Kitap casaos@192.168.68.130:~/E_Kitap
```

### 2. SSH ile Sunucuya Bağlanın

```bash
ssh casaos@192.168.68.130
```

### 3. Docker Image Oluşturun

```bash
cd ~/E_Kitap
docker build -t e-kitap .
```

### 4. Container'ı Başlatın

```bash
docker-compose up -d
```

---

## Erişim

Kurulum tamamlandıktan sonra:

🌐 **Web Arayüzü:** http://192.168.68.130:5050

---

## Yönetim Komutları

```bash
# Container durumunu kontrol et
docker ps

# Logları görüntüle
docker logs e-kitap

# Container'ı durdur
docker-compose down

# Container'ı yeniden başlat
docker-compose restart
```

---

## Kütüphane Tarama

1. Web arayüzüne gidin: http://192.168.68.130:5050
2. Tarama yaparak kitapları veritabanına ekleyin
3. Varsayılan tarama yolu: `/library` (container içi)

---

## Sorun Giderme

### Container başlamıyorsa:
```bash
docker logs e-kitap
```

### Harddisk bağlantı hatası:
```bash
# Harddiskin mount olduğunu kontrol edin
ls -la "/mnt/seagate/2. KUTUPHANE"
```

### Port çakışması:
docker-compose.yml'deki portu değiştirin (örn: 5051:5050)
