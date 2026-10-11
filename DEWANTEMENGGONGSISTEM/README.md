# Dewan Temenggong - Sistem Tempahan JSP

Fail asing: `index.html` (struktur), `css/style.css` (rekaan), `js/app.js` (logik).
Pangkalan data: **Turso (libSQL)** melalui fungsi pelayan dalam folder `api/`.
Token Turso dan kata laluan admin hanya berada di pelayan (pemboleh ubah persekitaran), bukan dalam kod frontend.

## 1. Sediakan Turso
```
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create dewan-temenggong
turso db show dewan-temenggong --url        # -> TURSO_DATABASE_URL
turso db tokens create dewan-temenggong     # -> TURSO_AUTH_TOKEN
```
Jadual dicipta automatik pada permintaan pertama (lihat juga `schema.sql`).

## 2. Deploy ke Vercel (paling mudah)
1. Muat naik folder ini ke GitHub.
2. Vercel -> Add New Project -> pilih repo. Framework Preset: **Other**. Tiada build command.
3. Settings -> Environment Variables, tambah:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_PASSWORD` (kata laluan log masuk admin)
   - `ADMIN_SECRET` (rentetan rawak panjang, untuk tandatangan sesi)
4. Deploy.

## 3. Cuba di komputer
```
npm install
npm i -g vercel
cp .env.example .env     # isi nilai sebenar
vercel dev
```

## Peraturan yang dikuatkuasakan di pelayan
- Dibuka Isnin & Jumaat (5-7 PM), Rabu (8-10 PM); admin boleh tutup tarikh tertentu.
- 1 tempahan sehari bagi setiap No. Matrik / No. Telefon (hari lain dibenarkan).
- Had 10 orang setiap court badminton, 6 setiap meja ping pong.
- Pelajar biasa hanya nampak nama dan matrik yang disamarkan; admin nampak penuh.
