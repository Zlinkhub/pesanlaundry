/* =====================================================
   Azayaka Laundry - main.js
   Versi Modular: fungsi form utama
   ===================================================== */

// ============================
// Variabel & Default Config
// ============================
let lokasiTeks = "";
let jenisDipilih = "";
let layananDipilih = "";

// ============================
// Fungsi interaksi form
// ============================
function pilihJenis(jenis, el) {
  jenisDipilih = jenis;
  document.querySelectorAll('#jenisGroup .btn').forEach(btn => btn.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.layanan-btn').forEach(btn => {
    btn.style.display = btn.classList.contains(jenis.toLowerCase()) ? 'block' : 'none';
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
      document.getElementById('lokasi').value = 'Lokasi berhasil diambil ✅';
      showToast('📍 Lokasi berhasil ditandai untuk jemput/antar.');
    }, () => showToast('⚠️ Aktifkan izin lokasi agar kami dapat menjemput pesanan Anda.'));
  } else showToast('❌ Browser Anda tidak mendukung fitur lokasi.');
}

// ============================
// Update label berdasarkan delivery
// ============================
function updateDeliveryLabels() {
  const delivery = document.getElementById('delivery').value;
  const labelWaktu = document.getElementById('labelWaktu');
  const labelLokasi = document.getElementById('labelLokasi');
  const lokasiInput = document.getElementById('lokasi');
  const noteLokasi = document.getElementById('noteLokasi');

  labelWaktu.style.opacity = 0;
  labelLokasi.style.opacity = 0;
  noteLokasi.style.opacity = 0;

  setTimeout(() => {
    if (delivery === 'Antar') {
      labelWaktu.textContent = '🕒 Waktu Pengantaran:';
      labelLokasi.textContent = '📍 Lokasi Pengantaran:';
      lokasiInput.placeholder = 'Tulis lokasi antar atau klik 📍';
      noteLokasi.innerHTML = '📍 Pastikan alamat tujuan antar sudah benar sebelum dikirim.';
    } else if (delivery === 'Jemput & Antar') {
      labelWaktu.textContent = '🕒 Waktu Jemput & Antar:';
      labelLokasi.textContent = '📍 Lokasi Jemput & Antar:';
      lokasiInput.placeholder = 'Klik 📍 untuk ambil lokasi utama';
      noteLokasi.innerHTML = '📍 Lokasi ini akan digunakan untuk jemput dan antar pesanan.';
    } else {
      labelWaktu.textContent = '🕒 Waktu Penjemputan:';
      labelLokasi.textContent = '📍 Lokasi Penjemputan:';
      lokasiInput.placeholder = 'Klik 📍 untuk ambil lokasi otomatis';
      noteLokasi.innerHTML = '📍 Aktifkan lokasi & gunakan browser seperti Chrome agar fitur lokasi berfungsi dengan baik.';
    }

    labelWaktu.style.opacity = 1;
    labelLokasi.style.opacity = 1;
    noteLokasi.style.opacity = 1;
  }, 150);
}

// ============================
// Fungsi WhatsApp
// ============================
function bukaWhatsApp(target, encoded) {
  const userAgent = navigator.userAgent.toLowerCase();
  let waLink = '';
  if (/android|iphone|ipad|mobile/i.test(userAgent)) {
    waLink = `https://wa.me/${target}?text=${encoded}`;
  } else {
    waLink = `https://web.whatsapp.com/send?phone=${target}&text=${encoded}`;
  }
  window.open(waLink, '_blank');
}

function kirimPesan(tujuan) {
  const nama = document.getElementById('nama');
  const waktu = document.getElementById('waktu');
  const alamat = document.getElementById('alamat');
  const delivery = document.getElementById('delivery').value;
  let valid = true;

  [nama, waktu, alamat].forEach(el => el.classList.remove('required'));

  if (!nama.value.trim()) { nama.classList.add('required'); valid = false; }
  if (!jenisDipilih) { showToast('⚠️ Pilih jenis laundry terlebih dahulu.'); valid = false; }
  if (!layananDipilih) { showToast('⚠️ Pilih layanan laundry terlebih dahulu.'); valid = false; }
  if (!waktu.value.trim()) { waktu.classList.add('required'); valid = false; }
  if (!lokasiTeks && !alamat.value.trim()) { alamat.classList.add('required'); valid = false; }

  if (!valid) { showToast('⚠️ Mohon lengkapi kolom yang ditandai merah.'); return; }

  const estimasi = document.getElementById('estimasi').value;
  const tanggal = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });

  const pesanText = `🧺 *PESAN LAUNDRY* 🧺
*${document.getElementById('siteTitle').textContent}*

📅 _${tanggal}_

👤 Nama: ${nama.value}
🧥 Jenis: ${jenisDipilih}
🧼 Layanan: ${layananDipilih}
⏳ Estimasi: ${estimasi}
🚚 Delivery: ${delivery}
🕓 Waktu: ${waktu.value}
🏠 Alamat: ${alamat.value || '-'}
📍 Lokasi: ${lokasiTeks || 'Tidak terdeteksi'}

_Terima kasih sudah memesan di ${document.getElementById('siteTitle').textContent}_`;

  const nomorAdmin = '6287853561541';
  const nomorKurir = '6285246756360';
  const encoded = encodeURIComponent(pesanText);
  const target = tujuan === 'admin' ? nomorAdmin : nomorKurir;
  bukaWhatsApp(target, encoded);
}

// ============================
// Fungsi tambahan - buka di browser (webview)
// ============================
function bukaBrowser() {
  const urlSekarang = window.location.href;
  showToast('🔗 Membuka di browser bawaan...');
  setTimeout(() => window.open(urlSekarang, '_blank'), 800);
}

// ============================
// Inisialisasi awal
// ============================
(async function initMain(){
  if (typeof loadConfigFromGitHub === 'function') {
    const loaded = await loadConfigFromGitHub(DEFAULT_OWNER, DEFAULT_REPO, DEFAULT_BRANCH);
    applyConfig(loaded);
  }
  document.getElementById('year').textContent = new Date().getFullYear();

  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('wv') || ua.includes('micromessenger') || ua.includes('miui') || ua.includes('fb') || ua.includes('instagram')) {
    setTimeout(() => {
      const top = document.getElementById('browserTop');
      if (top) top.style.display = 'block';
    }, 7000);
  }
})();
