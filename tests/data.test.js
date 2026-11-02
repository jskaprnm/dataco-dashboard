// Uji pemuatan data dashboard. Jalankan dari akar proyek:
//   node --test tests/data.test.js
// Tanpa npm, hanya modul bawaan Node.js (versi 18 ke atas).
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const EXPECTED_TOTAL = 180519;

// Muat data/data.js persis seperti browser: jalankan skripnya lalu baca window.DASHBOARD_DATA.
function loadDataJs() {
  const code = fs.readFileSync(path.join(ROOT, 'data', 'data.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: 'data/data.js' });
  return sandbox.window.DASHBOARD_DATA;
}

function sumOrders(rows) {
  return rows.reduce((s, r) => s + r['Jumlah Order'], 0);
}

const data = loadDataJs();

test('data/data.js mengisi window.DASHBOARD_DATA', () => {
  assert.ok(data && typeof data === 'object', 'window.DASHBOARD_DATA tidak terisi');
  const keys = [
    'd01_tren_bulanan', 'd02_moda', 'd03_deteksi_moda', 'd04_region_crosstab', 'd05_region',
    'd06_matriks', 'd07_negara', 'd08_model_crosstab', 'd09_model', 'd10_fitur', 'd11_ambang',
    'd12_node', 'd13_node_crosstab', 'd14_relasi', 'd15_kategori', 'd16_geo', 'd17_stabilitas', 'kpi'
  ];
  for (const k of keys) assert.ok(k in data, `kunci ${k} tidak ada`);
  assert.ok(data.kpi.tampilan && data.kpi.mentah, 'kpi harus berisi tampilan dan mentah');
});

test('jumlah Jumlah Order pada d01_tren_bulanan tepat 180519', () => {
  assert.equal(data.d01_tren_bulanan.length, 37);
  assert.equal(sumOrders(data.d01_tren_bulanan), EXPECTED_TOTAL);
});

test('jumlah Jumlah Order pada d16_geo tepat 180519', () => {
  assert.equal(data.d16_geo.length, 46);
  assert.equal(sumOrders(data.d16_geo), EXPECTED_TOTAL);
});

test('angka KPI mentah cocok dengan DATA_DICTIONARY.md', () => {
  const m = data.kpi.mentah;
  assert.equal(m.total_order, 180519);
  assert.equal(m.late_rate, 0.5483);
  assert.equal(m.nilai_penjualan, 36784735);
  assert.equal(m.order_test_set, 36259);
  assert.equal(m.tidak_terdeteksi, 8151);
  assert.equal(m.porsi_standard_class, 0.9871);
  assert.equal(data.d12_node.length, 142);
});

test('data/data.json berisi data yang sama dengan data/data.js', () => {
  const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'data.json'), 'utf8'));
  assert.deepEqual(json, JSON.parse(JSON.stringify(data)));
});
