/* Dewan Temenggong - JSP | Frontend (vanilla JS). Data disimpan dalam Turso melalui /api/* */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, c = '') => `<i data-lucide="${n}" class="ic ${c}"></i>`;
const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
const fmt = (d) => { if (!d) return ''; const [y, m, x] = d.split('-'); return `${+x} ${MONTHS[+m - 1]} ${y}`; };
const FALLBACK = 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&q=80&w=200';
const SRD_REMARK = 'Jika berlaku pertindihan atau pertembungan penggunaan dengan pelajar lain, keutamaan diberikan kepada pelajar yang berpakaian sukan lengkap mengikut garis panduan Sahsiah Rupa Diri (SRD).';
const TABS = [['home', 'Utama', 'home'], ['booking-wizard', 'Tempah', 'plus'], ['student-check', 'Semak Status', 'search'], ['availability-calendar', 'Kalendar Live', 'calendar']];
const COURT = '<svg class="court" viewBox="0 0 400 220" fill="none" stroke="#fff" stroke-width="2.5"><rect x="10" y="10" width="380" height="200"/><line x1="10" y1="40" x2="390" y2="40"/><line x1="10" y1="180" x2="390" y2="180"/><line x1="200" y1="10" x2="200" y2="210" stroke-width="5"/><line x1="100" y1="40" x2="100" y2="180"/><line x1="300" y1="40" x2="300" y2="180"/><line x1="100" y1="110" x2="300" y2="110"/></svg>';

const S = {
  tab: 'home', step: 1, fac: 'fac-badminton', unit: 'b-lining', date: today(), notes: '',
  form: JSON.parse(localStorage.getItem('dt_form') || '{}'), search: '', results: null,
  view: { status: today(), admin: today() }, data: null, token: localStorage.getItem('dt_token') || '', modal: null, receipt: null
};

/* ---------- API ---------- */
async function api(path, body) {
  const r = await fetch('/api/' + path, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Ralat pelayan.');
  return j;
}
async function load() {
  try {
    S.data = await api('state');
    if (S.token && !S.data.isAdmin) { S.token = ''; localStorage.removeItem('dt_token'); }
  } catch (e) { toast(e.message, 'error'); }
  render();
}
let tt;
function toast(msg, type = 'success') {
  const el = $('#toast'); el.className = 'show ' + type; el.textContent = msg;
  clearTimeout(tt); tt = setTimeout(() => (el.className = ''), 4000);
}

/* ---------- Helper ---------- */
const sched = (d) => { if (!d || !S.data) return null; const [y, m, x] = d.split('-').map(Number); return S.data.schedule[new Date(y, m - 1, x).getDay()] || null; };
const chip = (t, x) => `<span class="chip ${t}">${x}</span>`;
const notice = (t, i, title, body) => `<div class="notice ${t}"><b>${ic(i)} ${title}</b><div>${body}</div></div>`;
const srd = () => notice('warn', 'alert-circle', 'Peringatan: Sahsiah Rupa Diri (SRD)', SRD_REMARK);
function overview(d) {
  const sc = sched(d), closed = S.data.closedDates.includes(d); let tot = 0, bk = 0;
  if (sc && !closed) S.data.facilities.forEach((f) => f.units.forEach((u) => sc.slots.forEach((sl) => {
    tot += f.maxCapacity;
    bk += S.data.bookings.filter((b) => b.unitId === u.id && b.date === d && b.startTime === sl.start && b.status === 'Diluluskan').length;
  })));
  return { tot, rem: Math.max(0, tot - bk), closed: closed || !sc };
}

/* ---------- Paparan ---------- */
function header() {
  const D = S.data, adm = D.isAdmin;
  return `<header class="top"><div class="wrap in">
    <button class="brand" data-a="tab" data-t="home"><img class="logo" src="${esc(D.settings.logo)}" alt="Logo JSP" onerror="this.onerror=null;this.src='${FALLBACK}'"><span><b>Dewan Temenggong</b><small>Jawatankuasa Sukan Pelajar (JSP)</small></span></button>
    <nav class="tabs">${TABS.map(([id, t]) => `<button class="${S.tab === id ? 'on' : ''}" data-a="tab" data-t="${id}">${t}</button>`).join('')}</nav>
    ${adm ? `<div class="flex" style="gap:8px"><button class="hbtn ${S.tab === 'admin' ? 'on' : ''}" data-a="tab" data-t="admin">${ic('shield')}<span class="hide-m">Dashboard JSP</span></button><button class="hbtn" data-a="logout" title="Log Keluar Admin">${ic('log-out')}</button></div>`
      : `<button class="hbtn" data-a="modal" data-m="login">${ic('key-round')}<span class="hide-m">Akses Admin JSP</span></button>`}
  </div></header>`;
}
const bnav = () => `<nav class="bnav">${TABS.map(([id, t, i]) => `<button class="${S.tab === id ? 'on' : ''}" data-a="tab" data-t="${id}">${ic(i)}${t}</button>`).join('')}</nav>`;

function home() {
  const D = S.data, o = overview(S.date), act = D.bookings.filter((b) => b.status === 'Diluluskan').length;
  return `<div class="stack">
  <section class="hero"><div class="bg" style="background-image:url('${esc(D.settings.bg)}')"></div><div class="shade"></div>${COURT}
    <div class="txt stack" style="--s:20px"><span class="tag">Portal rasmi tempahan sukan pelajar</span>
      <h2>Tempah <em>Dewan Temenggong</em> dalam seminit.</h2>
      <p>Diuruskan oleh Jawatankuasa Sukan Pelajar (JSP). Tempahan terus lulus automatik secara individu (1 orang 1 peranti), tertakluk kepada kapasiti maksimum gelanggang.</p>
      <div class="btns"><button class="btn volt" data-a="tab" data-t="booking-wizard">Tempah sekarang ${ic('arrow-right')}</button>
      <button class="btn ghost" data-a="tab" data-t="availability-calendar">${ic('activity')} Semak slot live</button>
      <button class="btn ghost" data-a="tab" data-t="student-check">${ic('search')} Semak status tempahan</button></div></div></section>
  <section class="card"><div class="head"><div><h3>Kapasiti dan statistik</h3><p class="mute">Semak kekosongan tempat untuk tarikh pilihan anda.</p></div><input type="date" class="auto" value="${S.date}" data-d="sel"></div>
    <div class="stats"><div><small>Jumlah tempahan</small><div class="n">${D.bookings.length}</div></div>
    <div><small>Tempahan lulus (aktif)</small><div class="n" style="color:var(--ok)">${act}</div></div>
    <div><small>Kapasiti kosong</small><div class="n">${o.closed ? 0 : o.rem}<small> / ${o.tot}</small></div></div>
    <div><small>Status operasi</small><div style="margin-top:12px">${o.closed ? chip('bad', '🔴 Ditutup / luar operasi') : o.rem > 0 ? chip('ok', '🟢 Boleh mohon') : chip('warn', '⚠️ Kapasiti penuh')}</div></div></div></section>
  <section class="f3">
    <div class="feat">${ic('users')}<h3>Sistem 1 orang 1 peranti</h3><p class="mute">Setiap pelajar memohon secara individu dengan 1 tempahan sehari bagi setiap No. Matrik / No. Telefon. Anda boleh menempah untuk hari-hari operasi yang lain.</p></div>
    <div class="feat">${ic('check-circle-2')}<h3>Terus lulus automatik</h3><p class="mute">Tiada semakan admin. Tempahan diluluskan serta-merta selagi slot belum mencapai had maksimum.</p></div>
    <div class="feat">${ic('clock')}<h3>Waktu operasi 2 jam</h3><p class="mute">Isnin dan Jumaat (5:00 PM - 7:00 PM), Rabu (8:00 PM - 10:00 PM).</p></div>
  </section></div>`;
}

function wizard() {
  const D = S.data, fac = D.facilities.find((f) => f.id === S.fac), f = S.form; let b = '';
  if (S.step === 1) {
    b = `<h3>Pilih sukan / kemudahan</h3><div class="g2">${D.facilities.map((x) => `<button type="button" class="opt ${S.fac === x.id ? 'on' : ''}" data-a="fac" data-id="${x.id}"><div class="im" style="background-image:url('${x.image}')"></div><div class="bd"><h4>${x.name}</h4><p class="mute">${x.description}</p><p class="ok-t">Maks ${x.maxCapacity} pax setiap unit • ${x.units.length} unit</p></div></button>`).join('')}</div>
    <div><label>Pilih unit / gelanggang / meja</label><div class="g2">${fac.units.map((u) => `<button type="button" class="u ${S.unit === u.id ? 'on' : ''}" data-a="unit" data-id="${u.id}"><span>${u.name}</span>${S.unit === u.id ? ic('check') : ''}</button>`).join('')}</div></div>
    <div class="end"><button class="btn volt" data-a="step" data-n="2">Seterusnya: tarikh dan masa ${ic('arrow-right')}</button></div>`;
  } else if (S.step === 2) {
    const sc = sched(S.date), cl = D.closedDates.includes(S.date);
    const nt = cl ? notice('bad', 'alert-circle', 'Dewan ditutup pada tarikh ini', 'Pentadbiran JSP telah menutup operasi dewan bagi tarikh ini. Sila pilih tarikh lain.')
      : !sc ? notice('warn', 'info', 'Luar waktu operasi rasmi JSP', 'Dewan hanya dibuka pada hari <b>Isnin (5:00 PM - 7:00 PM)</b>, <b>Rabu (8:00 PM - 10:00 PM)</b>, dan <b>Jumaat (5:00 PM - 7:00 PM)</b>.')
      : notice('ok', 'check-circle-2', `Waktu operasi rasmi (${sc.dayName}): ${sc.timeDisplay}`, 'Slot 2 jam rasmi yang dipersetujui oleh JSP bagi tarikh ini.');
    b = `<h3>Pilih tarikh dan slot masa</h3><div><label>Tarikh operasi dewan</label><input type="date" value="${S.date}" data-d="sel"></div>${nt}
    <div class="between"><button class="btn line" data-a="step" data-n="1">Kembali</button><button class="btn volt" data-a="step" data-n="3" ${cl || !sc ? 'disabled' : ''}>Seterusnya: maklumat pemohon ${ic('arrow-right')}</button></div>`;
  } else if (S.step === 3) {
    const fld = (k, l, ph, up) => `<div><label>${l}</label><input type="text" placeholder="${ph}" value="${esc(f[k] || '')}" data-f="${k}" ${up ? 'style="text-transform:uppercase"' : ''}></div>`;
    b = `<h3>Maklumat pelajar (pemohon individu)</h3>${srd()}
    ${fld('fullName', 'Nama penuh pelajar *', 'Contoh: MUHAMMAD HAZIM BIN ROSLI')}${fld('phoneNo', 'No. telefon / WhatsApp *', 'Contoh: 012-3456789')}
    <div class="g2">${fld('studentId', 'No. matrik *', 'Contoh: 2024694636', 1)}${fld('programCode', 'Kod program *', 'Contoh: BA111', 1)}</div>
    <div class="g2"><div><label>Bilangan peserta (tetap)</label><input type="number" value="1" disabled><span class="mute sm">Dikunci pada 1 orang sahaja (1 orang 1 peranti).</span></div>
    <div><label>Catatan tambahan (pilihan)</label><input type="text" placeholder="Contoh: Latihan peribadi..." value="${esc(S.notes)}" data-s="notes"></div></div>
    <div class="between"><button class="btn line" data-a="step" data-n="2">Kembali</button><button class="btn ink" data-a="submit">${ic('check-circle-2')} Hantar dan terus lulus</button></div>`;
  } else if (S.receipt) {
    const r = S.receipt;
    b = `<div class="right" style="text-align:center"><div class="okc">${ic('check-circle-2')}</div><h2 style="margin-top:14px">Tempahan berjaya diluluskan</h2><p class="mute">Permohonan anda telah diluluskan secara automatik oleh Sistem JSP.</p></div>
    <dl class="rc">${[['No. rujukan', r.refNo], ['Nama pemohon', r.userName], ['No. matrik', r.studentId], ['Kemudahan', `${r.facilityName} - ${r.unitName}`], ['Tarikh dan masa', `${fmt(r.date)} (${r.startTime} - ${r.endTime})`], ['Status', '🟢 Diluluskan (automatik)']].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div style="max-width:440px;margin:0 auto">${srd()}</div>
    <div class="end" style="justify-content:center"><button class="btn volt" data-a="tab" data-t="student-check">Semak rekod tempahan</button></div>`;
  }
  return `<div class="narrow"><div class="card"><div class="pad stack" style="--s:20px"><div class="between" style="border:0;padding:0;align-items:flex-start"><div><h2>Borang tempahan</h2><p class="mute">1 orang 1 nama. Terus lulus automatik.</p></div>${chip('mute', `Langkah ${S.step} daripada 4`)}</div>
  <div class="bar">${[1, 2, 3, 4].map((n) => `<i class="${n <= S.step ? 'on' : ''}"></i>`).join('')}</div>${b}</div></div></div>`;
}

/* Folder ikut court/meja + pilih tarikh */
function browser(kind) {
  const D = S.data, adm = D.isAdmin, vd = S.view[kind];
  const base = kind === 'status' && S.search.trim() ? (S.results || []) : D.bookings;
  const dates = [...new Set(base.map((b) => b.date))].sort().reverse();
  const shown = vd ? base.filter((b) => b.date === vd) : base, sc = sched(vd);
  return `<div class="stack" style="--s:16px"><div class="panel stack" style="--s:12px">
    <div class="end-b"><div><label>Pilih tarikh operasi</label><input type="date" class="auto" value="${vd}" data-d="view" data-k="${kind}"></div><button class="btn line" data-a="view" data-k="${kind}" data-v="">Semua tarikh</button></div>
    ${dates.length ? `<div class="wrapf"><span class="mute sm">Tarikh ada tempahan:</span>${dates.map((d) => `<button class="pill ${vd === d ? 'on' : ''}" data-a="view" data-k="${kind}" data-v="${d}">${fmt(d)} (${base.filter((b) => b.date === d).length})</button>`).join('')}</div>` : ''}
    <p class="strong wrapf">${vd ? fmt(vd) : 'Semua tarikh'} ${vd ? (D.closedDates.includes(vd) ? chip('bad', 'Ditutup (Admin JSP)') : sc ? chip('ok', `${sc.dayName} • ${sc.timeDisplay}`) : chip('mute', 'Luar waktu operasi')) : ''}</p></div>
  ${D.facilities.map((f) => `<div><h4 class="fh">${f.name}</h4>${f.units.map((u) => {
    const ub = shown.filter((b) => b.unitId === u.id), full = vd && ub.length >= f.maxCapacity;
    return `<details class="folder" ${ub.length ? 'open' : ''}><summary><span class="flex">${ic('arrow-right', 'ar volt-t')}${ic('folder', 'volt-t')} ${u.name}</span><span class="badge ${full ? 'bad' : ''}">${vd ? `${ub.length} / ${f.maxCapacity}${full ? ' Penuh' : ''}` : `${ub.length} tempahan`}</span></summary>
    ${ub.length ? ub.map((b) => `<div class="row"><div><b>${esc(b.refNo)}</b> ${chip('ok', 'Diluluskan automatik')}<p class="strong">${esc(b.userName)} (${esc(b.studentId)}${adm ? ' • ' + esc(b.programCode) : ''})</p>${adm ? `<p class="mute sm">${ic('phone')} ${esc(b.phoneNo)}</p>` : ''}</div>
      <div class="mute sm right">${vd ? '' : `<b class="ink-t">${fmt(b.date)}</b><br>`}${esc(b.startTime)} - ${esc(b.endTime)} • 1 orang<br>Dibuat: ${esc(b.createdAt)}</div></div>`).join('') : '<p class="row mute">Tiada tempahan.</p>'}</details>`;
  }).join('')}</div>`).join('')}</div>`;
}

const status = () => `<div class="narrow"><div class="card pad stack"><div><h2>${ic('search')} Semak status tempahan</h2><p class="mute">Masukkan No. Matrik atau No. Rujukan untuk carian pantas.</p></div>
  <input type="search" placeholder="Cari guna No. Matrik (cth: 2024694636) atau No. Rujukan..." value="${esc(S.search)}" data-s="search">${srd()}<div id="res-status">${browser('status')}</div></div></div>`;

function calendar() {
  const D = S.data, sc = sched(S.date);
  return `<div class="narrow"><div class="card pad stack"><div class="between" style="border:0;padding:0;align-items:center;flex-wrap:wrap"><div><h2>${ic('calendar')} Kalendar kekosongan</h2><p class="mute">Semak hari operasi rasmi dan status penutupan oleh JSP.</p></div><input type="date" class="auto" value="${S.date}" data-d="sel"></div>
  <div class="panel between" style="border:0;align-items:center;flex-wrap:wrap"><div><h3>${fmt(S.date)}</h3><p class="mute">Jadual operasi: ${sc ? sc.timeDisplay : 'Luar waktu operasi'}</p></div>
  ${D.closedDates.includes(S.date) ? chip('bad', 'Ditutup (Admin JSP)') : sc ? chip('ok', 'Beroperasi (boleh mohon)') : chip('mute', 'Tidak beroperasi')}</div>
  <div class="g2">${D.facilities.map((f) => `<div class="card pad stack" style="--s:12px;padding:20px"><div class="between" style="border:0;padding:0"><h4>${f.name}</h4><span class="ok-t">Maks ${f.maxCapacity} pax / unit</span></div>
  ${f.units.map((u) => { const n = D.bookings.filter((b) => b.unitId === u.id && b.date === S.date && b.status === 'Diluluskan').length, full = n >= f.maxCapacity;
    return `<div class="panel between" style="border:0;padding:12px;align-items:center"><span>${u.name}</span><b style="color:var(${full ? '--bad' : '--ok'});font-size:13px">${n} / ${f.maxCapacity} ${full ? '(Penuh)' : '(Tersedia)'}</b></div>`; }).join('')}</div>`).join('')}</div></div></div>`;
}

function admin() {
  const D = S.data, cl = D.closedDates.includes(S.date);
  return `<div class="card pad stack"><div class="between" style="border:0;padding:0;align-items:center;flex-wrap:wrap"><div><h2>${ic('shield')} Dashboard admin JSP</h2><p class="mute">Kawalan operasi, tetapan imej/logo, senarai permohonan, dan Google Sheets.</p></div>
  <div class="wrapf"><button class="btn ink" data-a="modal" data-m="sheets">${ic('file-spreadsheet')} Integrasi Google Sheets</button><button class="btn line" data-a="csv">${ic('download')} Eksport CSV</button></div></div>
  <div class="panel stack" style="--s:14px"><h4>${ic('image')} Tetapan visual (background dan logo)</h4><div class="g2"><div><label>URL gambar background hero</label><input type="text" value="${esc(S.bgIn)}" data-s="bgIn" placeholder="https://..."></div><div><label>URL logo JSP header</label><input type="text" value="${esc(S.logoIn)}" data-s="logoIn" placeholder="https://..."></div></div><div class="end"><button class="btn volt" data-a="saveVisual">Simpan perubahan visual</button></div></div>
  <div class="panel stack" style="--s:12px"><h4>Kawalan operasi tarikh dewan</h4><div class="wrapf"><input type="date" class="auto" value="${S.date}" data-d="sel"><button class="btn ${cl ? 'green' : 'red'}" data-a="toggle">${ic('power')} ${cl ? 'Buka operasi tarikh ini' : 'Tutup operasi tarikh ini'}</button></div></div>
  <div><h3>Semua rekod tempahan (${D.bookings.length})</h3><div style="margin-top:14px">${browser('admin')}</div></div></div>`;
}

function modals() {
  if (S.modal === 'login') return `<div class="modal"><div class="box"><button class="x" data-a="close" aria-label="Tutup">${ic('x')}</button><div class="mi">${ic('key-round')}</div><h3>Akses admin JSP</h3><p class="mute">Sila masukkan kata laluan keselamatan admin.</p>
    <form id="loginForm" class="stack" style="--s:14px"><input type="password" name="pw" placeholder="Kata laluan admin..." autofocus><button class="btn volt full" type="submit">Log masuk admin</button></form></div></div>`;
  if (S.modal === 'sheets') return `<div class="modal"><div class="box"><button class="x" data-a="close" aria-label="Tutup">${ic('x')}</button><div class="mi" style="background:var(--ok)">${ic('file-spreadsheet')}</div><h3>Integrasi Google Sheets</h3>
    <p class="mute">Masukkan Web App URL Google Apps Script anda untuk auto-sync rekod tempahan ke Google Sheets.</p><div><label>Web App URL (Apps Script)</label><input type="text" value="${esc(S.sheetsIn)}" data-s="sheetsIn" placeholder="https://script.google.com/macros/s/.../exec"></div>
    <ol class="panel sm" style="padding-left:30px;margin:0"><li>Cipta Google Sheet baru di Google Drive.</li><li>Pergi ke <b>Extensions ➔ Apps Script</b> dan tampal skrip <code>doPost</code>.</li><li>Tekan <b>Deploy ➔ New Deployment ➔ Web App (Who has access: Anyone)</b>.</li><li>Salin URL yang terhasil dan tampal di atas.</li></ol>
    <button class="btn ink full" data-a="saveSheets">Simpan pautan</button></div></div>`;
  return '';
}

function render() {
  if (!S.data) { $('#app').innerHTML = '<p style="padding:60px;text-align:center">Memuatkan…</p>'; return; }
  const D = S.data;
  if (S.bgIn === undefined) { S.bgIn = D.settings.bg; S.logoIn = D.settings.logo; }
  if (S.sheetsIn === undefined && D.isAdmin) S.sheetsIn = D.settings.sheetsUrl || '';
  if (S.tab === 'admin' && !D.isAdmin) S.tab = 'home';
  const views = { home, 'booking-wizard': wizard, 'student-check': status, 'availability-calendar': calendar, admin };
  $('#app').innerHTML = header() + `<main class="wrap">${(views[S.tab] || home)()}</main>` + bnav() + modals() +
    '<footer>© 2026 Jawatankuasa Sukan Pelajar (JSP) • Dewan Temenggong. Hak Cipta Terpelihara.</footer>';
  if (window.lucide) lucide.createIcons();
}

/* ---------- Tindakan ---------- */
const A = {
  tab: (d) => { if (d.t === 'booking-wizard') S.step = 1; S.tab = d.t; render(); scrollTo(0, 0); load(); },
  step: (d) => { S.step = +d.n; render(); },
  fac: (d) => { S.fac = d.id; S.unit = S.data.facilities.find((f) => f.id === d.id).units[0].id; render(); },
  unit: (d) => { S.unit = d.id; render(); },
  view: (d) => { S.view[d.k] = d.v; render(); },
  modal: (d) => { S.modal = d.m; render(); },
  close: () => { S.modal = null; render(); },
  logout: () => { S.token = ''; localStorage.removeItem('dt_token'); S.tab = 'home'; toast('Admin telah log keluar.'); load(); },
  async submit() {
    const f = S.form;
    try {
      const r = await api('book', { fullName: f.fullName, phoneNo: f.phoneNo, studentId: f.studentId, programCode: f.programCode, notes: S.notes, facilityId: S.fac, unitId: S.unit, date: S.date });
      localStorage.setItem('dt_form', JSON.stringify(f));
      S.receipt = r.booking; S.step = 4; S.notes = '';
      toast('Tempahan anda BERJAYA dan LULUS secara automatik!'); await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async toggle() {
    try { const r = await api('admin', { action: 'toggle_date', date: S.date });
      toast(`Operasi dewan bagi tarikh ${fmt(S.date)} kini ${r.closed ? 'DITUTUP oleh JSP.' : 'DIBUKA.'}`, r.closed ? 'info' : 'success'); await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async saveVisual() {
    try { await api('admin', { action: 'save_settings', bg: S.bgIn, logo: S.logoIn }); toast('Tetapan visual & logo berjaya disimpan!'); await load(); }
    catch (e) { toast(e.message, 'error'); }
  },
  async saveSheets() {
    try { await api('admin', { action: 'save_settings', sheetsUrl: S.sheetsIn }); S.modal = null; toast('Pautan Google Sheets berjaya disimpan!'); await load(); }
    catch (e) { toast(e.message, 'error'); }
  },
  csv() {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = S.data.bookings.map((b) => [b.refNo, b.userName, b.phoneNo || '-', b.studentId, b.programCode, b.facilityName, b.unitName, b.date, `${b.startTime}-${b.endTime}`, b.participantsCount, b.status, b.createdAt].map(q).join(','));
    const csv = 'No Rujukan,Nama Pelajar,No Telefon,No Matrik,Kod Program,Kemudahan,Unit,Tarikh,Masa,Peserta,Status,Tarikh Dibuat\n' + rows.join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `Rekod_Tempahan_Dewan_Temenggong_${today()}.csv`; a.click(); toast('Laporan tempahan berjaya dieksport ke CSV!');
  }
};

document.addEventListener('click', (e) => {
  const m = e.target.closest('.modal'); if (m && e.target === m) { S.modal = null; return render(); }
  const el = e.target.closest('[data-a]'); if (el && A[el.dataset.a]) A[el.dataset.a](el.dataset);
});
document.addEventListener('change', (e) => {
  const d = e.target.dataset.d; if (!d) return;
  if (d === 'sel') S.date = e.target.value; else S.view[e.target.dataset.k] = e.target.value;
  render();
});
let st;
document.addEventListener('input', (e) => {
  const { f, s } = e.target.dataset;
  if (f) S.form[f] = e.target.value;
  else if (s === 'search') { S.search = e.target.value; clearTimeout(st); st = setTimeout(doSearch, 300); }
  else if (s === 'notes') S.notes = e.target.value;
  else if (s) S[s] = e.target.value;
});
async function doSearch() {
  const q = S.search.trim();
  try { S.results = q ? (await api('search?q=' + encodeURIComponent(q))).bookings : null; } catch (e) { return toast(e.message, 'error'); }
  S.view.status = q ? '' : today();
  const r = $('#res-status'); if (r) { r.innerHTML = browser('status'); lucide.createIcons(); }
}
document.addEventListener('submit', async (e) => {
  e.preventDefault(); if (e.target.id !== 'loginForm') return;
  try {
    const r = await api('admin', { action: 'login', password: e.target.pw.value });
    S.token = r.token; localStorage.setItem('dt_token', r.token); S.modal = null; S.tab = 'admin'; toast('Log masuk Admin JSP Berjaya!'); await load();
  } catch (err) { toast(err.message, 'error'); }
});

load();
