import { db, wrap, fail, isAdmin, signToken } from './_lib.js';

const upsert = (k, v) => db.execute({ sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', args: [k, v] });
const okUrl = (v) => v === '' || /^https?:\/\/[^\s'")(]+$/i.test(v);

export default wrap(async (req, res) => {
  if (req.method !== 'POST') fail(405, 'Kaedah tidak dibenarkan.');
  const { action, ...p } = req.body || {};

  if (action === 'login') {
    if (!process.env.ADMIN_PASSWORD) fail(500, 'ADMIN_PASSWORD belum ditetapkan pada pelayan.');
    if (p.password !== process.env.ADMIN_PASSWORD) fail(401, 'Kata Laluan Admin tidak sah.');
    return res.json({ token: signToken() });
  }
  if (!isAdmin(req)) fail(401, 'Sesi admin tamat. Sila log masuk semula.');

  if (action === 'toggle_date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || '')) fail(400, 'Tarikh tidak sah.');
    const ex = await db.execute({ sql: 'SELECT 1 FROM closed_dates WHERE date = ?', args: [p.date] });
    if (ex.rows.length) { await db.execute({ sql: 'DELETE FROM closed_dates WHERE date = ?', args: [p.date] }); return res.json({ closed: false }); }
    await db.execute({ sql: 'INSERT INTO closed_dates (date) VALUES (?)', args: [p.date] });
    return res.json({ closed: true });
  }
  if (action === 'save_settings') {
    if (p.semesterStartDate !== undefined) {
      const ssd = String(p.semesterStartDate).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ssd)) fail(400, 'Tarikh mula semester tidak sah.');
      await upsert('semesterStartDate', ssd);
    }
    if (p.openBookingMode !== undefined) {
      await upsert('openBookingMode', String(p.openBookingMode).trim());
    }
    if (p.openWeeks !== undefined) {
      await upsert('openWeeks', String(p.openWeeks).trim());
    }
    for (const k of ['bg', 'logo', 'sheetsUrl']) {
      if (p[k] === undefined) continue;
      const v = String(p[k]).trim();
      if (!okUrl(v)) fail(400, 'Pautan tidak sah. Gunakan URL bermula https://');
      await upsert(k, v);
    }
    return res.json({ ok: true });
  }
  if (action === 'toggle_week') {
    const weekNum = parseInt(p.week, 10);
    if (!weekNum || weekNum < 1 || weekNum > 20) fail(400, 'Nombor minggu kuliah tidak sah.');
    const curr = await db.execute("SELECT value FROM settings WHERE key = 'openWeeks'");
    let weeks = (curr.rows[0]?.value || '1,2').split(',').map(s => s.trim()).filter(Boolean);
    const wStr = String(weekNum);
    if (weeks.includes(wStr)) {
      weeks = weeks.filter(w => w !== wStr);
    } else {
      weeks.push(wStr);
      weeks.sort((a, b) => Number(a) - Number(b));
    }
    const newStr = weeks.join(',');
    await upsert('openWeeks', newStr);
    await upsert('openBookingMode', 'week_control');
    return res.json({ ok: true, openWeeks: newStr });
  }
  if (action === 'set_only_week') {
    const weekNum = parseInt(p.week, 10);
    if (!weekNum || weekNum < 1 || weekNum > 20) fail(400, 'Nombor minggu kuliah tidak sah.');
    await upsert('openWeeks', String(weekNum));
    await upsert('openBookingMode', 'week_control');
    return res.json({ ok: true, openWeeks: String(weekNum) });
  }
  if (action === 'delete_booking') {
    if (!p.id && !p.refNo) fail(400, 'ID atau No. Rujukan tempahan diperlukan.');
    if (p.id) {
      await db.execute({ sql: 'DELETE FROM bookings WHERE id = ?', args: [p.id] });
    } else {
      await db.execute({ sql: 'DELETE FROM bookings WHERE ref_no = ?', args: [p.refNo] });
    }
    return res.json({ ok: true, deleted: true });
  }
  fail(400, 'Tindakan tidak sah.');
});
