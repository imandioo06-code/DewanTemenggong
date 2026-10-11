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
    for (const k of ['bg', 'logo', 'sheetsUrl']) {
      if (p[k] === undefined) continue;
      const v = String(p[k]).trim();
      if (!okUrl(v)) fail(400, 'Pautan tidak sah. Gunakan URL bermula https://');
      await upsert(k, v);
    }
    return res.json({ ok: true });
  }
  fail(400, 'Tindakan tidak sah.');
});
