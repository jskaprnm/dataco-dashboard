/* Dashboard DataCo Global
 * Data dimuat dari data/data.js (window.DASHBOARD_DATA), tanpa fetch(),
 * agar tetap jalan saat index.html dibuka langsung lewat file://.
 * Semua rasio disimpan sebagai pecahan; dikali 100 hanya saat ditampilkan.
 * Tidak ada angka yang dihitung ulang atau dikarang: semua nilai dibaca dari data.
 */
(function () {
  'use strict';

  // =====================================================================
  // 1. Warna dan format angka
  // =====================================================================
  var C = {
    navy: '#12395F', blue: '#2B6CA3', blueMid: '#5B94C4', blueLight: '#BCD4E8',
    wash: '#EDF3F9', bg: '#F4F7FB', border: '#E5EAF1', grid: '#EEF2F7',
    gray: '#6B7785', neutral: '#B3BDC8', text: '#1C2733'
  };
  var SEQ_SCALE = [[0, C.blueLight], [0.5, C.blueMid], [1, C.navy]];
  var SERIES = [
    { color: C.navy, dash: 'solid', symbol: 'circle' },
    { color: C.blueMid, dash: 'dash', symbol: 'diamond' },
    { color: C.gray, dash: 'dot', symbol: 'square' }
  ];

  var nfCache = {};
  function nf(d) {
    if (!nfCache[d]) nfCache[d] = new Intl.NumberFormat('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
    return nfCache[d];
  }
  var DASH = '—';
  function isMissing(v) { return v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v)); }
  function fmtInt(v) { return isMissing(v) ? DASH : nf(0).format(v); }
  function fmtDec(v, d) { return isMissing(v) ? DASH : nf(d === undefined ? 4 : d).format(v); }
  function fmtPct(v, d) { return isMissing(v) ? DASH : nf(d === undefined ? 2 : d).format(v * 100) + '%'; }
  function fmtUsd(v) { return isMissing(v) ? DASH : '$' + nf(0).format(v); }
  function fmtSec(v) { return isMissing(v) ? DASH : nf(1).format(v) + ' dtk'; }
  function fmtAmbang(v) { return nf(2).format(Number(v)); }
  function dec4(v) { return fmtDec(v, 4); }

  var BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function monthParts(s) { var p = String(s).split('-'); return { y: p[0], m: parseInt(p[1], 10) - 1 }; }
  function monthShort(s) { var p = monthParts(s); return BULAN[p.m] ? BULAN[p.m] + ' ' + p.y : s; }
  function monthLong(s) { var p = monthParts(s); return BULAN_PANJANG[p.m] ? BULAN_PANJANG[p.m] + ' ' + p.y : s; }

  // =====================================================================
  // 2. Util DOM
  // =====================================================================
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'text') node.textContent = v;
        else if (k === 'className') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  function unique(arr) {
    var seen = {}, out = [];
    arr.forEach(function (v) { if (!seen[v]) { seen[v] = true; out.push(v); } });
    return out;
  }
  function maxOf(arr) { return arr.reduce(function (m, v) { return v > m ? v : m; }, -Infinity); }
  function minOf(arr) { return arr.reduce(function (m, v) { return v < m ? v : m; }, Infinity); }
  function sum(rows, key) { return rows.reduce(function (s, r) { return s + (Number(r[key]) || 0); }, 0); }
  function col(rows, key) { return rows.map(function (r) { return r[key]; }); }

  /** Ubah tabel bentuk panjang (dimensi, Metrik, Nilai) menjadi satu baris per dimensi. */
  function pivot(rows, dimKey) {
    var order = [], map = {};
    rows.forEach(function (r) {
      var k = r[dimKey];
      if (!map[k]) { map[k] = { _name: k }; order.push(k); }
      map[k][r.Metrik] = isMissing(r.Nilai) ? null : r.Nilai;
    });
    return order.map(function (k) { return map[k]; });
  }

  var ICONS = {
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    dollar: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    eyeOff: '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>'
  };
  function svgIcon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }
  /** Garis kecil (sparkline) dari deret nilai sebenarnya; hanya dekoratif. */
  function sparkline(values) {
    var w = 96, h = 34, pad = 2;
    var mn = minOf(values), mx = maxOf(values), span = mx - mn || 1;
    var pts = values.map(function (v, i) {
      var x = pad + i * (w - 2 * pad) / Math.max(values.length - 1, 1);
      var y = h - pad - (v - mn) / span * (h - 2 * pad);
      return x.toFixed(1) + ',' + y.toFixed(1);
    });
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<polyline points="' + pts.join(' ') + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
  }

  function showError(msg) {
    var box = $('load-error');
    box.appendChild(el('p', { text: msg }));
    box.hidden = false;
  }

  // =====================================================================
  // 3. Data
  // =====================================================================
  var D = window.DASHBOARD_DATA;
  if (!D || typeof D !== 'object') {
    showError('Data tidak dapat dimuat. Pastikan berkas data/data.js ada di folder data/ di samping index.html, lalu muat ulang halaman.');
    document.querySelectorAll('.chart').forEach(function (c) { c.appendChild(el('div', { className: 'chart-message', text: 'Data tidak tersedia.' })); });
    return;
  }
  var K = (D.kpi && D.kpi.mentah) || {};
  var HAS_PLOTLY = typeof window.Plotly !== 'undefined';
  if (!HAS_PLOTLY) {
    showError('Pustaka grafik (Plotly) gagal dimuat dari CDN. Periksa koneksi internet lalu muat ulang halaman. Kartu KPI dan tabel tetap tampil.');
  }

  // Pemeriksaan pemuatan data (uji lengkap ada di tests/data.test.js).
  ['d01_tren_bulanan', 'd16_geo'].forEach(function (k) {
    var total = sum(D[k] || [], 'Jumlah Order');
    if (total !== 180519) console.warn('Total Jumlah Order pada ' + k + ' = ' + total + ', seharusnya 180519.');
  });

  function hasData(key) { return Array.isArray(D[key]) && D[key].length > 0; }
  function rowsOf(key) { return hasData(key) ? D[key] : []; }
  function findRow(key, match) {
    return rowsOf(key).filter(function (r) {
      return Object.keys(match).every(function (k) { return r[k] === match[k]; });
    })[0];
  }
  /** Model Spark MLlib (bukan varian ambang) yang memiliki nilai metrik tertentu. */
  function sparkModelWith(metric, value) {
    var r = rowsOf('d09_model').filter(function (m) {
      return m['Kerangka Kerja'] === 'Spark MLlib' && String(m.Model).indexOf('@') === -1 && m[metric] === value;
    })[0];
    return r ? r.Model + ' · ' + r['Kerangka Kerja'] : null;
  }

  // =====================================================================
  // 4. Helper Plotly (gaya seragam di semua tab)
  // =====================================================================
  var FONT = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  var CONFIG = { responsive: true, displayModeBar: false, displaylogo: false, scrollZoom: false };

  function axis(title, extra) {
    return Object.assign({
      title: title ? { text: title, font: { size: 12, color: C.gray }, standoff: 8 } : undefined,
      showgrid: true, gridcolor: C.grid, gridwidth: 1,
      showline: false, zeroline: false,
      ticks: '', tickfont: { size: 11.5, color: C.gray },
      automargin: true, fixedrange: true
    }, extra || {});
  }
  function layout(extra) {
    return Object.assign({
      font: { family: FONT, size: 12, color: C.text },
      separators: ',.',            // desimal koma, ribuan titik
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 4, r: 12, t: 6, b: 4 },
      hoverlabel: { bgcolor: '#FFFFFF', bordercolor: C.border, align: 'left', font: { family: FONT, color: C.text, size: 12.5 } },
      hovermode: 'closest', showlegend: false, bargap: 0.32,
      legend: { orientation: 'h', x: 1, xanchor: 'right', y: 1.02, yanchor: 'bottom', font: { size: 12, color: C.text }, bgcolor: 'rgba(0,0,0,0)' }
    }, extra || {});
  }
  function withLegend(extra) { return Object.assign({ showlegend: true, margin: { l: 4, r: 12, t: 30, b: 4 } }, extra || {}); }
  function barText(extra) { return Object.assign({ textposition: 'outside', cliponaxis: false, textfont: { size: 11.5, color: C.text } }, extra || {}); }

  function message(id, text) {
    var node = $(id);
    if (!node) return;
    if (HAS_PLOTLY && node.data) Plotly.purge(node);
    node.innerHTML = '';
    node.appendChild(el('div', { className: 'chart-message', text: text }));
  }
  function plot(id, data, lay) {
    var node = $(id);
    if (!node) return null;
    if (!HAS_PLOTLY) { message(id, 'Grafik tidak tersedia karena pustaka grafik gagal dimuat.'); return null; }
    if (!node.data) node.innerHTML = '';
    return Plotly.react(node, data, layout(lay), CONFIG);
  }
  function sizeRef(maxVal, maxPx) { return 2 * maxVal / (maxPx * maxPx); }

  /** Jalankan render komponen; bila data hilang atau terjadi galat, tampilkan pesan di kartunya. */
  function guard(targetIds, keys, fn) {
    var missing = keys.filter(function (k) { return !hasData(k); });
    if (missing.length) {
      targetIds.forEach(function (id) { message(id, 'Data ' + missing.join(', ') + ' tidak tersedia.'); });
      return;
    }
    try { fn(); } catch (e) {
      console.error(e);
      targetIds.forEach(function (id) { message(id, 'Komponen ini gagal ditampilkan. Detail galat ada di konsol browser.'); });
    }
  }

  // =====================================================================
  // 5. Komponen: popover, multi-select, tabel
  // =====================================================================
  // Popover info dan dropdown memakai <details>: bisa dibuka dengan klik, sentuh, Enter, atau Spasi.
  // Hanya satu yang terbuka; klik di luar atau Escape menutupnya.
  function popovers() { return document.querySelectorAll('details.info, details.ms'); }
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (!(d instanceof HTMLDetailsElement) || !d.open || !d.matches('.info, .ms')) return;
    popovers().forEach(function (o) { if (o !== d && o.open && !o.contains(d)) o.open = false; });
  }, true);
  document.addEventListener('click', function (e) {
    popovers().forEach(function (o) { if (o.open && !o.contains(e.target)) o.open = false; });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    popovers().forEach(function (o) {
      if (!o.open) return;
      var hadFocus = o.contains(document.activeElement);
      o.open = false;
      if (hadFocus) o.querySelector('summary').focus();
    });
  });

  /**
   * Dropdown multi-select di dalam <details class="ms">. Semua opsi terpilih di awal.
   * Mengembalikan { get, reset }.
   */
  function multiSelect(detailsId, labelId, noun, options, onChange) {
    var root = $(detailsId);
    var labelText = $(labelId) ? $(labelId).textContent : noun;
    var summary = el('summary', { className: 'ms__btn', 'aria-describedby': labelId });
    var value = el('span', { className: 'ms__value' });
    summary.appendChild(value);
    var fieldset = el('fieldset');
    fieldset.appendChild(el('legend', { className: 'sr-only', text: 'Pilih ' + noun }));
    var inputs = options.map(function (opt, i) {
      var id = detailsId + '-' + i;
      var input = el('input', { type: 'checkbox', id: id, value: opt });
      input.checked = true;
      input.addEventListener('change', changed);
      fieldset.appendChild(el('label', { className: 'ms__option', for: id }, [input, el('span', { text: opt })]));
      return input;
    });
    var all = el('button', { type: 'button', className: 'btn btn--sm', text: 'Pilih semua' });
    var none = el('button', { type: 'button', className: 'btn btn--sm', text: 'Kosongkan' });
    all.addEventListener('click', function () { setAll(true); });
    none.addEventListener('click', function () { setAll(false); });
    root.appendChild(summary);
    root.appendChild(el('div', { className: 'ms__panel' }, [el('div', { className: 'ms__actions' }, [all, none]), fieldset]));

    function get() { return inputs.filter(function (i) { return i.checked; }).map(function (i) { return i.value; }); }
    function setAll(on) { inputs.forEach(function (i) { i.checked = on; }); changed(); }
    function updateSummary() {
      var sel = get();
      var text = sel.length === options.length ? 'Semua (' + options.length + ')'
        : sel.length === 0 ? 'Tidak ada'
        : sel.length === 1 ? sel[0]
        : sel.length + ' dari ' + options.length;
      value.textContent = text;
      summary.setAttribute('aria-label', labelText + ': ' + sel.length + ' dari ' + options.length + ' ' + noun + ' dipilih');
      root.classList.toggle('is-active', sel.length !== options.length);
    }
    function changed() { updateSummary(); onChange(get()); }
    updateSummary();
    return { get: get, reset: function () { setAll(true); }, total: options.length };
  }

  /**
   * Tabel yang dapat diurutkan.
   * columns: [{ key, label, numeric, format(v), render(row) -> Node }]
   * Mengembalikan { setRows(rows) } agar filter tidak membuat ulang listener.
   */
  function sortableTable(container, columns, rows, opts) {
    opts = opts || {};
    var state = { key: opts.defaultSort ? opts.defaultSort.key : null, dir: opts.defaultSort ? opts.defaultSort.dir : 'asc' };
    var data = rows.slice();
    var table = el('table', { className: 'data-table' });
    if (opts.caption) table.appendChild(el('caption', { className: 'sr-only', text: opts.caption + '. Klik judul kolom untuk mengurutkan.' }));
    var headRow = el('tr');
    var ths = columns.map(function (c) {
      var btn = el('button', { type: 'button', className: 'sort-btn', text: c.label });
      var th = el('th', { scope: 'col', 'aria-sort': 'none', className: c.numeric ? null : 'is-text' }, [btn]);
      btn.addEventListener('click', function () {
        if (state.key === c.key) state.dir = state.dir === 'asc' ? 'desc' : 'asc';
        else { state.key = c.key; state.dir = c.numeric ? 'desc' : 'asc'; }
        render();
      });
      headRow.appendChild(th);
      return th;
    });
    var tbody = el('tbody');
    table.appendChild(el('thead', null, [headRow]));
    table.appendChild(tbody);
    container.appendChild(table);

    function compare(a, b) {
      var c = columns.filter(function (x) { return x.key === state.key; })[0];
      var va = a[state.key], vb = b[state.key];
      var ma = isMissing(va), mb = isMissing(vb);
      if (ma && mb) return 0;
      if (ma) return 1;             // nilai kosong selalu di bawah
      if (mb) return -1;
      var r = c && c.numeric ? va - vb : String(va).localeCompare(String(vb), 'id');
      return state.dir === 'asc' ? r : -r;
    }
    function render() {
      var sorted = data.slice();
      if (state.key) sorted.sort(compare);
      columns.forEach(function (c, i) {
        ths[i].setAttribute('aria-sort', c.key === state.key ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none');
      });
      tbody.innerHTML = '';
      if (!sorted.length) {
        tbody.appendChild(el('tr', null, [el('td', { colspan: String(columns.length), className: 'empty', text: opts.empty || 'Tidak ada data untuk pilihan filter ini.' })]));
        return;
      }
      sorted.forEach(function (row) {
        var tr = el('tr', { className: opts.rowClass ? opts.rowClass(row) || null : null });
        columns.forEach(function (c, i) {
          var cell = el(i === 0 ? 'th' : 'td', { scope: i === 0 ? 'row' : null, className: c.numeric ? null : 'is-text' });
          if (c.render) cell.appendChild(c.render(row));
          else cell.textContent = c.format ? c.format(row[c.key]) : (isMissing(row[c.key]) ? DASH : row[c.key]);
          if (opts.cellExtra) { var extra = opts.cellExtra(row, c); if (extra) cell.appendChild(extra); }
          tr.appendChild(cell);
        });
        tbody.appendChild(tr);
      });
    }
    render();
    return { setRows: function (r) { data = r.slice(); render(); } };
  }

  // =====================================================================
  // 6. KPI dan insight ringkas
  // =====================================================================
  function renderKpi() {
    var wrap = $('kpi-row');
    if (!D.kpi || !D.kpi.mentah) { wrap.appendChild(el('div', { className: 'chart-message', text: 'Data KPI tidak tersedia.' })); return; }
    var t = rowsOf('d01_tren_bulanan');
    var sparkPeriod = t.length ? 'Tren bulanan ' + monthShort(t[0].Bulan) + ' – ' + monthShort(t[t.length - 1].Bulan) : 'Tren bulanan';
    var primary = [
      { icon: 'box', label: 'Total Order', value: fmtInt(K.total_order), spark: col(t, 'Jumlah Order') },
      { icon: 'clock', label: 'Late Rate Keseluruhan', value: fmtPct(K.late_rate), spark: col(t, 'Late Rate') },
      { icon: 'dollar', label: 'Total Nilai Penjualan', value: fmtUsd(K.nilai_penjualan), spark: col(t, 'Total Sales') },
      { icon: 'eyeOff', label: 'Keterlambatan Tidak Terdeteksi', value: fmtInt(K.tidak_terdeteksi), tag: 'Test set', hint: 'Order terlambat yang tidak terdeteksi model, dihitung pada test set' }
    ];
    var grid = el('div', { className: 'kpi-primary' });
    primary.forEach(function (c) {
      var card = el('div', { className: 'kpi', role: 'group', 'aria-label': c.label + ': ' + c.value + (c.tag ? ' (' + c.tag + ')' : ''), title: c.hint || null }, [
        el('div', { className: 'kpi__top' }, [
          el('span', { className: 'kpi__icon', html: svgIcon(c.icon) }),
          el('span', { className: 'kpi__label', text: c.label }),
          c.tag ? el('span', { className: 'tag tag--accent', text: c.tag }) : null
        ]),
        el('span', { className: 'kpi__value', text: c.value }),
        c.spark && c.spark.length > 1 ? el('span', { className: 'kpi__spark', html: sparkline(c.spark), title: sparkPeriod, 'aria-hidden': 'true' }) : null
      ]);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    var secondary = [
      { label: 'Order Test Set', value: fmtInt(K.order_test_set) },
      { label: 'Porsi Standard Class (tidak terdeteksi)', value: fmtPct(K.porsi_standard_class) },
      { label: 'Accuracy Terbaik · ' + (sparkModelWith('Accuracy', K.accuracy_terbaik) || 'model'), value: dec4(K.accuracy_terbaik) },
      { label: 'ROC AUC Terbaik · ' + (sparkModelWith('ROC AUC', K.roc_auc_terbaik) || 'model'), value: dec4(K.roc_auc_terbaik) }
    ];
    var strip = el('section', { className: 'kpi-strip', 'aria-labelledby': 'kpi-strip-title' }, [
      el('h2', { className: 'kpi-strip__title', id: 'kpi-strip-title', html: svgIcon('cpu') + '<span>Evaluasi model · test set</span>' })
    ]);
    secondary.forEach(function (c) {
      strip.appendChild(el('div', { className: 'kpi-mini', role: 'group', 'aria-label': c.label + ': ' + c.value, title: c.label }, [
        el('span', { className: 'kpi-mini__value', text: c.value }),
        el('span', { className: 'kpi-mini__label', text: c.label })
      ]));
    });
    wrap.appendChild(strip);
  }

  /*
   * Bukti utama untuk panel insight: angka yang disebut di tulisan mahasiswa,
   * dibaca langsung dari data agar dapat dicek. Sesuaikan bila tulisan diubah.
   */
  var EVIDENCE = {
    operasional: [
      { label: 'First Class → Caribbean', src: 'd06_matriks', value: function () {
        var r = findRow('d06_matriks', { 'Shipping Mode': 'First Class', 'Order Region': 'Caribbean' });
        return r && fmtPct(r['Late Rate']);
      } },
      { label: 'Order ke Estados Unidos', src: 'd07_negara', value: function () {
        var r = findRow('d07_negara', { 'Order Country': 'Estados Unidos' });
        return r && fmtInt(r['Jumlah Order']);
      } },
      { label: 'Late rate keseluruhan', src: 'kpi', value: function () { return fmtPct(K.late_rate); } }
    ],
    ml: [
      { label: 'Tidak terdeteksi', src: 'kpi', value: function () { return fmtInt(K.tidak_terdeteksi); } },
      { label: 'Porsi Standard Class', src: 'kpi', value: function () { return fmtPct(K.porsi_standard_class); } },
      { label: 'Recall Standard Class', src: 'd02_moda', value: function () {
        var r = findRow('d02_moda', { 'Shipping Mode': 'Standard Class' });
        return r && fmtPct(r['Recall Model']);
      } }
    ],
    graph: [
      { label: 'Node dalam jaringan', src: 'd12_node', value: function () { return hasData('d12_node') && fmtInt(D.d12_node.length); } },
      { label: 'Degree node PR', src: 'd12_node', value: function () { var r = findRow('d12_node', { Node: 'PR' }); return r && fmtInt(r.Degree); } },
      { label: 'Order PR → Estados Unidos', src: 'd14_relasi', value: function () {
        var r = findRow('d14_relasi', { Relasi: 'PR → Estados Unidos' });
        return r && fmtInt(r['Jumlah Order']);
      } }
    ]
  };
  function renderEvidence() {
    document.querySelectorAll('[data-support]').forEach(function (ul) {
      var items = EVIDENCE[ul.getAttribute('data-support')] || [];
      var sources = [];
      items.forEach(function (item) {
        var v = null;
        try { v = item.value(); } catch (e) { console.error(e); }
        sources.push(item.label + ': ' + item.src);
        ul.appendChild(el('li', { title: 'Sumber: ' + item.src }, [
          el('span', { className: 'evidence__value', text: v || DASH }),
          el('span', { className: 'evidence__label', text: item.label })
        ]));
      });
      // Sumber bukti disimpan di popover agar tetap dapat ditelusuri tanpa memenuhi tampilan.
      var head = ul.parentNode.querySelector('.insight__eyebrow');
      if (head && sources.length) {
        var pop = el('div', { className: 'info__pop info__pop--left' }, [el('p', { className: 'info__src', text: 'Sumber bukti utama:' })]);
        sources.forEach(function (s) { pop.appendChild(el('p', { text: s })); });
        head.parentNode.insertBefore(el('details', { className: 'info info--inline' }, [
          el('summary', { className: 'info__btn', 'aria-label': 'Sumber bukti utama', text: 'i' }), pop
        ]), head.nextSibling);
      }
    });
  }

  /** Potong teks insight menjadi dua baris dengan tombol "Selengkapnya" bila memang terpotong. */
  function setupClamps(panel) {
    panel.querySelectorAll('[data-clamp]').forEach(function (btn) {
      if (btn.dataset.ready) return;
      var text = $(btn.getAttribute('data-clamp'));
      text.classList.add('is-clamped');
      if (text.scrollHeight <= text.clientHeight + 1) { text.classList.remove('is-clamped'); return; }
      btn.dataset.ready = '1';
      btn.hidden = false;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        text.classList.toggle('is-clamped', !open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.textContent = open ? 'Ringkas' : 'Selengkapnya';
      });
    });
  }

  // =====================================================================
  // 7. Tab 1 — Ringkasan Eksekutif
  // =====================================================================
  var tab1 = { modes: [] };

  function renderTab1() {
    guard(['chart-tren-volume', 'chart-tren-late'], ['d01_tren_bulanan'], function () {
      // Opsi periode dibangun dari tahun yang benar-benar ada di data (tanpa bulan yang tidak tersedia).
      var sel = $('select-periode');
      if (sel && !sel.options.length) {
        var years = unique(D.d01_tren_bulanan.map(function (r) { return monthParts(r.Bulan).y; }));
        sel.appendChild(el('option', { value: '', text: 'Semua Periode' }));
        years.forEach(function (y) {
          var months = D.d01_tren_bulanan.filter(function (r) { return monthParts(r.Bulan).y === y; });
          var only = months.length === 1 ? ' (' + monthLong(months[0].Bulan).split(' ')[0] + ' saja)' : '';
          sel.appendChild(el('option', { value: y, text: y + only }));
        });
        sel.addEventListener('change', function () {
          tab1.periode = sel.value || null;
          renderTren();
        });
      }
      renderTren();
    });
    guard(['chart-moda'], ['d02_moda'], function () {
      var modes = col(D.d02_moda, 'Shipping Mode');
      var ms = multiSelect('ms-moda-ringkasan', 'lbl-moda-ringkasan', 'moda', modes, function (sel) {
        tab1.modes = sel;
        $('filter-ringkasan-status').textContent = sel.length + ' dari ' + modes.length + ' moda dipilih.';
        $('moda-filter-flag').hidden = sel.length === modes.length;
        renderModaChart();
      });
      tab1.modes = ms.get();
      $('reset-ringkasan').addEventListener('click', function () {
        ms.reset();
        var sel = $('select-periode');
        if (sel) { sel.value = ''; tab1.periode = null; renderTren(); }
      });
      renderModaChart();
    });
    guard(['chart-geo'], ['d16_geo'], renderGeo);
  }

  // Filter periode: tahun yang dipilih, atau null untuk semua. Hanya memengaruhi dua grafik tren.
  tab1.periode = null;

  function renderTren() {
    var all = D.d01_tren_bulanan;
    var rows = tab1.periode ? all.filter(function (r) { return monthParts(r.Bulan).y === tab1.periode; }) : all;
    if (!rows.length) rows = all;
    // Pakai sumbu waktu asli (YYYY-MM-01) agar Plotly menata jarak label sesuai lebar plot,
    // bukan per kategori. Label otomatis menipis pada kartu yang sempit.
    var dates = rows.map(function (r) { return r.Bulan + '-01'; });
    var span = rows.length;              // jumlah bulan yang tampil
    var single = rows.length === 1;
    // Kerapatan label mengikuti lebar plot nyata (bukan hanya lebar layar): tiap label butuh
    // ~70px. Jadi kartu sempit otomatis memakai interval lebih lebar (mis. tahunan).
    var plotW = $('chart-tren-volume') ? $('chart-tren-volume').clientWidth || 320 : 320;
    var maxTicks = Math.max(3, Math.floor(plotW / 70));
    var monthStep = single ? 1 : Math.max(1, Math.ceil(span / maxTicks));
    // Bulatkan ke interval rapi: 1, 2, 3, 6, atau kelipatan 12 bulan.
    [1, 2, 3, 6, 12, 24].some(function (s) { if (monthStep <= s) { monthStep = s; return true; } return false; });
    var annual = monthStep >= 12;
    var xAxis = axis('', {
      type: 'date', tickangle: 0, showgrid: false,
      tickformat: annual ? '%Y' : (monthStep >= 3 ? '%b %Y' : '%b %y'),
      dtick: single ? undefined : (annual ? 'M12' : 'M' + monthStep),
      ticklabelmode: 'period'
    });
    if (single) { xAxis.tickvals = dates; xAxis.ticktext = [monthLong(rows[0].Bulan)]; }

    plot('chart-tren-volume', [{
      type: 'scatter', mode: single ? 'markers' : 'lines', x: dates, y: col(rows, 'Jumlah Order'),
      customdata: rows.map(function (r) { return [monthLong(r.Bulan), fmtInt(r['Jumlah Order'])]; }),
      hovertemplate: '<b>%{customdata[0]}</b><br>Jumlah Order: %{customdata[1]}<extra></extra>',
      line: { color: C.blue, width: 2.5, shape: 'spline', smoothing: 0.6 },
      marker: { color: C.navy, size: single ? 10 : 4 },
      fill: single ? undefined : 'tozeroy', fillcolor: 'rgba(43,108,163,0.10)'
    }], {
      hovermode: 'x', margin: { l: 4, r: 12, t: 6, b: 6 }, xaxis: xAxis,
      yaxis: axis('Jumlah Order', { tickformat: '~s', rangemode: 'tozero' })
    });

    // Garis acuan late rate. Untuk periode terfilter, hitung ulang dari bobot Jumlah Order
    // (bukan rata-rata sederhana) agar benar secara matematis; untuk semua periode, pakai angka KPI.
    var refVal, refLabel;
    if (tab1.periode) {
      var totOrder = sum(rows, 'Jumlah Order');
      var totLate = rows.reduce(function (s, r) { return s + r['Late Rate'] * r['Jumlah Order']; }, 0);
      refVal = totOrder ? totLate / totOrder : null;
      refLabel = 'Rata-rata ' + tab1.periode + ' ' + fmtPct(refVal);
    } else {
      refVal = K.late_rate;
      refLabel = 'Keseluruhan ' + fmtPct(refVal);
    }
    var lay = { hovermode: 'x', margin: { l: 4, r: 12, t: 6, b: 6 }, xaxis: xAxis, yaxis: axis('Late Rate (%)', { tickformat: '.0%' }) };
    if (!isMissing(refVal)) {
      lay.shapes = [{ type: 'line', xref: 'paper', x0: 0, x1: 1, yref: 'y', y0: refVal, y1: refVal, line: { color: C.gray, width: 1, dash: 'dash' } }];
      lay.annotations = [{ xref: 'paper', x: 0, xanchor: 'left', yref: 'y', y: refVal, yanchor: 'bottom', showarrow: false,
        text: refLabel, font: { size: 11, color: C.gray } }];
    }
    plot('chart-tren-late', [{
      type: 'scatter', mode: 'lines+markers', x: dates, y: col(rows, 'Late Rate'),
      customdata: rows.map(function (r) { return [monthLong(r.Bulan), fmtPct(r['Late Rate']), fmtInt(r['Jumlah Order'])]; }),
      hovertemplate: '<b>%{customdata[0]}</b><br>Late Rate: %{customdata[1]}<br>Jumlah Order: %{customdata[2]}<extra></extra>',
      line: { color: C.navy, width: 2 }, marker: { color: C.navy, size: single ? 9 : 4 }
    }], lay);
  }

  function renderModaChart() {
    var rows = D.d02_moda
      .filter(function (r) { return tab1.modes.indexOf(r['Shipping Mode']) !== -1; })
      .sort(function (a, b) { return b['Late Rate Aktual'] - a['Late Rate Aktual']; });
    if (!rows.length) { message('chart-moda', 'Tidak ada moda yang dipilih. Pilih minimal satu moda atau tekan Reset.'); return; }
    plot('chart-moda', [barText({
      type: 'bar', orientation: 'h',
      y: col(rows, 'Shipping Mode'), x: col(rows, 'Late Rate Aktual'),
      text: rows.map(function (r) { return fmtPct(r['Late Rate Aktual']); }),
      customdata: rows.map(function (r) { return [fmtPct(r['Late Rate Aktual']), fmtInt(r['Jumlah Order'])]; }),
      hovertemplate: '<b>%{y}</b><br>Late Rate: %{customdata[0]}<br>Jumlah Order (test set): %{customdata[1]}<extra></extra>',
      marker: { color: rows.map(function (r, i) { return i === 0 ? C.navy : C.blueMid; }) }
    })], {
      margin: { l: 4, r: 56, t: 6, b: 4 }, bargap: 0.38,
      xaxis: axis('Late Rate (%)', { tickformat: '.0%', range: [0, 1.08] }),
      yaxis: axis('', { type: 'category', autorange: 'reversed', showgrid: false, tickfont: { size: 12.5, color: C.text } })
    });
  }

  function renderGeo() {
    var rows = D.d16_geo;
    var maxOrder = maxOf(col(rows, 'Jumlah Order'));
    plot('chart-geo', [{
      type: 'scattergeo', mode: 'markers',
      lat: col(rows, 'Latitude'), lon: col(rows, 'Longitude'),
      customdata: rows.map(function (r) { return [r['Customer State'], r['Customer Country'], fmtInt(r['Jumlah Order']), fmtPct(r['Late Rate'])]; }),
      hovertemplate: '<b>%{customdata[0]}</b> · %{customdata[1]}<br>Jumlah Order: %{customdata[2]}<br>Late Rate: %{customdata[3]}<extra></extra>',
      marker: {
        size: col(rows, 'Jumlah Order'), sizemode: 'area', sizeref: sizeRef(maxOrder, 44), sizemin: 4,
        color: col(rows, 'Late Rate'), colorscale: SEQ_SCALE, showscale: true, opacity: 0.88,
        line: { color: '#FFFFFF', width: 0.8 },
        colorbar: { title: { text: 'Late Rate', side: 'right', font: { size: 11.5, color: C.gray } }, tickformat: '.0%', thickness: 8, len: 0.7, outlinewidth: 0, tickfont: { size: 10.5, color: C.gray } }
      }
    }], {
      margin: { l: 0, r: 0, t: 0, b: 0 },
      geo: {
        projection: { type: 'mercator' },
        lonaxis: { range: [-162, -60] }, lataxis: { range: [14, 52] },
        showland: true, landcolor: '#EBF0F6',
        showcountries: true, countrycolor: '#D6DEE8',
        showsubunits: true, subunitcolor: '#DFE6EE',
        coastlinecolor: '#C9D3DE', showocean: true, oceancolor: '#FFFFFF',
        showlakes: false, showframe: false, bgcolor: 'rgba(0,0,0,0)'
      }
    });
  }

  // =====================================================================
  // 8. Tab 2 — Analisis Operasional
  // =====================================================================
  var tab2 = { regions: [], modes: [], regionTable: null, regionRows: [] };

  function renderTab2() {
    var tableRegions = hasData('d04_region_crosstab') ? unique(col(D.d04_region_crosstab, 'Order Region')) : [];
    var heatRegions = hasData('d06_matriks') ? unique(col(D.d06_matriks, 'Order Region')) : [];
    var allRegions = unique(tableRegions.concat(heatRegions)).sort(function (a, b) { return a.localeCompare(b, 'id'); });
    var modeOrder = hasData('d02_moda') ? col(D.d02_moda, 'Shipping Mode') : [];
    var heatModes = hasData('d06_matriks') ? unique(col(D.d06_matriks, 'Shipping Mode')) : [];
    var allModes = modeOrder.filter(function (m) { return heatModes.indexOf(m) !== -1; })
      .concat(heatModes.filter(function (m) { return modeOrder.indexOf(m) === -1; }));

    // Cakupan filter, dihitung dari data, ditaruh di popover.
    var onlyHeat = heatRegions.filter(function (r) { return tableRegions.indexOf(r) === -1; });
    var note = $('filter-operasional-note');
    note.appendChild(el('p', null, [el('strong', { text: 'Region: ' }), 'Performa Region dan Heatmap.']));
    note.appendChild(el('p', null, [el('strong', { text: 'Moda: ' }), 'Heatmap.']));
    note.appendChild(el('p', null, [el('strong', { text: 'Tidak berlaku: ' }), 'Negara Tujuan Terbesar (d07_negara tidak memuat region atau moda).']));
    if (onlyHeat.length) note.appendChild(el('p', { className: 'info__src', text: onlyHeat.join(' dan ') + ' hanya ada di heatmap; tabel region tidak memuatnya.' }));

    function status() {
      $('filter-operasional-status').textContent = tab2.regions.length + ' dari ' + allRegions.length + ' region dan ' +
        tab2.modes.length + ' dari ' + allModes.length + ' moda dipilih.';
    }
    var regionMs = multiSelect('ms-region', 'lbl-region', 'region', allRegions, function (sel) { tab2.regions = sel; status(); applyTab2(); });
    var modeMs = multiSelect('ms-moda-op', 'lbl-moda-op', 'moda', allModes, function (sel) { tab2.modes = sel; status(); renderHeatmap(); });
    tab2.regions = regionMs.get();
    tab2.modes = modeMs.get();
    $('reset-operasional').addEventListener('click', function () { regionMs.reset(); modeMs.reset(); });

    guard(['table-region'], ['d04_region_crosstab'], function () {
      tab2.regionRows = pivot(D.d04_region_crosstab, 'Order Region');
      tab2.regionTable = sortableTable($('table-region'), [
        { key: '_name', label: 'Region' },
        { key: 'Jumlah Order', label: 'Jumlah Order', numeric: true, format: fmtInt },
        { key: 'Late Rate', label: 'Late Rate', numeric: true, format: fmtPct },
        { key: 'Accuracy', label: 'Accuracy', numeric: true, format: fmtPct },
        { key: 'Recall', label: 'Recall', numeric: true, format: fmtPct },
        { key: 'Tidak Terdeteksi', label: 'Tidak Terdeteksi', numeric: true, format: fmtInt }
      ], tab2.regionRows, {
        caption: 'Performa Region',
        defaultSort: { key: 'Jumlah Order', dir: 'desc' },
        empty: 'Region yang dipilih tidak ada di data tabel region. Pilih region lain atau tekan Reset.'
      });
    });
    guard(['chart-negara'], ['d07_negara'], renderNegara);
    guard(['chart-heatmap'], ['d06_matriks'], renderHeatmap);
  }

  function applyTab2() {
    if (tab2.regionTable) tab2.regionTable.setRows(tab2.regionRows.filter(function (r) { return tab2.regions.indexOf(r._name) !== -1; }));
    renderHeatmap();
  }

  function renderNegara() {
    var rows = D.d07_negara.slice().sort(function (a, b) { return b['Jumlah Order'] - a['Jumlah Order']; }).slice(0, 15);
    plot('chart-negara', [barText({
      type: 'bar', orientation: 'h',
      y: col(rows, 'Order Country'), x: col(rows, 'Jumlah Order'),
      text: rows.map(function (r) { return fmtInt(r['Jumlah Order']); }),
      customdata: rows.map(function (r) { return [fmtInt(r['Jumlah Order']), fmtPct(r['Late Rate']), fmtUsd(r['Total Sales'])]; }),
      hovertemplate: '<b>%{y}</b><br>Jumlah Order: %{customdata[0]}<br>Late Rate: %{customdata[1]}<br>Total Sales: %{customdata[2]}<extra></extra>',
      marker: { color: rows.map(function (r, i) { return i < 3 ? C.blue : C.blueMid; }) }
    })], {
      margin: { l: 4, r: 56, t: 6, b: 4 }, bargap: 0.28,
      xaxis: axis('Jumlah Order', { tickformat: '~s', showgrid: true }),
      yaxis: axis('', { type: 'category', autorange: 'reversed', showgrid: false, tickfont: { size: 12, color: C.text } })
    });
  }

  function renderHeatmap() {
    if (!hasData('d06_matriks')) return;
    var m = D.d06_matriks;
    var allLate = col(m, 'Late Rate');
    var modeOrder = hasData('d02_moda') ? col(D.d02_moda, 'Shipping Mode') : [];
    function rank(x) { var i = modeOrder.indexOf(x); return i === -1 ? 99 : i; }
    var modes = unique(col(m, 'Shipping Mode')).sort(function (a, b) { return rank(a) - rank(b); })
      .filter(function (x) { return tab2.modes.indexOf(x) !== -1; });
    var regs = unique(col(m, 'Order Region')).filter(function (x) { return tab2.regions.indexOf(x) !== -1; });
    if (!modes.length || !regs.length) {
      message('chart-heatmap', 'Tidak ada kombinasi untuk pilihan filter ini. Pilih minimal satu region dan satu moda, atau tekan Reset.');
      return;
    }
    var lookup = {};
    m.forEach(function (r) { lookup[r['Shipping Mode'] + '|' + r['Order Region']] = r; });
    var z = [], text = [], cd = [];
    modes.forEach(function (mode) {
      var zr = [], tr = [], cr = [];
      regs.forEach(function (reg) {
        var r = lookup[mode + '|' + reg];
        zr.push(r ? r['Late Rate'] : null);
        tr.push(r ? fmtPct(r['Late Rate'], 1) : '');
        cr.push(r ? [fmtPct(r['Late Rate']), fmtInt(r['Jumlah Order'])] : ['tidak ada data', DASH]);
      });
      z.push(zr); text.push(tr); cd.push(cr);
    });
    plot('chart-heatmap', [{
      type: 'heatmap', x: regs, y: modes, z: z, text: text, customdata: cd,
      texttemplate: '%{text}', textfont: { size: 12 },
      colorscale: SEQ_SCALE, zmin: minOf(allLate), zmax: maxOf(allLate), xgap: 3, ygap: 3,
      hovertemplate: '<b>%{y} → %{x}</b><br>Late Rate: %{customdata[0]}<br>Jumlah Order: %{customdata[1]}<extra></extra>',
      colorbar: { title: { text: 'Late Rate', side: 'right', font: { size: 11.5, color: C.gray } }, tickformat: '.0%', thickness: 8, len: 0.9, outlinewidth: 0, tickfont: { size: 10.5, color: C.gray } }
    }], {
      margin: { l: 4, r: 4, t: 4, b: 4 },
      xaxis: axis('Order Region', { type: 'category', tickangle: -25, showgrid: false, tickfont: { size: 12, color: C.text } }),
      yaxis: axis('', { type: 'category', autorange: 'reversed', showgrid: false, tickfont: { size: 12.5, color: C.text } })
    });
  }

  // =====================================================================
  // 9. Tab 3 — Machine Learning
  // =====================================================================
  var ambang = { metrics: [], byKey: {}, markerTrace: -1 };
  function ambangKey(v) { return Math.round(Number(v) * 100); }

  function renderTab3() {
    guard(['table-model'], ['d08_model_crosstab'], renderModelTable);
    guard(['chart-fitur'], ['d10_fitur'], renderFitur);
    guard(['chart-ambang'], ['d11_ambang'], renderAmbang);
    guard(['chart-deteksi'], ['d03_deteksi_moda'], renderDeteksi);
    guard(['chart-stabilitas'], ['d17_stabilitas'], renderStabilitas);
  }

  function renderModelTable() {
    var models = pivot(D.d08_model_crosstab, 'Model').map(function (r) {
      var parts = String(r._name).split(' · ');
      r._model = parts[0];
      r._fw = parts.length > 1 ? parts.slice(1).join(' · ') : null;
      return r;
    });
    var bestAcc = maxOf(models.map(function (r) { return isMissing(r.Accuracy) ? -Infinity : r.Accuracy; }));
    function isBest(r) { return r.Accuracy === bestAcc; }
    sortableTable($('table-model'), [
      { key: '_model', label: 'Model' },
      { key: '_fw', label: 'Kerangka', render: function (r) {
        if (!r._fw) return el('span', { className: 'fw fw--none', text: DASH });
        return el('span', { className: 'fw ' + (r._fw === 'Spark MLlib' ? 'fw--spark' : 'fw--alt'), text: r._fw });
      } },
      { key: 'Accuracy', label: 'Accuracy', numeric: true, format: dec4 },
      { key: 'Recall', label: 'Recall', numeric: true, format: dec4 },
      { key: 'F1', label: 'F1', numeric: true, format: dec4 },
      { key: 'ROC AUC', label: 'ROC AUC', numeric: true, format: dec4 },
      { key: 'Waktu Latih', label: 'Waktu Latih', numeric: true, format: fmtSec }
    ], models, {
      caption: 'Perbandingan Model',
      rowClass: function (r) { return isBest(r) ? 'is-best' : ''; },
      cellExtra: function (r, c) { return c.key === '_model' && isBest(r) ? el('span', { className: 'badge', text: 'Accuracy tertinggi' }) : null; }
    });

    var info = $('d-model');
    info.appendChild(el('p', { text: 'Satu baris per model. Baris yang disorot memiliki Accuracy tertinggi (' + dec4(bestAcc) + ') dari seluruh model. Tanda pisah (—) berarti metrik tidak berlaku.' }));
    var kpiModel = sparkModelWith('Accuracy', K.accuracy_terbaik);
    if (!isMissing(K.accuracy_terbaik) && K.accuracy_terbaik !== bestAcc && kpiModel) {
      info.appendChild(el('p', { text: 'KPI "Accuracy Terbaik" (' + dec4(K.accuracy_terbaik) + ') mengacu pada model Spark MLlib terbaik: ' + kpiModel + '.' }));
    }
    info.appendChild(el('p', { className: 'info__src', text: 'Sumber: d08_model_crosstab' }));
  }

  function renderFitur() {
    var fitur = D.d10_fitur.slice().sort(function (a, b) { return b.Importance - a.Importance; });
    plot('chart-fitur', [barText({
      type: 'bar', orientation: 'h',
      y: col(fitur, 'Kelompok Fitur'), x: col(fitur, 'Importance'),
      text: fitur.map(function (r) { return dec4(r.Importance); }),
      customdata: fitur.map(function (r) { return [dec4(r.Importance), r.Sorotan]; }),
      hovertemplate: '<b>%{y}</b><br>Importance: %{customdata[0]}<br>Sorotan: %{customdata[1]}<extra></extra>',
      marker: { color: fitur.map(function (r) { return r.Sorotan === 'Dominan' ? C.navy : C.neutral; }) }
    })], {
      margin: { l: 4, r: 60, t: 6, b: 4 }, bargap: 0.34,
      xaxis: axis('Importance', { tickformat: '.1f', range: [0, maxOf(col(fitur, 'Importance')) * 1.2] }),
      yaxis: axis('', { type: 'category', autorange: 'reversed', showgrid: false, tickfont: { size: 12.5, color: C.text } }),
      annotations: [{ xref: 'paper', yref: 'paper', x: 1, y: 0, xanchor: 'right', yanchor: 'bottom', showarrow: false,
        text: '<span style="color:' + C.navy + '">■</span> Dominan   <span style="color:' + C.neutral + '">■</span> Kelompok lain',
        font: { size: 11.5, color: C.gray } }]
    });
  }

  function renderAmbang() {
    var rowsA = D.d11_ambang;
    ambang.metrics = unique(col(rowsA, 'Metrik'));
    rowsA.forEach(function (r) {
      var k = ambangKey(r.Ambang);
      (ambang.byKey[k] = ambang.byKey[k] || {})[r.Metrik] = r.Nilai;
    });
    var slider = $('slider-ambang');
    var x0 = Number(slider.value);
    var traces = ambang.metrics.map(function (met, i) {
      var rs = rowsA.filter(function (r) { return r.Metrik === met; }).sort(function (a, b) { return a.Ambang - b.Ambang; });
      var st = SERIES[i % SERIES.length];
      return {
        type: 'scatter', mode: 'lines', name: met,
        x: col(rs, 'Ambang'), y: col(rs, 'Nilai'),
        customdata: rs.map(function (r) { return fmtPct(r.Nilai); }),
        hovertemplate: met + ': <b>%{customdata}</b><extra></extra>',
        line: { color: st.color, dash: st.dash, width: 2.5 }
      };
    });
    ambang.markerTrace = traces.length;
    traces.push({
      type: 'scatter', mode: 'markers', name: 'Ambang dipilih', showlegend: false, hoverinfo: 'skip',
      x: ambang.metrics.map(function () { return x0; }), y: markerValues(x0),
      marker: { size: 10, color: '#FFFFFF', line: { width: 2.5, color: ambang.metrics.map(function (m, i) { return SERIES[i % SERIES.length].color; }) } }
    });
    plot('chart-ambang', traces, withLegend({
      hovermode: 'x unified',
      legend: { orientation: 'h', x: 0, xanchor: 'left', y: 1.02, yanchor: 'bottom', font: { size: 12 } },
      xaxis: axis('Ambang', { tickformat: '.1f', range: [0, 1], dtick: 0.1, hoverformat: '.2f' }),
      yaxis: axis('Nilai (%)', { tickformat: '.0%', range: [-0.03, 1.06] }),
      shapes: [{ type: 'line', xref: 'x', yref: 'paper', x0: x0, x1: x0, y0: 0, y1: 1, line: { color: C.navy, width: 1.5, dash: 'dot' } }]
    }));

    slider.addEventListener('input', function () { updateAmbang(slider.value); });
    $('slider-ambang-reset').addEventListener('click', function () {
      slider.value = '0.5';
      updateAmbang(slider.value);
      slider.focus();
    });
    updateAmbang(slider.value);
  }
  function markerValues(v) {
    var vals = ambang.byKey[ambangKey(v)] || {};
    return ambang.metrics.map(function (m) { return isMissing(vals[m]) ? null : vals[m]; });
  }
  function updateAmbang(value) {
    var v = Number(value);
    var vals = ambang.byKey[ambangKey(v)] || {};
    $('slider-ambang-value').textContent = fmtAmbang(v);
    $('slider-ambang').setAttribute('aria-valuetext', 'Ambang ' + fmtAmbang(v) + '. ' +
      ambang.metrics.map(function (m) { return m + ' ' + fmtPct(vals[m]); }).join(', '));
    var box = $('slider-ambang-readout');
    box.innerHTML = '';
    ambang.metrics.forEach(function (m, i) {
      var tile = el('div', { className: 'metric-tile' }, [
        el('span', { className: 'metric-tile__name', text: m }),
        el('span', { className: 'metric-tile__value', text: fmtPct(vals[m]) })
      ]);
      tile.style.setProperty('--tile-color', SERIES[i % SERIES.length].color);
      box.appendChild(tile);
    });
    var gd = $('chart-ambang');
    if (HAS_PLOTLY && gd && gd.data) {
      Plotly.relayout(gd, { 'shapes[0].x0': v, 'shapes[0].x1': v });
      Plotly.restyle(gd, { x: [ambang.metrics.map(function () { return v; })], y: [markerValues(v)] }, [ambang.markerTrace]);
    }
  }

  function renderDeteksi() {
    var det = D.d03_deteksi_moda;
    var modes = unique(col(det, 'Shipping Mode'));
    var ukuran = unique(col(det, 'Ukuran'));
    var colors = [C.navy, C.blueMid];
    plot('chart-deteksi', ukuran.map(function (u, i) {
      var rs = modes.map(function (mode) { return findRow('d03_deteksi_moda', { 'Shipping Mode': mode, Ukuran: u }); });
      return barText({
        type: 'bar', name: u, x: modes,
        y: rs.map(function (r) { return r ? r.Nilai : null; }),
        text: rs.map(function (r) { return r ? fmtPct(r.Nilai, 0) : ''; }),
        customdata: modes.map(function (mode, j) {
          var d2 = findRow('d02_moda', { 'Shipping Mode': mode }) || {};
          return [rs[j] ? fmtPct(rs[j].Nilai) : DASH, fmtInt(d2['Jumlah Order']), fmtInt(d2['Tidak Terdeteksi'])];
        }),
        hovertemplate: '<b>%{x}</b><br>' + u + ': %{customdata[0]}<br>Jumlah Order (test set): %{customdata[1]}<br>Tidak Terdeteksi: %{customdata[2]}<extra></extra>',
        marker: { color: colors[i % colors.length] }
      });
    }), withLegend({
      barmode: 'group', bargap: 0.3, bargroupgap: 0.08,
      legend: { orientation: 'h', x: 0, xanchor: 'left', y: 1.02, yanchor: 'bottom', font: { size: 12 } },
      xaxis: axis('', { type: 'category', showgrid: false, tickfont: { size: 12, color: C.text } }),
      yaxis: axis('Persentase (%)', { tickformat: '.0%', range: [0, 1.14] })
    }));
  }

  function renderStabilitas() {
    var stab = D.d17_stabilitas;
    var metrics = unique(col(stab, 'Metrik'));
    plot('chart-stabilitas', metrics.map(function (met, i) {
      var rs = stab.filter(function (r) { return r.Metrik === met; });
      var st = SERIES[i % SERIES.length];
      return {
        type: 'scatter', mode: 'lines+markers', name: met,
        x: rs.map(function (r) { return monthShort(r.Bulan); }), y: col(rs, 'Nilai'),
        customdata: rs.map(function (r) { return fmtPct(r.Nilai); }),
        hovertemplate: met + ': <b>%{customdata}</b><extra></extra>',
        line: { color: st.color, dash: st.dash, width: 2.5 },
        marker: { color: st.color, size: 7, symbol: st.symbol }
      };
    }), withLegend({
      hovermode: 'x unified',
      legend: { orientation: 'h', x: 0, xanchor: 'left', y: 1.02, yanchor: 'bottom', font: { size: 12 } },
      xaxis: axis('Bulan', { type: 'category', showgrid: false }),
      yaxis: axis('Nilai (%)', { tickformat: '.0%' })
    }));
  }

  // =====================================================================
  // 10. Tab 4 — Graph Analytics
  // =====================================================================
  function renderTab4() {
    guard(['chart-network'], ['d14_relasi', 'd12_node'], renderNetwork);
    guard(['chart-sentralitas'], ['d12_node'], renderSentralitas);
    guard(['table-node'], ['d13_node_crosstab'], renderNodeTable);
    guard(['chart-kategori'], ['d15_kategori'], renderKategori);
    guard(['chart-relasi'], ['d14_relasi'], renderRelasi);
  }

  /*
   * Graf jaringan: hanya relasi yang ada di d14_relasi (relasi terbesar) dan
   * node yang terlibat; atribut node dari d12_node. Tata letak dua kolom karena
   * setiap relasi menghubungkan lokasi pelanggan (kiri) dengan negara tujuan (kanan).
   */
  function renderNetwork() {
    var nodeIdx = {};
    D.d12_node.forEach(function (n) { nodeIdx[n.Node] = n; });
    var edges = D.d14_relasi.map(function (r) {
      var p = String(r.Relasi).split(' → ');
      return { s: p[0], t: p[1], n: r['Jumlah Order'], lr: r['Late Rate'], name: r.Relasi };
    }).filter(function (e) { return e.s && e.t && nodeIdx[e.s] && nodeIdx[e.t]; });
    if (!edges.length) { message('chart-network', 'Relasi pada d14_relasi tidak cocok dengan node pada d12_node.'); return; }
    var skipped = D.d14_relasi.length - edges.length;

    var vol = {};
    edges.forEach(function (e) { vol[e.t] = (vol[e.t] || 0) + e.n; });
    var sources = unique(edges.map(function (e) { return e.s; })).sort(function (a, b) { return nodeIdx[b]['Jumlah Order'] - nodeIdx[a]['Jumlah Order']; });
    var targets = unique(edges.map(function (e) { return e.t; })).sort(function (a, b) { return vol[b] - vol[a]; });
    var nT = targets.length, nS = sources.length, total = D.d12_node.length;
    var pos = {};
    targets.forEach(function (t, j) { pos[t] = { x: 1, y: nT - 1 - j }; });
    sources.forEach(function (s, i) { pos[s] = { x: 0, y: (nT - 1) * (1 - (i + 1) / (nS + 1)) }; });

    // Keterangan subset: singkat di judul, lengkap di popover.
    $('network-subset').textContent = 'Subset: ' + edges.length + ' relasi teratas';
    var info = $('d-network');
    info.appendChild(el('p', { text: 'Menampilkan ' + edges.length + ' relasi dengan Jumlah Order terbesar beserta ' + (nS + nT) + ' node yang terhubung, dari jaringan lengkap ' + fmtInt(total) + ' node. Relasi lain tidak tersedia dalam data sehingga tidak digambar.' }));
    info.appendChild(el('p', { text: 'Pilih node di panel kiri atau arahkan kursor ke node untuk menyorot relasinya.' }));
    info.appendChild(el('p', { className: 'info__src', text: 'Sumber: relasi d14_relasi · atribut node d12_node' }));
    var meta = $('network-meta');
    [[fmtInt(nS + nT), 'node ditampilkan'], [fmtInt(total), 'node total'], [fmtInt(edges.length), 'relasi ditampilkan'], [fmtInt(nS) + ' · ' + fmtInt(nT), 'lokasi · negara']]
      .forEach(function (p) { meta.appendChild(el('div', { className: 'stat' }, [el('span', { className: 'stat__value', text: p[0] }), el('span', { className: 'stat__label', text: p[1] })])); });
    if (skipped > 0) meta.appendChild(el('div', { className: 'stat' }, [el('span', { className: 'stat__value', text: fmtInt(skipped) }), el('span', { className: 'stat__label', text: 'relasi dilewati' })]));

    var maxEdge = maxOf(edges.map(function (e) { return e.n; }));
    var EDGE = 'rgba(91,148,196,0.5)', EDGE_ON = 'rgba(18,57,95,0.9)', EDGE_OFF = 'rgba(91,148,196,0.12)';
    function curve(a, b, steps) {
      var xs = [], ys = [];
      for (var k = 0; k <= steps; k++) {
        var t = k / steps, u = 1 - t;
        xs.push(u * u * u * a.x + 3 * u * u * t * 0.5 + 3 * u * t * t * 0.5 + t * t * t * b.x);
        ys.push(u * u * u * a.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t * t * t * b.y);
      }
      return { x: xs, y: ys };
    }
    var traces = edges.map(function (e) {
      var c = curve(pos[e.s], pos[e.t], 24);
      return { type: 'scatter', mode: 'lines', x: c.x, y: c.y, hoverinfo: 'skip', showlegend: false,
        line: { width: 1.5 + 11 * e.n / maxEdge, color: EDGE } };
    });
    var edgeIdx = traces.map(function (t, i) { return i; });
    traces.push({
      type: 'scatter', mode: 'markers', showlegend: false, meta: 'edge',
      x: edges.map(function (e) { return curve(pos[e.s], pos[e.t], 2).x[1]; }),
      y: edges.map(function (e) { return curve(pos[e.s], pos[e.t], 2).y[1]; }),
      marker: { size: 16, color: 'rgba(0,0,0,0)' },
      customdata: edges.map(function (e) { return [e.name, fmtInt(e.n), fmtPct(e.lr)]; }),
      hovertemplate: '<b>%{customdata[0]}</b><br>Jumlah Order: %{customdata[1]}<br>Late Rate: %{customdata[2]}<extra></extra>'
    });
    var allNodes = sources.concat(targets);
    var maxNode = maxOf(allNodes.map(function (n) { return nodeIdx[n]['Jumlah Order']; }));
    var types = unique(allNodes.map(function (n) { return nodeIdx[n]['Tipe Node']; }));
    types.forEach(function (tp, i) {
      var ns = allNodes.filter(function (n) { return nodeIdx[n]['Tipe Node'] === tp; });
      var st = SERIES[i % SERIES.length];
      var left = ns.every(function (n) { return pos[n].x === 0; });
      traces.push({
        type: 'scatter', mode: 'markers+text', name: tp, meta: 'node',
        x: ns.map(function (n) { return pos[n].x; }), y: ns.map(function (n) { return pos[n].y; }),
        text: ns, textposition: left ? 'middle left' : 'middle right',
        textfont: { size: 12.5, color: C.text },
        customdata: ns.map(function (n) {
          var r = nodeIdx[n];
          return [n, r['Tipe Node'], fmtInt(r.Degree), dec4(r.Betweenness), dec4(r.Closeness), fmtInt(r['Jumlah Order']), fmtPct(r['Late Rate'])];
        }),
        hovertemplate: '<b>%{customdata[0]}</b> · %{customdata[1]}<br>Degree: %{customdata[2]}<br>Betweenness: %{customdata[3]}<br>Closeness: %{customdata[4]}<br>Jumlah Order: %{customdata[5]}<br>Late Rate: %{customdata[6]}<extra></extra>',
        marker: {
          symbol: st.symbol, color: st.color,
          size: ns.map(function (n) { return nodeIdx[n]['Jumlah Order']; }),
          sizemode: 'area', sizeref: sizeRef(maxNode, 62), sizemin: 11,
          line: { color: '#FFFFFF', width: 2 }
        }
      });
    });
    plot('chart-network', traces, {
      margin: { l: 4, r: 4, t: 10, b: 10 },
      xaxis: { visible: false, range: [-0.45, 1.45], fixedrange: true },
      yaxis: { visible: false, range: [-0.8, nT - 0.2], fixedrange: true }
    });

    // Sorot relasi milik node terpilih (dropdown) atau yang sedang di-hover.
    var gd = $('chart-network');
    var select = $('network-focus');
    select.appendChild(el('option', { value: '', text: 'Semua node' }));
    allNodes.forEach(function (n) { select.appendChild(el('option', { value: n, text: n + ' · ' + nodeIdx[n]['Tipe Node'] })); });
    function highlight(name) {
      if (!HAS_PLOTLY || !gd.data) return;
      Plotly.restyle(gd, { 'line.color': edges.map(function (e) {
        if (!name) return EDGE;
        return e.s === name || e.t === name ? EDGE_ON : EDGE_OFF;
      }) }, edgeIdx);
    }
    select.addEventListener('change', function () { highlight(select.value); });
    if (HAS_PLOTLY && gd.on) {
      gd.on('plotly_hover', function (ev) {
        var p = ev.points && ev.points[0];
        if (p && p.data.meta === 'node') highlight(p.customdata[0]);
      });
      gd.on('plotly_unhover', function () { highlight(select.value); });
      gd.on('plotly_click', function (ev) {
        var p = ev.points && ev.points[0];
        if (p && p.data.meta === 'node') { select.value = p.customdata[0]; highlight(select.value); }
      });
    }
  }

  function topLabels(rows, xKey, yKey, nameKey, sortKey, n, side) {
    // Susun label berjajar ke atas (dalam piksel) di satu sisi titik, sehingga tidak saling tindih
    // walau titik-titiknya berdekatan. `side` menentukan arah label menjauhi kerumunan.
    var picked = rows.slice().sort(function (a, b) { return b[sortKey] - a[sortKey]; }).slice(0, n);
    var left = side === 'left';
    var dx = left ? -26 : 26;
    var step = 26;                       // jarak antar-label dalam piksel
    var base = -(picked.length - 1) / 2 * step; // pusatkan tumpukan terhadap titik teratas
    return picked.map(function (r, i) {
      return {
        x: r[xKey], y: r[yKey], text: r[nameKey], showarrow: true, arrowhead: 0, arrowwidth: 1, arrowcolor: C.neutral,
        ax: dx, ay: base + i * step, xanchor: left ? 'right' : 'left',
        font: { size: 11.5, color: C.text }, bgcolor: 'rgba(255,255,255,0.92)', borderpad: 2
      };
    });
  }

  function renderSentralitas() {
    var nodes = D.d12_node;
    var types = unique(col(nodes, 'Tipe Node'));
    var maxOrder = maxOf(col(nodes, 'Jumlah Order'));
    plot('chart-sentralitas', types.map(function (tp, i) {
      var rs = nodes.filter(function (r) { return r['Tipe Node'] === tp; });
      var st = SERIES[i % SERIES.length];
      return {
        type: 'scatter', mode: 'markers', name: tp,
        x: col(rs, 'Betweenness'), y: col(rs, 'Late Rate'),
        customdata: rs.map(function (r) { return [r.Node, r['Tipe Node'], dec4(r.Betweenness), fmtPct(r['Late Rate']), fmtInt(r['Jumlah Order']), fmtInt(r.Degree)]; }),
        hovertemplate: '<b>%{customdata[0]}</b> · %{customdata[1]}<br>Betweenness: %{customdata[2]}<br>Late Rate: %{customdata[3]}<br>Jumlah Order: %{customdata[4]}<br>Degree: %{customdata[5]}<extra></extra>',
        marker: {
          color: st.color, symbol: st.symbol, opacity: 0.72,
          size: col(rs, 'Jumlah Order'), sizemode: 'area', sizeref: sizeRef(maxOrder, 46), sizemin: 5,
          line: { color: '#FFFFFF', width: 0.8 }
        }
      };
    }), withLegend({
      legend: { orientation: 'h', x: 0, xanchor: 'left', y: 1.02, yanchor: 'bottom', font: { size: 12 }, itemsizing: 'constant' },
      xaxis: axis('Betweenness', { tickformat: '.1f', range: [-0.02, 0.42] }),
      yaxis: axis('Late Rate (%)', { tickformat: '.0%' }),
      annotations: topLabels(nodes, 'Betweenness', 'Late Rate', 'Node', 'Betweenness', 5, 'left')
    }));
  }

  function renderNodeTable() {
    var top = pivot(D.d13_node_crosstab, 'Node').map(function (r) {
      var p = String(r._name).split(' · ');
      r._node = p[0];
      r._tipe = p.length > 1 ? p.slice(1).join(' · ') : null;
      return r;
    });
    sortableTable($('table-node'), [
      { key: '_node', label: 'Node' },
      { key: '_tipe', label: 'Tipe', render: function (r) {
        return el('span', { className: 'fw ' + (r._tipe === 'Lokasi pelanggan' ? 'fw--spark' : 'fw--alt'), text: r._tipe || DASH });
      } },
      { key: 'Degree', label: 'Degree', numeric: true, format: fmtInt },
      { key: 'Betweenness', label: 'Betweenness', numeric: true, format: dec4 },
      { key: 'Jumlah Order', label: 'Jumlah Order', numeric: true, format: fmtInt },
      { key: 'Late Rate', label: 'Late Rate', numeric: true, format: fmtPct }
    ], top, { caption: 'Node Paling Sentral', defaultSort: { key: 'Betweenness', dir: 'desc' } });
  }

  function renderKategori() {
    var kat = D.d15_kategori;
    var maxKat = maxOf(col(kat, 'Jumlah Order'));
    plot('chart-kategori', [{
      type: 'scatter', mode: 'markers',
      x: col(kat, 'Degree Centrality'), y: col(kat, 'Late Rate'),
      customdata: kat.map(function (r) { return [r['Kategori Produk'], dec4(r['Degree Centrality']), dec4(r.Betweenness), fmtPct(r['Late Rate']), fmtInt(r['Jumlah Order'])]; }),
      hovertemplate: '<b>%{customdata[0]}</b><br>Degree Centrality: %{customdata[1]}<br>Betweenness: %{customdata[2]}<br>Late Rate: %{customdata[3]}<br>Jumlah Order: %{customdata[4]}<extra></extra>',
      marker: {
        color: C.blue, opacity: 0.62,
        size: col(kat, 'Jumlah Order'), sizemode: 'area', sizeref: sizeRef(maxKat, 42), sizemin: 6,
        line: { color: C.navy, width: 1 }
      }
    }], {
      xaxis: axis('Degree Centrality', { tickformat: '.1f', range: [-0.08, 1.12] }),
      yaxis: axis('Late Rate (%)', { tickformat: '.0%' }),
      annotations: topLabels(kat, 'Degree Centrality', 'Late Rate', 'Kategori Produk', 'Jumlah Order', 5, 'left')
    });
  }

  function renderRelasi() {
    var rel = D.d14_relasi.slice().sort(function (a, b) { return b['Jumlah Order'] - a['Jumlah Order']; });
    plot('chart-relasi', [barText({
      type: 'bar', orientation: 'h',
      y: col(rel, 'Relasi'), x: col(rel, 'Jumlah Order'),
      text: rel.map(function (r) { return fmtInt(r['Jumlah Order']); }),
      customdata: rel.map(function (r) { return [fmtInt(r['Jumlah Order']), fmtPct(r['Late Rate'])]; }),
      hovertemplate: '<b>%{y}</b><br>Jumlah Order: %{customdata[0]}<br>Late Rate: %{customdata[1]}<extra></extra>',
      marker: { color: rel.map(function (r, i) { return i === 0 ? C.navy : C.blueMid; }) }
    })], {
      margin: { l: 4, r: 52, t: 6, b: 4 }, bargap: 0.3,
      xaxis: axis('Jumlah Order', { tickformat: '~s' }),
      yaxis: axis('', { type: 'category', autorange: 'reversed', showgrid: false, tickfont: { size: 12, color: C.text } })
    });
  }

  // =====================================================================
  // 11. Navigasi tab (pola WAI-ARIA tabs, aktivasi otomatis)
  // =====================================================================
  var renderers = {
    'panel-ringkasan': renderTab1,
    'panel-operasional': renderTab2,
    'panel-ml': renderTab3,
    'panel-graph': renderTab4
  };
  var rendered = {};
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function resizeCharts(panel) {
    if (!HAS_PLOTLY) return;
    panel.querySelectorAll('.js-plotly-plot').forEach(function (g) { Plotly.Plots.resize(g); });
  }

  function activate(tab, focus) {
    popovers().forEach(function (o) { o.open = false; });
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.tabIndex = selected ? 0 : -1;
      var panel = $(t.getAttribute('aria-controls'));
      panel.hidden = !selected;
      panel.classList.toggle('is-entering', selected);
    });
    if (focus) tab.focus();
    if (tab.scrollIntoView) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    var panelId = tab.getAttribute('aria-controls');
    var panel = $(panelId);
    // Grafik digambar saat tab pertama kali tampil agar ukurannya benar.
    if (!rendered[panelId]) {
      rendered[panelId] = true;
      renderers[panelId]();
    } else {
      resizeCharts(panel);
    }
    setupClamps(panel);
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activate(next, true); }
    });
  });

  // Ukuran ulang grafik saat lebar layar berubah (melewati breakpoint) atau panel dibuka.
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var active = document.querySelector('.tab-panel:not([hidden])');
      if (active) resizeCharts(active);
    }, 150);
  });
  document.querySelectorAll('details.collapse').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) resizeCharts(d); });
  });

  // =====================================================================
  // 12. Mulai
  // =====================================================================
  renderKpi();
  renderEvidence();
  activate(tabs[0], false);
})();
