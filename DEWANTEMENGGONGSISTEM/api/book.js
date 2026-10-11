import { db, wrap, fail, FACILITIES, sched, toBooking } from './_lib.js';

export default wrap(async (req, res) => {
  if (req.method !== 'POST') fail(405, 'Kaedah tidak dibenarkan.');
  const b = req.body || {};
  const t = (k, max = 120) => String(b[k] ?? '').trim().slice(0, max);
  if (!t('fullName')) fail(400, 'Sila masukkan Nama Penuh anda!');
  if (!t('phoneNo', 30)) fail(400, 'Sila masukkan No. Telefon / WhatsApp anda!');
  if (!t('studentId', 30)) fail(400, 'Sila masukkan No. Matrik anda!');
  if (!t('programCode', 30)) fail(400, 'Sila masukkan Kod Program anda!');

  const fac = FACILITIES.find(f => f.id === b.facilityId);
  const unit = fac?.units.find(u => u.id === b.unitId);
  if (!unit) fail(400, 'Kemudahan atau unit tidak sah.');
  const date = t('date', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(400, 'Tarikh tidak sah.');
  const sc = sched(date);
  if (!sc) fail(400, 'Dewan hanya dibuka pada hari Isnin, Rabu dan Jumaat.');
  const closed = await db.execute({ sql: 'SELECT 1 FROM closed_dates WHERE date = ?', args: [date] });
  if (closed.rows.length) fail(400, 'Dewan ditutup pada tarikh ini. Sila pilih tarikh lain.');

  const sid = t('studentId', 30).toUpperCase(), phone = t('phoneNo', 30), slot = sc.slots[0];

  // Had 1 tempahan sehari bagi setiap No. Matrik / No. Telefon
  const dup = await db.execute({
    sql: "SELECT ref_no FROM bookings WHERE date = ? AND status = 'Diluluskan' AND (student_id = ? OR phone_no = ?) LIMIT 1",
    args: [date, sid, phone]
  });
  if (dup.rows.length) fail(409, `Harap maaf! No. Matrik (${sid}) atau No. Telefon ini telah mempunyai tempahan pada tarikh tersebut (Rujukan: ${dup.rows[0].ref_no}). Sistem hanya membenarkan 1 tempahan sehari per pelajar. Anda boleh memilih tarikh lain.`);

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
