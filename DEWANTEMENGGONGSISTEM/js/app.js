/* Dewan Temenggong - JSP
   Minimalist System (Apple / Google Design Inspired) */

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n, c = '') => `<i data-lucide="${n}" class="ic ${c}"></i>`;
const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

/* ---------- Internationalization (BM / ENG) ---------- */
const I18N = {
  bm: {
    months: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
    days: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
    daysShort: ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'],
    tabs: { home: 'Utama', wizard: 'Tempah', status: 'Semak Status', calendar: 'Kalendar Live' },
    header: { brandSub: 'Jawatankuasa Sukan Pelajar (JSP)', admin: 'Akses Admin JSP', logout: 'Log Keluar' },
    clock: { title: 'WAKTU SEMASA • MYT (GMT+8)', closed: 'Operasi Ditutup Hari Ini', open: 'Sesi Dibuka', rest: 'Tiada Sesi Operasi Hari Ini (Hari Rehat)', scheduleNote: 'Jadual operasi rasmi: Isnin & Jumaat (5-7 PM), Rabu (8-10 PM).', bookBtn: 'Tempah slot hari ini' },
    stats: { title: 'Kapasiti & Statistik Sesi', sub: 'Status penggunaan fasiliti sukan mengikut tarikh pilihan.', total: 'Jumlah Tempahan', totalSub: 'Sepanjang sesi', active: 'Tempahan Aktif', activeSub: 'Telah diluluskan', vacancy: 'Kekosongan Hari Ini', status: 'Status Dewan', closedBadge: 'Ditutup', availBadge: 'Tersedia', fullBadge: 'Penuh', outsideOp: 'Luar operasi' },
    hero: { tag: 'DEWAN TEMENGGONG', title: 'Pusat Sukan & Fasiliti Kolej Kediaman.', desc: 'Sistem tempahan berpusat gelanggang badminton dan meja ping pong. Kelulusan automatik masa-nyata untuk kemudahan pelajar kolej.', bookNow: 'Tempah slot sekarang', viewCal: 'Lihat kalendar kekosongan', checkStatus: 'Semak status tempahan' },
    guidelines: { 
      g1Title: '1 Pelajar 1 Tempahan Seminggu', 
      g1Desc: 'Pendaftaran individu memerlukan No. Matrik yang sah. Had 1 tempahan seminggu bagi memastikan peluang yang adil untuk semua warga kolej.', 
      g2Title: 'Kelulusan Serta-merta', 
      g2Desc: 'Sistem mengesahkan tempahan secara automatik selagi kuota slot belum penuh. Anda akan menerima slip rujukan untuk disimpan dan ditunjukkan jika perlu.', 
      g3Title: 'Etika Sahsiah (SRD)',
      srd: 'Sila patuhi garis panduan Sahsiah Rupa Diri (SRD). Berpakaian sukan yang lengkap dan sopan ketika menggunakan kemudahan dewan.'
    },
    wizard: {
      steps: [
        { n: 1, label: 'Pilih Fasiliti' },
        { n: 2, label: 'Tarikh & Waktu' },
        { n: 3, label: 'Maklumat Diri' },
        { n: 4, label: 'Pengesahan' }
      ],
      step1Title: 'Pilih jenis sukan dan unit', step1Desc: 'Pilih kemudahan yang ingin anda gunakan hari ini.',
      step2Title: 'Pilih tarikh operasi', step2Desc: 'Dewan beroperasi pada Isnin & Jumaat (5-7 PM) dan Rabu (8-10 PM). Pilih tarikh terus dari kalendar live di bawah.',
      step3Title: 'Maklumat pemohon', step3Desc: 'Pastikan maklumat sepadan dengan rekod universiti anda.',
      step4Title: 'Tempahan Disahkan', step4Desc: 'Permohonan anda telah diluluskan secara automatik.',
      cap: 'Kapasiti maksimum:', perUnit: 'orang per unit.', unitLabel: 'Pilih unit spesifik:', 
      nextDate: 'Seterusnya: Tarikh & Masa', nextStudent: 'Seterusnya: Maklumat Pelajar', submit: 'Hantar dan Luluskan', back: 'Kembali',
      datePast: 'Tarikh ini telah lepas. Sila pilih tarikh hari ini atau tarikh akan datang.', dateClosed: 'Dewan ditutup oleh pentadbiran JSP pada tarikh ini. Sila pilih tarikh lain pada kalendar.', dateOpen: 'Slot dibuka untuk permohonan.', dateNonOp: 'Tarikh ini luar hari operasi rasmi. Sila pilih hari bertanda hijau (Isnin, Rabu, atau Jumaat) di atas.',
      selDateLabel: 'TARIKH DIPILIH UNTUK TEMPAHAN:', opTime: 'Waktu Operasi', outSession: 'Luar sesi operasi rasmi',
      fullName: 'Nama Penuh Pelajar *', phoneNo: 'No. Telefon / WhatsApp *', studentId: 'No. Matrik Pelajar *', progCode: 'Kod Program *', notes: 'Catatan Tambahan (Pilihan)',
      fullNamePh: 'Contoh: MUHAMMAD HAZIM', phoneNoPh: 'Contoh: 012-3456789', studentIdPh: '202••••••• (10 angka)', progCodePh: 'Contoh: AC220', notesPh: 'Contoh: Latihan kejohanan',
      studentIdHint: 'Wajib 10 angka bermula dengan 202 (cth: 2024694636).',
      phoneNoHint: 'Format nombor telefon Malaysia (cth: 012-3456789 atau 011-12345678).',
      onePerWeekNotice: '📌 <b>Syarat Kuota:</b> Setiap pelajar dihadkan kepada <b>1 tempahan setiap minggu</b> (Isnin–Ahad) bagi memberi peluang yang adil kepada rakan kolej lain.',
      agreementTitle: 'Aku Janji Ketulenan Maklumat & Pengesahan Kad Matrik *',
      agreementDesc: 'Saya memperakui bahawa semua maklumat yang diisi adalah benar, tepat dan milik saya sendiri. Sekiranya maklumat ini didapati tidak benar atau palsu, tempahan saya akan dibatalkan serta-merta dan saya bersedia dikenakan tindakan tatatertib oleh Pengurusan Kolej & JSP. Saya maklum bahawa <b>Kad Pelajar (Matrik) fizikal wajib ditunjukkan</b> kepada petugas JSP di dewan semasa sesi bermula.',
      physicalNotice: 'Peringatan Petugas JSP: Kad Pelajar (Matrik) Fizikal wajib ditunjukkan semasa melapor diri di dewan. Petugas berhak membatalkan slot jika maklumat tidak sah.',
      weekNotOpen: 'Minggu Belum Dibuka',
      weekNotOpenNotice: 'Tempahan bagi minggu ini belum dibuka oleh pentadbiran JSP. Admin akan mengaktifkan tempahan menjelang minggu berkenaan.',
      printSlip: 'Cetak / Simpan Slip', checkRecord: 'Semak Rekod Tempahan',
      refNo: 'NO. RUJUKAN', applicantName: 'Nama Pelajar', studentMatric: 'No. Matrik', facilityUnit: 'Fasiliti & Unit', dateTime: 'Tarikh & Masa', statusApproved: 'Diluluskan'
    },
    calendar: { 
      title: 'Kalendar Live', sub: 'Penunjuk Aras Sesi Operasi & Kekosongan', 
      lastMonth: 'Bulan Lepas', thisMonth: 'Bulan Ini', nextMonth: 'Bulan Depan', 
      legendOpen: 'Dibuka (Isnin, Rabu, Jumaat)', legendClosed: 'Ditutup / Penuh', legendRest: 'Hari Rehat (Luar Sesi)', legendLocked: 'Belum Dibuka (Minggu Seterusnya)',
      todayBadge: 'Hari Ini', passedBadge: 'Lepas', restBadge: 'Rehat', badgeLocked: 'Belum Buka',
      selDate: 'TARIKH DIPILIH', hallClosed: 'Dewan Ditutup', openForBooking: 'Dibuka Untuk Permohonan', noSessionToday: 'Tiada Sesi Hari Ini',
      maxPerUnit: 'Maks', personsPerUnit: 'orang / unit'
    },
    statusView: { 
      title: 'Semak Status Tempahan', sub: 'Cari rekod menggunakan No. Matrik Pelajar (cth: 2024694636) atau No. Rujukan Tempahan.', 
      placeholder: 'Masukkan No. Matrik atau No. Rujukan...', 
      noRecord: 'Tiada rekod tempahan dijumpai untuk carian:', 
      checkMatricTip: 'Sila pastikan No. Matrik atau No. Rujukan dimasukkan dengan tepat.',
      foundCount: 'rekod tempahan dijumpai:',
      sessionDate: 'Tarikh Sesi', opHours: 'Waktu Operasi', registeredAt: 'Didaftar pada:', deleteBtn: 'Padam', printBtn: 'Cetak Slip'
    },
    browserView: {
      selectDate: 'Pilih Tarikh:', allDates: 'Semua Tarikh', bookingsCount: 'tempahan', fullBadge: '(Penuh)', availBadge: '(Tersedia)',
      noBooking: 'Tiada tempahan berdaftar.', createdOn: 'Dibuat:', deleteBooking: 'Padam Tempahan'
    },
    adminView: {
      title: 'Panel Pentadbir JSP', sub: 'Kawalan operasi dewan, penutupan tarikh, pengurusan rekod tempahan, dan eksport.',
      exportCsv: 'Eksport CSV', gSheets: 'Google Sheets',
      controlTitle: 'Kawalan Buka / Tutup Tarikh Dewan', controlSub: 'Pilih tarikh di bawah dan gunakan suis (switch) untuk membuka atau menutup operasi.',
      opClosed: '🔴 Operasi Ditutup', opOpen: '🟢 Operasi Dibuka',
      closedNotice: 'Pelajar TIDAK boleh menempah slot pada tarikh ini.',
      openNotice: 'Terbuka untuk tempahan.',
      offScheduleNotice: 'Tarikh ini luar jadual rasmi tetapi status operasi terbuka.',
      academicTitle: 'Kawalan Tempahan Minggu (Kalendar Akademik UiTM)',
      academicSub: 'Tentukan minggu yang dibuka untuk tempahan. Minggu seterusnya automatik ditutup (OFF) sehinggalah admin membuka (ON) minggu tersebut.',
      semStartLabel: 'Tarikh Mula Semester (Minggu 1):',
      saveSemStart: 'Simpan Tarikh Mula',
      curWeekBadge: 'Minggu Semasa:',
      openWeeksLabel: 'Status Pembukaan Setiap Minggu (Klik butang minggu untuk Buka / Tutup):',
      btnOpenThisWeekOnly: 'Buka Minggu Ini Sahaja (Off Minggu Lain)',
      btnAdvanceNextWeek: 'Buka Minggu Seterusnya (+1)',
      btnToggleAll: 'Buka Semua Minggu',
      visualTitle: 'Pautan Visual (Latar Belakang & Logo)', bgPh: 'URL Latar Belakang...', logoPh: 'URL Logo JSP...', saveVisual: 'Simpan Visual',
      allRecords: 'Semua Rekod Tempahan', recordsSub: 'Pilih tarikh dari kalendar bulanan untuk semak dan padam (remove) sebarang tempahan pengguna.'
    },
    footer: '© 2026 Dewan Temenggong • Jawatankuasa Sukan Pelajar UiTM Alor Gajah, Melaka'
  },
  eng: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tabs: { home: 'Home', wizard: 'Book', status: 'Check Status', calendar: 'Live Calendar' },
    header: { brandSub: 'Student Sports Committee (JSP)', admin: 'JSP Admin Access', logout: 'Logout' },
    clock: { title: 'CURRENT TIME • MYT (GMT+8)', closed: 'Operation Closed Today', open: 'Session Open', rest: 'No Operation Today (Rest Day)', scheduleNote: 'Official schedule: Monday & Friday (5-7 PM), Wednesday (8-10 PM).', bookBtn: 'Book today\'s slot' },
    stats: { title: 'Session Capacity & Statistics', sub: 'Facility utilization status for selected date.', total: 'Total Bookings', totalSub: 'All-time sessions', active: 'Active Bookings', activeSub: 'Approved bookings', vacancy: 'Today\'s Vacancies', status: 'Hall Status', closedBadge: 'Closed', availBadge: 'Available', fullBadge: 'Full', outsideOp: 'Off-session' },
    hero: { tag: 'DEWAN TEMENGGONG', title: 'College Sports & Facility Center.', desc: 'Centralized booking system for badminton courts and table tennis. Instant automated approval for residential college students.', bookNow: 'Book a slot now', viewCal: 'View availability calendar', checkStatus: 'Check booking status' },
    guidelines: { 
      g1Title: '1 Student 1 Booking per Week', 
      g1Desc: 'Individual registration requires a valid Student ID. Limit of 1 booking per week to ensure fair opportunities for all college residents.', 
      g2Title: 'Instant Approval', 
      g2Desc: 'The system validates bookings automatically as long as slot quotas are available. You will receive a reference slip to save and present if needed.', 
      g3Title: 'Dress & Conduct (SRD)',
      srd: 'Please comply with student dress code and conduct (SRD) guidelines. Wear proper and polite athletic attire when using sports facilities.'
    },
    wizard: {
      steps: [
        { n: 1, label: 'Select Sport' },
        { n: 2, label: 'Date & Time' },
        { n: 3, label: 'Student Info' },
        { n: 4, label: 'Confirmation' }
      ],
      step1Title: 'Select sport & facility', step1Desc: 'Choose the sports facility you wish to use today.',
      step2Title: 'Select operating date', step2Desc: 'The sports hall operates on Monday & Friday (5-7 PM) and Wednesday (8-10 PM). Pick your date from the live calendar below.',
      step3Title: 'Applicant details', step3Desc: 'Ensure information matches your official student records.',
      step4Title: 'Booking Confirmed', step4Desc: 'Your booking has been approved automatically.',
      cap: 'Maximum capacity:', perUnit: 'persons per unit.', unitLabel: 'Select specific unit:', 
      nextDate: 'Next: Date & Time', nextStudent: 'Next: Student Details', submit: 'Submit and Approve', back: 'Back',
      datePast: 'This date has already passed. Please select today or an upcoming date.', dateClosed: 'The hall is closed by JSP admin on this date. Please pick another date.', dateOpen: 'Slots are open for application.', dateNonOp: 'This date is outside official operating days. Please select green dates (Monday, Wednesday, or Friday) above.',
      selDateLabel: 'SELECTED DATE FOR BOOKING:', opTime: 'Operating Time', outSession: 'Outside official session',
      fullName: 'Student Full Name *', phoneNo: 'Phone / WhatsApp No. *', studentId: 'Student ID No. *', progCode: 'Program Code *', notes: 'Additional Notes (Optional)',
      fullNamePh: 'Example: MUHAMMAD HAZIM', phoneNoPh: 'Example: 012-3456789', studentIdPh: '202••••••• (10 digits)', progCodePh: 'Example: AC220', notesPh: 'Example: Tournament practice',
      studentIdHint: 'Must be 10 digits starting with 202 (e.g. 2024694636).',
      phoneNoHint: 'Malaysian phone number format (e.g. 012-3456789 or 011-12345678).',
      onePerWeekNotice: '📌 <b>Quota Policy:</b> Each student is limited to <b>1 booking per week</b> (Mon–Sun) to ensure fair turns for all fellow students.',
      agreementTitle: 'Declaration of Information Accuracy & Student ID Verification *',
      agreementDesc: 'I certify that all details entered are accurate, true, and belong to me. If found false, my booking will be cancelled immediately and I will face disciplinary action by College Management & JSP. I understand that my <b>physical Student ID (Matric) Card must be presented</b> to JSP officials at the hall upon session entry.',
      physicalNotice: 'JSP Staff Notice: Physical Student ID card must be presented upon reporting at the sports hall. Officials reserve the right to revoke slots if details do not match.',
      weekNotOpen: 'Week Not Open Yet',
      weekNotOpenNotice: 'Booking for this week is not open yet. JSP admin will activate booking ahead of that week.',
      printSlip: 'Print / Save Slip', checkRecord: 'Check Bookings',
      refNo: 'REF. NUMBER', applicantName: 'Student Name', studentMatric: 'Student ID', facilityUnit: 'Facility & Unit', dateTime: 'Date & Time', statusApproved: 'Approved'
    },
    calendar: { 
      title: 'Live Calendar', sub: 'Hall Operating Sessions & Quota Indicator', 
      lastMonth: 'Prev Month', thisMonth: 'Current Month', nextMonth: 'Next Month', 
      legendOpen: 'Open (Mon, Wed, Fri)', legendClosed: 'Closed / Full', legendRest: 'Rest Day (Off-session)', legendLocked: 'Not Open Yet (Future Weeks)',
      todayBadge: 'Today', passedBadge: 'Passed', restBadge: 'Rest', badgeLocked: 'Not Open',
      selDate: 'SELECTED DATE', hallClosed: 'Hall Closed', openForBooking: 'Open For Booking', noSessionToday: 'No Session Today',
      maxPerUnit: 'Max', personsPerUnit: 'persons / unit'
    },
    statusView: { 
      title: 'Check Booking Status', sub: 'Search using Student ID (e.g. 2024694636) or Booking Reference Number.', 
      placeholder: 'Enter Student ID or Reference Number...', 
      noRecord: 'No booking records found for query:', 
      checkMatricTip: 'Please verify that your Student ID or Reference Number is typed accurately.',
      foundCount: 'booking records found:',
      sessionDate: 'Session Date', opHours: 'Operating Time', registeredAt: 'Registered on:', deleteBtn: 'Delete', printBtn: 'Print Slip'
    },
    browserView: {
      selectDate: 'Select Date:', allDates: 'All Dates', bookingsCount: 'bookings', fullBadge: '(Full)', availBadge: '(Available)',
      noBooking: 'No registered bookings.', createdOn: 'Created:', deleteBooking: 'Delete Booking'
    },
    adminView: {
      title: 'JSP Admin Control Panel', sub: 'Hall operation controls, closure dates, booking records management, and export.',
      exportCsv: 'Export CSV', gSheets: 'Google Sheets',
      controlTitle: 'Hall Date Operation Switch', controlSub: 'Select a date below and toggle the switch to open or close operations.',
      opClosed: '🔴 Operation Closed', opOpen: '🟢 Operation Open',
      closedNotice: 'Students CANNOT book slots on this date.',
      openNotice: 'Open for student bookings.',
      offScheduleNotice: 'This date is outside official schedule but marked as open.',
      academicTitle: 'UiTM Academic Weeks Booking Control',
      academicSub: 'Control which weeks are open for bookings. Future weeks will remain closed until activated by admin.',
      semStartLabel: 'Semester Start Date (Week 1):',
      saveSemStart: 'Save Semester Date',
      curWeekBadge: 'Current Week:',
      openWeeksLabel: 'Weekly Booking Status (Click week button to toggle Open / Close):',
      btnOpenThisWeekOnly: 'Open Current Week Only (Off Other Weeks)',
      btnAdvanceNextWeek: 'Open Next Week (+1)',
      btnToggleAll: 'Open All Weeks',
      visualTitle: 'Visual Links (Background & Logo)', bgPh: 'Background Image URL...', logoPh: 'JSP Logo URL...', saveVisual: 'Save Visual',
      allRecords: 'All Booking Records', recordsSub: 'Pick a date from the monthly calendar to inspect and remove any user booking.'
    },
    footer: '© 2026 Dewan Temenggong • Student Sports Committee UiTM Alor Gajah, Melaka'
  }
};

/* ---------- Helper Format Phone Malaysia ---------- */
const formatMyPhone = (val) => {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, '');
  if (digits.startsWith('60')) {
    digits = '0' + digits.slice(2);
  }
  const maxLen = (digits.startsWith('011') || digits.startsWith('014')) ? 11 : 10;
  digits = digits.slice(0, maxLen);
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
};

/* ---------- Helper Format No. Matrik UiTM (202XXXXXXX - 10 angka) ---------- */
const formatStudentMatric = (val) => {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('202')) return digits.slice(0, 10);
  if (digits === '2' || digits === '20') return digits;
  if (digits.startsWith('20')) digits = '202' + digits.slice(2);
  else if (digits.startsWith('2')) digits = '202' + digits.slice(1);
  else digits = '202' + digits;
  return digits.slice(0, 10);
};

const renderStudentIdHint = (val) => {
  const sid = String(val || '').replace(/\D/g, '');
  const isEng = (typeof S !== 'undefined' && S.lang === 'eng');
  if (!sid) {
    return isEng 
      ? 'Format: 10 digits starting with 202 (e.g. 2024694636)' 
      : 'Format: Wajib 10 angka bermula dengan 202 (cth: 2024694636)';
  }
  if (!sid.startsWith('202')) {
    return `<span style="color:#ef4444;font-weight:600">⚠ ${isEng ? 'Must start with 202' : 'Wajib bermula dengan 202'}</span>`;
  }
  if (sid.length < 10) {
    const dots = '• '.repeat(10 - sid.length).trim();
    return `<span style="color:#0284c7;font-weight:600">${sid} ${dots}</span> <span style="color:var(--ink-tertiary);font-size:11px">(${sid.length}/10 angka)</span>`;
  }
  return `<span style="color:#16a34a;font-weight:600">✓ ${sid} (${isEng ? '10 digits verified' : '10 angka lengkap - Sah'})</span>`;
};

const savedForm = JSON.parse(localStorage.getItem('dt_form') || '{}');
if (savedForm.programCode === 'CS110') savedForm.programCode = '';
if (savedForm.phoneNo) savedForm.phoneNo = formatMyPhone(savedForm.phoneNo);
if (savedForm.studentId) savedForm.studentId = formatStudentMatric(savedForm.studentId);
if (savedForm.studentId && !/^202\d{7}$/.test(savedForm.studentId)) savedForm.studentId = '';

const S = {
  tab: 'home', step: 1, fac: 'fac-badminton', unit: 'b-lining', date: today(), notes: '',
  calYear: new Date().getFullYear(), calMonth: new Date().getMonth(),
  form: savedForm, search: '', results: null,
  view: { status: today(), admin: today() }, data: null, token: localStorage.getItem('dt_token') || '', modal: null, receipt: null,
  lang: localStorage.getItem('dt_lang') || 'bm',
  theme: localStorage.getItem('dt_theme') || 'light' // default light mode
};

const t = (k) => {
  const dict = I18N[S.lang] || I18N.bm;
  const parts = k.split('.');
  let curr = dict;
  for (const p of parts) {
    if (curr && curr[p] !== undefined) curr = curr[p];
    else return k;
  }
  return curr;
};

const fmt = (d) => {
  if (!d) return '';
  const [y, m, x] = d.split('-');
  const dt = new Date(+y, +m - 1, +x);
  const dict = I18N[S.lang] || I18N.bm;
  return `${dict.days[dt.getDay()]}, ${+x} ${dict.months[+m - 1]} ${y}`;
};

const translateDayName = (dName) => {
  if (!dName) return '';
  if (S.lang !== 'eng') return dName;
  const m = {
    'Isnin': 'Monday', 'Selasa': 'Tuesday', 'Rabu': 'Wednesday', 'Khamis': 'Thursday', 'Jumaat': 'Friday', 'Sabtu': 'Saturday', 'Ahad': 'Sunday',
    'Isn': 'Mon', 'Sel': 'Tue', 'Rab': 'Wed', 'Kha': 'Thu', 'Jum': 'Fri', 'Sab': 'Sat', 'Ahd': 'Sun'
  };
  return m[dName] || dName;
};

const translateFacilityName = (fName, fId) => {
  if (S.lang !== 'eng') return fName || '';
  if (fId && fId.includes('badminton')) return 'Badminton Court (Hall)';
  if (fId && fId.includes('pingpong')) return 'Table Tennis';
  if (fName && fName.toLowerCase().includes('badminton')) return 'Badminton Court (Hall)';
  if (fName && fName.toLowerCase().includes('ping pong')) return 'Table Tennis';
  return fName || '';
};

const FALLBACK = '/content img/logojspimg.png';
const SRD_REMARK = 'Sila patuhi garis panduan Sahsiah Rupa Diri (SRD). Berpakaian sukan yang lengkap dan sopan ketika menggunakan kemudahan dewan.';

const getAcademicWeek = (dateStr) => {
  if (!dateStr) return null;
  const semStart = (S.data?.settings?.semesterStartDate) || '2026-10-05';
  
  // Sesi Semester Baharu: 15 Mac 2027 hingga 25 Julai 2027
  // Antara 15 Feb 2027 hingga 14 Mac 2027 adalah Semester Break (Cuti Semester)
  if (dateStr >= '2027-03-15') {
    // Semester Baharu (Mac - Julai 2027)
    const [sy, sm, sd] = [2027, 3, 15];
    const [dy, dm, dd] = dateStr.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    start.setHours(0, 0, 0, 0);
    const current = new Date(dy, dm - 1, dd);
    current.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Cuti Pertengahan Semester Baru: 30 Mei 2027 hingga 6 Jun 2027 (tidak dikira sebagai week nombor)
    if (dateStr >= '2027-05-30' && dateStr <= '2027-06-06') {
      return {
        week: 0,
        isMidsem: true,
        isBreak: true,
        label: S.lang === 'eng' ? 'Midsem Break' : 'Cuti Midsem',
        fullLabel: S.lang === 'eng' ? 'Midsem Break (30 May - 6 June)' : 'Cuti Pertengahan Semester (30 Mei - 6 Jun)',
        shortLabel: S.lang === 'eng' ? 'Break' : 'Midsem'
      };
    }

    // Tolak 7 hari cuti midsem bagi tarikh selepas 6 Jun 2027
    const adjustedDays = (dateStr > '2027-06-06') ? (diffDays - 7) : diffDays;
    const weekNum = Math.floor(adjustedDays / 7) + 1;

    if (dateStr > '2027-07-25' || weekNum > 18) {
      return {
        week: weekNum,
        isPost: true,
        isBreak: true,
        label: S.lang === 'eng' ? 'Semester Break' : 'Cuti Semester',
        fullLabel: S.lang === 'eng' ? 'Semester Break' : 'Cuti Semester',
        shortLabel: S.lang === 'eng' ? 'Break' : 'Cuti'
      };
    }

    return {
      week: weekNum,
      isPre: false,
      label: S.lang === 'eng' ? `Week ${weekNum}` : `Minggu ${weekNum}`,
      fullLabel: S.lang === 'eng' ? `Week ${weekNum}` : `Minggu ${weekNum}`,
      shortLabel: S.lang === 'eng' ? `W${weekNum}` : `M${weekNum}`
    };
  }

  // Sesi Semester Semasa (Mula 5 Okt 2026 sehingga 14 Feb 2027)
  const [sy, sm, sd] = semStart.split('-').map(Number);
  const [dy, dm, dd] = dateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  start.setHours(0, 0, 0, 0);
  const current = new Date(dy, dm - 1, dd);
  current.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { week: 0, isPre: true, label: S.lang === 'eng' ? 'Pre-Semester' : 'Pra-Semester', fullLabel: S.lang === 'eng' ? 'Pre-Semester Period' : 'Tempoh Pra-Semester', shortLabel: 'Pre' };
  
  // Cuti Pertengahan Semester 2026: 21 - 27 Disember 2026 (7 hari, tidak dikira sebagai week nombor)
  if (dateStr >= '2026-12-21' && dateStr <= '2026-12-27') {
    return {
      week: 0,
      isMidsem: true,
      isBreak: true,
      label: S.lang === 'eng' ? 'Midsem Break' : 'Cuti Midsem',
      fullLabel: S.lang === 'eng' ? 'Midsem Break (21 - 27 Dec)' : 'Cuti Pertengahan Semester (21 - 27 Dis)',
      shortLabel: S.lang === 'eng' ? 'Break' : 'Midsem'
    };
  }

  // Jika tarikh melepasi cuti midsem (selepas 27 Disember 2026), tolak 7 hari cuti midsem supaya turutan minggu bersambung tanpa mengira midsem
  const adjustedDays = (dateStr > '2026-12-27') ? (diffDays - 7) : diffDays;
  const weekNum = Math.floor(adjustedDays / 7) + 1;

  // Selepas 14 Februari 2027 sehingga 14 Mac 2027 adalah Semester Break (sebelum semester baru bermula 15 Mac 2027)
  if (weekNum > 18 || dateStr > '2027-02-14') {
    return {
      week: weekNum,
      isPost: true,
      isBreak: true,
      label: S.lang === 'eng' ? 'Semester Break' : 'Cuti Semester',
      fullLabel: S.lang === 'eng' ? 'Semester Break (Before New Sem 15 Mar)' : 'Cuti Semester (Sebelum Sesi Baru 15 Mac)',
      shortLabel: S.lang === 'eng' ? 'Break' : 'Cuti'
    };
  }

  return {
    week: weekNum,
    isPre: false,
    label: S.lang === 'eng' ? `Week ${weekNum}` : `Minggu ${weekNum}`,
    fullLabel: S.lang === 'eng' ? `Week ${weekNum}` : `Minggu ${weekNum}`,
    shortLabel: S.lang === 'eng' ? `W${weekNum}` : `M${weekNum}`
  };
};

const isDateWeekOpen = (dateStr) => {
  if (!dateStr || !S.data) return { open: true };
  const mode = S.data.settings?.openBookingMode || 'week_control';
  if (mode === 'all') return { open: true };
  const openWeeks = (S.data.settings?.openWeeks || '1,2').split(',').map(s => s.trim()).filter(Boolean);
  const targetWeek = getAcademicWeek(dateStr);
  const todayStr = today();

  if (targetWeek?.isMidsem) {
    const isMidsemOpen = openWeeks.includes('midsem');
    return {
      open: isMidsemOpen,
      weekNum: 'midsem',
      reason: isMidsemOpen ? '' : (S.lang === 'eng' ? `Closed for ${targetWeek.fullLabel}` : `Ditutup sempena ${targetWeek.fullLabel}`)
    };
  }

  if (targetWeek?.isPost) {
    return {
      open: false,
      reason: S.lang === 'eng' ? (targetWeek.fullLabel || 'Semester Break') : (targetWeek.fullLabel || 'Cuti Semester')
    };
  }

  if (mode === 'week_control') {
    if (targetWeek && targetWeek.week > 0) {
      const isOpen = openWeeks.includes(String(targetWeek.week));
      return { 
        open: isOpen, 
        weekNum: targetWeek.week, 
        reason: isOpen ? '' : (S.lang === 'eng' ? `Booking for Week ${targetWeek.week} is not open yet (Admin will activate it ahead of that week)` : `Tempahan bagi Minggu ${targetWeek.week} belum dibuka (JSP akan mengaktifkan menjelang minggu tersebut)`)
      };
    }
    return { open: true };
  }

  if (mode === 'current_week') {
    const curWeek = getAcademicWeek(todayStr);
    const isOpen = targetWeek && curWeek && targetWeek.week === curWeek.week;
    return { 
      open: isOpen, 
      weekNum: targetWeek?.week, 
      reason: isOpen ? '' : (S.lang === 'eng' ? `Only current week (Week ${curWeek?.week}) is open` : `Hanya minggu semasa (Minggu ${curWeek?.week}) dibuka`)
    };
  }

  if (mode === 'rolling_2days') {
    const [ty, tm, td] = todayStr.split('-').map(Number);
    const [by, bm, bd] = dateStr.split('-').map(Number);
    const diff = Math.floor((new Date(by, bm - 1, bd) - new Date(ty, tm - 1, td)) / (86400000));
    const isOpen = diff <= 2;
    return {
      open: isOpen,
      reason: isOpen ? '' : (S.lang === 'eng' ? 'Booking opens 2 days before session date' : 'Tempahan hanya dibuka 2 hari sebelum tarikh sesi')
    };
  }

  return { open: true };
};

const getTabs = () => [
  ['home', t('tabs.home')],
  ['booking-wizard', t('tabs.wizard')],
  ['student-check', t('tabs.status')],
  ['availability-calendar', t('tabs.calendar')]
];

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
  const dict = I18N[S.lang] || I18N.bm;
  return `${dict.days[d.getDay()]}, ${d.getDate()} ${dict.months[d.getMonth()]} ${d.getFullYear()}`;
};

/* ---------- Header ---------- */
function header() {
  const D = S.data, adm = D.isAdmin;
  const isDark = S.theme === 'dark';
  const isBm = S.lang === 'bm';

  return `
  <header class="top-nav">
    <div class="nav-container">
      <div class="nav-brand">
        <button class="brand-link" data-a="tab" data-t="home">
          <img src="/content img/logojspimg.png" alt="Logo JSP" class="nav-logo-thumb" onerror="this.style.display='none'">
          <div class="brand-text-col">
            <span class="brand-title">DEWAN TEMENGGONG</span>
            <span class="brand-sub-full">${t('header.brandSub')}</span>
          </div>
        </button>
      </div>

      <nav class="nav-segmented">
        ${getTabs().map(([id, label]) => `
          <button class="nav-pill ${S.tab === id ? 'active' : ''}" data-a="tab" data-t="${id}">
            ${label}
          </button>
        `).join('')}
      </nav>

      <div class="nav-actions">
        <!-- Button Switch Light / Dark Mode -->
        <button class="utility-switch-pill" data-a="toggleTheme" title="${isDark ? 'Tukar ke Mod Cerah (Light Mode)' : 'Tukar ke Mod Gelap (Dark Mode)'}">
          ${ic(isDark ? 'sun' : 'moon')}
          <span>${isDark ? 'Light' : 'Dark'}</span>
        </button>

        <!-- Button Switch BM / ENG -->
        <button class="utility-switch-pill lang-toggle-pill" data-a="toggleLang" title="${isBm ? 'Switch to English' : 'Tukar ke Bahasa Melayu'}">
          ${ic('globe')}
          <span class="lang-opt ${isBm ? 'lang-active' : ''}">BM</span>
          <span class="lang-divider">/</span>
          <span class="lang-opt ${!isBm ? 'lang-active' : ''}">ENG</span>
        </button>

        ${adm ? `
          <button class="btn-subtle ${S.tab === 'admin' ? 'active' : ''}" data-a="tab" data-t="admin">
            ${ic('shield')}
            <span>Admin</span>
          </button>
          <button class="btn-icon" data-a="logout" title="${t('header.logout')}">
            ${ic('log-out')}
          </button>
        ` : `
          <button class="btn-subtle" data-a="modal" data-m="login">
            ${ic('key-round')}
            <span>${t('header.admin')}</span>
          </button>
        `}
      </div>
    </div>
  </header>`;
}

const bnav = () => {
  const tabIcons = {
    'home': 'home',
    'booking-wizard': 'calendar-plus',
    'student-check': 'search',
    'availability-calendar': 'calendar-days'
  };
  return `
  <nav class="mobile-nav">
    ${getTabs().map(([id, label]) => `
      <button class="mobile-nav-btn ${S.tab === id ? 'active' : ''}" data-a="tab" data-t="${id}">
        <span class="mobile-nav-icon">${ic(tabIcons[id] || 'circle')}</span>
        <span class="mobile-nav-label">${label}</span>
      </button>
    `).join('')}
  </nav>`;
};

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
          <div class="caption-muted">${t('clock.title')}</div>
          <div class="clock-digits" id="liveClockTime">${getClockTime()}</div>
          <div class="clock-calendar-sub" id="liveClockDate">${getClockDate()}</div>
        </div>

        <div class="clock-status-block">
          <div class="status-indicator-row">
            <span class="status-dot ${isClosedToday ? 'dot-red' : isOperatingToday ? 'dot-green' : 'dot-gray'}"></span>
            <span class="status-text">
              ${isClosedToday 
                ? t('clock.closed') 
                : isOperatingToday 
                  ? `${t('clock.open')} (${translateDayName(todaySchedule.dayName)}: ${todaySchedule.timeDisplay})` 
                  : t('clock.rest')}
            </span>
          </div>
          <p class="caption-muted" style="margin-top:6px">
            ${t('clock.scheduleNote')}
          </p>
          <div style="margin-top:14px">
            <button class="btn-primary" data-a="tab" data-t="booking-wizard">
              ${t('clock.bookBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Kapasiti dan Statistik (Di bawah jam) -->
    <div class="card clean-stats-bar">
      <div class="stats-header">
        <div>
          <h3 class="section-title">${t('stats.title')}</h3>
          <p class="caption-muted">${t('stats.sub')}</p>
        </div>
        <div class="date-input-wrap">
          <input type="date" value="${S.date}" data-d="sel" class="minimal-date-input">
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-cell">
          <span class="stat-caption">${t('stats.total')}</span>
          <div class="stat-number">${D.bookings.length}</div>
          <span class="stat-note">${t('stats.totalSub')}</span>
        </div>

        <div class="stat-cell">
          <span class="stat-caption">${t('stats.active')}</span>
          <div class="stat-number stat-green">${act}</div>
          <span class="stat-note">${t('stats.activeSub')}</span>
        </div>

        <div class="stat-cell">
          <span class="stat-caption">${t('stats.vacancy')}</span>
          <div class="stat-number">${o.closed ? '0' : o.rem} <span class="stat-unit">/ ${o.tot}</span></div>
          <span class="stat-note">${sc ? sc.timeDisplay : t('stats.outsideOp')}</span>
        </div>

        <div class="stat-cell">
          <span class="stat-caption">${t('stats.status')}</span>
          <div class="stat-badge-wrap">
            ${o.closed ? chip('chip-bad', t('stats.closedBadge')) : o.rem > 0 ? chip('chip-ok', t('stats.availBadge')) : chip('chip-warn', t('stats.fullBadge'))}
          </div>
          <span class="stat-note">${fmt(S.date)}</span>
        </div>
      </div>
    </div>

    <!-- 3. Hero Presentation dengan backgrounddt.jpeg -->
    <div class="card hero-photo-card" style="background-image: linear-gradient(180deg, rgba(9, 13, 22, 0.45) 0%, rgba(9, 13, 22, 0.88) 100%), url('/content img/backgrounddt.jpeg');">
      <div class="hero-photo-content">
        <span class="hero-tag">${t('hero.tag')}</span>
        <h1 class="hero-headline text-white">${t('hero.title')}</h1>
        <p class="hero-subline text-white-muted">
          ${t('hero.desc')}
        </p>
        <div class="hero-button-row">
          <button class="btn-primary" data-a="tab" data-t="booking-wizard">
            ${t('hero.bookNow')}
          </button>
          <button class="btn-glass" data-a="tab" data-t="availability-calendar">
            ${t('hero.viewCal')}
          </button>
          <button class="btn-glass" data-a="tab" data-t="student-check">
            ${t('hero.checkStatus')}
          </button>
        </div>
      </div>
    </div>

    <!-- 4. Guidelines Cards -->
    <div class="clean-grid-3">
      <div class="card clean-card-pad">
        <h4 class="card-item-title">${t('guidelines.g1Title')}</h4>
        <p class="caption-muted">
          ${t('guidelines.g1Desc')}
        </p>
      </div>

      <div class="card clean-card-pad">
        <h4 class="card-item-title">${t('guidelines.g2Title')}</h4>
        <p class="caption-muted">
          ${t('guidelines.g2Desc')}
        </p>
      </div>

      <div class="card clean-card-pad">
        <h4 class="card-item-title">${t('guidelines.g3Title')}</h4>
        <p class="caption-muted">
          ${t('guidelines.srd')}
        </p>
      </div>
    </div>
  </div>`;
}

/* ---------- View: Wizard Tempahan ---------- */
function wizard() {
  const D = S.data, fac = D.facilities.find((f) => f.id === S.fac), f = S.form;
  let body = '';

  const steps = (I18N[S.lang] || I18N.bm).wizard.steps;

  if (S.step === 1) {
    body = `
      <div class="wizard-step-body">
        <h3 class="step-title">${t('wizard.step1Title')}</h3>
        <p class="caption-muted">${t('wizard.step1Desc')}</p>

        <div class="facility-choice-grid">
          ${D.facilities.map((x) => `
            <div class="card choice-card ${S.fac === x.id ? 'selected' : ''}" data-a="fac" data-id="${x.id}">
              <div class="choice-image" style="background-image:url('${x.image}')"></div>
              <div class="choice-content">
                <div class="choice-header">
                  <span class="choice-title">${S.lang === 'eng' ? (x.type === 'badminton' ? 'Badminton Court' : 'Table Tennis') : x.name}</span>
                  <span class="choice-check">${S.fac === x.id ? ic('check') : ''}</span>
                </div>
                <p class="caption-muted">${S.lang === 'eng' ? (x.type === 'badminton' ? 'High quality tournament courts.' : 'Standard tournament ping pong tables.') : (x.type === 'badminton' ? 'Gelanggang badminton berkualiti tinggi.' : x.description)}</p>
                <div class="caption-muted" style="margin-top:10px;font-size:12px">
                  ${t('wizard.cap')} <b>${x.maxCapacity} ${t('wizard.perUnit')}</b>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="unit-group">
          <label class="field-label">${t('wizard.unitLabel')}</label>
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
            ${t('wizard.nextDate')}
          </button>
        </div>
      </div>`;
  } else if (S.step === 2) {
    const sc = sched(S.date), cl = D.closedDates.includes(S.date);
    const isPast = S.date < today();
    const weekCheck = isDateWeekOpen(S.date);
    const isWeekLocked = sc && !isPast && !cl && !weekCheck.open;
    const wkInfo = getAcademicWeek(S.date);
    body = `
      <div class="wizard-step-body">
        <h3 class="step-title">${t('wizard.step2Title')}</h3>
        <p class="caption-muted">${t('wizard.step2Desc')}</p>

        <!-- Kalendar Live Interaktif untuk Pemilihan Tarikh -->
        <div style="margin-top:20px">
          ${renderBigMonthlyCalendar()}
        </div>

        <div class="card clean-card-pad" style="margin-top:16px;padding:16px 20px;background:var(--bg-subtle)">
          <div class="calendar-date-summary" style="margin:0">
            <div>
              <span class="caption-muted sm">${t('wizard.selDateLabel')} ${wkInfo ? `• <b>${wkInfo.fullLabel}</b>` : ''}</span>
              <h4 style="font-size:16px;margin-top:2px">${fmt(S.date)}</h4>
              <div class="caption-muted" style="font-size:12.5px">
                ${sc ? `${t('wizard.opTime')}: <b>${translateDayName(sc.dayName)} (${sc.timeDisplay})</b>` : t('wizard.outSession')}
              </div>
            </div>
            <div>
              ${isPast 
                ? chip('chip-bad', S.lang === 'eng' ? 'Past Date (Invalid)' : 'Tarikh Lepas (Tidak Sah)') 
                : cl 
                  ? chip('chip-bad', t('stats.closedBadge')) 
                  : isWeekLocked
                    ? chip('chip-warn', S.lang === 'eng' ? 'Week Not Open' : 'Minggu Belum Dibuka')
                    : sc 
                      ? chip('chip-ok', S.lang === 'eng' ? 'Session Open' : 'Sesi Dibuka') 
                      : chip('chip-subtle', S.lang === 'eng' ? 'No Session' : 'Tiada Sesi')}
            </div>
          </div>
        </div>

        <div class="notice-minimal ${isPast || cl || isWeekLocked ? 'notice-bad' : sc ? 'notice-ok' : 'notice-warn'}" style="margin-top:14px">
          ${isPast 
            ? t('wizard.datePast') 
            : cl 
              ? t('wizard.dateClosed') 
              : isWeekLocked
                ? (weekCheck.reason || t('wizard.weekNotOpenNotice'))
                : sc 
                  ? `${translateDayName(sc.dayName)}: ${sc.timeDisplay}. ${t('wizard.dateOpen')}` 
                  : t('wizard.dateNonOp')}
        </div>

        <div class="step-footer">
          <button class="btn-secondary" data-a="step" data-n="1">${t('wizard.back')}</button>
          <button class="btn-primary" data-a="step" data-n="3" ${isPast || cl || !sc || isWeekLocked ? 'disabled' : ''}>
            ${t('wizard.nextStudent')}
          </button>
        </div>
      </div>`;
  } else if (S.step === 3) {
    body = `
      <div class="wizard-step-body">
        <h3 class="step-title">${t('wizard.step3Title')}</h3>
        <p class="caption-muted">${t('wizard.step3Desc')}</p>

        <div class="notice-minimal notice-info" style="margin-top:16px">
          ${t('wizard.onePerWeekNotice')}
        </div>

        <div class="form-grid" style="margin-top:18px">
          <div class="field-group">
            <label class="field-label">${t('wizard.fullName')}</label>
            <input type="text" placeholder="${t('wizard.fullNamePh')}" value="${esc(f.fullName || '')}" data-f="fullName" class="minimal-input">
          </div>

          <div class="field-group">
            <label class="field-label">${t('wizard.phoneNo')}</label>
            <input type="tel" inputmode="tel" maxlength="13" placeholder="${t('wizard.phoneNoPh')}" value="${esc(formatMyPhone(f.phoneNo || ''))}" data-f="phoneNo" class="minimal-input">
            <span class="field-hint">${t('wizard.phoneNoHint')}</span>
          </div>

          <div class="field-group">
            <label class="field-label">${t('wizard.studentId')}</label>
            <div class="student-id-input-wrap">
              <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="10" placeholder="${t('wizard.studentIdPh')}" value="${esc(f.studentId || '')}" data-f="studentId" class="minimal-input ${f.studentId && f.studentId.length === 10 && f.studentId.startsWith('202') ? 'input-valid' : ''}">
            </div>
            <div id="studentIdStatus" class="field-hint">${renderStudentIdHint(f.studentId)}</div>
          </div>

          <div class="field-group">
            <label class="field-label">${t('wizard.progCode')}</label>
            <input type="text" maxlength="10" placeholder="${t('wizard.progCodePh')}" value="${esc(f.programCode || '')}" data-f="programCode" class="minimal-input" style="text-transform:uppercase">
          </div>

          <div class="field-group field-span-2">
            <label class="field-label">${t('wizard.notes')}</label>
            <input type="text" placeholder="${t('wizard.notesPh')}" value="${esc(S.notes)}" data-s="notes" class="minimal-input">
          </div>

          <!-- Aku Janji Ketulenan Maklumat & Pengesahan Kad Matrik Fizikal -->
          <div class="field-span-2" style="margin-top:8px">
            <div class="agreement-card">
              <label class="agreement-label">
                <input type="checkbox" data-f="agreement" ${f.agreement ? 'checked' : ''} class="agreement-checkbox">
                <div class="agreement-content">
                  <span class="agreement-title">${t('wizard.agreementTitle')}</span>
                  <p class="agreement-text">${t('wizard.agreementDesc')}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="step-footer">
          <button class="btn-secondary" data-a="step" data-n="2">${t('wizard.back')}</button>
          <button class="btn-primary" data-a="submit">${t('wizard.submit')}</button>
        </div>
      </div>`;
  } else if (S.receipt) {
    const r = S.receipt;
    const wkInfo = getAcademicWeek(r.date);
    body = `
      <div class="wizard-step-body text-center">
        <div class="success-icon-wrap">
          ${ic('check')}
        </div>
        <h3 class="step-title" style="margin-top:16px">${t('wizard.step4Title')}</h3>
        <p class="caption-muted">${t('wizard.step4Desc')}</p>

        <!-- Minimal Pass Slip -->
        <div class="card minimal-pass-card">
          <div class="pass-header">
            <span class="pass-label">${t('wizard.refNo')}</span>
            <span class="pass-ref">${esc(r.refNo)}</span>
          </div>
          <div class="pass-details-list">
            <div class="pass-row">
              <span class="caption-muted">${t('wizard.applicantName')}</span>
              <b>${esc(r.userName)}</b>
            </div>
            <div class="pass-row">
              <span class="caption-muted">${t('wizard.studentMatric')}</span>
              <b>${esc(r.studentId)}</b>
            </div>
            <div class="pass-row">
              <span class="caption-muted">${t('wizard.facilityUnit')}</span>
              <b>${translateFacilityName(r.facilityName, r.facilityId)} (${esc(r.unitName)})</b>
            </div>
            <div class="pass-row">
              <span class="caption-muted">${t('wizard.dateTime')}</span>
              <b>${fmt(r.date)} ${wkInfo ? `(${wkInfo.fullLabel})` : ''} • ${esc(r.startTime)} - ${esc(r.endTime)}</b>
            </div>
            <div class="pass-row">
              <span class="caption-muted">${t('stats.status')}</span>
              <span class="chip chip-ok">${t('wizard.statusApproved')}</span>
            </div>
          </div>

          <div class="physical-id-alert" style="margin-top:16px;text-align:left">
            ${ic('shield-alert')}
            <div>
              <b>${t('wizard.physicalNotice')}</b>
            </div>
          </div>
        </div>

        <div class="hero-button-row" style="justify-content:center;margin-top:24px">
          <button class="btn-secondary" onclick="window.print()">${t('wizard.printSlip')}</button>
          <button class="btn-primary" data-a="tab" data-t="student-check">${t('wizard.checkRecord')}</button>
        </div>
      </div>`;
  }

  return `
  <div class="narrow-container">
    <div class="card clean-card-pad">
      <!-- Modern Stepper Progress Bar -->
      <div class="stepper-progress-container">
        <div class="stepper-progress-track">
          <div class="stepper-progress-fill" style="width:${((S.step - 1) / (steps.length - 1)) * 100}%"></div>
        </div>
        <div class="stepper-dots-row">
          ${steps.map((st) => `
            <div class="stepper-tab ${S.step === st.n ? 'active' : S.step > st.n ? 'done' : ''}">
              <span class="stepper-num">${S.step > st.n ? ic('check') : st.n}</span>
              <span class="stepper-text">${st.label}</span>
            </div>
          `).join('')}
        </div>
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
        <label class="field-label" style="margin:0">${t('browserView.selectDate')}</label>
        <input type="date" value="${vd}" data-d="view" data-k="${kind}" class="minimal-date-input">
        <button class="btn-subtle" data-a="view" data-k="${kind}" data-v="">${t('browserView.allDates')}</button>
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
          <h4 class="facility-section-title">${S.lang === 'eng' ? (f.type === 'badminton' ? 'Badminton Court' : 'Table Tennis') : f.name}</h4>
          <div class="units-stack">
            ${f.units.map((u) => {
              const ub = shown.filter((b) => b.unitId === u.id);
              const full = vd && ub.length >= f.maxCapacity;
              return `
              <details class="clean-accordion" ${ub.length ? 'open' : ''}>
                <summary class="clean-summary">
                  <span class="summary-title">${u.name}</span>
                  <span class="chip ${full ? 'chip-bad' : 'chip-subtle'}">
                    ${vd ? `${ub.length} / ${f.maxCapacity} ${S.lang === 'eng' ? 'Persons' : 'Orang'} ${full ? t('browserView.fullBadge') : ''}` : `${ub.length} ${t('browserView.bookingsCount')}`}
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
                        <div class="caption-muted" style="font-size:11px">${t('browserView.createdOn')} ${esc(b.createdAt)}</div>
                        ${adm ? `
                          <div>
                            <button class="btn-delete-booking" data-a="deleteBooking" data-id="${b.id}" data-ref="${esc(b.refNo)}" data-name="${esc(b.userName)}">
                              ${ic('trash-2')} ${t('browserView.deleteBooking')}
                            </button>
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `).join('') : `<div class="empty-entry caption-muted">${t('browserView.noBooking')}</div>`}
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
          ${t('statusView.noRecord')} <b>"${esc(q)}"</b>.
        </div>
        <div class="caption-muted sm" style="margin-top:6px">
          ${t('statusView.checkMatricTip')}
        </div>
      </div>`;
  }

  return `
    <div class="pass-cards-list">
      <div class="caption-muted sm" style="margin-bottom:12px;font-weight:600">
        ${bookings.length} ${t('statusView.foundCount')}
      </div>
      ${bookings.map((b) => `
        <div class="student-pass-card">
          <div class="pass-card-top">
            <div class="pass-ref-block">
              <span class="pass-ref-label">${t('wizard.refNo')}</span>
              <span class="pass-ref-val">${esc(b.refNo)}</span>
            </div>
            <div class="pass-status-pill">
              <span class="status-dot dot-green"></span>
              <span>${t('wizard.statusApproved')}</span>
            </div>
          </div>

          <div class="pass-card-body">
            <div class="pass-student-details">
              <h4 class="pass-student-name">${esc(b.userName)}</h4>
              <span class="pass-student-sub">${esc(b.studentId)} ${b.programCode ? '• ' + esc(b.programCode) : ''}</span>
            </div>

            <div class="pass-facility-box">
              <div class="pass-facility-title">
                ${b.facilityId.includes('badminton') ? '🏸 ' : '🏓 '} <b>${translateFacilityName(b.facilityName, b.facilityId)}</b>
              </div>
              <div class="pass-unit-title">${esc(b.unitName)}</div>
            </div>

            <div class="pass-date-time-grid">
              <div>
                <span class="caption-muted sm">${t('statusView.sessionDate')}</span>
                <div class="pass-dt-val">${fmt(b.date)}</div>
              </div>
              <div>
                <span class="caption-muted sm">${t('statusView.opHours')}</span>
                <div class="pass-dt-val">${esc(b.startTime)} - ${esc(b.endTime)}</div>
              </div>
            </div>
          </div>

          <div class="pass-card-footer">
            <span class="caption-muted" style="font-size:11.5px">${t('statusView.registeredAt')} ${esc(b.createdAt)}</span>
            <div style="display:flex;gap:8px;align-items:center">
              ${S.data && S.data.isAdmin ? `
                <button class="btn-delete-booking" style="margin:0" data-a="deleteBooking" data-id="${b.id}" data-ref="${esc(b.refNo)}" data-name="${esc(b.userName)}">
                  ${ic('trash-2')} ${t('statusView.deleteBtn')}
                </button>
              ` : ''}
              <button class="btn-subtle" onclick="window.print()">
                ${ic('printer')} <span>${t('statusView.printBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

const status = () => `
  <div class="narrow-container">
    <div class="card clean-card-pad">
      <h3 class="section-title">${t('statusView.title')}</h3>
      <p class="caption-muted">${t('statusView.sub')}</p>

      <div class="search-input-wrap" style="margin-top:18px">
        <input type="search" placeholder="${t('statusView.placeholder')}" value="${esc(S.search)}" data-s="search" class="minimal-input search-box" autofocus>
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
  const dict = I18N[S.lang] || I18N.bm;
  const monthName = dict.months[month];

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0, Sunday is 6
  const startOffset = (firstDayIndex + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();

  const dayHeaders = S.lang === 'eng' 
    ? [
        { full: 'Mon', short: 'Mon' },
        { full: 'Tue', short: 'Tue' },
        { full: 'Wed', short: 'Wed' },
        { full: 'Thu', short: 'Thu' },
        { full: 'Fri', short: 'Fri' },
        { full: 'Sat', short: 'Sat' },
        { full: 'Sun', short: 'Sun' }
      ]
    : [
        { full: 'Isnin', short: 'Isn' },
        { full: 'Selasa', short: 'Sel' },
        { full: 'Rabu', short: 'Rab' },
        { full: 'Khamis', short: 'Kha' },
        { full: 'Jumaat', short: 'Jum' },
        { full: 'Sabtu', short: 'Sab' },
        { full: 'Ahad', short: 'Ahd' }
      ];

  const todayStr = today();
  let cells = [];
  // Empty cells before start
  for (let i = 0; i < startOffset; i++) {
    cells.push('<div class="cal-cell empty"></div>');
  }

  // Days 1..totalDays
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    const dayOfWeek = new Date(year, month, d).getDay();
    const isToday = dateStr === todayStr;
    const isPast = dateStr < todayStr;
    const isSelected = dateStr === S.date;
    const isClosed = D.closedDates.includes(dateStr);
    const daySched = D.schedule ? D.schedule[dayOfWeek] : null;
    const isOperating = !!daySched;
    const weekCheck = isDateWeekOpen(dateStr);
    const isWeekLocked = isOperating && !isPast && !isClosed && !weekCheck.open;
    const wkInfo = getAcademicWeek(dateStr);

    // Check bookings for this date
    let badgeHtml = '';
    if (isPast) {
      badgeHtml = `<span class="cal-badge-muted">${S.lang === 'eng' ? 'Passed' : 'Lepas'}</span>`;
    } else if (isClosed) {
      badgeHtml = `<span class="cal-badge-pill badge-closed"><span class="desk-label">${t('stats.closedBadge')}</span><span class="mob-label">${S.lang === 'eng' ? 'Closed' : 'Tutup'}</span></span>`;
    } else if (isWeekLocked) {
      badgeHtml = `<span class="cal-badge-pill badge-locked"><span class="desk-label">${t('calendar.badgeLocked')}</span><span class="mob-label">${S.lang === 'eng' ? 'Soon' : 'Belum'}</span></span>`;
    } else if (isOperating) {
      const ov = overview(dateStr);
      if (ov.rem === 0) {
        badgeHtml = `<span class="cal-badge-pill badge-full"><span class="desk-label">${t('stats.fullBadge')}</span><span class="mob-label">${S.lang === 'eng' ? 'Full' : 'Penuh'}</span></span>`;
      } else {
        const timeShort = daySched.timeDisplay.split(' - ')[0].replace(':00', '');
        badgeHtml = `<span class="cal-badge-pill badge-open"><span class="desk-label">${translateDayName(daySched.dayName).slice(0,3)} • ${daySched.timeDisplay.split(' - ')[0]}</span><span class="mob-label">${timeShort}</span></span>`;
      }
    } else {
      badgeHtml = `<span class="cal-badge-muted">${S.lang === 'eng' ? 'Rest' : 'Rehat'}</span>`;
    }

    const clickAction = (isPast && S.tab === 'booking-wizard') 
      ? 'data-a="pastDateNotice"' 
      : (isWeekLocked && S.tab === 'booking-wizard')
        ? `data-a="lockedDateNotice" data-week="${weekCheck.weekNum || ''}"`
        : `data-a="calDate" data-date="${dateStr}"`;

    cells.push(`
      <div class="cal-cell ${isPast ? 'past-date' : ''} ${isWeekLocked ? 'week-locked' : ''} ${isOperating ? 'operating' : 'non-operating'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" ${clickAction} title="${isPast ? (S.lang === 'eng' ? 'Past date cannot be booked' : 'Tarikh telah lepas') : isWeekLocked ? weekCheck.reason : dateStr}">
        <div class="cal-cell-header">
          <span class="cal-day-num">${d}</span>
          ${wkInfo ? `<span class="cal-week-tag" title="${wkInfo.fullLabel}">${wkInfo.shortLabel}</span>` : ''}
        </div>
        <div class="cal-cell-body">
          ${badgeHtml}
        </div>
      </div>
    `);
  }

  const curWk = getAcademicWeek(todayStr);

  return `
    <div class="big-calendar-card">
      <div class="cal-top-controls">
        <div class="cal-month-title-wrap">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <h3 class="cal-month-title" style="margin:0">${monthName} ${year}</h3>
            ${curWk ? `<span class="chip chip-ok" style="font-size:11px;font-weight:600">${curWk.fullLabel}</span>` : ''}
          </div>
          <span class="caption-muted sm">${t('calendar.sub')}</span>
        </div>
        <div class="cal-nav-buttons">
          <button class="btn-subtle" data-a="calNav" data-dir="-1" title="${t('calendar.lastMonth')}">
            ${ic('chevron-left')}
          </button>
          <button class="btn-subtle" data-a="calToday" title="${t('calendar.thisMonth')}">
            ${t('calendar.thisMonth')}
          </button>
          <button class="btn-subtle" data-a="calNav" data-dir="1" title="${t('calendar.nextMonth')}">
            ${ic('chevron-right')}
          </button>
        </div>
      </div>

      <!-- Legend -->
      <div class="cal-legend-row">
        <div class="legend-item"><span class="legend-dot dot-green"></span> <span>${t('calendar.legendOpen')}</span></div>
        <div class="legend-item"><span class="legend-dot dot-amber"></span> <span>${t('calendar.legendLocked')}</span></div>
        <div class="legend-item"><span class="legend-dot dot-red"></span> <span>${t('calendar.legendClosed')}</span></div>
        <div class="legend-item"><span class="legend-dot dot-gray"></span> <span>${t('calendar.legendRest')}</span></div>
      </div>

      <!-- Calendar Grid -->
      <div class="cal-weekdays-row">
        ${dayHeaders.map(dh => `<div class="cal-weekday-col"><span class="day-full">${dh.full}</span><span class="day-short">${dh.short}</span></div>`).join('')}
      </div>
      <div class="cal-grid">
        ${cells.join('')}
      </div>
    </div>`;
}

function calendar() {
  const D = S.data, sc = sched(S.date);
  const curSelWk = getAcademicWeek(S.date);
  const selWkCheck = isDateWeekOpen(S.date);
  const isSelWkLocked = sc && !D.closedDates.includes(S.date) && S.date >= today() && !selWkCheck.open;

  return `
  <div class="flow-layout">
    <!-- Big Visual Calendar (Penunjuk Aras) -->
    ${renderBigMonthlyCalendar()}

    <!-- Selected Date Overview Card -->
    <div class="card clean-card-pad" style="margin-top:20px">
      <div class="calendar-date-summary">
        <div>
          <span class="caption-muted sm">${t('calendar.selDate')} ${curSelWk ? `• <b>${curSelWk.fullLabel}</b>` : ''}</span>
          <h3 style="font-size:18px;margin-top:2px">${fmt(S.date)}</h3>
          <div class="caption-muted">${t('wizard.opTime')}: ${sc ? `<b>${translateDayName(sc.dayName)} (${sc.timeDisplay})</b>` : t('wizard.outSession')}</div>
        </div>
        <div>
          ${D.closedDates.includes(S.date) 
            ? chip('chip-bad', t('calendar.hallClosed')) 
            : isSelWkLocked
              ? chip('chip-warn', S.lang === 'eng' ? 'Week Not Open' : 'Minggu Belum Dibuka')
              : sc 
                ? chip('chip-ok', t('calendar.openForBooking')) 
                : chip('chip-subtle', t('calendar.noSessionToday'))}
        </div>
      </div>

      <div class="flow-layout" style="margin-top:20px;--s:16px">
        ${D.facilities.map((f) => `
          <div class="card clean-card-pad" style="padding:20px">
            <div class="facility-head-row">
              <span class="choice-title">${S.lang === 'eng' ? (f.type === 'badminton' ? 'Badminton Court' : 'Table Tennis') : f.name}</span>
              <span class="caption-muted">${t('calendar.maxPerUnit')} ${f.maxCapacity} ${t('calendar.personsPerUnit')}</span>
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
                    <span class="${full ? 'stat-bad' : 'caption-muted'}">${n} / ${f.maxCapacity} ${full ? t('browserView.fullBadge') : t('browserView.availBadge')}</span>
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
  const D = S.data, cl = D.closedDates.includes(S.date), sc = sched(S.date);
  return `
  <div class="flow-layout">
    <div class="card clean-card-pad">
      <div class="admin-top-header">
        <div>
          <h3 class="section-title">${t('adminView.title')}</h3>
          <p class="caption-muted">${t('adminView.sub')}</p>
        </div>
        <div class="hero-button-row">
          <button class="btn-secondary" data-a="modal" data-m="sheets">${ic('file-spreadsheet')} ${t('adminView.gSheets')}</button>
          <button class="btn-primary" data-a="csv">${ic('download')} ${t('adminView.exportCsv')}</button>
        </div>
      </div>

      <!-- Kawalan Operasi & Buka/Tutup Tarikh -->
      <div class="admin-controls-grid" style="margin-top:24px">
        <div class="admin-box">
          <label class="field-label">${t('adminView.controlTitle')}</label>
          <p class="caption-muted" style="font-size:12.5px;margin-bottom:8px">${t('adminView.controlSub')}</p>
          <div style="max-width:280px">
            <input type="date" value="${S.date}" data-d="sel" class="minimal-date-input" style="width:100%">
          </div>

          <!-- Switch Buka / Tutup Tarikh Moden -->
          <div class="switch-control-card">
            <div class="switch-label-group">
              <span class="switch-status-text">
                ${cl ? t('adminView.opClosed') : t('adminView.opOpen')} (${fmt(S.date)})
              </span>
              <span class="switch-subtext">
                ${cl 
                  ? t('adminView.closedNotice') 
                  : sc 
                    ? `${t('wizard.opTime')} (${translateDayName(sc.dayName)}: ${sc.timeDisplay}). ${t('adminView.openNotice')}` 
                    : t('adminView.offScheduleNotice')}
              </span>
            </div>
            <button type="button" class="switch-btn ${cl ? 'is-closed' : ''}" data-a="toggle" title="Klik untuk tukar status operasi">
              <span class="switch-thumb"></span>
            </button>
          </div>
        </div>

        <div class="admin-box">
          <label class="field-label">${t('adminView.visualTitle')}</label>
          <div class="flow-layout" style="--s:10px;margin-top:8px">
            <input type="text" value="${esc(S.bgIn)}" data-s="bgIn" placeholder="${t('adminView.bgPh')}" class="minimal-input">
            <input type="text" value="${esc(S.logoIn)}" data-s="logoIn" placeholder="${t('adminView.logoPh')}" class="minimal-input">
            <button class="btn-secondary" data-a="saveVisual">${ic('check')} ${t('adminView.saveVisual')}</button>
          </div>
        </div>
      </div>

      <!-- Kawalan Tempahan Minggu (Kalendar Akademik UiTM) -->
      <div class="admin-academic-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
          <div>
            <h4 class="facility-section-title" style="margin:0">${t('adminView.academicTitle')}</h4>
            <p class="caption-muted" style="font-size:12.5px;margin-top:4px">${t('adminView.academicSub')}</p>
          </div>
          ${sched(today()) ? `<span class="chip chip-ok" style="font-weight:600">${t('adminView.curWeekBadge')} ${getAcademicWeek(today()) ? getAcademicWeek(today()).fullLabel : ''}</span>` : ''}
        </div>

        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px">
          <label class="field-label" style="margin:0">${t('adminView.semStartLabel')}</label>
          <input type="date" value="${esc(S.semStartIn || D.settings.semesterStartDate || '2026-10-05')}" data-s="semStartIn" class="minimal-date-input" style="max-width:180px">
          <button class="btn-subtle" data-a="saveAcademicSettings">${ic('save')} ${t('adminView.saveSemStart')}</button>
        </div>

        <div style="margin-top:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px">
            <label class="field-label" style="margin:0">${t('adminView.openWeeksLabel')}</label>
            <div class="hero-button-row" style="margin:0;gap:8px">
              <button class="btn-subtle" data-a="openCurrentWeekOnly">${ic('calendar')} ${t('adminView.btnOpenThisWeekOnly')}</button>
              <button class="btn-subtle" data-a="advanceToNextWeek">${ic('fast-forward')} ${t('adminView.btnAdvanceNextWeek')}</button>
              <button class="btn-subtle" data-a="openAllWeeksToggle">${ic('check-check')} ${t('adminView.btnToggleAll')}</button>
            </div>
          </div>

          <div class="week-admin-grid">
            ${(() => {
              const semStr = D.settings.semesterStartDate || '2026-10-05';
              const [sy, sm, sd] = semStr.split('-').map(Number);
              const startDt = new Date(sy, sm - 1, sd);
              startDt.setHours(0,0,0,0);
              const dict = I18N[S.lang] || I18N.bm;
              const formatShort = (dt) => `${dt.getDate()} ${dict.months[dt.getMonth()].slice(0,3)}`;
              const openWeeksList = (D.settings.openWeeks || '1,2').split(',').map(s => s.trim());
              const curWk = getAcademicWeek(today());
              const is2027Sem = semStr >= '2027-01-01';

              let pillsHtml = '';

              for (let w = 1; w <= 18; w++) {
                // Untuk semester 2026: Midsem Break adalah 21 - 27 Disember (antara W11 dan W12)
                // Untuk semester 2027: Midsem Break adalah 30 Mei - 6 Jun (antara W11 dan W12)
                if (w === 12) {
                  // Paparkan pill Cuti Midsem
                  const isMidsemOpen = D.settings.openBookingMode === 'all' || openWeeksList.includes('midsem');
                  const isCurMidsem = curWk && curWk.isMidsem;
                  const midsemDatesText = is2027Sem 
                    ? `30 ${dict.months[4].slice(0,3)} - 6 ${dict.months[5].slice(0,3)}` 
                    : `21 ${dict.months[11].slice(0,3)} - 27 ${dict.months[11].slice(0,3)}`;
                  pillsHtml += `
                  <button type="button" class="week-admin-pill ${isMidsemOpen ? 'open' : 'closed'} ${isCurMidsem ? 'is-current' : ''}" data-a="toggleWeek" data-w="midsem" style="border-style:dashed;">
                    <span class="week-pill-num">${S.lang === 'eng' ? 'Midsem Break' : 'Cuti Midsem'} ${isCurMidsem ? (S.lang === 'eng' ? '(Current)' : '(Semasa)') : ''}</span>
                    <span class="week-pill-dates">${midsemDatesText}</span>
                    <span class="week-pill-badge">${isMidsemOpen ? (S.lang === 'eng' ? '🟢 Open' : '🟢 Dibuka') : (S.lang === 'eng' ? '🔴 Closed' : '🔴 Ditutup')}</span>
                  </button>`;
                }

                // Hitung tarikh mula dan tamat untuk Week w:
                // Jika w <= 11: offset = (w - 1) * 7 hari dari startDt
                // Jika w >= 12: offset = (w - 1) * 7 + 7 hari (kerana ada 1 minggu cuti midsem)
                const dayOffset = (w <= 11) ? (w - 1) * 7 : (w - 1) * 7 + 7;
                const wStart = new Date(startDt);
                wStart.setDate(startDt.getDate() + dayOffset);
                const wEnd = new Date(wStart);
                wEnd.setDate(wStart.getDate() + 6);

                const dateRangeStr = `${formatShort(wStart)} - ${formatShort(wEnd)}`;
                const isOpen = D.settings.openBookingMode === 'all' || openWeeksList.includes(String(w));
                const isCurrent = curWk && curWk.week === w;

                pillsHtml += `
                <button type="button" class="week-admin-pill ${isOpen ? 'open' : 'closed'} ${isCurrent ? 'is-current' : ''}" data-a="toggleWeek" data-w="${w}">
                  <span class="week-pill-num">${S.lang === 'eng' ? `W${w}` : `M${w}`} ${isCurrent ? (S.lang === 'eng' ? '(Current)' : '(Semasa)') : ''}</span>
                  <span class="week-pill-dates">${dateRangeStr}</span>
                  <span class="week-pill-badge">${isOpen ? (S.lang === 'eng' ? '🟢 Open' : '🟢 Dibuka') : (S.lang === 'eng' ? '🔴 Closed' : '🔴 Ditutup')}</span>
                </button>`;
              }

              return pillsHtml;
            })()}
          </div>
        </div>
      </div>

      <!-- Bahagian Semua Rekod Tempahan dengan Kalendar untuk Memudahkan Admin -->
      <div style="margin-top:36px">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;margin-bottom:16px">
          <div>
            <h4 class="facility-section-title">${t('adminView.allRecords')} (${D.bookings.length})</h4>
            <p class="caption-muted">${t('adminView.recordsSub')}</p>
          </div>
        </div>

        <!-- Kalendar Bulanan untuk Kemudahan Akses Admin -->
        <div style="margin-bottom:20px">
          ${renderBigMonthlyCalendar()}
        </div>

        <!-- Senarai Tempahan mengikut fasiliti dan unit -->
        <div style="margin-top:14px">${browser('admin')}</div>
      </div>
    </div>
  </div>`;
}

/* ---------- Modals ---------- */
function modals() {
  if (S.modal === 'booking-loading') return `
    <div class="clean-modal-backdrop booking-process-backdrop">
      <div class="clean-modal-dialog booking-process-dialog text-center">
        <div class="jsp-loading-avatar-wrap">
          <div class="jsp-loading-ring"></div>
          <img src="/content img/logojspimg.png" alt="Logo JSP" class="jsp-loading-logo">
        </div>
        <h3 class="section-title" style="margin-top:18px;font-size:18px">
          ${S.lang === 'eng' ? 'Processing Your Booking…' : 'Sedang Memproses Tempahan…'}
        </h3>
        <p class="caption-muted" style="margin-top:6px;font-size:13px">
          ${S.lang === 'eng' ? 'Please wait while the system verifies your quota and registers your slot.' : 'Sila tunggu sebentar sementara sistem mengesahkan kuota dan mendaftar slot anda.'}
        </p>
      </div>
    </div>`;

  if (S.modal === 'booking-success') return `
    <div class="clean-modal-backdrop booking-process-backdrop">
      <div class="clean-modal-dialog booking-process-dialog text-center">
        <button class="modal-close-btn" data-a="close" aria-label="Tutup">${ic('x')}</button>
        <div class="booking-success-badge-wrap">
          <div class="booking-success-check-circle">
            ${ic('check')}
          </div>
        </div>
        <h3 class="section-title" style="margin-top:16px;font-size:19px">
          ${t('wizard.step4Title')}
        </h3>
        <div class="booking-success-msg-box" style="margin-top:12px">
          <p class="booking-success-primary-msg">
            ${S.lang === 'eng' ? 'Your booking has been approved!' : 'Tempahan anda telah disahkan dan diluluskan.'}
          </p>
          <p class="caption-muted" style="margin-top:6px;font-size:12.5px">
            ${t('wizard.step4Desc')}
          </p>
        </div>
        <div style="margin-top:20px">
          <button class="btn-primary" data-a="close" style="width:100%;justify-content:center">
            ${S.lang === 'eng' ? 'View Booking Pass / Slip' : 'Lihat Slip Pas Tempahan'}
          </button>
        </div>
      </div>
    </div>`;

  if (S.modal === 'login-loading') return `
    <div class="clean-modal-backdrop booking-process-backdrop">
      <div class="clean-modal-dialog booking-process-dialog text-center">
        <div class="jsp-loading-avatar-wrap">
          <div class="jsp-loading-ring"></div>
          <img src="/content img/logojspimg.png" alt="Logo JSP" class="jsp-loading-logo">
        </div>
        <h3 class="section-title" style="margin-top:18px;font-size:18px">
          ${S.lang === 'eng' ? 'Verifying Admin Access…' : 'Mengesahkan Akses Pentadbir…'}
        </h3>
        <p class="caption-muted" style="margin-top:6px;font-size:13px">
          ${S.lang === 'eng' ? 'Please wait while credentials are being verified.' : 'Sila tunggu sebentar sementara sistem mengesahkan kata laluan admin.'}
        </p>
      </div>
    </div>`;

  if (S.modal === 'login-success') return `
    <div class="clean-modal-backdrop booking-process-backdrop">
      <div class="clean-modal-dialog booking-process-dialog text-center login-success-card">
        <div class="login-success-badge-wrap">
          <div class="login-success-glow-ring">
            ${ic('shield-check')}
          </div>
        </div>
        <div class="login-success-badge-tag">
          ${S.lang === 'eng' ? 'ACCESS GRANTED' : 'PENGESAHAN BERJAYA'}
        </div>
        <h3 class="section-title" style="margin-top:10px;font-size:20px;letter-spacing:-0.02em">
          ${S.lang === 'eng' ? 'Login Successful' : 'Log Masuk Berjaya'}
        </h3>
        <div class="login-success-msg-box" style="margin-top:14px">
          <p class="login-success-sub">
            ${S.lang === 'eng' ? 'Welcome back, JSP Administrator.' : 'Selamat kembali, Pentadbir Sukan JSP.'}
          </p>
          <div class="login-redirecting-indicator" style="margin-top:8px">
            <span class="login-dot-pulse"></span>
            <span class="caption-muted" style="font-size:12px">
              ${S.lang === 'eng' ? 'Entering Admin Control Panel…' : 'Sedang masuk terus ke Panel Admin…'}
            </span>
          </div>
        </div>
      </div>
    </div>`;

  if (S.modal === 'login') return `
    <div class="clean-modal-backdrop">
      <div class="clean-modal-dialog">
        <button class="modal-close-btn" data-a="close" aria-label="Tutup">${ic('x')}</button>
        <div class="modal-icon-badge">${ic('key-round')}</div>
        <h3 class="section-title">${S.lang === 'eng' ? 'JSP Admin Access' : 'Akses Admin JSP'}</h3>
        <p class="caption-muted" style="margin-top:4px">
          ${S.lang === 'eng' ? 'Please enter the admin password to access management controls.' : 'Sila masukkan kata laluan keselamatan admin.'}
        </p>
        <form id="loginForm" class="login-form-wrap">
          <input type="password" name="pw" placeholder="${S.lang === 'eng' ? 'Enter admin password...' : 'Kata laluan admin...'}" autofocus class="minimal-input login-password-input">
          <button class="btn-primary login-submit-btn" type="submit">
            ${S.lang === 'eng' ? 'Log In as Admin' : 'Log Masuk Admin'}
          </button>
        </form>
      </div>
    </div>`;

  if (S.modal === 'sheets') return `
    <div class="clean-modal-backdrop">
      <div class="clean-modal-dialog">
        <button class="modal-close-btn" data-a="close" aria-label="Tutup">${ic('x')}</button>
        <h3 class="section-title">${S.lang === 'eng' ? 'Google Sheets Integration' : 'Integrasi Google Sheets'}</h3>
        <p class="caption-muted">${S.lang === 'eng' ? 'Enter Google Apps Script Web App URL for real-time automatic sheet syncing.' : 'Masukkan Web App URL Apps Script untuk auto-sync rekod.'}</p>
        <div style="margin-top:16px" class="flow-layout" style="--s:14px">
          <input type="text" value="${esc(S.sheetsIn)}" data-s="sheetsIn" placeholder="https://script.google.com/..." class="minimal-input">
          <button class="btn-primary" data-a="saveSheets" style="width:100%">${S.lang === 'eng' ? 'Save URL' : 'Simpan Pautan'}</button>
        </div>
      </div>
    </div>`;

  return '';
}

/* ---------- Render Engine ---------- */
function applyTheme() {
  if (S.theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

function render() {
  applyTheme();
  document.documentElement.lang = S.lang === 'eng' ? 'en' : 'ms';

  if (!S.data) {
    $('#app').innerHTML = `
      <div class="minimal-loader">
        <div class="loader-pulse"></div>
        <div class="caption-muted" style="margin-top:12px">${S.lang === 'eng' ? 'Loading Dewan Temenggong…' : 'Memuatkan Dewan Temenggong…'}</div>
      </div>`;
    return;
  }
  const D = S.data;
  if (S.bgIn === undefined) { S.bgIn = D.settings.bg; S.logoIn = D.settings.logo; }
  if (S.sheetsIn === undefined && D.isAdmin) S.sheetsIn = D.settings.sheetsUrl || '';
  if (S.semStartIn === undefined && D.settings) S.semStartIn = D.settings.semesterStartDate || '2026-10-05';
  if (S.tab === 'admin' && !D.isAdmin) S.tab = 'home';

  const views = { home, 'booking-wizard': wizard, 'student-check': status, 'availability-calendar': calendar, admin };

  $('#app').innerHTML = header() + `
    <main class="main-wrapper">
      ${(views[S.tab] || home)()}
    </main>` + bnav() + modals() + `
    <footer class="clean-footer">
      <div class="footer-centered-wrap">
        ${t('footer')}
      </div>
    </footer>`;

  if (window.lucide) lucide.createIcons();
}

/* ---------- Actions ---------- */
const A = {
  toggleTheme: () => {
    S.theme = S.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dt_theme', S.theme);
    render();
    toast(S.theme === 'dark' ? (S.lang === 'eng' ? 'Dark mode enabled.' : 'Mod gelap diaktifkan.') : (S.lang === 'eng' ? 'Light mode enabled.' : 'Mod cerah diaktifkan.'));
  },
  toggleLang: () => {
    S.lang = S.lang === 'bm' ? 'eng' : 'bm';
    localStorage.setItem('dt_lang', S.lang);
    render();
    toast(S.lang === 'eng' ? 'Switched to English.' : 'Ditukar ke Bahasa Melayu.');
  },
  pastDateNotice: () => {
    toast(t('wizard.datePast'), 'error');
  },
  lockedDateNotice: (d) => {
    toast(S.lang === 'eng' 
      ? (d.week ? `Booking for Week ${d.week} is not open yet. JSP admin will activate it ahead of that week.` : 'Booking for this week is not open yet.')
      : (d.week ? `Tempahan bagi Minggu ${d.week} belum dibuka. Admin JSP akan membuka tempahan menjelang minggu tersebut.` : 'Tempahan bagi minggu ini belum dibuka.'), 'warn');
  },
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
  enterAdmin: async () => {
    S.modal = null;
    S.tab = 'admin';
    render();
    await load();
  },
  logout: () => { 
    S.token = ''; 
    localStorage.removeItem('dt_token'); 
    S.tab = 'home'; 
    toast(S.lang === 'eng' ? 'Logged out successfully.' : 'Log keluar berjaya.'); 
    load(); 
  },
  calDate: (d) => {
    if (S.tab === 'booking-wizard' && d.date < today()) {
      return toast(t('wizard.datePast'), 'error');
    }
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
  async deleteBooking(d) {
    const ref = d.ref;
    const name = d.name || (S.lang === 'eng' ? 'user' : 'pengguna');
    const confirmMsg = S.lang === 'eng' 
      ? `Are you sure you want to delete booking [${ref}] for ${name}? This slot will become available again.` 
      : `Adakah anda pasti mahu memadamkan tempahan [${ref}] untuk ${name}? Slot ini akan dikosongkan semula.`;
    if (!confirm(confirmMsg)) {
      return;
    }
    try {
      await api('admin', { action: 'delete_booking', id: d.id, refNo: ref });
      toast(S.lang === 'eng' ? `Booking [${ref}] has been deleted.` : `Tempahan [${ref}] berjaya dipadamkan.`);
      await load();
    } catch (e) {
      toast(e.message, 'error');
    }
  },
  async submit() {
    const f = S.form;
    if (!f.fullName || !f.fullName.trim()) return toast(S.lang === 'eng' ? 'Please enter your full name.' : 'Sila masukkan nama penuh anda.', 'error');
    
    // Semak format No. Telefon Malaysia
    const rawDigitsPhone = String(f.phoneNo || '').replace(/\D/g, '');
    let normPhone = rawDigitsPhone;
    if (normPhone.startsWith('60')) normPhone = '0' + normPhone.slice(2);
    if (!normPhone || !/^(011\d{8}|014\d{7,8}|01[0236789]\d{7})$/.test(normPhone)) {
      return toast(S.lang === 'eng' 
        ? 'Please enter a valid Malaysian phone number (e.g. 012-3456789 or 011-12345678).' 
        : 'Sila masukkan format nombor telefon Malaysia yang sah (cth: 012-3456789 atau 011-12345678).', 'error');
    }
    const cleanPhone = `${normPhone.slice(0, 3)}-${normPhone.slice(3)}`;

    // Semak No. Matrik (wajib 10 digit nombor dan wajib bermula 202)
    const cleanSid = String(f.studentId || '').replace(/\D/g, '');
    if (!cleanSid || !/^202\d{7}$/.test(cleanSid)) {
      return toast(S.lang === 'eng' 
        ? 'Invalid Student ID. Please enter a 10-digit UiTM Student ID starting with "202" (e.g. 2024694636).' 
        : 'No. Matrik tidak sah. Sila pastikan No. Matrik UiTM mengandungi 10 digit dan bermula dengan "202" (cth: 2024694636).', 'error');
    }
    if (!f.programCode || !f.programCode.trim()) return toast(S.lang === 'eng' ? 'Please enter your program code.' : 'Sila masukkan kod program anda.', 'error');
    if (!f.agreement) {
      return toast(S.lang === 'eng' ? 'Please check the Student Declaration agreement box before submitting.' : 'Sila tandakan kotak Aku Janji Pengesahan Maklumat sebelum menghantar tempahan.', 'error');
    }

    // 1. Tunjuk popup loading dengan animasi logojspimg
    S.modal = 'booking-loading';
    render();

    try {
      const [r] = await Promise.all([
        api('book', { 
          fullName: f.fullName.trim(), 
          phoneNo: cleanPhone, 
          studentId: cleanSid, 
          programCode: f.programCode.trim().toUpperCase(), 
          notes: S.notes, 
          facilityId: S.fac, 
          unitId: S.unit, 
          date: S.date,
          agreement: true 
        }),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
      localStorage.setItem('dt_form', JSON.stringify({ fullName: f.fullName.trim(), phoneNo: cleanPhone, studentId: cleanSid, programCode: f.programCode.trim().toUpperCase() }));
      S.receipt = r.booking;
      S.step = 4;
      S.notes = '';
      
      // 2. Tunjuk popup message (message sama macam yang sedia ada)
      S.modal = 'booking-success';
      toast(S.lang === 'eng' ? 'Your booking has been approved!' : 'Tempahan anda telah disahkan dan diluluskan.');
      render();
      await load();
    } catch (e) { 
      S.modal = null;
      render();
      toast(e.message, 'error'); 
    }
  },
  async toggle() {
    try {
      const r = await api('admin', { action: 'toggle_date', date: S.date });
      const statusWord = S.lang === 'eng' ? (r.closed ? 'closed' : 'open') : (r.closed ? 'ditutup' : 'dibuka');
      toast(S.lang === 'eng' ? `Operation on ${fmt(S.date)} is now ${statusWord}.` : `Operasi tarikh ${fmt(S.date)} kini ${statusWord}.`);
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async toggleWeek(d) {
    try {
      await api('admin', { action: 'toggle_week', week: d.w });
      toast(S.lang === 'eng' ? `Week ${d.w} booking status updated.` : `Status tempahan Minggu ${d.w} dikemaskini.`);
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async openCurrentWeekOnly() {
    const cur = getAcademicWeek(today());
    if (!cur || !cur.week) return toast(S.lang === 'eng' ? 'Current week could not be determined.' : 'Minggu semasa tidak dapat ditentukan.', 'error');
    try {
      await api('admin', { action: 'set_only_week', week: cur.week });
      toast(S.lang === 'eng' ? `Only Week ${cur.week} is now open for booking.` : `Hanya Minggu ${cur.week} dibuka untuk tempahan.`);
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async advanceToNextWeek() {
    const cur = getAcademicWeek(today());
    const openWeeksList = (S.data?.settings?.openWeeks || '1,2').split(',').map(Number).filter(Boolean);
    const maxOpen = openWeeksList.length ? Math.max(...openWeeksList) : (cur?.week || 1);
    const nextWk = Math.min(18, maxOpen + 1);
    try {
      await api('admin', { action: 'set_only_week', week: nextWk });
      toast(S.lang === 'eng' ? `Advanced: Week ${nextWk} is now open for booking.` : `Minggu ${nextWk} kini dibuka untuk tempahan.`);
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async openAllWeeksToggle() {
    try {
      const allWeeks = Array.from({ length: 18 }, (_, i) => i + 1).join(',');
      await api('admin', { action: 'save_settings', openBookingMode: 'all', openWeeks: allWeeks });
      toast(S.lang === 'eng' ? 'All 18 academic weeks are now open for booking.' : 'Semua 18 minggu kini dibuka untuk tempahan.');
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async saveAcademicSettings() {
    try {
      const ssd = S.semStartIn || S.data?.settings?.semesterStartDate;
      await api('admin', { action: 'save_settings', semesterStartDate: ssd });
      toast(S.lang === 'eng' ? 'Semester start date saved.' : 'Tarikh mula semester berjaya disimpan.');
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async saveVisual() {
    try {
      await api('admin', { action: 'save_settings', bg: S.bgIn, logo: S.logoIn });
      toast(S.lang === 'eng' ? 'Visual settings updated.' : 'Visual berjaya dikemaskini.');
      await load();
    } catch (e) { toast(e.message, 'error'); }
  },
  async saveSheets() {
    try {
      await api('admin', { action: 'save_settings', sheetsUrl: S.sheetsIn });
      S.modal = null;
      toast(S.lang === 'eng' ? 'Google Sheets link saved.' : 'Pautan Google Sheets disimpan.');
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
    const csvHeader = S.lang === 'eng' 
      ? 'Ref No,Student Name,Phone No,Student ID,Program Code,Facility,Unit,Date,Time,Pax,Status,Created At\n' 
      : 'No Rujukan,Nama Pelajar,No Telefon,No Matrik,Kod Program,Kemudahan,Unit,Tarikh,Masa,Peserta,Status,Tarikh Dibuat\n';
    const csv = csvHeader + rows.join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `Tempahan_Dewan_Temenggong_${today()}.csv`;
    a.click();
    toast(S.lang === 'eng' ? 'CSV file downloaded.' : 'Fail CSV telah dimuat turun.');
  }
};

/* ---------- Events ---------- */
document.addEventListener('click', (e) => {
  const m = e.target.closest('.clean-modal-backdrop');
  if (m && e.target === m) { 
    if (S.modal === 'booking-loading' || S.modal === 'login-loading') return;
    if (S.modal === 'login-success') {
      S.modal = null;
      return render();
    }
    S.modal = null; 
    return render(); 
  }
  const el = e.target.closest('[data-a]');
  if (el && A[el.dataset.a]) A[el.dataset.a](el.dataset);
});

document.addEventListener('change', (e) => {
  const { f, s } = e.target.dataset;
  if (f === 'agreement') {
    S.form.agreement = e.target.checked;
    return;
  }
  const d = e.target.dataset.d;
  if (d === 'sel') {
    S.date = e.target.value;
    const [y, m] = S.date.split('-').map(Number);
    S.calYear = y;
    S.calMonth = m - 1;
    return render();
  }
  if (d === 'view') {
    S.view[e.target.dataset.k] = e.target.value;
    return render();
  }
  if (s) {
    S[s] = e.target.value;
  }
});

let st;
document.addEventListener('input', (e) => {
  const { f, s } = e.target.dataset;
  if (f === 'studentId') {
    e.target.value = formatStudentMatric(e.target.value);
    S.form[f] = e.target.value;
    const hintEl = document.getElementById('studentIdStatus');
    if (hintEl) {
      hintEl.innerHTML = renderStudentIdHint(e.target.value);
    }
    if (e.target.value.length === 10 && e.target.value.startsWith('202')) {
      e.target.classList.add('input-valid');
    } else {
      e.target.classList.remove('input-valid');
    }
  }
  else if (f === 'phoneNo') {
    e.target.value = formatMyPhone(e.target.value);
    S.form[f] = e.target.value;
  }
  else if (f === 'programCode') {
    e.target.value = e.target.value.toUpperCase();
    S.form[f] = e.target.value;
  }
  else if (f === 'agreement') {
    S.form[f] = e.target.checked;
  }
  else if (f) S.form[f] = e.target.value;
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
  const pw = e.target.pw ? e.target.pw.value : '';
  if (!pw) {
    return toast(S.lang === 'eng' ? 'Please enter the admin password.' : 'Sila masukkan kata laluan admin.', 'error');
  }

  // 1. Tunjuk popup loading dengan logo JSP berputar
  S.modal = 'login-loading';
  render();

  try {
    const [r] = await Promise.all([
      api('admin', { action: 'login', password: pw }),
      new Promise(resolve => setTimeout(resolve, 850))
    ]);
    S.token = r.token;
    localStorage.setItem('dt_token', r.token);

    // Muat turun state terkini dengan token baru (supaya S.data.isAdmin = true)
    S.data = await api('state');

    // 2. Set tab terus ke admin dan tunjuk popup login-success secara aesthetic
    S.tab = 'admin';
    S.modal = 'login-success';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast(S.lang === 'eng' ? 'Login successful! Welcome back.' : 'Log masuk berjaya! Selamat kembali.');

    // 3. Tutup modal secara lancar dan dedahkan panel admin
    setTimeout(() => {
      if (S.modal === 'login-success') {
        S.modal = null;
        render();
      }
    }, 850);

  } catch (err) {
    S.modal = 'login';
    render();
    toast(err.message, 'error');
  }
});

// Live Clock Ticker
setInterval(() => {
  const timeEl = document.getElementById('liveClockTime');
  const dateEl = document.getElementById('liveClockDate');
  if (timeEl) timeEl.textContent = getClockTime();
  if (dateEl) dateEl.textContent = getClockDate();
}, 1000);

load();
