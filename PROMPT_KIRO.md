# Dashboard DataCo Global — Spesifikasi Build

Bangun sebuah dashboard analitik statis untuk mata kuliah Big Data Analytics.
Seluruh data sudah tersedia di folder `data/`. Jangan membuat data baru, jangan
mengarang angka, dan jangan mengambil data dari internet.

## Data

Folder `data/` berisi 18 berkas CSV, satu `data.js`, dan satu `data.json`.
Baca `DATA_DICTIONARY.md` lebih dulu untuk daftar kolom dan tipe setiap berkas.

Muat data lewat `<script src="data/data.js"></script>`, lalu baca dari
`window.DASHBOARD_DATA`. Jangan memakai `fetch()` untuk memuat data: halaman ini harus
tetap jalan saat `index.html` dibuka langsung dari berkas, dan `fetch()` diblokir
browser pada protokol `file://`.

`data/data.json` berisi isi yang sama persis dan disertakan sebagai cadangan bila
dijalankan lewat server. Jangan memuat keduanya sekaligus.

Strukturnya objek dengan kunci nama berkas tanpa ekstensi, misalnya `d01_tren_bulanan`,
ditambah kunci `kpi` yang berisi `tampilan` dan `mentah`.

Ketentuan data yang wajib dipatuhi:

- Semua nilai bertipe rasio sudah berupa pecahan. `0.5483` berarti 54,83 persen.
  Kalikan 100 hanya saat menampilkan, jangan saat menghitung.
- Angka ditampilkan dengan format Indonesia: titik untuk ribuan, koma untuk desimal.
  Contoh: `180.519`, `54,83%`, `$36.784.735`.
- Nilai kosong pada `d08_model_crosstab` berarti metrik itu tidak berlaku untuk
  baris baseline. Tampilkan sebagai tanda pisah, bukan nol.
- Uji pemuatan data: jumlah kolom `Jumlah Order` pada `d01_tren_bulanan` dan pada
  `d16_geo` masing-masing harus tepat 180519. Tulis pemeriksaan ini sebagai tes.

## Teknologi

- HTML, CSS, dan JavaScript biasa. Tanpa build step, tanpa framework, tanpa npm.
- Berkas dibuka langsung lewat `index.html` dan juga jalan bila dilayani server statis.
- Pustaka grafik lewat CDN. Pakai satu pustaka saja untuk seluruh dashboard.
- Semua berjalan di sisi klien. Tidak ada backend.

## Struktur

Satu halaman dengan empat tab di bagian atas. Tab aktif ditandai jelas.
Ukuran rancangan 1400 kali 900 piksel, tetapi tata letak harus menyesuaikan
lebar layar dan tetap terbaca pada laptop 1280 piksel.

### Tab 1 — Ringkasan Eksekutif

Judul: `Risiko Keterlambatan Pengiriman — DataCo Global`
Subjudul: `Analisis 180.519 order periode Januari 2015 sampai Januari 2018`

1. Baris enam kartu KPI dari `kpi`: Total Order, Late Rate, Nilai Penjualan,
   Order Test Set, Tidak Terdeteksi, Porsi Standard Class. Setiap kartu memuat
   angka besar dan label kecil di bawahnya.
2. Grafik garis Tren Volume Order dari `d01_tren_bulanan`, sumbu X `Bulan`,
   sumbu Y `Jumlah Order`.
3. Grafik garis Tren Late Rate dari `d01_tren_bulanan`, sumbu Y `Late Rate`
   dalam persen.
4. Grafik batang horizontal Late Rate per Moda dari `d02_moda`, diurutkan menurun.
5. Peta sebaran pelanggan dari `d16_geo`. Ukuran titik mengikuti `Jumlah Order`,
   warna mengikuti `Late Rate`. Bila peta terlalu rumit, ganti dengan scatter
   `Longitude` terhadap `Latitude` dengan rasio aspek yang benar.

### Tab 2 — Analisis Operasional

Judul: `Analisis Operasional — Wilayah dan Tujuan Pengiriman`

1. Tabel Performa Region dari `d04_region_crosstab`, diputar menjadi satu baris
   per region dengan kolom Jumlah Order, Late Rate, Accuracy, Recall,
   Tidak Terdeteksi. Kolom dapat diurutkan dengan klik header.
2. Grafik batang Negara Tujuan Terbesar dari `d07_negara`, 15 negara,
   diurutkan menurun menurut `Jumlah Order`.
3. Heatmap Moda terhadap Region dari `d06_matriks`. Baris moda, kolom region,
   warna mengikuti `Late Rate`, angka ditulis di dalam setiap sel.

### Tab 3 — Machine Learning

Judul: `Machine Learning — Evaluasi Model dan Batas Kemampuannya`

1. Tabel Perbandingan Model dari `d08_model_crosstab`, diputar menjadi satu baris
   per model dengan kolom Accuracy, Recall, F1, ROC AUC, Waktu Latih.
   Tandai baris dengan Accuracy tertinggi.
2. Grafik batang Feature Importance dari `d10_fitur`, diurutkan menurun.
   Kelompok dengan `Sorotan` bernilai Dominan diberi warna aksen, sisanya warna netral.
3. Kurva Ambang dari `d11_ambang`. Satu garis per `Metrik`, sumbu X `Ambang`.
   Sediakan penggeser ambang; saat digeser, tampilkan nilai setiap metrik pada
   ambang tersebut.
4. Grafik batang berdampingan Deteksi per Moda dari `d03_deteksi_moda`,
   membandingkan late rate sebenarnya dengan yang terdeteksi model.
5. Grafik garis Stabilitas Bulanan dari `d17_stabilitas`, satu garis per `Metrik`.

### Tab 4 — Graph Analytics

Judul: `Graph Analytics — Struktur Jaringan dan Keterlambatan`

1. Scatter Sentralitas dari `d12_node`. Sumbu X `Betweenness`, sumbu Y `Late Rate`,
   ukuran titik `Jumlah Order`, warna mengikuti `Tipe Node`.
2. Tabel Node Paling Sentral dari `d13_node_crosstab`, diputar menjadi satu baris
   per node dengan kolom Degree, Betweenness, Jumlah Order, Late Rate.
3. Scatter Kategori Produk dari `d15_kategori`. Sumbu X `Degree Centrality`,
   sumbu Y `Late Rate`, ukuran titik `Jumlah Order`.
4. Grafik batang horizontal Relasi Terbesar dari `d14_relasi`, diurutkan menurun
   menurut `Jumlah Order`.

## Panel insight

Pada tab 2, 3, dan 4, sediakan satu panel teks di bawah judul dengan latar `#EEF3F8`
dan garis tepi `#DDE5EE`.

Isi panel tersebut dengan teks placeholder persis seperti ini:

    [TULIS INSIGHT ANDA SENDIRI DI SINI]

Jangan menulis analisis, interpretasi, atau kesimpulan apa pun ke dalam panel itu,
dan jangan menuliskannya di tempat lain pada dashboard. Bagian itu akan diisi sendiri
oleh penulis. Judul grafik dan label sumbu tetap ditulis seperti diminta di atas.

## Warna

| Peran | Hex |
| --- | --- |
| Header dan aksen utama | `#12395F` |
| Biru utama | `#2B6CA3` |
| Biru sedang | `#5B94C4` |
| Biru muda | `#BCD4E8` |
| Latar panel insight | `#EEF3F8` |
| Garis tepi | `#DDE5EE` |
| Teks abu | `#6B7785` |

Latar halaman putih. Skala warna berurutan memakai gradasi dari `#BCD4E8` ke `#12395F`.
Jangan memakai merah dan hijau sebagai pembeda utama agar tetap terbaca oleh
pembaca dengan buta warna.

## Interaksi

- Tooltip pada setiap elemen grafik, memuat nama dimensi dan nilai terformat.
- Header tabel dapat diklik untuk mengurutkan.
- Penggeser ambang pada tab 3.
- Pada tab 1, filter moda pengiriman yang memengaruhi grafik pada tab tersebut.
- Semua kontrol dapat dijangkau dengan keyboard dan punya label yang terbaca
  screen reader.

## Keluaran

- `index.html`, `styles.css`, `app.js`, folder `data/` yang sudah ada.
- Satu berkas tes yang memeriksa pemuatan data dan total 180519 pada dua berkas.
- `README.md` berisi cara menjalankan, cara deploy, dan daftar grafik beserta
  sumber datanya.
- `.nojekyll` kosong di akar proyek.

## Siap dipasang di GitHub Pages

Hasil build ini akan dipublikasikan lewat GitHub Pages dan tautannya dikumpulkan
sebagai bagian penilaian, jadi patuhi hal berikut:

- Seluruh rujukan berkas memakai jalur relatif, misalnya `data/data.js` dan
  `styles.css`. Jangan pernah memakai jalur yang diawali garis miring seperti
  `/data/data.js`, karena GitHub Pages melayani situs dari subfolder
  `https://<user>.github.io/<nama-repo>/` sehingga jalur absolut akan gagal.
- `index.html` berada di akar proyek, bukan di dalam subfolder.
- Tanpa build step dan tanpa proses di sisi server. Yang di-deploy adalah berkas apa
  adanya.
- Pustaka grafik dimuat dari CDN memakai `https://`, bukan `http://`, agar tidak
  diblokir sebagai mixed content.
- Nama berkas dan folder huruf kecil semua tanpa spasi. Server GitHub Pages
  membedakan huruf besar dan kecil, berbeda dengan macOS.
- Halaman harus tetap tampil benar saat `index.html` dibuka dengan klik ganda dari
  Finder maupun saat dilayani dari subfolder.

Tulis di `README.md` langkah deploy berikut, dan sesuaikan bila ada yang berubah:

1. Jalankan `git init`, `git add .`, `git commit -m "dashboard"`.
2. Buat repositori publik baru di GitHub, lalu `git remote add origin <url>` dan
   `git push -u origin main`.
3. Di GitHub buka Settings, lalu Pages. Pada Source pilih Deploy from a branch,
   branch `main`, folder `/ (root)`, lalu Save.
4. Tunggu satu sampai dua menit. Tautannya berbentuk
   `https://<user>.github.io/<nama-repo>/`.
5. Buka tautan itu dan pastikan keenam kartu KPI serta seluruh grafik tampil.

Kerjakan bertahap: muat data dan tampilkan kartu KPI lebih dulu, pastikan angkanya
cocok dengan `DATA_DICTIONARY.md`, baru lanjut ke grafik berikutnya.
