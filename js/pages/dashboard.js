// ============================================================
// Academy Eji — Dashboard Page Script (index.html)
// Dipindah dari inline <script> di index.html tanpa perubahan logika.
// ============================================================

      // ── TEMA ──
      const themeToggle = document.getElementById("theme-toggle");
      const htmlEl = document.documentElement;

      if (localStorage.getItem("theme") === "dark") {
        htmlEl.setAttribute("data-theme", "dark");
        themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
      }

      themeToggle.addEventListener("click", () => {
        const isDark = htmlEl.getAttribute("data-theme") === "dark";
        htmlEl.setAttribute("data-theme", isDark ? "light" : "dark");
        themeToggle.innerHTML = isDark
          ? "<i class='bx bx-moon'></i>"
          : "<i class='bx bx-sun'></i>";
        localStorage.setItem("theme", isDark ? "light" : "dark");
      });

      // ── GREETING ──
      const greetingEl = document.getElementById("greeting-text");
      const hour = new Date().getHours();
      greetingEl.textContent =
        hour < 11
          ? "Selamat Pagi,"
          : hour < 15
            ? "Selamat Siang,"
            : hour < 18
              ? "Selamat Sore,"
              : "Selamat Malam,";

      // ── SIDEBAR MOBILE ──
      const sidebar = document.getElementById("sidebar");
      const sidebarOverlay = document.getElementById("sidebar-overlay");

      document
        .getElementById("sidebar-toggle")
        .addEventListener("click", () => {
          sidebar.classList.toggle("open");
          sidebarOverlay.classList.toggle("open");
        });

      sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        sidebarOverlay.classList.remove("open");
      });

      sidebar.querySelectorAll(".nav-item").forEach((item) => {
        item.addEventListener("click", () => {
          if (window.innerWidth <= 992) {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.remove("open");
          }
        });
      });

      // ── SINKRON NAMA DI GREETING HEADER ──
      function syncGreetName() {
        const el = document.getElementById("greet-username");
        if (!el) return;
        const u = window.Auth && Auth.getUser ? Auth.getUser() : null;
        el.textContent = u && u.username ? u.username : "Pengguna";
      }
      syncGreetName();
      setTimeout(syncGreetName, 600);
      setTimeout(syncGreetName, 1800);

      // ── KATEGORI IKON: state aktif ──
      document.querySelectorAll(".cat-item").forEach((item) => {
        item.addEventListener("click", () => {
          document
            .querySelectorAll(".cat-item")
            .forEach((i) => i.classList.remove("active"));
          item.classList.add("active");
        });
      });

      // ── TOMBOL FILTER (fokus ke kolom pencarian cepat) ──
      const filterBtn = document.getElementById("filter-btn");
      if (filterBtn) {
        filterBtn.addEventListener("click", () => {
          document.getElementById("quick-search-input")?.focus();
        });
      }

      // ── LONCENG NOTIFIKASI ──
      const notifBtn = document.getElementById("notif-btn");
      const notifBadge = document.getElementById("notif-badge");
      if (notifBtn) {
        notifBtn.addEventListener("click", () => {
          notifBadge?.classList.add("hide");
        });
      }

      // ── TOGGLE SEMUA / FAVORIT SAYA ──
      const toggleOpts = document.querySelectorAll(".toggle-opt");
      toggleOpts.forEach((opt) => {
        opt.addEventListener("click", () => {
          toggleOpts.forEach((o) => o.classList.remove("active"));
          opt.classList.add("active");
          const mode = opt.dataset.filter;
          document.querySelectorAll(".feat-card").forEach((card) => {
            if (mode === "favorit") {
              card.classList.toggle("is-hidden", card.dataset.fav !== "1");
            } else {
              card.classList.remove("is-hidden");
            }
          });
        });
      });

      // ── TOMBOL URUTKAN (balik urutan kartu unggulan) ──
      const sortBtn = document.getElementById("sort-btn");
      if (sortBtn) {
        sortBtn.addEventListener("click", () => {
          const wrap = document.getElementById("feat-scroll");
          if (!wrap) return;
          Array.from(wrap.children)
            .reverse()
            .forEach((c) => wrap.appendChild(c));
        });
      }

      // ══════════════════════════════════════════════════════════
      // ── KONTEN UNGGULAN: ambil data asli + ranking berdasarkan klik ──
      // ══════════════════════════════════════════════════════════
      const FAV_KEY = "eji_favorites";
      function getFavs() {
        try {
          return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
        } catch (e) {
          return [];
        }
      }
      function toggleFav(id) {
        let favs = getFavs();
        const idx = favs.indexOf(id);
        if (idx === -1) favs.push(id);
        else favs.splice(idx, 1);
        localStorage.setItem(FAV_KEY, JSON.stringify(favs));
        return favs.includes(id);
      }

      function esc(s) {
        return String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      // Tentukan halaman tujuan berdasarkan nama kategori (mengikuti logika filter tiap halaman)
      function targetPageFor(namaKategori) {
        const n = (namaKategori || "").toLowerCase();
        if (n === "artikel") return "article-landing.html";
        if (/materi|ebook|e-book|referensi|jurnal|buku/.test(n))
          return "referensi/index.html";
        if (n.includes("prompt")) return "prompt/index.html";
        return "article-landing.html";
      }

      function getKategori(list, id) {
        return (
          list.find((k) => k.id === id) || {
            nama: "Konten",
            warna: "#2563eb",
          }
        );
      }

      function iconForKategori(namaKategori) {
        const n = (namaKategori || "").toLowerCase();
        if (n.includes("foto")) return "bx-camera";
        if (n.includes("desain")) return "bx-palette";
        if (n.includes("makalah")) return "bx-file-blank";
        if (n.includes("materi")) return "bx-book-content";
        if (n.includes("artikel")) return "bx-news";
        if (n.includes("buku") || n.includes("penelitian")) return "bx-book-open";
        if (n.includes("ebook") || n.includes("e-book")) return "bx-book";
        if (n.includes("prompt")) return "bx-bot";
        return "bx-folder";
      }

      function renderKategoriGrid(DB) {
        const grid = document.getElementById("kategori-grid");
        if (!grid) return;
        const counts = {};
        (DB.artikel || []).forEach((a) => {
          counts[a.kategori_id] = (counts[a.kategori_id] || 0) + 1;
        });
        const kats = (DB.kategori || []).filter((k) => counts[k.id]);
        if (!kats.length) {
          grid.innerHTML = `<div class="feat-empty" style="grid-column:1/-1;"><i class="bx bx-category"></i>Belum ada kategori konten.</div>`;
          return;
        }
        kats.sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
        grid.innerHTML = kats
          .map((k) => {
            const page = targetPageFor(k.nama);
            const warna = k.warna || "#2563eb";
            return `
            <a href="${esc(page)}" class="kat-card">
              <div class="kat-card-icon" style="background:${esc(warna)}1a;color:${esc(warna)}">
                <i class="bx ${iconForKategori(k.nama)}"></i>
              </div>
              <div>
                <div class="kat-card-name">${esc(k.nama)}</div>
                <div class="kat-card-count">${counts[k.id]} konten</div>
              </div>
            </a>`;
          })
          .join("");
      }

      async function loadKontenUnggulan() {
        const wrap = document.getElementById("feat-scroll");
        let DB = { kategori: [], artikel: [] };
        let byArticle = {};

        try {
          const res = await fetch("api/get-data");
          if (res.ok) DB = await res.json();
        } catch (e) {
          console.warn("Gagal memuat data konten:", e);
        }

        try {
          const res2 = await fetch("api/get-clicks");
          if (res2.ok) {
            const j = await res2.json();
            byArticle = (j.summary && j.summary.by_article) || {};
          }
        } catch (e) {
          console.warn("Gagal memuat data klik:", e);
        }

        // Update statistik di stats-row
        const totalKonten = (DB.artikel || []).length;
        const totalArtikelKat = (DB.kategori || [])
          .filter((k) => (k.nama || "").trim().toLowerCase() === "artikel")
          .map((k) => k.id);
        const totalArtikel = (DB.artikel || []).filter((a) =>
          totalArtikelKat.includes(a.kategori_id)
        ).length;
        const elTotalKonten = document.getElementById("stat-total-konten");
        const elTotalArtikel = document.getElementById("stat-total-artikel");
        if (elTotalKonten) elTotalKonten.textContent = totalKonten || 0;
        if (elTotalArtikel) elTotalArtikel.textContent = totalArtikel || 0;

        renderKategoriGrid(DB);

        const items = (DB.artikel || []).map((a) => {
          const c = byArticle[a.id];
          return { ...a, _clicks: c ? c.count : 0 };
        });

        items.sort((x, y) => {
          if (y._clicks !== x._clicks) return y._clicks - x._clicks;
          if ((y.featured ? 1 : 0) !== (x.featured ? 1 : 0))
            return (y.featured ? 1 : 0) - (x.featured ? 1 : 0);
          return (y.tanggal || "").localeCompare(x.tanggal || "");
        });

        let top = items.filter((i) => i._clicks > 0).slice(0, 8);
        if (top.length < 4) {
          const usedIds = new Set(top.map((i) => i.id));
          const fallback = items
            .filter((i) => !usedIds.has(i.id))
            .slice(0, 8 - top.length);
          top = top.concat(fallback);
        }

        if (!wrap) return;

        if (!top.length) {
          wrap.innerHTML = `<div class="feat-empty"><i class="bx bx-inbox"></i>Belum ada konten untuk ditampilkan.</div>`;
          return;
        }

        const favs = getFavs();

        wrap.innerHTML = top
          .map((a) => {
            const k = getKategori(DB.kategori || [], a.kategori_id);
            const page = targetPageFor(k.nama);
            const href = `${page}?open=${encodeURIComponent(a.id)}`;
            const isFav = favs.includes(a.id);
            const bg = a.gambar
              ? `background-image:url('${a.gambar.replace(/'/g, "%27")}')`
              : `background:linear-gradient(135deg, ${k.warna || "#2563eb"}, #1d4ed8)`;
            return `
            <div class="feat-card" data-id="${esc(a.id)}" data-fav="${isFav ? "1" : "0"}">
              <div class="feat-thumb" style="${bg}">
                <span class="feat-badge" style="background:${esc(k.warna || "#2563eb")}cc">${esc(k.nama)}</span>
                <div class="feat-actions">
                  <button class="feat-action-btn feat-fav-btn${isFav ? " is-fav" : ""}" title="Favorit" data-id="${esc(a.id)}">
                    <i class="bx ${isFav ? "bxs-heart" : "bx-heart"}"></i>
                  </button>
                </div>
                <a href="${esc(href)}" class="feat-open-btn">
                  <i class="bx bx-show"></i> Lihat
                </a>
              </div>
              <div class="feat-body">
                <div class="feat-title">${esc(a.judul)}</div>
                <div class="feat-meta">
                  <span>${esc(k.nama)}</span>
                  ${a._clicks > 0 ? `<span class="feat-clicks">&bull; <i class="bx bx-trending-up"></i> ${a._clicks} dilihat</span>` : ""}
                </div>
              </div>
            </div>`;
          })
          .join("");

        wrap.querySelectorAll(".feat-fav-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.dataset.id;
            const nowFav = toggleFav(id);
            const card = btn.closest(".feat-card");
            const icon = btn.querySelector("i");
            card.dataset.fav = nowFav ? "1" : "0";
            btn.classList.toggle("is-fav", nowFav);
            icon.classList.toggle("bx-heart", !nowFav);
            icon.classList.toggle("bxs-heart", nowFav);
            const activeFilter = document.querySelector(".toggle-opt.active")?.dataset.filter;
            if (activeFilter === "favorit" && !nowFav) {
              card.classList.add("is-hidden");
            }
          });
        });
      }

      loadKontenUnggulan();
