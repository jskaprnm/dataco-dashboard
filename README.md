# Dashboard DataCo Global

Dashboard analitik statis tentang risiko keterlambatan pengiriman DataCo Global
(mata kuliah Big Data Analytics). Dibuat dengan HTML, CSS, dan JavaScript biasa,
tanpa build step dan tanpa backend. Grafik memakai satu pustaka,
[Plotly.js 2.35.2](https://cdn.plot.ly/plotly-2.35.2.min.js), yang dimuat dari CDN lewat `https://`.

## Struktur berkas

```
index.html          halaman utama (empat tab)
styles.css          gaya tampilan
app.js              pemuatan data, format angka, grafik, tabel, interaksi
data/               data sumber (CSV, data.js, data.json)
tests/data.test.js  uji pemuatan data
.nojekyll           mematikan pemrosesan Jekyll di GitHub Pages
```

Data dimuat lewat `<script src="data/data.js"></script>` dan dibaca dari
`window.DASHBOARD_DATA`. Halaman tidak memakai `fetch()`, sehingga tetap jalan saat
dibuka langsung dari berkas (`file://`). `data/data.json` berisi isi yang sama dan
hanya disimpan sebagai cadangan; halaman tidak memuatnya.

## Cara menjalankan

**Langsung dari berkas:** klik ganda `index.html` di Finder (atau Explorer).
Koneksi internet diperlukan untuk memuat Plotly dan peta dasar dari CDN.

**Lewat server statis (opsional):**

```
python3 -m http.server 8000
```

lalu buka `http://localhost:8000/`.

## Menjalankan tes

Tes memakai modul bawaan Node.js (versi 18 ke atas), tanpa npm:

```
node --test tests/data.test.js
```

Tes memeriksa bahwa `data/data.js` mengisi `window.DASHBOARD_DATA`, bahwa jumlah
`Jumlah Order` pada `d01_tren_bulanan` dan `d16_geo` masing-masing tepat 180519,
bahwa angka KPI cocok dengan `DATA_DICTIONARY.md`, dan bahwa `data.json` sama dengan `data.js`.

## Cara deploy ke GitHub Pages

1. Jalankan `git init`, `git add .`, `git commit -m "dashboard"`.
   Bila branch awal bukan `main`, jalankan `git branch -M main`.
2. Buat repositori publik baru di GitHub, lalu `git remote add origin <url>` dan
   `git push -u origin main`.
3. Di GitHub buka Settings, lalu Pages. Pada Source pilih Deploy from a branch,
   branch `main`, folder `/ (root)`, lalu Save.
4. Tunggu satu sampai dua menit. Tautannya berbentuk
   `https://<user>.github.io/<nama-repo>/`.
5. Buka tautan itu dan pastikan keenam kartu KPI serta seluruh grafik tampil.

Semua rujukan berkas memakai jalur relatif (`styles.css`, `app.js`, `data/data.js`),
jadi situs tetap jalan saat dilayani dari subfolder `/<nama-repo>/`.

## Daftar grafik dan sumber data

### Tab 1 — Ringkasan Eksekutif

| Elemen | Jenis | Sumber data |
| --- | --- | --- |
| Kartu KPI (Total Order, Late Rate, Nilai Penjualan, Order Test Set, Tidak Terdeteksi, Porsi Standard Class) | Kartu angka | `kpi.mentah` di `data/data.js` |
| Tren Volume Order | Grafik garis | `d01_tren_bulanan` |
| Tren Late Rate | Grafik garis | `d01_tren_bulanan` |
| Late Rate per Moda | Batang horizontal, menurun | `d02_moda` |
| Peta Sebaran Pelanggan | Peta titik (ukuran = Jumlah Order, warna = Late Rate) | `d16_geo` |

Filter moda pengiriman pada tab ini memengaruhi grafik Late Rate per Moda.
`d01_tren_bulanan` dan `d16_geo` tidak memuat rincian per moda, jadi kedua grafik
itu tidak berubah oleh filter.

### Tab 2 — Analisis Operasional

| Elemen | Jenis | Sumber data |
| --- | --- | --- |
| Performa Region | Tabel, dapat diurutkan | `d04_region_crosstab` (diputar per region) |
| Negara Tujuan Terbesar | Grafik batang, 15 negara, menurun | `d07_negara` |
| Heatmap Moda terhadap Region | Heatmap dengan angka di sel | `d06_matriks` |

### Tab 3 — Machine Learning

| Elemen | Jenis | Sumber data |
| --- | --- | --- |
| Perbandingan Model | Tabel, dapat diurutkan, baris Accuracy tertinggi ditandai | `d08_model_crosstab` (diputar per model) |
| Feature Importance | Batang horizontal, menurun, kelompok Dominan diberi warna aksen | `d10_fitur` |
| Kurva Ambang | Grafik garis per metrik + penggeser ambang | `d11_ambang` |
| Deteksi per Moda | Batang berdampingan | `d03_deteksi_moda` |
| Stabilitas Bulanan | Grafik garis per metrik | `d17_stabilitas` |

### Tab 4 — Graph Analytics

| Elemen | Jenis | Sumber data |
| --- | --- | --- |
| Scatter Sentralitas | Scatter (ukuran = Jumlah Order, warna dan bentuk = Tipe Node) | `d12_node` |
| Node Paling Sentral | Tabel, dapat diurutkan | `d13_node_crosstab` (diputar per node) |
| Scatter Kategori Produk | Scatter (ukuran = Jumlah Order) | `d15_kategori` |
| Relasi Terbesar | Batang horizontal, menurun | `d14_relasi` |

Panel insight pada tab 2, 3, dan 4 berisi tulisan penulis dan dapat diubah
langsung di `index.html` (elemen `<div class="insight">`).

## Catatan format dan aksesibilitas

- Angka memakai format Indonesia: titik untuk ribuan, koma untuk desimal.
- Rasio disimpan sebagai pecahan dan baru dikali 100 saat ditampilkan.
- Nilai kosong pada `d08_model_crosstab` tampil sebagai tanda pisah (—).
- Palet hanya memakai gradasi biru, tanpa pasangan merah-hijau. Kategori pada grafik
  juga dibedakan dengan bentuk titik atau pola garis.
- Tab dapat dipindah dengan tombol panah kiri/kanan, Home, dan End. Header tabel,
  kotak centang filter, dan penggeser ambang dapat dijangkau dengan Tab dan punya label.
