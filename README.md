# Lotça Frontend

BIST hisse/halka arz/temettü portföy takip uygulamasının web arayüzü.

Backend'i (Spring Boot API) ayrı bir repoda bulabilirsiniz:
https://github.com/erturkemre/Lotca-Backend — bu arayüz o API'ye bağlanarak
çalışır, kendi başına bir veritabanı veya sunucu içermez.

## Teknoloji Yığını

- **React 18** + **Vite 5**
- **TanStack Query** — sunucu verisi/cache yönetimi
- **Zustand** — auth state
- **Tailwind CSS** — stil
- **Recharts** — grafikler
- **react-toastify** — bildirimler
- **Axios** — HTTP istemcisi

## Gereksinimler

- **Node.js 18+** ve npm
- Çalışan bir Lotça backend instance'ı (yerelde veya uzakta)

## Kurulum

```bash
npm install
```

`.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:8081/api
```

`VITE_API_URL`'i backend'inizin gerçek adresine göre ayarlayın (Docker ile
çalıştırıyorsanız backend genelde `8081` portunda, doğrudan `mvn spring-boot:run`
ile çalıştırıyorsanız `8080` portunda olur).

```bash
npm run dev
```

Tarayıcıdan **http://localhost:5173** adresini açın.

> Not: 5173 portu doluysa Vite otomatik olarak başka bir porta (örn. 5174)
> geçer — bu durumda backend'in CORS ayarına (`app.cors.allowed-origins`) yeni
> portu eklemeniz gerekir, aksi halde istekler tarayıcı tarafından engellenir.

## Prodüksiyon Build

```bash
npm run build
```

Çıktı `dist/` klasörüne yazılır — herhangi bir statik dosya sunucusuyla
(nginx, Vercel, Netlify vb.) servis edilebilir. `VITE_API_URL` build zamanında
koda gömüldüğü için farklı bir backend adresi kullanacaksanız build'i o ortam
değişkeniyle yeniden almanız gerekir.

## Çoklu kullanıcı mı?

Evet — herkes kayıt olup kendi hesabıyla giriş yapabilir. Arayüz backend'in
JWT tabanlı kimlik doğrulamasını kullanır; token `localStorage`'da tutulur ve
her istekte otomatik eklenir (bkz. `src/shared/api/axios.js`).

## Klasör Yapısı

```
src/
├── pages/          # Route'lara karşılık gelen sayfa bileşenleri
├── features/       # Domain bazlı hook'lar (auth, portfolio, transaction, dividend, admin, account)
├── shared/
│   ├── api/        # axios instance + endpoint tanımları
│   ├── components/ # Tekrar kullanılan UI bileşenleri
│   └── utils/      # CSV export, toast bildirimleri
└── App.jsx         # Route tanımları
```

## Lisans / Sorumluluk Reddi

Kişisel kullanım için geliştirilmiştir. Yatırım tavsiyesi değildir.
