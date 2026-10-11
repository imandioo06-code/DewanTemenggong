/* Dewan Temenggong - JSP
   Minimalist System (Apple / Google Design Inspired) */

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, c = '') => `<i data-lucide="${n}" class="ic ${c}"></i>`;
const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
const DAYS = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

const fmt = (d) => {
  if (!d) return '';
  const [y, m, x] = d.split('-');
  const dt = new Date(+y, +m - 1, +x);
  return `${DAYS[dt.getDay()]}, ${+x} ${MONTHS[+m - 1]} ${y}`;
};

const FALLBACK = '/content img/logojspimg.png';
const SRD_REMARK = 'Sila patuhi garis panduan Sahsiah Rupa Diri (SRD). Berpakaian sukan yang lengkap dan sopan ketika menggunakan kemudahan dewan.';

const TABS = [
  ['home', 'Utama'],
  ['booking-wizard', 'Tempah'],
  ['availability-calendar', 'Kalendar'],
  ['student-check', 'Semak Status']
];

const S = {
  tab: 'home', step: 1, fac: 'fac-badminton', unit: 'b-lining', date: today(), notes: '',
  calYear: new Date().getFullYear(), calMonth: new Date().getMonth(),
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
  if (!r.ok) throw new Error(j.error || 'Ralat komunikasi dengan pelayan.');
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
  const el = $('#toast');
  el.className = 'show ' + type;
  el.innerHTML = `<span>${msg}</span>`;
  clearTimeout(tt);
  tt = setTimeout(() => (el.className = ''), 3800);
}

/* ---------- Helpers ---------- */
const sched = (d) => {
  if (!d || !S.data) return null;
  const [y, m, x] = d.split('-').map(Number);
  return S.data.schedule[new Date(y, m - 1, x).getDay()] || null;
};

const chip = (t, text) => `<span class="chip ${t}">${text}</span>`;

function overview(d) {
  const sc = sched(d), closed = S.data.closedDates.includes(d);
  let tot = 0, bk = 0;
  if (sc && !closed) {
    S.data.facilities.forEach((f) => f.units.forEach((u) => sc.slots.forEach((sl) => {
      tot += f.maxCapacity;
      bk += S.data.bookings.filter((b) => b.unitId === u.id && b.date === d && b.startTime === sl.start && b.status === 'Diluluskan').length;
    })));
  }
  return { tot, rem: Math.max(0, tot - bk), bk, closed: closed || !sc };
}

const getClockTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
const getClockDate = () => {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/* ---------- Header ---------- */
function header() {
  const D = S.data, adm = D.isAdmin;
  return `
  <header class="top-nav">
    <div class="nav-container">
      <div class="nav-brand">
        <button class="brand-link" data-a="tab" data-t="home">
          <img src="/content img/logojspimg.png" alt="Logo JSP" class="nav-logo-thumb" onerror="this.style.display='none'">
          <span class="brand-title">Dewan Temenggong</span>
          <span class="brand-sub">JSP</span>
        </button>
      </div>

      <nav class="nav-segmented">
        ${TABS.map(([id, t]) => `
          <button class="nav-pill ${S.tab === id ? 'active' : ''}" data-a="tab" data-t="${id}">
            ${t}
          </button>
        `).join('')}
      </nav>

      <div class="nav-actions">
        ${adm ? `
          <button class="btn-subtle ${S.tab === 'admin' ? 'active' : ''}" data-a="tab" data-t="admin">
            ${ic('shield')}
            <span>Admin</span>
          </button>
          <button class="btn-icon" data-a="logout" title="Log Keluar">
            ${ic('log-out')}
          </button>
        ` : `
          <button class="btn-subtle" data-a="modal" data-m="login">
            <span>Akses Admin</span>
          </button>
        `}
      </div>
    </div>
  </header>`;
}

const bnav = () => `
  <nav class="mobile-nav">
    ${TABS.map(([id, t]) => `
      <button class="${S.tab === id ? 'active' : ''}" data-a="tab" data-t="${id}">
        <span>${t}</span>
      </button>
    `).join('')}
  </nav>`;

/* ---------- View: Utama (Home) ---------- */
function home() {
  const D = S.data, o = overview(S.date), act = D.bookings.filter((b) => b.status === 'Diluluskan').length;
  const sc = sched(S.date);
  const now = new Date();
  const todaySchedule = D.schedule ? D.schedule[now.getDay()] : null;
  const isOperatingToday = !!todaySchedule;
  const isClosedToday = D.closedDates.includes(today());

  return `
  <div class="flow-layout">
    <!-- 1. Jam Waktu Sekarang & Status (Atas Sekali) -->
    <div class="card clean-widget-clock">
      <div class="widget-clock-inner">
        <div class="clock-display-block">
          <div class="caption-muted">WAKTU SEMASA • MYT (GMT+8)</div>
          <div class="clock-digits" id="liveClockTime">${getClockTime()}</div>
          <div class="clock-calendar-sub" id="liveClockDate">${getClockDate()}</div>
        </div>

        <div class="clock-status-block">
          <div class="status-indicator-row">
            <span class="status-dot ${isClosedToday ? 'dot-red' : isOperatingToday ? 'dot-green' : 'dot-gray'}"></span>
            <span class="status-text">
              ${isClosedToday 
                ? 'Operasi Ditutup Hari Ini' 
                : isOperatingToday 
                  ? `Sesi Dibuka (${todaySchedule.dayName}: ${todaySchedule.timeDisplay})` 
                  : 'Tiada Sesi Operasi Hari Ini (Hari Rehat)'}
            </span>
          </div>
          <p class="caption-muted" style="margin-top:6px">
            Jadual operasi rasmi: Isnin & Jumaat (5-7 PM), Rabu (8-10 PM).
          </p>
          <div style="margin-top:14px">
            <button class="btn-primary" data-a="tab" data-t="booking-wizard">
              Tempah slot hari ini
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Kapasiti dan Statistik (Di bawah jam) -->
    <div class="card clean-stats-bar">
      <div class="stats-header">
        <div>
          <h3 class="section-title">Kapasiti & Statistik Sesi</h3>
          <p class="caption-muted">Status penggunaan fasiliti sukan mengikut tarikh pilihan.</p>
        </div>
        <div class="date-input-wrap">
          <input type="date" value="${S.date}" data-d="sel" class="minimal-date-input">
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-cell">
          <span class="stat-caption">Jumlah Tempahan</span>
          <div class="stat-number">${D.bookings.length}</div>
          <span class="stat-note">Sepanjang sesi</span>
        </div>

        <div class="stat-cell">
          <span class="stat-caption">Tempahan Aktif</span>
          <div class="stat-number stat-green">${act}</div>
          <span class="stat-note">Telah diluluskan</span>
        </div>

        <div class="stat-cell">
          <span class="stat-caption">Kekosongan Hari Ini</span>
          <div class="stat-number">${o.closed ? '0' : o.rem} <span class="stat-unit">/ ${o.tot}</span></div>
          <span class="stat-note">${sc ? sc.timeDisplay : 'Luar operasi'}</span>
        </div>

        <div class="stat-cell">
          <span class="stat-caption">Status Dewan</span>
          <div class="stat-badge-wrap">
            ${o.closed ? chip('chip-bad', 'Ditutup') : o.rem > 0 ? chip('chip-ok', 'Tersedia') : chip('chip-warn', 'Penuh')}
          </div>
          <span class="stat-note">${fmt(S.date)}</span>
        </div>
      </div>
    </div>

    <!-- 3. Hero Presentation dengan backgrounddt.jpeg -->
    <div class="card hero-photo-card" style="background-image: linear-gradient(180deg, rgba(9, 13, 22, 0.45) 0%, rgba(9, 13, 22, 0.88) 100%), url('/content img/backgrounddt.jpeg');">
      <div class="hero-photo-content">
        <span class="hero-tag">DEWAN TEMENGGONG</span>
        <h1 class="hero-headline text-white">Pusat Sukan & Fasiliti Kolej Kediaman.</h1>
        <p class="hero-subline text-white-muted">
          Sistem tempahan berpusat gelanggang badminton dan meja ping pong. Kelulusan automatik masa-nyata untuk kemudahan pelajar kolej.
        </p>
        <div class="hero-button-row">
          <button class="btn-primary" data-a="tab" data-t="booking-wizard">
            Tempah slot sekarang
          </button>
          <button class="btn-glass" data-a="tab" data-t="availability-calendar">
            Lihat kalendar kekosongan
          </button>
          <button class="btn-glass" data-a="tab" data-t="student-check">
            Semak status tempahan
          </button>
        </div>
      </div>
    </div>

    <!-- 4. Guidelines Cards -->
    <div class="clean-grid-3">
      <div class="card clean-card-pad">
        <h4 class="card-item-title">1 Pelajar 1 Peranti</h4>
        <p class="caption-muted">
          Pendaftaran individu menggunakan No. Matrik sah. Had 1 tempahan setiap hari bagi memastikan giliran yang adil untuk semua warga kolej.
        </p>
      </div>

      <div class="card clean-card-pad">
        <h4 class="card-item-title">Kelulusan Serta-merta</h4>
        <p class="caption-muted">
          Sistem mengesahkan tempahan secara langsung selagi kuota slot belum penuh. Anda akan menerima slip rujukan untuk ditunjukkan.
        </p>
      </div>

      <div class="card clean-card-pad">
        <h4 class="card-item-title">Etika Sahsiah (SRD)</h4>
        <p class="caption-muted">
          ${SRD_REMARK}
        </p>
      </div>
    </div>
  </div>`;
}

/* ---------- View: Wizard Tempahan ---------- */
function wizard() {
  const D = S.data, fac = D.facilities.find((f) => f.id === S.fac), f = S.form;
  let body = '';

  const steps = [
    { n: 1, label: 'Pilih Fasiliti' },
    { n: 2, label: 'Tarikh & Waktu' },
    { n: 3, label: 'Maklumat Diri' },
    { n: 4, label: 'Pengesahan' }
  ];

  if (S.step === 1) {
    body = `
      <div class="wizard-step-body">
        <h3 class="step-title">Pilih jenis sukan dan unit</h3>
        <p class="caption-muted">Pilih kemudahan yang ingin anda gunakan hari ini.</p>

        <div class="facility-choice-grid">
          ${D.facilities.map((x) => `
            <div class="card choice-card ${S.fac === x.id ? 'selected' : ''}" data-a="fac" data-id="${x.id}">
              <div class="choice-image" style="background-image:url('${x.image}')"></div>
              <div class="choice-content">
                <div class="choice-header">
                  <span class="choice-title">${x.name}</span>
                  <span class="choice-check">${S.fac === x.id ? ic('check') : ''}</span>
                </div>
                <p class="caption-muted">${x.description}</p>
                <div class="caption-muted" style="margin-top:10px;font-size:12px">
                  Kapasiti: sehingga <b>${x.maxCapacity} orang</b> per unit
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="unit-group">
          <label class="field-label">Pilih unit spesifik:</label>
          <div class="unit-chips-row">
            ${fac.units.map((u) => `
              <button type="button" class="unit-pill ${S.unit === u.id ? 'active' : ''}" data-a="unit" data-id="${u.id}">
                ${u.name}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="step-footer">
          <div></div>
          <button class="btn-primary" data-a="step" data-n="2">
            Seterusnya: Tarikh & Masa
          </button>
        </div>
      </div>`;
  } else if (S.step === 2) {
    const sc = sched(S.date), cl = D.closedDates.includes(S.date);
    body = `
      <div class="wizard-step-body">
        <h3 class="step-title">Pilih tarikh operasi</h3>
        <p class="caption-muted">Dewan beroperasi pada Isnin & Jumaat (5-7 PM) dan Rabu (8-10 PM).</p>

        <div class="field-group" style="margin-top:20px;max-width:320px">
          <label class="field-label">Tarikh penggunaan</label>
          <input type="date" value="${S.date}" data-d="sel" class="minimal-input">
        </div>

        <div class="notice-minimal ${cl ? 'notice-bad' : sc ? 'notice-ok' : 'notice-warn'}">
          ${cl 
            ? 'Dewan ditutup oleh pentadbiran JSP pada tarikh ini. Sila pilih tarikh lain.' 
            : sc 
              ? `Jadual ${sc.dayName}: ${sc.timeDisplay}. Slot dibuka untuk permohonan.` 
              : 'Luar hari operasi rasmi. Sila pilih hari Isnin, Rabu, atau Jumaat.'}
        </div>

        <div class="step-footer">
          <button class="btn-secondary" data-a="step" data-n="1">Kembali</button>
          <button class="btn-primary" data-a="step" data-n="3" ${cl || !sc ? 'disabled' : ''}>
            Seterusnya: Maklumat Pelajar
          </button>
        </div>
      </div>`;
  } else if (S.step === 3) {
    body = `
      <div class="wizard-step-body">
        <h3 class="step-title">Maklumat pemohon</h3>
        <p class="caption-muted">Pastikan maklumat sepadan dengan rekod universiti anda.</p>

        <div class="form-grid" style="margin-top:24px">
          <div class="field-group">
            <label class="field-label">Nama Penuh Pelajar *</label>
            <input type="text" placeholder="Contoh: MUHAMMAD HAZIM" value="${esc(f.fullName || '')}" data-f="fullName" class="minimal-input">
          </div>

          <div class="field-group">
            <label class="field-label">No. Telefon / WhatsApp *</label>
            <input type="text" placeholder="Contoh: 012-3456789" value="${esc(f.phoneNo || '')}" data-f="phoneNo" class="minimal-input">
          </div>

          <div class="field-group">
            <label class="field-label">No. Matrik Pelajar *</label>
            <input type="text" placeholder="Contoh: 2024694636" value="${esc(f.studentId || '')}" data-f="studentId" class="minimal-input" style="text-transform:uppercase">
          </div>

          <div class="field-group">
            <label class="field-label">Kod Program *</label>
            <input type="text" placeholder="Contoh: CS110" value="${esc(f.programCode || '')}" data-f="programCode" class="minimal-input" style="text-transform:uppercase">
          </div>

          <div class="field-group field-span-2">
            <label class="field-label">Catatan Tambahan (Pilihan)</label>
            <input type="text" placeholder="Contoh: Latihan kejohanan" value="${esc(S.notes)}" data-s="notes" class="minimal-input">
          </div>
        </div>

        <div class="step-footer">
          <button class="btn-secondary" data-a="step" data-n="2">Kembali</button>
          <button class="btn-primary" data-a="submit">Hantar dan Luluskan</button>
        </div>
      </div>`;
  } else if (S.receipt) {
    const r = S.receipt;
    body = `
      <div class="wizard-step-body text-center">
        <div class="success-icon-wrap">
          ${ic('check')}
        </div>
        <h3 class="step-title" style="margin-top:16px">Tempahan Disahkan</h3>
        <p class="caption-muted">Permohonan anda telah diluluskan secara automatik.</p>

        <!-- Minimal Pass Slip -->
        <div class="card minimal-pass-card">
          <div class="pass-header">
            <span class="pass-label">NO. RUJUKAN</span>
            <span class="pass-ref">${esc(r.refNo)}</span>
          </div>
          <div class="pass-details-list">
            <div class="pass-row">
              <span class="caption-muted">Nama Pelajar</span>
              <b>${esc(r.userName)}</b>
            </div>
            <div class="pass-row">
              <span class="caption-muted">No. Matrik</span>
              <b>${esc(r.studentId)}</b>
            </div>
            <div class="pass-row">
              <span class="caption-muted">Fasiliti & Unit</span>
              <b>${esc(r.facilityName)} (${esc(r.unitName)})</b>
            </div>
            <div class="pass-row">
              <span class="caption-muted">Tarikh & Masa</span>
              <b>${fmt(r.date)} • ${esc(r.startTime)} - ${esc(r.endTime)}</b>
            </div>
            <div class="pass-row">
              <span class="caption-muted">Status</span>
              <span class="chip chip-ok">Diluluskan</span>
            </div>
          </div>
        </div>

        <div class="hero-button-row" style="justify-content:center;margin-top:24px">
          <button class="btn-secondary" onclick="window.print()">Cetak / Simpan Slip</button>
          <button class="btn-primary" data-a="tab" data-t="student-check">Semak Rekod Tempahan</button>
        </div>
      </div>`;
  }

  return `
  <div class="narrow-container">
    <div class="card clean-card-pad">
      <!-- Minimal Stepper Header -->
      <div class="stepper-dots-row">
        ${steps.map((st) => `
          <div class="stepper-tab ${S.step === st.n ? 'active' : S.step > st.n ? 'done' : ''}">
            <span class="stepper-num">${st.n}</span>
            <span class="stepper-text hide-m">${st.label}</span>
          </div>
        `).join('')}
      </div>

      ${body}
    </div>
  </div>`;
}

/* ---------- View: Browser / Senarai Tempahan ---------- */
function browser(kind) {
  const D = S.data, adm = D.isAdmin, vd = S.view[kind];
  const base = kind === 'status' && S.search.trim() ? (S.results || []) : D.bookings;
  const dates = [...new Set(base.map((b) => b.date))].sort().reverse();
  const shown = vd ? base.filter((b) => b.date === vd) : base, sc = sched(vd);

  return `
  <div class="flow-layout">
    <div class="filter-strip">
      <div class="filter-left">
        <label class="field-label" style="margin:0">Pilih Tarikh:</label>
        <input type="date" value="${vd}" data-d="view" data-k="${kind}" class="minimal-date-input">
        <button class="btn-subtle" data-a="view" data-k="${kind}" data-v="">Semua Tarikh</button>
      </div>

      ${dates.length ? `
        <div class="quick-dates-row">
          ${dates.slice(0, 6).map((d) => `
            <button class="date-chip ${vd === d ? 'active' : ''}" data-a="view" data-k="${kind}" data-v="${d}">
              ${d} (${base.filter((b) => b.date === d).length})
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <div class="flow-layout" style="--s:16px">
      ${D.facilities.map((f) => `
        <div class="facility-section-block">
          <h4 class="facility-section-title">${f.name}</h4>
          <div class="units-stack">
            ${f.units.map((u) => {
              const ub = shown.filter((b) => b.unitId === u.id);
              const full = vd && ub.length >= f.maxCapacity;
              return `
              <details class="clean-accordion" ${ub.length ? 'open' : ''}>
                <summary class="clean-summary">
                  <span class="summary-title">${u.name}</span>
                  <span class="chip ${full ? 'chip-bad' : 'chip-subtle'}">
                    ${vd ? `${ub.length} / ${f.maxCapacity} Orang ${full ? '(Penuh)' : ''}` : `${ub.length} tempahan`}
                  </span>
                </summary>
                <div class="accordion-body">
                  ${ub.length ? ub.map((b) => `
                    <div class="booking-entry">
                      <div>
                        <div class="entry-ref">${esc(b.refNo)}</div>
                        <div class="entry-name">${esc(b.userName)}</div>
                        <div class="caption-muted">${esc(b.studentId)}${adm ? ' • ' + esc(b.programCode) : ''}</div>
                        ${adm ? `<div class="caption-muted" style="margin-top:2px">${esc(b.phoneNo)}</div>` : ''}
                      </div>
                      <div class="text-right">
                        ${vd ? '' : `<div class="caption-muted">${fmt(b.date)}</div>`}
                        <div class="entry-time">${esc(b.startTime)} - ${esc(b.endTime)}</div>
                        <div class="caption-muted" style="font-size:11px">Dibuat: ${esc(b.createdAt)}</div>
                      </div>
                    </div>
                  `).join('') : '<div class="empty-entry caption-muted">Tiada tempahan berdaftar.</div>'}
                </div>
              </details>`;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

/* ---------- View: Semak Status (Kad Minimalist) ---------- */
function renderStudentPassCards() {
  const q = S.search.trim();
  if (!q) return '';
  const bookings = S.results || [];
  if (!bookings.length) {
    return `
      <div class="card empty-search-card">
        <div class="caption-muted" style="font-size:14px">
          Tiada rekod tempahan dijumpai untuk carian: <b>"${esc(q)}"</b>.
        </div>
        <div class="caption-muted sm" style="margin-top:6px">
          Sila pastikan No. Matrik atau No. Rujukan dimasukkan dengan tepat.
        </div>
      </div>`;
  }

  return `
    <div class="pass-cards-list">
      <div class="caption-muted sm" style="margin-bottom:12px;font-weight:600">
        Dijumpai ${bookings.length} rekod tempahan:
      </div>
      ${bookings.map((b) => `
        <div class="student-pass-card">
          <div class="pass-card-top">
            <div class="pass-ref-block">
              <span class="pass-ref-label">NO. RUJUKAN</span>
              <span class="pass-ref-val">${esc(b.refNo)}</span>
            </div>
            <div class="pass-status-pill">
              <span class="status-dot dot-green"></span>
              <span>Diluluskan</span>
            </div>
          </div>

          <div class="pass-card-body">
            <div class="pass-student-details">
              <h4 class="pass-student-name">${esc(b.userName)}</h4>
              <span class="pass-student-sub">${esc(b.studentId)} ${b.programCode ? '• ' + esc(b.programCode) : ''}</span>
            </div>

            <div class="pass-facility-box">
              <div class="pass-facility-title">
                ${b.facilityId.includes('badminton') ? '🏸 ' : '🏓 '} <b>${esc(b.facilityName)}</b>
              </div>
              <div class="pass-unit-title">${esc(b.unitName)}</div>
            </div>

            <div class="pass-date-time-grid">
              <div>
                <span class="caption-muted sm">Tarikh Sesi</span>
                <div class="pass-dt-val">${fmt(b.date)}</div>
              </div>
              <div>
                <span class="caption-muted sm">Waktu Operasi</span>
                <div class="pass-dt-val">${esc(b.startTime)} - ${esc(b.endTime)}</div>
              </div>
            </div>
          </div>

          <div class="pass-card-footer">
            <span class="caption-muted" style="font-size:11.5px">Didaftar pada: ${esc(b.createdAt)}</span>
            <button class="btn-subtle" onclick="window.print()">
              ${ic('printer')} <span>Cetak Slip</span>
            </button>
          </div>
        </div>
      `).join('')}
    </div>`;
}

const status = () => `
  <div class="narrow-container">
    <div class="card clean-card-pad">
      <h3 class="section-title">Semak Status Tempahan</h3>
      <p class="caption-muted">Cari rekod menggunakan No. Matrik Pelajar (cth: 2024694636) atau No. Rujukan Tempahan.</p>

      <div class="search-input-wrap" style="margin-top:18px">
        <input type="search" placeholder="Masukkan No. Matrik atau No. Rujukan..." value="${esc(S.search)}" data-s="search" class="minimal-input search-box" autofocus>
      </div>

      <div id="res-status" style="margin-top:20px">
        ${renderStudentPassCards()}
      </div>
    </div>
  </div>`;

/* ---------- View: Kalendar Visual Besar (Penunjuk Aras) ---------- */
function renderBigMonthlyCalendar() {
  const D = S.data;
  const year = S.calYear;
  const month = S.calMonth;
  const monthName = MONTHS[month];

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0, Sunday is 6
  const startOffset = (firstDayIndex + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();

  const dayHeaders = ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'];

  let cells = [];
  // Empty cells before start
  for (let i = 0; i < startOffset; i++) {
    cells.push('<div class="cal-cell empty"></div>');
  }

  // Days 1..totalDays
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    const dayOfWeek = new Date(year, month, d).getDay();
    const isToday = dateStr === today();
    const isSelected = dateStr === S.date;
    const isClosed = D.closedDates.includes(dateStr);
    const daySched = D.schedule ? D.schedule[dayOfWeek] : null;
    const isOperating = !!daySched;

    // Check bookings for this date
    let badgeHtml = '';
    if (isClosed) {
      badgeHtml = '<span class="cal-badge-pill badge-closed">Ditutup</span>';
    } else if (isOperating) {
      const ov = overview(dateStr);
      if (ov.rem === 0) {
        badgeHtml = '<span class="cal-badge-pill badge-full">Penuh</span>';
      } else {
        badgeHtml = `<span class="cal-badge-pill badge-open">${daySched.dayName.slice(0,3)} • ${daySched.timeDisplay.split(' - ')[0]}</span>`;
      }
    } else {
      badgeHtml = '<span class="cal-badge-muted">Rehat</span>';
    }

    cells.push(`
      <div class="cal-cell ${isOperating ? 'operating' : 'non-operating'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-a="calDate" data-date="${dateStr}">
        <div class="cal-cell-header">
          <span class="cal-day-num">${d}</span>
          ${isToday ? '<span class="cal-today-dot" title="Hari Ini"></span>' : ''}
        </div>
        <div class="cal-cell-body">
          ${badgeHtml}
        </div>
      </div>
    `);
  }

  return `
    <div class="big-calendar-card">
      <div class="cal-top-controls">
        <div class="cal-month-title-wrap">
          <h3 class="cal-month-title">${monthName} ${year}</h3>
          <span class="caption-muted sm">Penunjuk Aras Sesi Operasi & Kekosongan</span>
        </div>
        <div class="cal-nav-buttons">
          <button class="btn-subtle" data-a="calNav" data-dir="-1" title="Bulan Lepas">
            ${ic('chevron-left')}
          </button>
          <button class="btn-subtle" data-a="calToday" title="Bulan Semasa">
            Bulan Ini
          </button>
          <button class="btn-subtle" data-a="calNav" data-dir="1" title="Bulan Depan">
            ${ic('chevron-right')}
          </button>
        </div>
      </div>

      <!-- Legend -->
      <div class="cal-legend-row">
        <div class="legend-item"><span class="legend-dot dot-green"></span> <span>Dibuka (Isnin, Rabu, Jumaat)</span></div>
        <div class="legend-item"><span class="legend-dot dot-red"></span> <span>Ditutup / Penuh</span></div>
        <div class="legend-item"><span class="legend-dot dot-gray"></span> <span>Hari Rehat (Luar Sesi)</span></div>
      </div>

      <!-- Calendar Grid -->
      <div class="cal-weekdays-row">
        ${dayHeaders.map(dh => `<div class="cal-weekday-col">${dh}</div>`).join('')}
      </div>
      <div class="cal-grid">
        ${cells.join('')}
      </div>
    </div>`;
}

function calendar() {
  const D = S.data, sc = sched(S.date);
  return `
  <div class="flow-layout">
    <!-- Big Visual Calendar (Penunjuk Aras) -->
    ${renderBigMonthlyCalendar()}

    <!-- Selected Date Overview Card -->
    <div class="card clean-card-pad" style="margin-top:20px">
      <div class="calendar-date-summary">
        <div>
          <span class="caption-muted sm">TARIKH DIPILIH</span>
          <h3 style="font-size:18px;margin-top:2px">${fmt(S.date)}</h3>
          <div class="caption-muted">Sesi: ${sc ? `<b>${sc.dayName} (${sc.timeDisplay})</b>` : 'Luar sesi operasi rasmi'}</div>
        </div>
        <div>
          ${D.closedDates.includes(S.date) ? chip('chip-bad', 'Dewan Ditutup') : sc ? chip('chip-ok', 'Dibuka Untuk Permohonan') : chip('chip-subtle', 'Tiada Sesi Hari Ini')}
        </div>
      </div>

      <div class="flow-layout" style="margin-top:20px;--s:16px">
        ${D.facilities.map((f) => `
          <div class="card clean-card-pad" style="padding:20px">
            <div class="facility-head-row">
              <span class="choice-title">${f.name}</span>
              <span class="caption-muted">Maks ${f.maxCapacity} orang / unit</span>
            </div>

            <div class="unit-bars-list" style="margin-top:14px">
              ${f.units.map((u) => {
                const n = D.bookings.filter((b) => b.unitId === u.id && b.date === S.date && b.status === 'Diluluskan').length;
                const full = n >= f.maxCapacity;
                const pct = Math.min(100, Math.round((n / f.maxCapacity) * 100));
                return `
                <div class="unit-bar-item">
                  <div class="unit-bar-labels">
                    <span>${u.name}</span>
                    <span class="${full ? 'stat-bad' : 'caption-muted'}">${n} / ${f.maxCapacity} ${full ? '(Penuh)' : '(Tersedia)'}</span>
                  </div>
                  <div class="clean-progress-track">
                    <div class="clean-progress-fill ${full ? 'fill-full' : ''}" style="width:${pct}%"></div>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

/* ---------- View: Admin ---------- */
function admin() {
  const D = S.data, cl = D.closedDates.includes(S.date);
  return `
  <div class="flow-layout">
    <div class="card clean-card-pad">
      <div class="admin-top-header">
        <div>
          <h3 class="section-title">Panel Pentadbir JSP</h3>
          <p class="caption-muted">Kawalan operasi dewan dan eksport data rekod.</p>
        </div>
        <div class="hero-button-row">
          <button class="btn-secondary" data-a="modal" data-m="sheets">Google Sheets</button>
          <button class="btn-primary" data-a="csv">Eksport CSV</button>
        </div>
      </div>

      <div class="admin-controls-grid" style="margin-top:24px">
        <div class="admin-box">
          <label class="field-label">Kawalan Buka / Tutup Tarikh</label>
          <div class="hero-button-row" style="margin-top:8px">
            <input type="date" value="${S.date}" data-d="sel" class="minimal-date-input">
            <button class="${cl ? 'btn-primary' : 'btn-secondary'}" data-a="toggle">
              ${cl ? 'Buka Tarikh Ini' : 'Tutup Tarikh Ini'}
            </button>
          </div>
        </div>

        <div class="admin-box">
          <label class="field-label">Pautan Visual (Latar Belakang & Logo)</label>
          <div class="flow-layout" style="--s:10px;margin-top:8px">
            <input type="text" value="${esc(S.bgIn)}" data-s="bgIn" placeholder="URL Latar Belakang..." class="minimal-input">
            <input type="text" value="${esc(S.logoIn)}" data-s="logoIn" placeholder="URL Logo JSP..." class="minimal-input">
            <button class="btn-secondary" data-a="saveVisual">Simpan Visual</button>
          </div>
        </div>
      </div>

      <div style="margin-top:36px">
        <h4 class="facility-section-title">Semua Rekod Tempahan (${D.bookings.length})</h4>
        <div style="margin-top:14px">${browser('admin')}</div>
      </div>
    </div>
  </div>`;
}

/* ---------- Modals ---------- */
function modals() {
  if (S.modal === 'login') return `
    <div class="clean-modal-backdrop">
      <div class="clean-modal-dialog">
        <button class="modal-close-btn" data-a="close" aria-label="Tutup">${ic('x')}</button>
        <h3 class="section-title">Akses Pegawai JSP</h3>
        <p class="caption-muted">Masukkan kata laluan untuk pengurusan sistem.</p>
        <form id="loginForm" style="margin-top:20px" class="flow-layout" style="--s:14px">
          <input type="password" name="pw" placeholder="Kata laluan keselamatan..." autofocus class="minimal-input">
          <button class="btn-primary" type="submit" style="width:100%">Log Masuk</button>
        </form>
      </div>
    </div>`;

  if (S.modal === 'sheets') return `
    <div class="clean-modal-backdrop">
      <div class="clean-modal-dialog">
        <button class="modal-close-btn" data-a="close" aria-label="Tutup">${ic('x')}</button>
        <h3 class="section-title">Integrasi Google Sheets</h3>
        <p class="caption-muted">Masukkan Web App URL Apps Script untuk auto-sync rekod.</p>
        <div style="margin-top:16px" class="flow-layout" style="--s:14px">
          <input type="text" value="${esc(S.sheetsIn)}" data-s="sheetsIn" placeholder="https://script.google.com/..." class="minimal-input">
          <button class="btn-primary" data-a="saveSheets" style="width:100%">Simpan Pautan</button>
        </div>
      </div>
    </div>`;

  return '';
}

/* ---------- Render Engine ---------- */
function render() {
  if (!S.data) {
    $('#app').innerHTML = `
      <div class="minimal-loader">
        <div class="loader-pulse"></div>
        <div class="caption-muted" style="margin-top:12px">Memuatkan Dewan Temenggong…</div>
      </div>`;
    return;
  }
  const D = S.data;
  if (S.bgIn === undefined) { S.bgIn = D.settings.bg; S.logoIn = D.settings.logo; }
  if (S.sheetsIn === undefined && D.isAdmin) S.sheetsIn = D.settings.sheetsUrl || '';
  if (S.tab === 'admin' && !D.isAdmin) S.tab = 'home';

  const views = { home, 'booking-wizard': wizard, 'student-check': status, 'availability-calendar': calendar, admin };

  $('#app').innerHTML = header() + `
    <main class="main-wrapper">
      ${(views[S.tab] || home)()}
    </main>` + bnav() + modals() + `
    <footer class="clean-footer">
      <div class="nav-container footer-flex">
        <span>© 2026 Dewan Temenggong • JSP Kolej Kediaman</span>
        <span class="caption-muted">Turso Database & Vercel Cloud</span>
      </div>
    </footer>`;

  if (window.lucide) lucide.createIcons();
}

/* ---------- Actions ---------- */
const A = {
  tab: (d) => {
    if (d.t === 'booking-wizard') S.step = 1;
    S.tab = d.t;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    load();
  },
  step: (d) => { S.step = +d.n; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  fac: (d) => { S.fac = d.id; S.unit = S.data.facilities.find((f) => f.id === d.id).units[0].id; render(); },
  unit: (d) => { S.unit = d.id; render(); },
  view: (d) => { S.view[d.k] = d.v; render(); },
  modal: (d) => { S.modal = d.m; render(); },
  close: () => { S.modal = null; render(); },
  logout: () => { S.token = ''; localStorage.removeItem('dt_token'); S.tab = 'home'; toast('Log keluar berjaya.'); load(); },
  calDate: (d) => {
    S.date = d.date;
    render();
  },
  calNav: (d) => {
    const dir = parseInt(d.dir, 10);
    let m = S.calMonth + dir;
    let y = S.calYear;
    if (m < 0) { m = 11; y--; }
    else if (m > 11) { m = 0; y++; }
    S.calMonth = m;
    S.calYear = y;
    render();
  },
  calToday: () => {
    const now = new Date();
    S.calYear = now.getFullYear();
    S.calMonth = now.getMonth();
    S.date = today();
    render();
  },
  async submit() {
    const f = S.form;
    try {
      const r = await api('book', { fullName: f.fullName, phoneNo: f.phoneNo, studentId: f.studentId, programCode: f.programCode, notes: S.notes, facilityId: S.fac, unitId: S.unit, date: S.date });
      localStorage.setItem('dt_form', JSON.stringify(f));
      S.receipt = r.booking;
      S.step = 4;
      S.notes = '';
      toast('Tempahan anda telah disahkan dan diluluskan.');
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async toggle() {
    try {
      const r = await api('admin', { action: 'toggle_date', date: S.date });
      toast(`Operasi tarikh ${fmt(S.date)} kini ${r.closed ? 'ditutup' : 'dibuka'}.`);
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async saveVisual() {
    try {
      await api('admin', { action: 'save_settings', bg: S.bgIn, logo: S.logoIn });
      toast('Visual berjaya dikemaskini.');
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async saveSheets() {
    try {
      await api('admin', { action: 'save_settings', sheetsUrl: S.sheetsIn });
      S.modal = null;
      toast('Pautan Google Sheets disimpan.');
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  csv() {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = S.data.bookings.map((b) => [
      b.refNo, b.userName, b.phoneNo || '-', b.studentId, b.programCode,
      b.facilityName, b.unitName, b.date, `${b.startTime}-${b.endTime}`,
      b.participantsCount, b.status, b.createdAt
    ].map(q).join(','));
    const csv = 'No Rujukan,Nama Pelajar,No Telefon,No Matrik,Kod Program,Kemudahan,Unit,Tarikh,Masa,Peserta,Status,Tarikh Dibuat\n' + rows.join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `Tempahan_Dewan_Temenggong_${today()}.csv`;
    a.click();
    toast('Fail CSV telah dimuat turun.');
  }
};

/* ---------- Events ---------- */
document.addEventListener('click', (e) => {
  const m = e.target.closest('.clean-modal-backdrop');
  if (m && e.target === m) { S.modal = null; return render(); }
  const el = e.target.closest('[data-a]');
  if (el && A[el.dataset.a]) A[el.dataset.a](el.dataset);
});

document.addEventListener('change', (e) => {
  const d = e.target.dataset.d;
  if (!d) return;
  if (d === 'sel') {
    S.date = e.target.value;
    const [y, m] = S.date.split('-').map(Number);
    S.calYear = y;
    S.calMonth = m - 1;
  }
  else S.view[e.target.dataset.k] = e.target.value;
  render();
});

let st;
document.addEventListener('input', (e) => {
  const { f, s } = e.target.dataset;
  if (f) S.form[f] = e.target.value;
  else if (s === 'search') {
    S.search = e.target.value;
    clearTimeout(st);
    st = setTimeout(doSearch, 300);
  }
  else if (s === 'notes') S.notes = e.target.value;
  else if (s) S[s] = e.target.value;
});

async function doSearch() {
  const q = S.search.trim();
  try {
    S.results = q ? (await api('search?q=' + encodeURIComponent(q))).bookings : null;
  } catch (e) {
    return toast(e.message, 'error');
  }
  const r = $('#res-status');
  if (r) {
    r.innerHTML = renderStudentPassCards();
    if (window.lucide) lucide.createIcons();
  }
}

document.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (e.target.id !== 'loginForm') return;
  try {
    const r = await api('admin', { action: 'login', password: e.target.pw.value });
    S.token = r.token;
    localStorage.setItem('dt_token', r.token);
    S.modal = null;
    S.tab = 'admin';
    toast('Akses pentadbir berjaya.');
    await load();
  } catch (err) { toast(err.message, 'error'); }
});

// Live Clock Ticker
setInterval(() => {
  const timeEl = document.getElementById('liveClockTime');
  const dateEl = document.getElementById('liveClockDate');
  if (timeEl) timeEl.textContent = getClockTime();
  if (dateEl) dateEl.textContent = getClockDate();
}, 1000);

load();
