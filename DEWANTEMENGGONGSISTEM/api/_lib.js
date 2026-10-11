import { createClient } from '@libsql/client';
import crypto from 'node:crypto';

export const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

export const FACILITIES = [
  { id: 'fac-badminton', name: 'Gelanggang Badminton', type: 'badminton', maxCapacity: 10,
    description: 'Gelanggang badminton berkualiti tinggi. Had 10 orang setiap gelanggang.',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    units: [{ id: 'b-lining', name: 'Gelanggang Li-Ning (Court 1)' }, { id: 'b-yonex', name: 'Gelanggang Yonex (Court 2)' }] },
  { id: 'fac-pingpong', name: 'Meja Ping Pong', type: 'pingpong', maxCapacity: 6,
    description: 'Meja pingpong standard kejohanan.',
    image: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&q=80&w=600',
    units: [{ id: 'p-datonaning', name: "Meja Dato' Naning (Meja 1)" }, { id: 'p-dolsaid', name: 'Meja Dol Said (Meja 2)' }, { id: 'p-hangnadim', name: 'Meja Hang Nadim (Meja 3)' }] }
];

// Isnin & Jumaat (5:00 PM - 7:00 PM), Rabu (8:00 PM - 10:00 PM)
export const SCHEDULE = {
  1: { dayName: 'Isnin', timeDisplay: '5:00 PM - 7:00 PM', slots: [{ start: '5:00 PM', end: '7:00 PM' }] },
  3: { dayName: 'Rabu', timeDisplay: '8:00 PM - 10:00 PM', slots: [{ start: '8:00 PM', end: '10:00 PM' }] },
  5: { dayName: 'Jumaat', timeDisplay: '5:00 PM - 7:00 PM', slots: [{ start: '5:00 PM', end: '7:00 PM' }] }
};
export const DEFAULTS = {
  bg: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=1600',
  logo: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&q=80&w=200'
};

export const sched = (d) => { const [y, m, x] = d.split('-').map(Number); return SCHEDULE[new Date(y, m - 1, x).getDay()] || null; };

let ready;
export const init = () => (ready ??= db.batch([
  `CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, ref_no TEXT NOT NULL, user_name TEXT NOT NULL, phone_no TEXT NOT NULL, student_id TEXT NOT NULL, program_code TEXT NOT NULL, facility_id TEXT NOT NULL, facility_name TEXT NOT NULL, unit_id TEXT NOT NULL, unit_name TEXT NOT NULL, date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL, participants_count INTEGER DEFAULT 1, notes TEXT DEFAULT '', status TEXT DEFAULT 'Diluluskan', created_at TEXT NOT NULL)`,
  'CREATE INDEX IF NOT EXISTS idx_bk_date ON bookings(date, unit_id)',
  'CREATE TABLE IF NOT EXISTS closed_dates (date TEXT PRIMARY KEY)',
  'CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)'
], 'write'));

export const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
export const wrap = (fn) => async (req, res) => {
  try { await init(); await fn(req, res); }
  catch (e) { if (!e.status) console.error(e); res.status(e.status || 500).json({ error: e.status ? e.message : 'Ralat pelayan. Cuba lagi.' }); }
};

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || '';
const sign = (p) => crypto.createHmac('sha256', secret()).update(p).digest('base64url');
export const signToken = () => { const p = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 3600e3 })).toString('base64url'); return `${p}.${sign(p)}`; };
export const isAdmin = (req) => {
  const [p, sig] = (req.headers.authorization || '').replace('Bearer ', '').split('.');
  if (!p || !sig || !secret()) return false;
  const ok = sign(p);
  if (sig.length !== ok.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(ok))) return false;
  try { return JSON.parse(Buffer.from(p, 'base64url').toString()).exp > Date.now(); } catch { return false; }
};

// Pelajar biasa hanya nampak data disamarkan. Admin nampak penuh.
export const toBooking = (r, admin) => ({
  id: r.id, refNo: r.ref_no,
  userName: admin ? r.user_name : `${r.user_name.slice(0, 3)}*** *** (Sulit)`,
  studentId: admin ? r.student_id : `${r.student_id.slice(0, 4)}****`,
  ...(admin ? { phoneNo: r.phone_no, programCode: r.program_code, notes: r.notes } : {}),
  facilityId: r.facility_id, facilityName: r.facility_name, unitId: r.unit_id, unitName: r.unit_name,
  date: r.date, startTime: r.start_time, endTime: r.end_time, participantsCount: 1, status: r.status, createdAt: r.created_at
});
