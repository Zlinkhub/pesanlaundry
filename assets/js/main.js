/* ==/* =====================================================
   AZAYAKA LAUNDRY - MAIN.JS
   Modul utama form pelanggan & tampilan publik
   ===================================================== */

// ============================
// Variabel global
// ============================
let lokasiTeks = "";
let jenisDipilih = "";
let layananDipilih = "";
let CONFIG = {}; // akan diisi dari config.json

// ============================
// Fungsi pilih jenis & layanan
// ============================
function pilihJenis(jenis, el) {
  jenisDipilih = jenis;
  document.querySelectorAll('#jenisGroup .btn').forEach(btn => btn.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('.layanan-btn').forEach(btn => {
    const isVisible = btn.classList.contains(jenis.toLowerCase());
    btn.style.display = isVisible ? 'block' : 'none';
    btn.classList.remove('active');
  });
  layananDipilih = '';
}

function pilihLayanan(layanan, el) {
  document.querySelectorAll('.layanan-btn').forEach(btn => btn.classList.remove('active'));
  el.classList.add('active');
  layananDipilih = layanan;
}

// ============================
// Fungsi lokasi otomatis
// ============================
function ambilLokasi() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      lokasiTeks = `https://www.google.com/maps?q=${lat},${lon}`;
      document.getElementById('lokasi').value = '📍 Lokasi berhasil diambil';
      showToast('✅ Lokasi berhasil ditandai untuk jemput/antar.');
    }, () => showToast('⚠️ Aktifkan izin lokasi untuk fitur ini.'));
  } else {
    showToast('❌ Browser tidak mendukung geolokasi.');
  }
}

// ============================
// Update label saat delivery berubah
// ============================
function updateDeliveryLabels() {
  const delivery = document.getElementById('delivery').value;
  const labelWaktu = document.getElementById('labelWaktu');
  const labelLokasi = document.getElementById('labelLokasi');
  const lokasiInput = document.getElementById('lokasi');
  const noteLokasi = document.getElementById('noteLokasi');

  if (delivery === 'Antar') {
    labelWaktu.textContent = '🕒 Waktu Pengantaran:';
    labelLokasi.textContent = '📍 Lokasi Pengantaran:';
    lokasiInput.placeholder = 'Tulis lokasi antar atau klik 📍';
    noteLokasi.textContent = 'Pastikan alamat tujuan antar sudah benar.';
  } else if (delivery === 'Jemput & Antar') {
    labelWaktu.textContent = '🕒 Waktu Jemput & Antar:';
    labelLokasi.textContent = '📍 Lokasi Jemput & Antar:';
    lokasiInput.placeholder = 'Klik 📍 untuk ambil lokasi utama';
    noteLokasi.textContent = 'Lokasi ini akan digunakan untuk jemput dan antar.';
  } else {
    labelWaktu.textContent = '🕒 Waktu Penjemputan:';
    labelLokasi.textContent = '📍 Lokasi Penjemputan:';
    lokasiInput.placeholder = 'Klik 📍 untuk ambil lokasi otomatis';
    noteLokasi.textContent = 'Aktifkan lokasi untuk penjemputan cepat.';
  }
}

// ============================
// Kirim pesan ke WhatsApp
// ============================
function kirimPesan(tujuan) {
  const nama = document.getElementById('nama');
  const waktu = document.getElementById('waktu');
  const alamat = document.getElementById('alamat');
  const delivery = document.getElementById('delivery').value;
  let valid = true;

  [nama, waktu, alamat].forEach(el => el.classList.remove('required'));

  if (!nama.value.trim()) { nama.classList.add('required'); valid = false; }
  if (!jenisDipilih) { showToast('⚠️ Pilih jenis laundry dulu'); valid = false; }
  if (!layananDipilih) { showToast('⚠️ Pilih layanan laundry dulu'); valid = false; }
  if (!waktu.value.trim()) { waktu.classList.add('required'); valid = false; }
  if (!lokasiTeks && !alamat.value.trim()) { alamat.classList.add('required'); valid = false; }

  if (!valid) {
    showToast('⚠️ Lengkapi kolom wajib sebelum mengirim.');
    return;
  }

  const estimasi = document.getElementById('estimasi').value;
  const tanggal = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });

  const pesanText = `🧺 *PESAN LAUNDRY* 🧺
*${CONFIG.namaLaundry || 'Azayaka Laundry'}*

📅 _${tanggal}_

👤 Nama: ${nama.value}
🧥 Jenis: ${jenisDipilih}
🧼 Layanan: ${layananDipilih}
⏳ Estimasi: ${estimasi}
🚚 Delivery: ${delivery}
🕓 Waktu: ${waktu.value}
🏠 Alamat: ${alamat.value || '-'}
📍 Lokasi: ${lokasiTeks || 'Tidak terdeteksi'}

_Terima kasih sudah memesan di ${CONFIG.namaLaundry || 'Azayaka Laundry'}_`;

  const nomorAdmin = CONFIG.whatsappAdmin || "6287853561541";
  const nomorKurir = CONFIG.whatsappKurir || "6285246756360";
  const encoded = encodeURIComponent(pesanText);
  const target = tujuan === 'admin' ? nomorAdmin : nomorKurir;

  bukaWhatsApp(target, encoded);
}

// ============================
// Fungsi buka WhatsApp
// ============================
function bukaWhatsApp(target, encoded) {
  const isMobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent.toLowerCase());
  const url = isMobile
    ? `https://wa.me/${target}?text=${encoded}`
    : `https://web.whatsapp.com/send?phone=${target}&text=${encoded}`;
  window.open(url, '_blank');
}

// ============================
// Toast Notification
// ============================
function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => toast.classList.remove('show'), 2500);
  setTimeout(() => toast.remove(), 3000);
}

// ============================
// Load Config dari GitHub Pages
// ============================
async function loadConfig() {
  try {
    const res = await fetch('config.json');
    if (!res.ok) throw new Error('Gagal memuat config.json');
    CONFIG = await res.json();
    applyConfig(CONFIG);
  } catch (err) {
    console.error('❌ Error load config:', err);
    showToast('⚠️ Gagal memuat pengaturan dari server.');
  }
}

// ============================
// Terapkan Config ke tampilan
// ============================
function applyConfig(cfg) {
  if (!cfg) return;
  const root = document.documentElement;

  if (cfg.warna) root.style.setProperty('--theme-color', cfg.warna);
  if (cfg.namaLaundry) {
    document.getElementById('siteTitle').textContent = cfg.namaLaundry;
    document.getElementById('footerName').textContent = cfg.namaLaundry;
  }
  if (cfg.logo) document.getElementById('logoImg').src = cfg.logo;

  // Tambahkan layanan satuan dari config
  if (cfg.layananSatuan && Array.isArray(cfg.layananSatuan)) {
    const container = document.getElementById('layananGroup');
    cfg.layananSatuan.forEach(l => {
      const btn = document.createElement('button');
      btn.className = 'layanan-btn satuan';
      btn.style.display = 'none';
      btn.textContent = l;
      btn.onclick = () => pilihLayanan(l, btn);
      container.appendChild(btn);
    });
  }
}

// ============================
// Jalankan saat halaman siap
// ============================
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  document.getElementById('year').textContent = new Date().getFullYear();
});

