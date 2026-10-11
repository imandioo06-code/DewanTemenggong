/* Dewan Temenggong - JSP | Frontend (Vanilla JS)
   Sistem Pengurusan & Tempahan Kemudahan Sukan Berpusat */

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
const FALLBACK = 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&q=80&w=200';
const SRD_REMARK = 'Semua pengguna fasiliti sukan Dewan Temenggong DIWAJIBKAN mematuhi garis panduan Sahsiah Rupa Diri (SRD) universiti. Sila berpakaian sukan yang sopan dan lengkap. Keutamaan gelanggang diberikan kepada pelajar yang mematuhi kod etika berpakaian.';

const TABS = [
  ['home', 'Halaman Utama', 'layout-dashboard'],
  ['booking-wizard', 'Tempah Slot', 'plus-circle'],
  ['availability-calendar', 'Kalendar Kekosongan', 'calendar-days'],
  ['student-check', 'Semak Status', 'search']
];

const COURT = `<svg class="court" viewBox="0 0 400 220" fill="none" stroke="currentColor">
  <rect x="10" y="10" width="380" height="200" rx="4" stroke-width="2"/>
  <line x1="10" y1="40" x2="390" y2="40" stroke-width="1.5"/>
  <line x1="10" y1="180" x2="390" y2="180" stroke-width="1.5"/>
  <line x1="200" y1="10" x2="200" y2="210" stroke-width="3"/>
  <line x1="100" y1="40" x2="100" y2="180" stroke-width="1.5"/>
  <line x1="300" y1="40" x2="300" y2="180" stroke-width="1.5"/>
  <line x1="100" y1="110" x2="300" y2="110" stroke-width="1.5"/>
</svg>`;

const S = {
  tab: 'home', step: 1, fac: 'fac-badminton', unit: 'b-lining', date: today(), notes: '',
  form: JSON.parse(localStorage.getItem('dt_form') || '{}'), search: '', results: null,
  view: { status: today(), admin: today() }, data: null, token: localStorage.getItem('dt_token') || '', modal: null, receipt: null
};

/* ---------- API Services ---------- */
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
  const iconName = type === 'error' ? 'alert-triangle' : type === 'info' ? 'info' : 'check-circle-2';
  el.className = 'show ' + type;
  el.innerHTML = `${ic(iconName)} <span>${msg}</span>`;
  if (window.lucide) lucide.createIcons();
  clearTimeout(tt);
  tt = setTimeout(() => (el.className = ''), 4200);
}

/* ---------- Business Logic Helpers ---------- */
const sched = (d) => {
  if (!d || !S.data) return null;
  const [y, m, x] = d.split('-').map(Number);
  return S.data.schedule[new Date(y, m - 1, x).getDay()] || null;
};

const chip = (t, text, icon = '') => `
  <span class="chip ${t}">
    ${icon ? ic(icon) : ''}
    <span>${text}</span>
  </span>`;

const notice = (t, i, title, body) => `
  <div class="notice ${t}">
    <div class="notice-icon">${ic(i)}</div>
    <div class="notice-body">
      <b>${title}</b>
      <div>${body}</div>
    </div>
  </div>`;

const srd = () => notice('warn', 'shield-alert', 'Garis Panduan Sahsiah Rupa Diri (SRD)', SRD_REMARK);

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

/* ---------- Header Component ---------- */
function header() {
  const D = S.data, adm = D.isAdmin;
  return `
  <header class="top">
    <div class="wrap in">
      <div class="header-left">
        <button class="brand" data-a="tab" data-t="home">
          <div class="logo-wrapper">
            <img class="logo" src="${esc(D.settings.logo)}" alt="Logo Rasmi JSP" onerror="this.onerror=null;this.src='${FALLBACK}'">
            <span class="live-dot-ping"></span>
          </div>
          <div class="brand-text">
            <b>DEWAN TEMENGGONG</b>
            <small>Sistem Pengurusan & Tempahan Kemudahan JSP</small>
          </div>
        </button>
      </div>

      <nav class="tabs">
        ${TABS.map(([id, t, icon]) => `
          <button class="${S.tab === id ? 'on' : ''}" data-a="tab" data-t="${id}">
            ${ic(icon)}
            <span>${t}</span>
          </button>
        `).join('')}
      </nav>

      <div class="header-right">
        <div class="live-status-pill hide-m">
          <span class="pulse-dot"></span>
          <span>Sistem Aktif</span>
        </div>
        ${adm ? `
          <div class="flex" style="gap:8px">
            <button class="hbtn ${S.tab === 'admin' ? 'on' : ''}" data-a="tab" data-t="admin">
              ${ic('shield-check')}
              <span class="hide-m">Portal Admin</span>
            </button>
            <button class="hbtn icon-only" data-a="logout" title="Log Keluar Admin">
              ${ic('log-out')}
            </button>
          </div>
        ` : `
          <button class="hbtn" data-a="modal" data-m="login">
            ${ic('lock')}
            <span class="hide-m">Akses Pegawai JSP</span>
          </button>
        `}
      </div>
    </div>
  </header>`;
}

const bnav = () => `
  <nav class="bnav">
    ${TABS.map(([id, t, icon]) => `
      <button class="${S.tab === id ? 'on' : ''}" data-a="tab" data-t="${id}">
        ${ic(icon)}
        <span>${t}</span>
      </button>
    `).join('')}
  </nav>`;

/* ---------- View: Halaman Utama ---------- */
function home() {
  const D = S.data, o = overview(S.date), act = D.bookings.filter((b) => b.status === 'Diluluskan').length;
  const sc = sched(S.date);

  return `
  <div class="stack" style="--s: 32px">
    <!-- Hero Section -->
    <section class="hero">
      <div class="bg" style="background-image:url('${esc(D.settings.bg)}')"></div>
      <div class="shade"></div>
      ${COURT}
      <div class="txt stack" style="--s:22px">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span>PORTAL RASMI TEMPAHAN KEMUDAHAN SUKAN PELAJAR</span>
        </div>
        <h2>Tempahan Fasiliti Sukan <em>Dewan Temenggong</em></h2>
        <p>Sistem berpusat Jawatankuasa Sukan Pelajar (JSP) bagi memudahkan permohonan penggunaan gelanggang badminton dan meja ping pong secara telus dengan kelulusan automatik masa-nyata.</p>
        <div class="btns">
          <button class="btn volt" data-a="tab" data-t="booking-wizard">
            ${ic('plus-circle')}
            <span>Tempah Slot Sekarang</span>
            ${ic('arrow-right')}
          </button>
          <button class="btn ghost" data-a="tab" data-t="availability-calendar">
            ${ic('calendar-days')}
            <span>Semak Kalendar Kekosongan</span>
          </button>
          <button class="btn ghost" data-a="tab" data-t="student-check">
            ${ic('search')}
            <span>Semak Status Tempahan</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Executive Metrics & Statistics -->
    <section class="card stats-card">
      <div class="head">
        <div class="flex" style="gap: 12px">
          <div class="icon-avatar">${ic('activity')}</div>
          <div>
            <h3>Kapasiti & Statistik Penggunaan</h3>
            <p class="mute">Pemantauan masa-nyata kehadiran pelajar dan kuota fasiliti sukan.</p>
          </div>
        </div>
        <div class="date-selector-wrapper">
          <label class="sr-only">Tarikh Pilihan</label>
          <input type="date" class="auto" value="${S.date}" data-d="sel">
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-top">
            <span class="stat-label">Jumlah Rekod Tempahan</span>
            <div class="stat-icon-wrap">${ic('archive')}</div>
          </div>
          <div class="stat-value">${D.bookings.length}</div>
          <span class="stat-sub mute">Kumulatif sepanjang sesi</span>
        </div>

        <div class="stat-item">
          <div class="stat-top">
            <span class="stat-label">Tempahan Aktif (Lulus)</span>
            <div class="stat-icon-wrap ok">${ic('check-circle-2')}</div>
          </div>
          <div class="stat-value" style="color:var(--ok)">${act}</div>
          <span class="stat-sub mute">Status diluluskan automatik</span>
        </div>

        <div class="stat-item">
          <div class="stat-top">
            <span class="stat-label">Baki Kekosongan Hari Ini</span>
            <div class="stat-icon-wrap volt">${ic('users')}</div>
          </div>
          <div class="stat-value">
            ${o.closed ? '0' : o.rem}
            <small>/ ${o.tot} Pax</small>
          </div>
          <span class="stat-sub mute">${sc ? sc.timeDisplay : 'Luar sesi operasi'}</span>
        </div>

        <div class="stat-item">
          <div class="stat-top">
            <span class="stat-label">Status Operasi Tarikh</span>
            <div class="stat-icon-wrap">${ic('calendar-clock')}</div>
          </div>
          <div class="stat-status-wrap">
            ${o.closed ? chip('bad', 'Ditutup / Luar Operasi', 'x-circle') : o.rem > 0 ? chip('ok', 'Fasiliti Dibuka', 'check-circle-2') : chip('warn', 'Kapasiti Penuh', 'alert-circle')}
          </div>
          <span class="stat-sub mute">${fmt(S.date)}</span>
        </div>
      </div>
    </section>

    <!-- Institutional Guidelines & Features -->
    <section class="features-grid">
      <div class="feature-card">
        <div class="feature-icon-box bg-blue">
          ${ic('user-check')}
        </div>
        <h3>Polisi 1 Orang 1 Peranti</h3>
        <p>Setiap pelajar mendaftar secara individu menggunakan No. Matrik & No. Telefon sah. Sistem menghadkan 1 tempahan setiap hari bagi memastikan keadilan agihan slot.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon-box bg-emerald">
          ${ic('zap')}
        </div>
        <h3>Kelulusan Terus Automatik</h3>
        <p>Tiada proses kelulusan manual yang memakan masa. Permohonan disahkan serta-merta dengan Slip Tempahan Rasmi selagi kuota unit belum mencecah had maksimum.</p>
      </div>

      <div class="feature-card">
        <div class="feature-icon-box bg-amber">
          ${ic('clock')}
        </div>
        <h3>Jadual Operasi Rasmi JSP</h3>
        <p>Dewan dibuka khusus pada hari <b>Isnin & Jumaat (5:00 PM - 7:00 PM)</b> serta <b>Rabu (8:00 PM - 10:00 PM)</b> tertakluk kepada pengumuman pentadbiran.</p>
      </div>
    </section>
  </div>`;
}

/* ---------- View: Borang Tempahan (Wizard) ---------- */
function wizard() {
  const D = S.data, fac = D.facilities.find((f) => f.id === S.fac), f = S.form;
  let content = '';

  const stepsHeader = [
    { n: 1, title: 'Fasiliti', desc: 'Pilihan Sukan' },
    { n: 2, title: 'Tarikh & Masa', desc: 'Slot Operasi' },
    { n: 3, title: 'Maklumat Pelajar', desc: 'Data Pemohon' },
    { n: 4, title: 'Pengesahan', desc: 'Slip E-Pas' }
  ];

  if (S.step === 1) {
    content = `
    <div class="step-pane">
      <div class="pane-header">
        <h3>Langkah 1: Pilih Jenis Kemudahan Sukan</h3>
        <p class="mute">Sila pilih sukan dan unit gelanggang / meja yang ingin digunakan.</p>
      </div>

      <div class="g2 facility-grid">
        ${D.facilities.map((x) => `
          <button type="button" class="opt ${S.fac === x.id ? 'on' : ''}" data-a="fac" data-id="${x.id}">
            <div class="im" style="background-image:url('${x.image}')">
              <span class="facility-badge">${x.units.length} Unit Disediakan</span>
            </div>
            <div class="bd">
              <div class="facility-header-row">
                <h4>${x.name}</h4>
                <div class="facility-radio-check">${S.fac === x.id ? ic('check') : ''}</div>
              </div>
              <p class="mute">${x.description}</p>
              <div class="capacity-pill">
                ${ic('users')}
                <span>Maksimum <b>${x.maxCapacity} orang</b> per unit</span>
              </div>
            </div>
          </button>
        `).join('')}
      </div>

      <div class="unit-selection-block">
        <label class="strong flex" style="gap:6px">
          ${ic('grid')}
          <span>Pilih Unit Spesifik (${fac.name})</span>
        </label>
        <div class="g2 unit-buttons-grid">
          ${fac.units.map((u) => `
            <button type="button" class="u ${S.unit === u.id ? 'on' : ''}" data-a="unit" data-id="${u.id}">
              <span class="flex" style="gap:8px">
                <span class="unit-dot"></span>
                <span>${u.name}</span>
              </span>
              ${S.unit === u.id ? `<span class="u-check">${ic('check')} Terpilih</span>` : `<span class="u-action">Pilih</span>`}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="end pane-footer">
        <button class="btn volt" data-a="step" data-n="2">
          <span>Seterusnya: Tarikh & Masa</span>
          ${ic('arrow-right')}
        </button>
      </div>
    </div>`;
  } else if (S.step === 2) {
    const sc = sched(S.date), cl = D.closedDates.includes(S.date);
    const nt = cl ? notice('bad', 'alert-circle', 'Fasiliti Ditutup Pada Tarikh Ini', 'Pihak Jawatankuasa Sukan Pelajar (JSP) telah menutup sesi Dewan Temenggong bagi tarikh ini atas urusan penyelenggaraan atau program kolej.')
      : !sc ? notice('warn', 'calendar-x', 'Luar Jadual Operasi Rasmi JSP', 'Dewan Temenggong hanya dibuka pada hari <b>Isnin & Jumaat (5:00 PM - 7:00 PM)</b> dan <b>Rabu (8:00 PM - 10:00 PM)</b> sahaja.')
      : notice('ok', 'check-circle-2', `Jadual Beroperasi: ${sc.dayName} (${sc.timeDisplay})`, `Slot rasmi bagi tarikh ${fmt(S.date)} sedia untuk permohonan.`);

    content = `
    <div class="step-pane">
      <div class="pane-header">
        <h3>Langkah 2: Pilih Tarikh Tempahan</h3>
        <p class="mute">Pilih tarikh operasi yang bertepatan dengan jadual rasmi Dewan Temenggong.</p>
      </div>

      <div class="card inner-card pad">
        <div class="form-group">
          <label class="strong flex" style="gap:8px">
            ${ic('calendar')}
            <span>Tarikh Permohonan Penggunaan</span>
          </label>
          <input type="date" value="${S.date}" data-d="sel" style="max-width:320px">
          <span class="mute sm" style="display:block;margin-top:6px">Tarikh dipilih: <b>${fmt(S.date)}</b></span>
        </div>

        <div class="schedule-quick-chips">
          <div class="schedule-chip ${sc?.dayName === 'Isnin' ? 'active' : ''}">
            <b>Isnin</b> 5:00 PM - 7:00 PM
          </div>
          <div class="schedule-chip ${sc?.dayName === 'Rabu' ? 'active' : ''}">
            <b>Rabu</b> 8:00 PM - 10:00 PM
          </div>
          <div class="schedule-chip ${sc?.dayName === 'Jumaat' ? 'active' : ''}">
            <b>Jumaat</b> 5:00 PM - 7:00 PM
          </div>
        </div>

        <div style="margin-top:16px">${nt}</div>
      </div>

      <div class="between pane-footer">
        <button class="btn line" data-a="step" data-n="1">
          ${ic('arrow-left')}
          <span>Kembali</span>
        </button>
        <button class="btn volt" data-a="step" data-n="3" ${cl || !sc ? 'disabled' : ''}>
          <span>Seterusnya: Maklumat Pemohon</span>
          ${ic('arrow-right')}
        </button>
      </div>
    </div>`;
  } else if (S.step === 3) {
    const fld = (k, l, ph, icon, up) => `
      <div class="form-group">
        <label class="strong">${l}</label>
        <div class="input-with-icon">
          <span class="input-icon">${ic(icon)}</span>
          <input type="text" placeholder="${ph}" value="${esc(f[k] || '')}" data-f="${k}" ${up ? 'style="text-transform:uppercase"' : ''}>
        </div>
      </div>`;

    content = `
    <div class="step-pane">
      <div class="pane-header">
        <h3>Langkah 3: Butiran Pelajar (Pemohon Individu)</h3>
        <p class="mute">Sila pastikan data yang diisi adalah tepat mengikut rekod universiti.</p>
      </div>

      ${srd()}

      <div class="form-card stack" style="--s: 18px">
        ${fld('fullName', 'Nama Penuh Pelajar (Mengikut Kad Pengenalan) *', 'Contoh: MUHAMMAD HAZIM BIN ROSLI', 'user')}
        ${fld('phoneNo', 'Nombor Telefon / WhatsApp Rasmi *', 'Contoh: 012-3456789', 'phone')}

        <div class="g2">
          ${fld('studentId', 'Nombor Matrik Pelajar *', 'Contoh: 2024694636', 'id-card', 1)}
          ${fld('programCode', 'Kod Program Akademik *', 'Contoh: CS110 / BA111', 'graduation-cap', 1)}
        </div>

        <div class="g2">
          <div class="form-group">
            <label class="strong">Kuantiti Pemohon</label>
            <div class="input-with-icon">
              <span class="input-icon">${ic('users')}</span>
              <input type="number" value="1" disabled>
            </div>
            <span class="mute sm" style="display:block;margin-top:4px">Ketetapan polisi sistem: 1 orang bagi setiap permohonan.</span>
          </div>

          <div class="form-group">
            <label class="strong">Catatan Tambahan (Pilihan)</label>
            <div class="input-with-icon">
              <span class="input-icon">${ic('file-text')}</span>
              <input type="text" placeholder="Contoh: Latihan kejohanan, rekreasi..." value="${esc(S.notes)}" data-s="notes">
            </div>
          </div>
        </div>
      </div>

      <div class="between pane-footer">
        <button class="btn line" data-a="step" data-n="2">
          ${ic('arrow-left')}
          <span>Kembali</span>
        </button>
        <button class="btn ink" data-a="submit">
          ${ic('shield-check')}
          <span>Sahkan & Hantar Permohonan</span>
        </button>
      </div>
    </div>`;
  } else if (S.receipt) {
    const r = S.receipt;
    content = `
    <div class="step-pane" style="text-align:center">
      <div class="receipt-success-badge">
        <div class="okc">${ic('check')}</div>
        <h2 style="margin-top:16px;font-size:28px">Tempahan Berjaya Diluluskan!</h2>
        <p class="mute">Sistem telah mengesahkan slot tempahan anda secara automatik. Sila simpan e-slip ini.</p>
      </div>

      <!-- Digital Boarding Pass / E-Slip -->
      <div class="ticket-slip">
        <div class="ticket-header">
          <div class="ticket-brand">
            <b>DEWAN TEMENGGONG • SLIP RASMI JSP</b>
            <small>Kolej Kediaman • Jawatankuasa Sukan Pelajar</small>
          </div>
          <div class="ticket-status-chip">
            ${chip('ok', 'DILULUSKAN MASANYATA', 'check-circle-2')}
          </div>
        </div>

        <div class="ticket-ref-bar">
          <span class="mute sm">NO. RUJUKAN TEMPAHAN</span>
          <div class="ticket-ref-code">${esc(r.refNo)}</div>
        </div>

        <div class="ticket-grid">
          <div><span class="mute sm">Nama Pelajar</span><b>${esc(r.userName)}</b></div>
          <div><span class="mute sm">No. Matrik</span><b>${esc(r.studentId)}</b></div>
          <div><span class="mute sm">Fasiliti Sukan</span><b>${esc(r.facilityName)}</b></div>
          <div><span class="mute sm">Gelanggang / Meja</span><b>${esc(r.unitName)}</b></div>
          <div><span class="mute sm">Tarikh Penggunaan</span><b>${fmt(r.date)}</b></div>
          <div><span class="mute sm">Sesi Masa</span><b>${esc(r.startTime)} - ${esc(r.endTime)}</b></div>
        </div>

        <div class="ticket-perforation"></div>

        <div class="ticket-footer">
          <div class="barcode-sim">
            <span>||||| |||| |||||| |||| |||||||| |||| |||||| |||||</span>
          </div>
          <span class="mute sm">Tunjukkan slip ini kepada Pengawas Bertugas jika diminta.</span>
        </div>
      </div>

      <div class="ticket-actions">
        <button class="btn line" onclick="window.print()">
          ${ic('printer')}
          <span>Cetak / Simpan Slip (PDF)</span>
        </button>
        <button class="btn volt" data-a="tab" data-t="student-check">
          ${ic('search')}
          <span>Semak Rekod di Pangkalan Data</span>
        </button>
      </div>
    </div>`;
  }

  return `
  <div class="narrow">
    <div class="card wizard-card">
      <div class="pad stack" style="--s: 24px">
        <!-- Stepper Navigation -->
        <div class="stepper-bar">
          ${stepsHeader.map((st) => `
            <div class="step-node ${S.step === st.n ? 'active' : S.step > st.n ? 'completed' : ''}">
              <div class="step-circle">
                ${S.step > st.n ? ic('check') : st.n}
              </div>
              <div class="step-text-wrap hide-m">
                <span class="step-title">${st.title}</span>
                <small class="step-desc">${st.desc}</small>
              </div>
            </div>
          `).join('')}
        </div>

        ${content}
      </div>
    </div>
  </div>`;
}

/* ---------- View: Folder Mengikut Fasiliti & Tarikh ---------- */
function browser(kind) {
  const D = S.data, adm = D.isAdmin, vd = S.view[kind];
  const base = kind === 'status' && S.search.trim() ? (S.results || []) : D.bookings;
  const dates = [...new Set(base.map((b) => b.date))].sort().reverse();
  const shown = vd ? base.filter((b) => b.date === vd) : base, sc = sched(vd);

  return `
  <div class="stack" style="--s: 20px">
    <div class="filter-panel stack" style="--s: 14px">
      <div class="end-b">
        <div>
          <label class="strong flex" style="gap:6px">${ic('calendar')} Pilih Tarikh Operasi</label>
          <input type="date" class="auto" value="${vd}" data-d="view" data-k="${kind}">
        </div>
        <button class="btn line" data-a="view" data-k="${kind}" data-v="">
          ${ic('list-filter')}
          <span>Papar Semua Tarikh</span>
        </button>
      </div>

      ${dates.length ? `
        <div class="wrapf" style="padding-top:6px">
          <span class="mute sm" style="font-weight:600">Tarikh Terdahulu:</span>
          ${dates.slice(0, 8).map((d) => `
            <button class="pill ${vd === d ? 'on' : ''}" data-a="view" data-k="${kind}" data-v="${d}">
              <span>${d}</span>
              <span class="pill-count">${base.filter((b) => b.date === d).length}</span>
            </button>
          `).join('')}
        </div>
      ` : ''}

      <div class="filter-status-row wrapf">
        <span class="strong">${vd ? fmt(vd) : 'Semua Rekod Tempahan'}</span>
        ${vd ? (D.closedDates.includes(vd) ? chip('bad', 'Fasiliti Ditutup (Admin JSP)', 'lock') : sc ? chip('ok', `${sc.dayName} (${sc.timeDisplay})`, 'check-circle') : chip('mute', 'Luar Sesi Operasi', 'clock')) : ''}
      </div>
    </div>

    <!-- Facility Cards Accordion -->
    <div class="stack" style="--s: 16px">
      ${D.facilities.map((f) => `
        <div class="facility-browser-group">
          <div class="group-title flex" style="gap:8px">
            <span class="group-icon-dot"></span>
            <h4>${f.name}</h4>
          </div>

          <div class="stack" style="--s: 10px; margin-top: 10px">
            ${f.units.map((u) => {
              const ub = shown.filter((b) => b.unitId === u.id);
              const full = vd && ub.length >= f.maxCapacity;
              return `
              <details class="folder" ${ub.length ? 'open' : ''}>
                <summary>
                  <span class="summary-left flex" style="gap:10px">
                    ${ic('chevron-right', 'ar')}
                    ${ic(f.type === 'badminton' ? 'activity' : 'circle-dot')}
                    <span class="folder-name">${u.name}</span>
                  </span>
                  <span class="badge ${full ? 'bad' : 'ok'}">
                    ${vd ? `${ub.length} / ${f.maxCapacity} Orang ${full ? '(Penuh)' : '(Tersedia)'}` : `${ub.length} Rekod`}
                  </span>
                </summary>

                <div class="folder-content">
                  ${ub.length ? ub.map((b) => `
                    <div class="booking-row">
                      <div class="booking-main">
                        <div class="flex" style="gap:8px; flex-wrap:wrap">
                          <span class="booking-ref-badge">${esc(b.refNo)}</span>
                          ${chip('ok', 'Diluluskan Automatik', 'check')}
                        </div>
                        <p class="student-name strong">${esc(b.userName)}</p>
                        <span class="mute sm">${esc(b.studentId)}${adm ? ' • Kod Program: ' + esc(b.programCode) : ''}</span>
                        ${adm ? `<p class="mute sm" style="margin-top:4px">${ic('phone')} ${esc(b.phoneNo)}</p>` : ''}
                      </div>

                      <div class="booking-meta right">
                        ${vd ? '' : `<b class="ink-t">${fmt(b.date)}</b><br>`}
                        <span class="time-slot-badge">${esc(b.startTime)} - ${esc(b.endTime)}</span>
                        <div class="mute sm" style="margin-top:4px">Didaftar: ${esc(b.createdAt)}</div>
                      </div>
                    </div>
                  `).join('') : '<div class="empty-booking-row mute">Tiada tempahan aktif pada tarikh ini.</div>'}
                </div>
              </details>`;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

/* ---------- View: Semak Status Tempahan ---------- */
const status = () => `
  <div class="narrow">
    <div class="card pad stack" style="--s:22px">
      <div class="view-header">
        <div class="icon-avatar">${ic('search')}</div>
        <div>
          <h2>Semak Status & Rekod Tempahan</h2>
          <p class="mute">Carian pantas menggunakan No. Matrik Pelajar atau No. Rujukan Tempahan.</p>
        </div>
      </div>

      <div class="search-box-wrapper">
        <span class="search-input-icon">${ic('search')}</span>
        <input type="search" placeholder="Masukkan No. Matrik (cth: 2024694636) atau No. Rujukan (DT-...)..." value="${esc(S.search)}" data-s="search">
      </div>

      ${srd()}

      <div id="res-status">${browser('status')}</div>
    </div>
  </div>`;

/* ---------- View: Kalendar Kekosongan ---------- */
function calendar() {
  const D = S.data, sc = sched(S.date);
  return `
  <div class="narrow">
    <div class="card pad stack" style="--s: 24px">
      <div class="between" style="border:0;padding:0;align-items:center;flex-wrap:wrap">
        <div class="view-header">
          <div class="icon-avatar">${ic('calendar-days')}</div>
          <div>
            <h2>Kalendar Kekosongan Sesi</h2>
            <p class="mute">Semak status operasi mingguan dan kuota slot gelanggang.</p>
          </div>
        </div>
        <input type="date" class="auto" value="${S.date}" data-d="sel">
      </div>

      <div class="calendar-banner-card between" style="border:0;align-items:center;flex-wrap:wrap">
        <div>
          <h3>${fmt(S.date)}</h3>
          <p class="mute">Sesi Operasi: ${sc ? `<b>${sc.timeDisplay}</b>` : 'Luar Jadual Rasmi'}</p>
        </div>
        <div>
          ${D.closedDates.includes(S.date) ? chip('bad', 'Ditutup oleh Pentadbiran JSP', 'lock') : sc ? chip('ok', 'Dibuka Untuk Permohonan', 'check-circle-2') : chip('mute', 'Tiada Sesi Hari Ini', 'clock')}
        </div>
      </div>

      <div class="g2 facility-status-grid">
        ${D.facilities.map((f) => `
          <div class="card inner-facility-card pad stack" style="--s:16px;padding:22px">
            <div class="between" style="border:0;padding:0">
              <h4>${f.name}</h4>
              <span class="ok-t">Maks ${f.maxCapacity} Orang / Unit</span>
            </div>

            <div class="stack" style="--s:10px">
              ${f.units.map((u) => {
                const n = D.bookings.filter((b) => b.unitId === u.id && b.date === S.date && b.status === 'Diluluskan').length;
                const full = n >= f.maxCapacity;
                const pct = Math.min(100, Math.round((n / f.maxCapacity) * 100));
                return `
                <div class="unit-occupancy-row">
                  <div class="between" style="border:0;padding:0;margin-bottom:6px">
                    <span class="strong">${u.name}</span>
                    <b style="color:var(${full ? '--bad' : '--ok'});font-size:13px">
                      ${n} / ${f.maxCapacity} ${full ? '(Penuh)' : '(Tersedia)'}
                    </b>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill ${full ? 'full' : ''}" style="width:${pct}%"></div>
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

/* ---------- View: Dashboard Admin Pegawai JSP ---------- */
function admin() {
  const D = S.data, cl = D.closedDates.includes(S.date);
  return `
  <div class="card pad stack" style="--s: 24px">
    <div class="between" style="border:0;padding:0;align-items:center;flex-wrap:wrap">
      <div class="view-header">
        <div class="icon-avatar">${ic('shield-check')}</div>
        <div>
          <h2>Portal Pentadbiran & Kawalan Pegawai JSP</h2>
          <p class="mute">Pengurusan operasi tarikh, visual dewan, eksport rekod data, dan integrasi Google Sheets.</p>
        </div>
      </div>
      <div class="wrapf">
        <button class="btn ink" data-a="modal" data-m="sheets">
          ${ic('file-spreadsheet')}
          <span>Pautan Google Sheets</span>
        </button>
        <button class="btn line" data-a="csv">
          ${ic('download')}
          <span>Eksport CSV</span>
        </button>
      </div>
    </div>

    <!-- Date Operational Switch -->
    <div class="panel stack" style="--s:14px">
      <h4>${ic('power')} Kawalan Operasi Tarikh Dewan</h4>
      <p class="mute sm">Tutup tarikh tertentu jika terdapat kejohanan kolej, peperiksaan, atau kerja baik pulih dewan.</p>
      <div class="wrapf">
        <input type="date" class="auto" value="${S.date}" data-d="sel">
        <button class="btn ${cl ? 'green' : 'red'}" data-a="toggle">
          ${ic('power')}
          <span>${cl ? 'Buka Semula Operasi Tarikh Ini' : 'Tutup Operasi Tarikh Ini'}</span>
        </button>
      </div>
    </div>

    <!-- Visual Customizer -->
    <div class="panel stack" style="--s:14px">
      <h4>${ic('image')} Tetapan Gambar Latar & Logo Rasmi</h4>
      <div class="g2">
        <div class="form-group">
          <label>URL Gambar Latar Belakang (Hero)</label>
          <input type="text" value="${esc(S.bgIn)}" data-s="bgIn" placeholder="https://...">
        </div>
        <div class="form-group">
          <label>URL Logo JSP (Header)</label>
          <input type="text" value="${esc(S.logoIn)}" data-s="logoIn" placeholder="https://...">
        </div>
      </div>
      <div class="end">
        <button class="btn volt" data-a="saveVisual">
          ${ic('save')}
          <span>Simpan Perubahan Visual</span>
        </button>
      </div>
    </div>

    <div>
      <div class="between" style="border:0;padding:0;margin-bottom:12px">
        <h3>Semua Rekod Tempahan Pelajar (${D.bookings.length})</h3>
      </div>
      <div style="margin-top:14px">${browser('admin')}</div>
    </div>
  </div>`;
}

/* ---------- Modals ---------- */
function modals() {
  if (S.modal === 'login') return `
    <div class="modal">
      <div class="box">
        <button class="x" data-a="close" aria-label="Tutup">${ic('x')}</button>
        <div class="mi">${ic('lock')}</div>
        <h3>Akses Pegawai Pentadbir JSP</h3>
        <p class="mute">Sila masukkan kata laluan keselamatan admin untuk mengakses dashboard.</p>
        <form id="loginForm" class="stack" style="--s:16px">
          <div class="input-with-icon">
            <span class="input-icon">${ic('key-round')}</span>
            <input type="password" name="pw" placeholder="Kata laluan keselamatan admin..." autofocus>
          </div>
          <button class="btn volt full" type="submit">
            ${ic('log-in')}
            <span>Log Masuk Pegawai</span>
          </button>
        </form>
      </div>
    </div>`;

  if (S.modal === 'sheets') return `
    <div class="modal">
      <div class="box">
        <button class="x" data-a="close" aria-label="Tutup">${ic('x')}</button>
        <div class="mi" style="background:var(--ok)">${ic('file-spreadsheet')}</div>
        <h3>Integrasi Google Sheets</h3>
        <p class="mute">Masukkan Web App URL Google Apps Script untuk sinkronisasi automatik setiap tempahan baru.</p>
        <div class="form-group">
          <label>Web App URL (Apps Script)</label>
          <input type="text" value="${esc(S.sheetsIn)}" data-s="sheetsIn" placeholder="https://script.google.com/macros/s/.../exec">
        </div>
        <ol class="panel sm" style="padding-left:24px;margin:0">
          <li>Cipta Google Sheet baharu di Google Drive.</li>
          <li>Buka <b>Extensions ➔ Apps Script</b> dan tampal fungsi <code>doPost</code>.</li>
          <li>Klik <b>Deploy ➔ New Deployment ➔ Web App (Anyone)</b>.</li>
          <li>Salin pautan yang terhasil dan simpan di sini.</li>
        </ol>
        <button class="btn ink full" data-a="saveSheets">
          ${ic('save')}
          <span>Simpan Pautan Google Sheets</span>
        </button>
      </div>
    </div>`;

  return '';
}

/* ---------- Render Engine ---------- */
function render() {
  if (!S.data) {
    $('#app').innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p class="strong" style="margin-top:16px">Menghubungkan ke Sistem Dewan Temenggong…</p>
        <small class="mute">Memuatkan data pangkalan data Turso</small>
      </div>`;
    return;
  }
  const D = S.data;
  if (S.bgIn === undefined) { S.bgIn = D.settings.bg; S.logoIn = D.settings.logo; }
  if (S.sheetsIn === undefined && D.isAdmin) S.sheetsIn = D.settings.sheetsUrl || '';
  if (S.tab === 'admin' && !D.isAdmin) S.tab = 'home';

  const views = { home, 'booking-wizard': wizard, 'student-check': status, 'availability-calendar': calendar, admin };

  $('#app').innerHTML = header() + `
    <main class="wrap">
      ${(views[S.tab] || home)()}
    </main>` + bnav() + modals() + `
    <footer>
      <div class="wrap footer-content">
        <div class="footer-left">
          <b>DEWAN TEMENGGONG</b> • Jawatankuasa Sukan Pelajar (JSP)
          <div class="mute sm" style="margin-top:4px">Portal Tempahan Rasmi Fasiliti Sukan Kolej Kediaman. Hak Cipta Terpelihara © 2026.</div>
        </div>
        <div class="footer-right mute sm">
          <span>Dikuasakan oleh Turso Cloud & Vercel Serverless</span>
        </div>
      </div>
    </footer>`;

  if (window.lucide) lucide.createIcons();
}

/* ---------- User Actions Handlers ---------- */
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
  logout: () => { S.token = ''; localStorage.removeItem('dt_token'); S.tab = 'home'; toast('Admin telah berjaya log keluar.', 'info'); load(); },
  async submit() {
    const f = S.form;
    try {
      const r = await api('book', { fullName: f.fullName, phoneNo: f.phoneNo, studentId: f.studentId, programCode: f.programCode, notes: S.notes, facilityId: S.fac, unitId: S.unit, date: S.date });
      localStorage.setItem('dt_form', JSON.stringify(f));
      S.receipt = r.booking;
      S.step = 4;
      S.notes = '';
      toast('Tempahan anda BERJAYA disahkan dan diluluskan!', 'success');
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async toggle() {
    try {
      const r = await api('admin', { action: 'toggle_date', date: S.date });
      toast(`Operasi fasiliti pada tarikh ${fmt(S.date)} kini ${r.closed ? 'DITUTUP.' : 'DIBUKA SEMULA.'}`, r.closed ? 'info' : 'success');
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async saveVisual() {
    try {
      await api('admin', { action: 'save_settings', bg: S.bgIn, logo: S.logoIn });
      toast('Tetapan visual berjaya dikemaskini!', 'success');
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async saveSheets() {
    try {
      await api('admin', { action: 'save_settings', sheetsUrl: S.sheetsIn });
      S.modal = null;
      toast('Pautan Google Sheets berjaya disimpan!', 'success');
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
    a.download = `Rekod_Tempahan_Dewan_Temenggong_${today()}.csv`;
    a.click();
    toast('Laporan CSV telah berjaya dimuat turun!', 'success');
  }
};

/* ---------- Event Listeners ---------- */
document.addEventListener('click', (e) => {
  const m = e.target.closest('.modal');
  if (m && e.target === m) { S.modal = null; return render(); }
  const el = e.target.closest('[data-a]');
  if (el && A[el.dataset.a]) A[el.dataset.a](el.dataset);
});

document.addEventListener('change', (e) => {
  const d = e.target.dataset.d;
  if (!d) return;
  if (d === 'sel') S.date = e.target.value;
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
  S.view.status = q ? '' : today();
  const r = $('#res-status');
  if (r) {
    r.innerHTML = browser('status');
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
    toast('Log masuk Pegawai Pentadbir JSP Berjaya!', 'success');
    await load();
  } catch (err) { toast(err.message, 'error'); }
});

load();
