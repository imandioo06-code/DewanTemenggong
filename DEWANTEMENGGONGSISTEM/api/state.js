import { db, wrap, isAdmin, toBooking, FACILITIES, SCHEDULE, DEFAULTS } from './_lib.js';

export default wrap(async (req, res) => {
  const adm = isAdmin(req);
  const [b, c, s] = await Promise.all([
    db.execute('SELECT * FROM bookings ORDER BY created_at DESC, id DESC'),
    db.execute('SELECT date FROM closed_dates'),
    db.execute('SELECT key, value FROM settings')
  ]);
  const set = Object.fromEntries(s.rows.map(r => [r.key, r.value]));
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    isAdmin: adm, facilities: FACILITIES, schedule: SCHEDULE,
    closedDates: c.rows.map(r => r.date),
    settings: { bg: set.bg || DEFAULTS.bg, logo: set.logo || DEFAULTS.logo, ...(adm ? { sheetsUrl: set.sheetsUrl || '' } : {}) },
    bookings: b.rows.map(r => toBooking(r, adm))
  });
});
