-- Pilihan: jadual ini dicipta automatik oleh API. Jalankan sendiri jika mahu: turso db shell <nama-db> < schema.sql
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY, ref_no TEXT NOT NULL, user_name TEXT NOT NULL, phone_no TEXT NOT NULL,
  student_id TEXT NOT NULL, program_code TEXT NOT NULL, facility_id TEXT NOT NULL, facility_name TEXT NOT NULL,
  unit_id TEXT NOT NULL, unit_name TEXT NOT NULL, date TEXT NOT NULL, start_time TEXT NOT NULL, end_time TEXT NOT NULL,
  participants_count INTEGER DEFAULT 1, notes TEXT DEFAULT '', status TEXT DEFAULT 'Diluluskan', created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bk_date ON bookings(date, unit_id);
CREATE TABLE IF NOT EXISTS closed_dates (date TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
