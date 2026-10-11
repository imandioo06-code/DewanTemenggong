import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

// Fallbacks
process.env.TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || 'file:local.db';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
process.env.ADMIN_SECRET = process.env.ADMIN_SECRET || 'dewan-temenggong-local-secret';

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const apiRoutes = {
  '/api/state': (await import('./api/state.js')).default,
  '/api/book': (await import('./api/book.js')).default,
  '/api/admin': (await import('./api/admin.js')).default,
  '/api/search': (await import('./api/search.js')).default,
};

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  // Match API routes
  if (apiRoutes[pathname]) {
    // Enhance res with Express/Vercel-like methods
    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
    res.json = function (obj) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      this.end(JSON.stringify(obj));
      return this;
    };

    // Query parameters
    req.query = Object.fromEntries(reqUrl.searchParams.entries());

    // Body parsing
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
    });

    req.on('end', async () => {
      if (rawBody && req.headers['content-type']?.includes('application/json')) {
        try {
          req.body = JSON.parse(rawBody);
        } catch {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      try {
        await apiRoutes[pathname](req, res);
      } catch (err) {
        console.error('API Error:', err);
        if (!res.writableEnded) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ralat dalaman pelayan.' }));
        }
      }
    });
    return;
  }

  // Static file serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Prevent path traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Akses tidak dibenarkan');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Fail tidak dijumpai (404)');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server Dewan Temenggong sedang berjalan di: http://localhost:${PORT}`);
  console.log(`Kata laluan admin default: ${process.env.ADMIN_PASSWORD}`);
});
