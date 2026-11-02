# Kamus Data — Dashboard DataCo Global

Delapan belas berkas CSV dan satu `data.json` yang memuat semuanya.
Semua CSV: pemisah koma, desimal titik, UTF-8 tanpa BOM, baris pertama header.
Nilai bertipe rasio disimpan sebagai pecahan, misalnya `0.5483` berarti 54,83 persen.

## Ringkasan

| Berkas | Baris | Kolom | Isi |
| --- | ---: | ---: | --- |
| `d01_tren_bulanan.csv` | 37 | 4 | Deret waktu bulanan, Januari 2015 sampai Januari 2018. |
| `d02_moda.csv` | 4 | 7 | Performa aktual dan performa model per moda pengiriman. |
| `d03_deteksi_moda.csv` | 8 | 3 | Bentuk panjang dari d02 untuk grafik batang berdampingan: late rate sebenarnya versus yang terdeteksi model. |
| `d04_region_crosstab.csv` | 50 | 5 | Bentuk panjang per region. Memuat Accuracy dan Tidak Terdeteksi yang tidak ada di d05. |
| `d05_region.csv` | 10 | 4 | Ringkasan numerik per region. |
| `d06_matriks.csv` | 48 | 4 | Kombinasi moda kali region untuk heatmap. |
| `d07_negara.csv` | 15 | 4 | Lima belas negara tujuan dengan order terbanyak. |
| `d08_model_crosstab.csv` | 65 | 5 | Bentuk panjang per model. Memuat F1 dan Waktu Latih yang tidak ada di d09. Nilai kosong berarti metrik itu tidak berlaku untuk baseline. |
| `d09_model.csv` | 12 | 5 | Ringkasan numerik perbandingan model. |
| `d10_fitur.csv` | 8 | 3 | Importance per kelompok fitur. Kolom Sorotan menandai kelompok dominan. |
| `d11_ambang.csv` | 147 | 3 | Kurva metrik terhadap ambang klasifikasi, 0,02 sampai 0,98. |
| `d12_node.csv` | 142 | 7 | Metrik sentralitas 142 node pada graph lokasi pelanggan dan negara tujuan. |
| `d13_node_crosstab.csv` | 40 | 5 | Bentuk panjang dari sepuluh node paling sentral. |
| `d14_relasi.csv` | 12 | 3 | Dua belas relasi dengan volume order terbesar. |
| `d15_kategori.csv` | 32 | 5 | Metrik graph untuk 32 kategori produk. |
| `d16_geo.csv` | 46 | 6 | Titik peta pelanggan dengan koordinat. |
| `d17_stabilitas.csv` | 20 | 3 | Metrik model per bulan pada periode uji. |
| `k_kpi.csv` | 1 | 8 | Delapan angka ringkasan untuk kartu KPI. Kolom berisi teks siap tampil; versi angkanya ada di data.json pada kunci kpi.mentah. |

## Rincian kolom

### `d01_tren_bulanan.csv`

Deret waktu bulanan, Januari 2015 sampai Januari 2018.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Bulan | teks | `2015-01` |
| Jumlah Order | bilangan bulat | `5322` |
| Late Rate | desimal | `0.5411` |
| Total Sales | desimal | `1051590.08` |

### `d02_moda.csv`

Performa aktual dan performa model per moda pengiriman.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Shipping Mode | teks | `Standard Class` |
| Jumlah Order | bilangan bulat | `21633` |
| Late Rate Aktual | desimal | `0.3775` |
| Recall Model | desimal | `0.0148` |
| Accuracy | desimal | `0.6206` |
| Tidak Terdeteksi | bilangan bulat | `8046` |
| Salah Alarm | bilangan bulat | `162` |

### `d03_deteksi_moda.csv`

Bentuk panjang dari d02 untuk grafik batang berdampingan: late rate sebenarnya versus yang terdeteksi model.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Shipping Mode | teks | `Standard Class` |
| Ukuran | teks | `Late rate sebenarnya` |
| Nilai | desimal | `0.3775` |

### `d04_region_crosstab.csv`

Bentuk panjang per region. Memuat Accuracy dan Tidak Terdeteksi yang tidak ada di d05.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Order Region | teks | `Western Europe` |
| Metrik | teks | `Accuracy` |
| Nilai | desimal | `0.7238` |
| Satuan | teks | `rasio` |
| Tampil | teks | `72,38%` |

### `d05_region.csv`

Ringkasan numerik per region.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Order Region | teks | `Western Europe` |
| Jumlah Order | bilangan bulat | `12351` |
| Late Rate | desimal | `0.5539` |
| Recall Model | desimal | `0.6031` |

### `d06_matriks.csv`

Kombinasi moda kali region untuk heatmap.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Shipping Mode | teks | `First Class` |
| Order Region | teks | `Caribbean` |
| Jumlah Order | bilangan bulat | `1193` |
| Late Rate | desimal | `0.9489` |

### `d07_negara.csv`

Lima belas negara tujuan dengan order terbanyak.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Order Country | teks | `Estados Unidos` |
| Jumlah Order | bilangan bulat | `24840` |
| Late Rate | desimal | `0.5503` |
| Total Sales | desimal | `4879667.67` |

### `d08_model_crosstab.csv`

Bentuk panjang per model. Memuat F1 dan Waktu Latih yang tidak ada di d09. Nilai kosong berarti metrik itu tidak berlaku untuk baseline.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Model | teks | `Logistic Regression · Spark MLlib` |
| Metrik | teks | `Accuracy` |
| Nilai | desimal | `0.7012` |
| Satuan | teks | `rasio` |
| Tampil | teks | `0,7012` |

### `d09_model.csv`

Ringkasan numerik perbandingan model.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Model | teks | `Logistic Regression` |
| Kerangka Kerja | teks | `Spark MLlib` |
| Accuracy | desimal | `0.7012` |
| ROC AUC | desimal | `0.744` |
| Recall | desimal | `0.5587` |

### `d10_fitur.csv`

Importance per kelompok fitur. Kolom Sorotan menandai kelompok dominan.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Kelompok Fitur | teks | `Moda pengiriman` |
| Importance | desimal | `0.665` |
| Sorotan | teks | `Dominan` |

### `d11_ambang.csv`

Kurva metrik terhadap ambang klasifikasi, 0,02 sampai 0,98.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Ambang | desimal | `0.02` |
| Metrik | teks | `Accuracy` |
| Nilai | desimal | `0.543` |

### `d12_node.csv`

Metrik sentralitas 142 node pada graph lokasi pelanggan dan negara tujuan.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Node | teks | `PR` |
| Tipe Node | teks | `Lokasi pelanggan` |
| Degree | bilangan bulat | `106` |
| Betweenness | desimal | `0.3702` |
| Closeness | desimal | `0.8011` |
| Jumlah Order | bilangan bulat | `68925` |
| Late Rate | desimal | `0.5472` |

### `d13_node_crosstab.csv`

Bentuk panjang dari sepuluh node paling sentral.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Node | teks | `PR · Lokasi pelanggan` |
| Metrik | teks | `Betweenness` |
| Nilai | desimal | `0.3702` |
| Satuan | teks | `skor` |
| Tampil | teks | `0,3702` |

### `d14_relasi.csv`

Dua belas relasi dengan volume order terbesar.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Relasi | teks | `PR → Estados Unidos` |
| Jumlah Order | bilangan bulat | `9398` |
| Late Rate | desimal | `0.5468` |

### `d15_kategori.csv`

Metrik graph untuk 32 kategori produk.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Kategori Produk | teks | `Tennis & Racquet` |
| Degree Centrality | desimal | `0.3226` |
| Betweenness | desimal | `0.2452` |
| Late Rate | desimal | `0.5579` |
| Jumlah Order | bilangan bulat | `328` |

### `d16_geo.csv`

Titik peta pelanggan dengan koordinat.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Customer State | teks | `PR` |
| Customer Country | teks | `Puerto Rico` |
| Jumlah Order | bilangan bulat | `69373` |
| Late Rate | desimal | `0.5476` |
| Latitude | desimal | `18.404934` |
| Longitude | desimal | `-66.610403` |

### `d17_stabilitas.csv`

Metrik model per bulan pada periode uji.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Bulan | teks | `2017-04` |
| Metrik | teks | `Accuracy` |
| Nilai | desimal | `0.6874` |

### `k_kpi.csv`

Delapan angka ringkasan untuk kartu KPI. Kolom berisi teks siap tampil; versi angkanya ada di data.json pada kunci kpi.mentah.

| Kolom | Tipe | Contoh |
| --- | --- | --- |
| Total Order | desimal | `180.519` |
| Late Rate | teks | `54,83%` |
| Nilai Penjualan | teks | `$36.784.735` |
| Order Test Set | desimal | `36.259` |
| Tidak Terdeteksi | desimal | `8.151` |
| Porsi Standard Class | teks | `98,71%` |
| Accuracy Terbaik | desimal | `0.7182` |
| ROC AUC Terbaik | desimal | `0.7714` |

## Angka kunci untuk pemeriksaan

| Besaran | Nilai |
| --- | ---: |
| Total order | 180.519 |
| Late rate keseluruhan | 54,83% |
| Nilai penjualan | $36.784.735 |
| Order pada test set | 36.259 |
| Keterlambatan tidak terdeteksi | 8.151 |
| Porsi Standard Class dari yang tidak terdeteksi | 98,71% |
| Accuracy model terbaik | 0,7182 |
| ROC AUC model terbaik | 0,7714 |
| Jumlah node graph | 142 |

Jumlah `Jumlah Order` pada `d01_tren_bulanan.csv` dan pada `d16_geo.csv`
masing-masing harus tepat 180.519. Pakai ini untuk mengecek pemuatan data.
