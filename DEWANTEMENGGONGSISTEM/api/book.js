import { db, wrap, fail, FACILITIES, sched, toBooking, getWeekRange, getAcademicWeek } from './_lib.js';

export default wrap(async (req, res) => {
  if (req.method !== 'POST') fail(405, 'Kaedah tidak dibenarkan.');
  const b = req.body || {};
  const t = (k, max = 120) => String(b[k] ?? '').trim().slice(0, max);
  if (!t('fullName')) fail(400, 'Sila masukkan Nama Penuh anda!');
  if (!t('phoneNo', 30)) fail(400, 'Sila masukkan No. Telefon / WhatsApp anda!');
  if (!t('studentId', 30)) fail(400, 'Sila masukkan No. Matrik anda!');
  if (!t('programCode', 30)) fail(400, 'Sila masukkan Kod Program anda!');

  // Pengesahan No. Telefon - format nombor telefon Malaysia
  const rawPhone = t('phoneNo', 30).replace(/\D/g, '');
  let normPhone = rawPhone;
  if (normPhone.startsWith('60')) normPhone = '0' + normPhone.slice(2);
  if (!/^(011\d{8}|014\d{7,8}|01[0236789]\d{7})$/.test(normPhone)) {
    fail(400, 'Format nombor telefon tidak sah. Sila masukkan nombor telefon Malaysia yang sah (cth: 012-3456789 atau 011-12345678).');
  }
  const formattedPhone = `${normPhone.slice(0, 3)}-${normPhone.slice(3)}`;

  // Pengesahan No. Matrik - ketetapan nombor 10 digit dan wajib bermula 202 (cth: 2024694636)
  const rawSid = t('studentId', 30).replace(/\D/g, '');
  if (!/^202\d{7}$/.test(rawSid)) {
    fail(400, 'No. Matrik tidak sah. Sila pastikan No. Matrik UiTM mengandungi 10 digit dan bermula dengan "202" (cth: 2024694636).');
  }

  // Pengesahan Aku Janji & Integriti
  if (!b.agreement) {
    fail(400, 'Sila tandakan kotak Aku Janji Pengesahan Maklumat sebelum menghantar tempahan.');
  }

  const fac = FACILITIES.find(f => f.id === b.facilityId);
  const unit = fac?.units.find(u => u.id === b.unitId);
  if (!unit) fail(400, 'Kemudahan atau unit tidak sah.');
  const date = t('date', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(400, 'Tarikh tidak sah.');
  
  const todayStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kuala_Lumpur' }).slice(0, 10);
  if (date < todayStr) fail(400, 'Tarikh yang dipilih telah lepas. Sila pilih tarikh hari ini atau tarikh akan datang.');

  const sc = sched(date);
  if (!sc) fail(400, 'Dewan hanya dibuka pada hari Isnin, Rabu dan Jumaat.');
  const closed = await db.execute({ sql: 'SELECT 1 FROM closed_dates WHERE date = ?', args: [date] });
  if (closed.rows.length) fail(400, 'Dewan ditutup pada tarikh ini. Sila pilih tarikh lain.');

  // Semak kawalan minggu (Admin open/off week control)
  const setRows = await db.execute("SELECT key, value FROM settings WHERE key IN ('semesterStartDate', 'openBookingMode', 'openWeeks')");
  const sMap = Object.fromEntries(setRows.rows.map(r => [r.key, r.value]));
  const semStart = sMap.semesterStartDate || '2026-10-05';
  const mode = sMap.openBookingMode || 'week_control';
  const openWeeks = (sMap.openWeeks || '1,2').split(',').map(s => s.trim()).filter(Boolean);

  const targetWeek = getAcademicWeek(date, semStart);
  if (targetWeek?.isMidsem) {
    if (!openWeeks.includes('midsem')) {
      fail(400, 'Dewan ditutup sempena Cuti Pertengahan Semester (21 - 27 Disember).');
    }
  } else if (targetWeek?.isPost) {
    fail(400, 'Tempoh sesi semester telah tamat.');
  } else if (mode === 'week_control' && targetWeek && targetWeek.week > 0) {
    if (!openWeeks.includes(String(targetWeek.week))) {
      fail(400, `Tempahan bagi Minggu ${targetWeek.week} belum dibuka oleh pihak pentadbiran JSP. Tempahan akan diaktifkan oleh admin menjelang minggu berkenaan.`);
    }
  } else if (mode === 'current_week') {
    const curWeek = getAcademicWeek(todayStr, semStart);
    if (targetWeek && curWeek && targetWeek.week !== curWeek.week) {
      fail(400, `Hanya tempahan untuk minggu semasa (Minggu ${curWeek.week}) dibuka.`);
    }
  } else if (mode === 'rolling_2days') {
    const [ty, tm, td] = todayStr.split('-').map(Number);
    const [by, bm, bd] = date.split('-').map(Number);
    const diffDays = Math.floor((new Date(by, bm - 1, bd) - new Date(ty, tm - 1, td)) / (86400000));
    if (diffDays > 2) {
      fail(400, 'Tempahan hanya dibuka 2 hari sebelum tarikh sesi dewan.');
    }
  }

  const sid = rawSid, phone = formattedPhone, slot = sc.slots[0];

  // Had 1 tempahan SEMINGGU bagi setiap No. Matrik / No. Telefon
  const { start: weekStart, end: weekEnd } = getWeekRange(date);
  const dup = await db.execute({
    sql: "SELECT ref_no, date, facility_name, unit_name FROM bookings WHERE date >= ? AND date <= ? AND status = 'Diluluskan' AND (student_id = ? OR phone_no = ? OR phone_no = ?) LIMIT 1",
    args: [weekStart, weekEnd, sid, formattedPhone, normPhone]
  });
  if (dup.rows.length) {
    fail(409, `Harap maaf! No. Matrik (${sid}) atau No. Telefon ini telah mempunyai tempahan bagi minggu tersebut pada tarikh ${dup.rows[0].date} (Rujukan: ${dup.rows[0].ref_no}). Sistem mengehadkan 1 tempahan setiap minggu bagi setiap pelajar untuk memberi peluang kepada pelajar lain.`);
  }

  // Had kapasiti setiap unit
  const cnt = await db.execute({
    sql: "SELECT COUNT(*) AS c FROM bookings WHERE unit_id = ? AND date = ? AND start_time = ? AND status = 'Diluluskan'",
    args: [unit.id, date, slot.start]
  });
  if (Number(cnt.rows[0].c) >= fac.maxCapacity) fail(409, `Kapasiti slot (${unit.name}) sudah penuh! Had maksimum ${fac.maxCapacity} orang telah dicapai.`);

  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kuala_Lumpur' }).slice(0, 16);
  const row = {
    id: `bk-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    ref_no: `DT-${date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    user_name: t('fullName'), phone_no: phone, student_id: sid, program_code: t('programCode', 30).toUpperCase(),
    facility_id: fac.id, facility_name: fac.name, unit_id: unit.id, unit_name: unit.name,
    date, start_time: slot.start, end_time: slot.end, notes: t('notes', 300), status: 'Diluluskan', created_at: now
  };
  const cols = Object.keys(row);
  await db.execute({ sql: `INSERT INTO bookings (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, args: Object.values(row) });

  const booking = toBooking(row, true);
  // Sync ke Google Sheets (pilihan)
  const sh = await db.execute("SELECT value FROM settings WHERE key = 'sheetsUrl'");
  const url = sh.rows[0]?.value;
  if (url) await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(booking) }).catch(() => {});
  res.json({ booking });
});
