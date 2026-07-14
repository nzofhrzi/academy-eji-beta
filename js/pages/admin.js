// ============================================================
// Academy Eji — Admin Page Script (admin.html)
// Dipindah dari inline <script> di admin.html tanpa perubahan logika.
// ============================================================

/* ══════════════════════════════════════════════════════
   AUTH GATE
   ══════════════════════════════════════════════════════ */
let adminKeyStored = '';

async function submitAdminGate() {
  const val = document.getElementById('auth-gate-input').value.trim();
  const errEl = document.getElementById('auth-gate-error');
  const btn = document.getElementById('auth-gate-btn');
  if (!val) return;
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.innerHTML = `<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;vertical-align:middle;margin-right:8px;"></span> Memverifikasi...`;
  try {
    const res = await fetch('/api/ujicoba?action=verify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': val },
      body: JSON.stringify({ key: val })
    });
    if (res.ok) {
      adminKeyStored = val;
      document.getElementById('auth-gate-overlay').classList.remove('visible');
      loadData();
    } else {
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.style.display = 'block';
    errEl.innerHTML = `<i class='bx bx-error-circle'></i> Gagal menghubungi server. Coba lagi.`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class='bx bx-log-in'></i> Masuk`;
  }
}
document.getElementById('auth-gate-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitAdminGate();
});

/* ══════════════════════════════════════════════════════
   TEMA DARK / LIGHT
   ══════════════════════════════════════════════════════ */
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

if (localStorage.getItem('theme') === 'dark') {
  htmlEl.setAttribute('data-theme', 'dark');
  themeToggle.innerHTML = "<i class='bx bx-sun'></i>";
}

themeToggle.addEventListener('click', () => {
  const isDark = htmlEl.getAttribute('data-theme') === 'dark';
  htmlEl.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.innerHTML = isDark ? "<i class='bx bx-moon'></i>" : "<i class='bx bx-sun'></i>";
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

/* ════════════════════════════════════════════════════
   DATA LAYER
   ════════════════════════════════════════════════════ */
let DB = { kategori:[], artikel:[], _sha:null };

/* ── Helpers ── */
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function uid(){ return 'id_'+Math.random().toString(36).slice(2,9) }
function getKat(id){ return DB.kategori.find(k=>k.id===id)||{nama:'—',warna:'#9ca3af'} }
function fmtDate(s){ if(!s) return ''; return new Date(s).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) }

/* ── API: Load ── */
async function loadData(){
  try {
    const res = await fetch('/api/get-data');
    if(!res.ok){
      const err = await res.json().catch(()=>({}));
      throw new Error(err.message || 'HTTP '+res.status);
    }
    const data = await res.json();
    DB.kategori = data.kategori || [];
    DB.artikel  = data.artikel  || [];
    DB._sha     = data._sha     || null;
  } catch(e) {
    showToast('Gagal memuat data: '+e.message, true);
  }
  render();
}

/* ── API: Save All (tombol Simpan ke GitHub) ── */
async function saveToServer(){
  const res = await fetch('/api/save-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kategori: DB.kategori, artikel: DB.artikel, _sha: DB._sha })
  });
  const j = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(j.message || 'HTTP '+res.status);
  return j.sha;
}

/* ── API: Edit satu item langsung ke GitHub ── */
async function apiEdit(type, id, data){
  const res = await fetch('/api/edit-data', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, id, data })
  });
  const j = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(j.message || 'HTTP '+res.status);
  return j;
}

/* ── API: Hapus satu item langsung ke GitHub ── */
async function apiDelete(type, id){
  const res = await fetch('/api/delete-data', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, id })
  });
  const j = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(j.message || 'HTTP '+res.status);
  return j;
}

/* ── API: Tambah artikel baru ── */
async function apiTambahArtikel(art){
  DB.artikel.unshift(art);
  const res = await fetch('/api/save-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kategori: DB.kategori, artikel: DB.artikel, _sha: DB._sha })
  });
  const j = await res.json().catch(()=>({}));
  if(!res.ok){
    DB.artikel = DB.artikel.filter(a=>a.id!==art.id);
    throw new Error(j.message || 'HTTP '+res.status);
  }
  if(j.sha) DB._sha = j.sha;
}

/* ── API: Tambah kategori baru ── */
async function apiTambahKategori(kat){
  DB.kategori.push(kat);
  const res = await fetch('/api/save-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kategori: DB.kategori, artikel: DB.artikel, _sha: DB._sha })
  });
  const j = await res.json().catch(()=>({}));
  if(!res.ok){
    DB.kategori = DB.kategori.filter(k=>k.id!==kat.id);
    throw new Error(j.message || 'HTTP '+res.status);
  }
  if(j.sha) DB._sha = j.sha;
}

/* ════════════════════════════════════════════════════
   SELECTION & BULK DELETE
   ════════════════════════════════════════════════════ */
let selectedArt = new Set();
let selectedKat = new Set();

function updateArtBulkBar(){
  const bar = document.getElementById('art-bulk-bar');
  const count = document.getElementById('art-bulk-count');
  count.textContent = selectedArt.size;
  bar.classList.toggle('show', selectedArt.size > 0);
}

function updateKatBulkBar(){
  const bar = document.getElementById('kat-bulk-bar');
  const count = document.getElementById('kat-bulk-count');
  count.textContent = selectedKat.size;
  bar.classList.toggle('show', selectedKat.size > 0);
}

function toggleArtSelect(id){
  if(selectedArt.has(id)) selectedArt.delete(id);
  else selectedArt.add(id);
  updateArtBulkBar();
  updateArtSelectAllCheckbox();
  renderArtTable();
}

function toggleKatSelect(id){
  if(selectedKat.has(id)) selectedKat.delete(id);
  else selectedKat.add(id);
  updateKatBulkBar();
  updateKatSelectAllCheckbox();
  renderKatTable();
}

function updateArtSelectAllCheckbox(){
  const visibleIds = new Set(getFilteredArtikels().map(a=>a.id));
  const allSelected = visibleIds.size > 0 && Array.from(visibleIds).every(id=>selectedArt.has(id));
  document.getElementById('art-select-all').checked = allSelected;
}

function updateKatSelectAllCheckbox(){
  const allSelected = DB.kategori.length > 0 && DB.kategori.every(k=>selectedKat.has(k.id));
  document.getElementById('kat-select-all').checked = allSelected;
}

function clearArtSelection(){
  selectedArt.clear();
  updateArtBulkBar();
  renderArtTable();
}

function clearKatSelection(){
  selectedKat.clear();
  updateKatBulkBar();
  renderKatTable();
}

/* ════════════════════════════════════════════════════
   RENDER
   ════════════════════════════════════════════════════ */
function render(){
  document.getElementById('s-total').textContent = DB.artikel.length;
  document.getElementById('s-feat').textContent  = DB.artikel.filter(a=>a.featured).length;
  document.getElementById('s-kat').textContent   = DB.kategori.length;
  renderArtTable();
  renderKatTable();
  renderKatSelect();
  renderArtFilterSelect();
}

/* ── Filter & search state (Artikel) ── */
let artSearch = '';
let artKatFilter = '';
let artFeaturedOnly = false;

function getFilteredArtikels(){
  let arts = DB.artikel.slice();
  if(artSearch) arts = arts.filter(a=>(a.judul+a.deskripsi).toLowerCase().includes(artSearch));
  if(artKatFilter) arts = arts.filter(a=>a.kategori_id===artKatFilter);
  if(artFeaturedOnly) arts = arts.filter(a=>a.featured);
  return arts;
}

function renderArtFilterSelect(){
  const sel = document.getElementById('art-filter-kat');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Semua Kategori</option>';
  DB.kategori.forEach(k=>{
    sel.innerHTML += `<option value="${esc(k.id)}" ${cur===k.id?'selected':''}>${esc(k.nama)}</option>`;
  });
}

function renderArtTable(){
  const tbody = document.getElementById('art-tbody');
  const arts = getFilteredArtikels();
  if(!arts.length){
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">
      <i class='bx bx-folder-open' style="font-size:36px;margin-bottom:10px;display:block;opacity:0.3"></i>
      Tidak ada artikel yang cocok.
    </td></tr>`;
    return;
  }
  tbody.innerHTML = arts.map((a,i)=>{
    const k = getKat(a.kategori_id);
    const isSelected = selectedArt.has(a.id);
    return `<tr style="animation:fadeUp 0.3s ease ${i*0.04}s both" class="${isSelected?'selected':''}">
      <td class="checkbox-cell"><input type="checkbox" ${isSelected?'checked':''} onchange="toggleArtSelect('${esc(a.id)}')"></td>
      <td><span class="td-title">${esc(a.judul)}</span></td>
      <td><span class="badge" style="background:${k.warna}20;color:${k.warna}">${esc(k.nama)}</span></td>
      <td>${fmtDate(a.tanggal)}</td>
      <td>${a.featured?'<span class="badge badge-feat">⭐ Unggulan</span>':'<span class="badge badge-norm">Biasa</span>'}</td>
      <td><div class="td-actions">
        <button class="act-btn edit" onclick="editArtikel('${esc(a.id)}')"><i class='bx bx-edit-alt'></i> Edit</button>
        <button class="act-btn del" onclick="openDelModal('art','${esc(a.id)}','${esc(a.judul)}')"><i class='bx bx-trash'></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

function renderKatTable(){
  const tbody = document.getElementById('kat-tbody');
  if(!DB.kategori.length){
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">
      <i class='bx bx-purchase-tag-alt' style="font-size:36px;margin-bottom:10px;display:block;opacity:0.3"></i>
      Belum ada kategori.
    </td></tr>`;
    return;
  }
  tbody.innerHTML = DB.kategori.map((k,i)=>{
    const count = DB.artikel.filter(a=>a.kategori_id===k.id).length;
    const isSelected = selectedKat.has(k.id);
    return `<tr style="animation:fadeUp 0.3s ease ${i*0.04}s both" class="${isSelected?'selected':''}">
      <td class="checkbox-cell"><input type="checkbox" ${isSelected?'checked':''} onchange="toggleKatSelect('${esc(k.id)}')"></td>
      <td><span class="kat-color-dot" style="background:${k.warna}"></span>${esc(k.nama)}</td>
      <td><code style="font-size:12px;color:var(--ink3);background:var(--surface2);padding:2px 8px;border-radius:4px">${esc(k.warna)}</code></td>
      <td><span style="font-weight:600;color:var(--primary)">${count}</span> artikel</td>
      <td><div class="td-actions">
        <button class="act-btn del" onclick="openDelModal('kat','${esc(k.id)}','${esc(k.nama)}')"><i class='bx bx-trash'></i> Hapus</button>
      </div></td>
    </tr>`;
  }).join('');
}

function renderKatSelect(){
  const sel = document.getElementById('f-kategori');
  const cur = sel.value;
  sel.innerHTML = '<option value="">-- Pilih Kategori --</option>';
  DB.kategori.forEach(k=>{
    sel.innerHTML += `<option value="${esc(k.id)}" ${cur===k.id?'selected':''}>${esc(k.nama)}</option>`;
  });
}

/* ════════════════════════════════════════════════════
   IMAGE PICKER — URL vs UPLOAD
   ════════════════════════════════════════════════════ */
let imgMode = 'url';
let uploadedImgUrl = '';

function switchImgTab(mode){
  imgMode = mode;
  document.getElementById('tab-url-btn').classList.toggle('active', mode==='url');
  document.getElementById('tab-upload-btn').classList.toggle('active', mode==='upload');
  document.getElementById('img-panel-url').classList.toggle('active', mode==='url');
  document.getElementById('img-panel-upload').classList.toggle('active', mode==='upload');
  if(mode==='url'){
    uploadedImgUrl='';
    previewImage();
  } else {
    if(uploadedImgUrl) showPreview(uploadedImgUrl);
    else clearPreview();
  }
}

function getGambarValue(){
  if(imgMode==='url') return document.getElementById('f-gambar').value.trim();
  return uploadedImgUrl;
}

function setGambarValue(url){
  if(!url){ imgMode='url'; switchImgTab('url'); return; }
  const isGhRaw = url.includes('raw.githubusercontent.com');
  if(isGhRaw){
    switchImgTab('upload');
    uploadedImgUrl = url;
    document.getElementById('upload-success').style.display='block';
    document.getElementById('upload-success').textContent='✅ Menggunakan gambar yang sudah ada di GitHub';
  } else {
    switchImgTab('url');
    document.getElementById('f-gambar').value = url;
  }
  showPreview(url);
}

function showPreview(url){
  const img = document.getElementById('img-preview');
  const ph  = document.getElementById('img-ph');
  if(url){ img.src=url; img.style.display='block'; ph.style.display='none'; img.onerror=()=>{img.style.display='none';ph.style.display=''} }
  else clearPreview();
}

function clearPreview(){
  document.getElementById('img-preview').style.display='none';
  document.getElementById('img-ph').style.display='';
}

/* Handle drag & drop */
const uploadZone = document.getElementById('upload-zone');
uploadZone.addEventListener('dragover', e=>{ e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', ()=> uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e=>{
  e.preventDefault(); uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if(file && file.type.startsWith('image/')) processFile(file);
  else showToast('File harus berupa gambar!', true);
});

function handleFileSelect(e){
  const file = e.target.files[0];
  if(!file) return;
  if(!file.type.startsWith('image/')) { showToast('File harus berupa gambar!', true); return; }
  if(file.size > 5*1024*1024) { showToast('Ukuran gambar maks 5 MB!', true); return; }
  processFile(file);
}

function processFile(file){
  const reader = new FileReader();
  reader.onload = async(e) => {
    const dataUrl = e.target.result;
    const base64 = dataUrl.split(',')[1];
    showPreview(dataUrl);
    await uploadToGitHub(file.name, base64);
  };
  reader.readAsDataURL(file);
}

async function uploadToGitHub(filename, base64){
  const prog = document.getElementById('upload-progress');
  const bar  = document.getElementById('progress-bar');
  const txt  = document.getElementById('progress-text');
  const succ = document.getElementById('upload-success');

  succ.style.display='none';
  prog.classList.add('show');
  bar.style.width='30%'; txt.textContent='Mengunggah ke GitHub…';

  try {
    bar.style.width='60%';
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, base64 })
    });
    const j = await res.json().catch(()=>({}));
    bar.style.width='100%';
    if(!res.ok) throw new Error(j.message || 'HTTP '+res.status);
    uploadedImgUrl = j.url;
    showPreview(uploadedImgUrl);
    txt.textContent='Selesai!';
    setTimeout(()=>{ prog.classList.remove('show'); bar.style.width='0%'; }, 800);
    succ.style.display='block';
    succ.textContent='✅ Berhasil diupload ke GitHub';
    showToast('✅ Gambar berhasil diupload ke GitHub!');
  } catch(e){
    prog.classList.remove('show'); bar.style.width='0%';
    showToast('Gagal upload gambar: '+e.message, true);
  }
}

/* ════════════════════════════════════════════════════
   FORM ARTIKEL
   ════════════════════════════════════════════════════ */
let editMode = false;

function resetForm(){
  editMode=false;
  document.getElementById('edit-id').value='';
  document.getElementById('f-judul').value='';
  document.getElementById('f-kategori').value='';
  document.getElementById('f-deskripsi').value='';
  document.getElementById('f-gambar').value='';
  document.getElementById('f-tanggal').value='';
  document.getElementById('f-featured').checked=false;
  document.getElementById('form-title').innerHTML="<i class='bx bx-edit'></i> Tambah Artikel Baru";
  document.getElementById('btn-cancel-edit').style.display='none';
  uploadedImgUrl='';
  imgMode='url';
  switchImgTab('url');
  clearPreview();
  document.getElementById('upload-success').style.display='none';
  document.getElementById('f-gambar-file').value='';
}

function editArtikel(id){
  const a = DB.artikel.find(x=>x.id===id);
  if(!a) return;
  editMode=true;
  document.getElementById('edit-id').value=a.id;
  document.getElementById('f-judul').value=a.judul||'';
  document.getElementById('f-kategori').value=a.kategori_id||'';
  document.getElementById('f-deskripsi').value=a.deskripsi||'';
  document.getElementById('f-tanggal').value=a.tanggal||'';
  document.getElementById('f-featured').checked=!!a.featured;
  document.getElementById('form-title').innerHTML="<i class='bx bx-edit'></i> Edit Artikel";
  document.getElementById('btn-cancel-edit').style.display='';
  setGambarValue(a.gambar||'');
  switchTab('tab-tambah');
}

function previewImage(){
  const url = document.getElementById('f-gambar').value.trim();
  showPreview(url);
}

/* Tombol Simpan Artikel */
document.getElementById('btn-submit-art').addEventListener('click', async()=>{
  const judul = document.getElementById('f-judul').value.trim();
  const katId = document.getElementById('f-kategori').value;
  if(!judul){ showToast('Judul tidak boleh kosong!', true); return; }
  if(!katId){ showToast('Pilih kategori terlebih dahulu!', true); return; }

  const editId = document.getElementById('edit-id').value;
  const artData = {
    judul,
    deskripsi:   document.getElementById('f-deskripsi').value.trim(),
    gambar:      getGambarValue(),
    kategori_id: katId,
    tanggal:     document.getElementById('f-tanggal').value,
    featured:    document.getElementById('f-featured').checked
  };

  const btn = document.getElementById('btn-submit-art');
  btn.disabled=true;
  btn.innerHTML='<span class="spinner"></span> Menyimpan…';

  try {
    if(editId){
      const result = await apiEdit('art', editId, artData);
      const idx = DB.artikel.findIndex(a=>a.id===editId);
      if(idx>-1) DB.artikel[idx] = result.item || { ...artData, id:editId };
      showToast('✅ Artikel berhasil diperbarui dan disimpan ke GitHub!');
    } else {
      const newArt = { id: uid(), ...artData };
      await apiTambahArtikel(newArt);
      showToast('✅ Artikel berhasil ditambahkan dan disimpan ke GitHub!');
    }
    resetForm();
    render();
    switchTab('tab-artikel');
  } catch(e){
    showToast('Gagal menyimpan: '+e.message, true);
  } finally {
    btn.disabled=false;
    btn.innerHTML="<i class='bx bx-save'></i> Simpan Artikel";
  }
});

document.getElementById('btn-reset-form').addEventListener('click', resetForm);
document.getElementById('btn-cancel-edit').addEventListener('click', resetForm);

/* ════════════════════════════════════════════════════
   KATEGORI
   ════════════════════════════════════════════════════ */
document.getElementById('btn-add-kat').addEventListener('click', async()=>{
  const nama  = document.getElementById('kat-nama').value.trim();
  const warna = document.getElementById('kat-warna').value;
  if(!nama){ showToast('Nama kategori tidak boleh kosong!', true); return; }

  const btn = document.getElementById('btn-add-kat');
  btn.disabled=true;
  btn.innerHTML='<span class="spinner"></span> Menyimpan…';

  try {
    const newKat = { id: uid(), nama, warna };
    await apiTambahKategori(newKat);
    document.getElementById('kat-nama').value='';
    render();
    showToast('✅ Kategori berhasil ditambahkan dan disimpan ke GitHub!');
  } catch(e){
    showToast('Gagal menambah kategori: '+e.message, true);
  } finally {
    btn.disabled=false;
    btn.innerHTML="<i class='bx bx-plus'></i> Tambah Kategori";
  }
});

/* ════════════════════════════════════════════════════
   DELETE MODAL
   ════════════════════════════════════════════════════ */
let _delType='', _delIds=[];

function openDelModal(type, id, name){
  _delType=type;
  _delIds=[id];
  let message = `Apakah kamu yakin ingin menghapus <strong>${esc(name)}</strong>?`;
  document.getElementById('del-message').innerHTML = message;
  document.getElementById('del-confirm-btn').disabled=false;
  document.getElementById('del-confirm-btn').innerHTML="<i class='bx bx-trash'></i> Hapus";
  document.getElementById('del-modal').classList.add('open');
}

function openDelBulkModal(type, ids){
  _delType=type;
  _delIds=ids;
  let message = `Apakah kamu yakin ingin menghapus <strong>${ids.length} item</strong>? Tindakan ini tidak dapat dibatalkan.`;
  document.getElementById('del-message').innerHTML = message;
  document.getElementById('del-confirm-btn').disabled=false;
  document.getElementById('del-confirm-btn').innerHTML="<i class='bx bx-trash'></i> Hapus Semua";
  document.getElementById('del-modal').classList.add('open');
}

function closeDelModal(){
  document.getElementById('del-modal').classList.remove('open');
}

document.getElementById('del-confirm-btn').addEventListener('click', async()=>{
  const btn = document.getElementById('del-confirm-btn');
  const cancelBtn = document.getElementById('del-cancel-btn');
  btn.disabled=true;
  cancelBtn.disabled=true;
  btn.innerHTML='<span class="spinner"></span> Menghapus…';

  try {
    let deleted = 0;
    for(const id of _delIds){
      await apiDelete(_delType, id);
      deleted++;
    }
    
    if(_delType==='art'){
      DB.artikel = DB.artikel.filter(a=>!_delIds.includes(a.id));
      clearArtSelection();
    } else {
      DB.kategori = DB.kategori.filter(k=>!_delIds.includes(k.id));
      clearKatSelection();
    }
    
    const msg = _delIds.length > 1 ? `✅ ${_delIds.length} item berhasil dihapus dari GitHub!` : '✅ Berhasil dihapus dari GitHub!';
    showToast(msg);
    closeDelModal();
    render();
  } catch(e){
    showToast('Gagal menghapus: '+e.message, true);
    btn.innerHTML="<i class='bx bx-trash'></i> Hapus";
  } finally {
    btn.disabled=false;
    cancelBtn.disabled=false;
  }
});

/* ════════════════════════════════════════════════════
   BULK DELETE BUTTONS
   ════════════════════════════════════════════════════ */
document.getElementById('art-bulk-delete').addEventListener('click', ()=>{
  if(selectedArt.size === 0) return;
  openDelBulkModal('art', Array.from(selectedArt));
});

document.getElementById('art-bulk-clear').addEventListener('click', clearArtSelection);

document.getElementById('kat-bulk-delete').addEventListener('click', ()=>{
  if(selectedKat.size === 0) return;
  openDelBulkModal('kat', Array.from(selectedKat));
});

document.getElementById('kat-bulk-clear').addEventListener('click', clearKatSelection);

/* ════════════════════════════════════════════════════
   SELECT ALL CHECKBOXES
   ════════════════════════════════════════════════════ */
document.getElementById('art-select-all').addEventListener('change', (e)=>{
  const visibleIds = getFilteredArtikels().map(a=>a.id);
  if(e.target.checked){
    visibleIds.forEach(id=>selectedArt.add(id));
  } else {
    visibleIds.forEach(id=>selectedArt.delete(id));
  }
  updateArtBulkBar();
  renderArtTable();
});

document.getElementById('kat-select-all').addEventListener('change', (e)=>{
  if(e.target.checked){
    DB.kategori.forEach(k=>selectedKat.add(k.id));
  } else {
    selectedKat.clear();
  }
  updateKatBulkBar();
  renderKatTable();
});

/* ════════════════════════════════════════════════════
   SIMPAN KE GITHUB (tombol manual)
   ════════════════════════════════════════════════════ */
document.getElementById('btn-save-gh').addEventListener('click', async()=>{
  const btn = document.getElementById('btn-save-gh');
  btn.innerHTML='<span class="spinner"></span><span class="btn-label"> Menyimpan…</span>'; btn.disabled=true;
  try{
    const sha = await saveToServer();
    if(sha) DB._sha = sha;
    showToast('✅ Data berhasil disimpan ke GitHub!');
  } catch(e){
    showToast('Gagal simpan: '+e.message, true);
  } finally {
    btn.innerHTML="<i class='bx bx-cloud-upload'></i><span class=\"btn-label\"> Simpan ke GitHub</span>"; btn.disabled=false;
  }
});

/* ════════════════════════════════════════════════════
   UI UTILITIES
   ════════════════════════════════════════════════════ */
function switchTab(tabId){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

/* Search */
document.getElementById('art-search').addEventListener('input', e=>{
  artSearch = e.target.value.toLowerCase().trim();
  clearArtSelection();
  renderArtTable();
});

/* Filter: kategori */
document.getElementById('art-filter-kat').addEventListener('change', e=>{
  artKatFilter = e.target.value;
  clearArtSelection();
  renderArtTable();
});

/* Filter: unggulan saja (chip toggle) */
document.getElementById('art-filter-feat').addEventListener('click', ()=>{
  artFeaturedOnly = !artFeaturedOnly;
  document.getElementById('art-filter-feat').classList.toggle('active', artFeaturedOnly);
  clearArtSelection();
  renderArtTable();
});

/* Tabs */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{ switchTab(btn.dataset.tab); });
});

/* Sidebar mobile */
document.getElementById('sidebar-toggle').addEventListener('click',()=>{
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
});
document.getElementById('sidebar-overlay').addEventListener('click',()=>{
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
});

/* Toast */
let _tt;
function showToast(msg, err=false){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='show'+(err?' err':'');
  clearTimeout(_tt); _tt=setTimeout(()=>t.classList.remove('show'),3500);
}

/* ── INIT: loadData dipanggil setelah auth berhasil ── */
