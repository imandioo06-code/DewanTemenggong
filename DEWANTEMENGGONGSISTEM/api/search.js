import { db, wrap, isAdmin, toBooking } from './_lib.js';

export default wrap(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 60);
  if (!q) return res.json({ bookings: [] });
  const like = `%${q.replace(/[%_]/g, '')}%`;
  const r = await db.execute({
    sql: 'SELECT * FROM bookings WHERE student_id LIKE ? OR ref_no LIKE ? OR user_name LIKE ? ORDER BY date DESC, created_at DESC LIMIT 200',
    args: [like, like, like]
  });
  const adm = isAdmin(req);
  res.setHeader('Cache-Control', 'no-store');
  res.json({ bookings: r.rows.map(x => toBooking(x, adm)) });
});
