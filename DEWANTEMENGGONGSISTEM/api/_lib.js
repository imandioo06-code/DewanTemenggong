import { createClient } from '@libsql/client';
import crypto from 'node:crypto';

let _db;
export const getDb = () => {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) {
      const err = new Error('TURSO_DATABASE_URL tidak ditetapkan dalam Vercel Environment Variables. Sila tetapkan TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN di Dashboard Vercel.');
      err.status = 500;
      throw err;
    }
    _db = createClient({ url, authToken });
  }
  return _db;
};

export const db = {
  execute: (...args) => getDb().execute(...args),
  batch: (...args) => getDb().batch(...args),
  transaction: (...args) => getDb().transaction(...args)
};

export const FACILITIES = [
  { id: 'fac-badminton', name: 'Gelanggang Badminton', type: 'badminton', maxCapacity: 16,
    description: 'Gelanggang badminton berkualiti tinggi.',
    image: '/content img/court.jpeg',
    units: [{ id: 'b-lining', name: 'Gelanggang Li-Ning (Court 1)' }, { id: 'b-yonex', name: 'Gelanggang Yonex (Court 2)' }] },
  { id: 'fac-pingpong', name: 'Meja Ping Pong', type: 'pingpong', maxCapacity: 6,
    description: 'Meja pingpong standard kejohanan.',
    image: '/content img/meja.jpeg',
    units: [{ id: 'p-datonaning', name: "Meja Dato' Naning (Meja 1)" }, { id: 'p-dolsaid', name: 'Meja Dol Said (Meja 2)' }, { id: 'p-hangnadim', name: 'Meja Hang Nadim (Meja 3)' }] }
];

// Isnin & Jumaat (5:00 PM - 7:00 PM), Rabu (8:00 PM - 10:00 PM)
export const SCHEDULE = {
  1: { dayName: 'Isnin', timeDisplay: '5:00 PM - 7:00 PM', slots: [{ start: '5:00 PM', end: '7:00 PM' }] },
  3: { dayName: 'Rabu', timeDisplay: '8:00 PM - 10:00 PM', slots: [{ start: '8:00 PM', end: '10:00 PM' }] },
  5: { dayName: 'Jumaat', timeDisplay: '5:00 PM - 7:00 PM', slots: [{ start: '5:00 PM', end: '7:00 PM' }] }
};
export const DEFAULTS = {
  bg: '/content img/backgrounddt.jpeg',
  logo: '/content img/logojspimg.png',
  semesterStartDate: '2026-10-05',
  openBookingMode: 'week_control',
  openWeeks: '1,2'
};

export const sched = (d) => { const [y, m, x] = d.split('-').map(Number); return SCHEDULE[new Date(y, m - 1, x).getDay()] || null; };

export const getWeekRange = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(dt);
  mon.setDate(dt.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const toIso = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  return { start: toIso(mon), end: toIso(sun) };
};

export const getAcademicWeek = (dateStr, semStartDate = '2026-10-05') => {
  if (!dateStr) return null;

  // Sesi Semester Baharu: 15 Mac 2027 hingga 25 Julai 2027
  // Antara 15 Feb 2027 hingga 14 Mac 2027 adalah Semester Break
  if (dateStr >= '2027-03-15') {
    const [sy, sm, sd] = [2027, 3, 15];
    const [dy, dm, dd] = dateStr.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    start.setHours(0, 0, 0, 0);
    const current = new Date(dy, dm - 1, dd);
    current.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Cuti Pertengahan Semester Baru: 30 Mei 2027 hingga 6 Jun 2027
    if (dateStr >= '2027-05-30' && dateStr <= '2027-06-06') {
      return {
        week: 0,
        isMidsem: true,
        isBreak: true,
        label: 'Cuti Midsem',
        labelEng: 'Midsem Break'
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
        label: 'Cuti Semester',
        labelEng: 'Semester Break'
      };
    }

    return {
      week: weekNum,
      isPre: false,
      label: `Minggu ${weekNum}`,
      labelEng: `Week ${weekNum}`
    };
  }

  // Sesi Semester Semasa (Mula 5 Okt 2026 sehingga 14 Feb 2027)
  const [sy, sm, sd] = semStartDate.split('-').map(Number);
  const [dy, dm, dd] = dateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  start.setHours(0, 0, 0, 0);
  const current = new Date(dy, dm - 1, dd);
  current.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { week: 0, isPre: true, label: 'Pra-Semester', labelEng: 'Pre-Semester' };
  
  // Cuti Pertengahan Semester 2026: 21 - 27 Disember 2026
  if (dateStr >= '2026-12-21' && dateStr <= '2026-12-27') {
    return {
      week: 0,
      isMidsem: true,
      isBreak: true,
      label: 'Cuti Midsem',
      labelEng: 'Midsem Break'
    };
  }

  // Jika tarikh selepas 27 Disember 2026, tolak 7 hari cuti midsem
  const adjustedDays = (dateStr > '2026-12-27') ? (diffDays - 7) : diffDays;
  const weekNum = Math.floor(adjustedDays / 7) + 1;

  if (weekNum > 18 || dateStr > '2027-02-14') {
    return {
      week: weekNum,
      isPost: true,
      isBreak: true,
      label: 'Cuti Semester',
      labelEng: 'Semester Break'
    };
  }

  return {
    week: weekNum,
    isPre: false,
    label: `Minggu ${weekNum}`,
    labelEng: `Week ${weekNum}`
  };
};

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
