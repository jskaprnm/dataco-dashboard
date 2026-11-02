# DataCo Global Dashboard

Dashboard analitik statis untuk menganalisis risiko keterlambatan pengiriman
DataCo Global: performa operasional, evaluasi model machine learning, dan
graph analytics jaringan pengiriman.

**Live:** https://jskaprnm.github.io/dataco-dashboard/

## Overview

Dashboard satu halaman dengan empat tab. Seluruh angka berasal dari data historis
periode Januari 2015 sampai Januari 2018 dan dibaca langsung dari berkas data di
folder `data/`. Tidak ada backend; seluruh pemrosesan berjalan di sisi klien.

Catatan: ini adalah proyek analitik data historis, bukan pemantauan waktu nyata.
Nilai pada kartu KPI mencakup metrik seluruh data (mis. Total Order) dan metrik
yang dihitung pada test set model (ditandai label "Test set").

## Dashboard Features

### Ringkasan Eksekutif
- Kartu KPI: Total Order, Late Rate Keseluruhan, Total Nilai Penjualan,
  Keterlambatan Tidak Terdeteksi (test set), serta strip KPI evaluasi model
  (Order Test Set, Porsi Standard Class, Accuracy Terbaik, ROC AUC Terbaik)
- Tren Volume Order bulanan
- Tren Late Rate bulanan dengan garis acuan
- Late Rate per moda pengiriman
- Peta sebaran pelanggan (ukuran titik = Jumlah Order, warna = Late Rate)
- Filter Periode (Semua Periode, 2015, 2016, 2017, 2018) yang memengaruhi kedua grafik tren
- Filter moda pengiriman yang memengaruhi grafik Late Rate per Moda

### Analisis Operasional
- Tabel Performa Region yang dapat diurutkan
- Grafik 15 negara tujuan terbesar
- Heatmap moda pengiriman terhadap region
- Filter Region dan Moda (berlaku pada visualisasi yang datanya mendukung)

### Machine Learning
- Tabel perbandingan model (membedakan implementasi Spark MLlib dan scikit-learn)
- Feature importance
- Kurva ambang klasifikasi dengan penggeser ambang interaktif
- Perbandingan deteksi per moda pengiriman
- Stabilitas model bulanan

### Graph Analytics
- Graf jaringan interaktif (subset relasi terbesar) dengan sorot node
- Scatter sentralitas (betweenness terhadap late rate)
- Tabel node paling sentral
- Scatter kategori produk
- Grafik relasi pengiriman terbesar

Tiap tab analitik memuat satu panel insight ringkas berisi tulisan penulis
beserta bukti angka yang diambil langsung dari data.

## Technology Stack

- HTML, CSS, dan JavaScript tanpa framework dan tanpa build step
- [Plotly.js 2.35.2](https://cdn.plot.ly/plotly-2.35.2.min.js) dari CDN (`https://`)
  sebagai satu-satunya pustaka grafik
- Node.js (modul bawaan) hanya untuk menjalankan tes; tidak dipakai saat runtime

Data dimuat lewat `<script src="data/data.js"></script>` dan dibaca dari
`window.DASHBOARD_DATA`, bukan `fetch()`, sehingga halaman tetap jalan saat dibuka
langsung dari berkas (`file://`). `data/data.json` berisi isi yang sama sebagai
cadangan terdokumentasi bila dilayani lewat server.

## Data Coverage

- Periode: Januari 2015 – Januari 2018 (2018 hanya bulan Januari)
- Total Order: 180.519
- Late Rate Keseluruhan: 54,83%
- Order Test Set: 36.259
- Keterlambatan Tidak Terdeteksi (test set): 8.151
- Accuracy model terbaik: 0,7182 · ROC AUC terbaik: 0,7714
- Jumlah node graph: 142

Angka ditampilkan dengan format Indonesia (titik untuk ribuan, koma untuk desimal).
Nilai rasio disimpan sebagai pecahan dan dikali 100 hanya saat ditampilkan.

## Project Structure

```
index.html          halaman utama (empat tab)
styles.css          gaya tampilan
app.js              pemuatan data, format angka, grafik, tabel, filter, interaksi
data/               data sumber (CSV, data.js, data.json)
tests/data.test.js  uji pemuatan data dan konsistensi angka
DATA_DICTIONARY.md  kamus kolom tiap berkas data
.nojekyll           menonaktifkan pemrosesan Jekyll di GitHub Pages
```

## Running Locally

**Langsung dari berkas:** klik ganda `index.html`. Koneksi internet diperlukan
untuk memuat Plotly dan peta dasar dari CDN.

**Lewat server statis (opsional):**

```
python3 -m http.server 8000
```

lalu buka `http://localhost:8000/`.

## GitHub Pages

Situs dilayani dari branch `main`, folder `/ (root)`. Seluruh rujukan berkas
memakai jalur relatif, dan `.nojekyll` mencegah GitHub memproses ulang struktur
folder, sehingga situs berjalan benar dari subfolder `/<nama-repo>/`.

Memperbarui situs: commit perubahan ke `main` lalu `git push`. GitHub Pages akan
mem-publish ulang dalam satu sampai dua menit.

## Testing

Tes memakai modul bawaan Node.js (versi 18 ke atas), tanpa npm:

```
node --test tests/data.test.js
```

Tes memeriksa bahwa `data/data.js` mengisi `window.DASHBOARD_DATA`, bahwa jumlah
`Jumlah Order` pada `d01_tren_bulanan` dan `d16_geo` masing-masing tepat 180519,
bahwa angka KPI cocok dengan `DATA_DICTIONARY.md`, dan bahwa `data.json` identik
dengan `data.js`.

## Catatan pengembangan

Dashboard ini disusun dengan bantuan AI (Kiro) untuk implementasi antarmuka dan
visualisasi. Seluruh angka, metrik, hasil model, dan metrik graph berasal dari
data proyek dan tidak diubah. Tulisan insight pada tiap tab ditulis oleh penulis.
