/* =====================================================
   Azayaka Laundry - admin.js
   Panel Admin + GitHub API
   ===================================================== */

// ============================
// Konstanta & Konfigurasi
// ============================
const ADMIN_USER = "Zlink";
const ADMIN_PASS = "1234";
const DEFAULT_OWNER = "Zlinkhub";     // Ganti dengan username GitHub kamu
const DEFAULT_REPO = "pesanlaundry";  // Ganti sesuai nama repo
const DEFAULT_BRANCH = "main";

// ============================
// Variabel global
// ============================
let githubToken = "";
let currentSHA = null;

// ============================
// Fungsi Login Admin
// ============================
function toggleAdmin() {
  const pass = prompt("Masukkan password admin:");
  if (pass === ADMIN_PASS) {
    showAdminPanel();
  } else {
    showToast("❌ Password salah!");
  }
}

function showAdminPanel() {
  const container = document.createElement("div");
  container.className = "admin-modal";
  container.innerHTML = `
    <div class="admin-box">
      <h3>⚙️ Panel Admin</h3>
      <label>Username:</label>
      <input type="text" id="adminUser" value="${ADMIN_USER}" readonly>

      <label>Personal Access Token (PAT):</label>
      <input type="password" id="githubToken" placeholder="Masukkan token GitHub">

      <label>Nama Laundry:</label>
      <input type="text" id="inputNama" value="${document.getElementById('siteTitle').textContent}">

      <label>Warna Tema:</label>
      <input type="color" id="inputWarna" value="#ff8c00">

      <label>Logo URL:</label>
      <input type="text" id="inputLogo" placeholder="URL gambar logo baru">

      <div class="btn-group">
        <button onclick="simpanConfig()">💾 Simpan ke GitHub</button>
        <button onclick="tutupAdmin()">Tutup</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);
}

function tutupAdmin() {
  const modal = document.querySelector(".admin-modal");
  if (modal) modal.remove();
}

// ============================
// Fungsi Notifikasi
// ============================
function showToast(msg) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => toast.classList.remove("show"), 2500);
  setTimeout(() => toast.remove(), 3000);
}

// ============================
// Fungsi GitHub API - Simpan config.json
// ============================
async function simpanConfig() {
  githubToken = document.getElementById("githubToken").value.trim();
  if (!githubToken) return showToast("⚠️ Masukkan GitHub Token dulu!");

  const newConfig = {
    namaLaundry: document.getElementById("inputNama").value,
    logo: document.getElementById("inputLogo").value || "https://static.1010dry.id/pesanlaundry/images/5f486d5d5fb3cbf0ab6dc2278ee9a997.png",
    warna: document.getElementById("inputWarna").value,
    layananSatuan: ["Dry Clean", "Pakaian", "Bedcover", "Sepatu", "Karpet"],
    whatsappAdmin: "6287853561541",
    whatsappKurir: "6285246756360",
    footerText: "Shiny, Fresh, & Clean ✨",
    sosmed1: "https://instagram.com/azayakalaundry",
    sosmed2: "https://wa.me/6287853561541"
  };

  const jsonContent = JSON.stringify(newConfig, null, 2);
  const url = `https://api.github.com/repos/${DEFAULT_OWNER}/${DEFAULT_REPO}/contents/config.json`;

  if (!currentSHA) {
    const latest = await ambilSHA(url);
    currentSHA = latest || null;
  }

  const payload = {
    message: "Update config.json via Admin Panel",
    content: btoa(unescape(encodeURIComponent(jsonContent))),
    sha: currentSHA,
    branch: DEFAULT_BRANCH
  };

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${githubToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      showToast("✅ Config berhasil disimpan ke GitHub!");
      tutupAdmin();
    } else {
      const err = await response.json();
      showToast(`❌ Gagal menyimpan: ${err.message}`);
    }
  } catch (err) {
    showToast("⚠️ Error koneksi ke GitHub API!");
    console.error(err);
  }
}

// ============================
// Ambil SHA file config.json
// ============================
async function ambilSHA(url) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
  } catch (err) {
    console.error("Gagal ambil SHA:", err);
  }
  return null;
}

// ============================
// Fungsi Load Config dari GitHub
// ============================
async function loadConfigFromGitHub(owner, repo, branch) {
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/config.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Tidak dapat memuat config.json");
    const data = await res.json();
    console.log("✅ Config loaded:", data);
    return data;
  } catch (err) {
    console.warn("⚠️ Gagal memuat config.json:", err);
    return null;
  }
}

// ============================
// Terapkan Config ke Tampilan
// ============================
function applyConfig(config) {
  if (!config) return;
  const warna = config.warna || "#ff8c00";
  const nama = config.namaLaundry || "Azayaka Laundry";
  const logo = config.logo || "";

  document.body.style.setProperty("--theme-color", warna);
  document.getElementById("siteTitle").textContent = nama;
  document.getElementById("footerName").textContent = nama;
  if (logo) document.getElementById("logoImg").src = logo;
}
