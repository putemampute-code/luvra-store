# LUVRA STORE - E-Ticaret Platformu

Lüks moda, parfüm ve aksesuar satışı yapan premium e-ticaret sitesi.

## Özellikler

- React + Vite ile geliştirilmiş modern arayüz
- Firebase Authentication ile kullanıcı yönetimi
- Firestore ile ürün ve sipariş veritabanı
- Iyzico ödeme entegrasyonu
- Admin yönetim paneli
- Responsive tasarım
- SEO optimizasyonu

## Kurulum

```bash
# Bağımlılıkları kur
npm install

# .env dosyasını oluştur
cp .env.example .env

# Geliştirme sunucusunu başlat
npm run dev
```

## Ortam Değişkenleri

`.env` dosyasında aşağıdaki değişkenleri tanımlayın:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
```

## Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Yeni proje oluşturun
3. Authentication > Email/Password'u etkinleştirin
4. Firestore Database oluşturun
5. Proje ayarlarından web uygulaması ekleyin
6. API Key'lerinizi `.env` dosyasına yazın

## Iyzico Kurulumu

1. [Iyzico](https://www.iyzipay.com/) adresine gidin
2. Sanal mağaza hesabı oluşturun
3. API anahtarlarınızı alın
4. Sandbox ortamı ile test edin
5. Canlıya geçmeden önce Iyzico onayı alın

## Deploy (Vercel)

```bash
# Vercel CLI kurulumu
npm i -g vercel

# Deploy
vercel

# Değişkenleri ayarla
vercel env add VITE_FIREBASE_API_KEY
```

Vercel Dashboard'dan da ortam değişkenlerini ayarlayabilirsiniz.

## Test Kullanıcıları

- **Müşteri:** Herhangi bir e-posta ile kayıt olabilirsiniz
- **Satıcı:** Firebase'de `role: 'admin'` olan kullanıcı

## Geliştirme

```bash
npm run dev      # Geliştirme sunucusu
npm run build    # Production build
npm run preview  # Build önizleme
npm run lint     # Kod denetimi
```

## Lisans

© 2026 LUVRA STORE. Tüm hakları saklıdır.
"# luvrastore" 
"# luvrastore"  
