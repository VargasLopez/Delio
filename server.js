/**
 * Zero-dependency Lightweight Local HTTP Server for Delio PWA
 * Compatible with Node.js v16+
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  console.log(`[Server] ${req.method} ${req.url}`);

  // Resolve requested file path
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Clean hash queries from routing (e.g. /#/chats -> /index.html)
  if (filePath.includes('#') || filePath.includes('?')) {
    filePath = filePath.split(/[?#]/)[0];
  }

  // Resolve absolute path in workspace
  let absolutePath = path.join(__dirname, filePath);

  // Helper function to read and serve the file once resolved
  const serveFile = (pathTarget) => {
    fs.readFile(pathTarget, (error, content) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${error.code}`);
        return;
      }

      const ext = path.extname(pathTarget).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 
        'Content-Type': contentType,
        'Service-Worker-Allowed': '/'
      });
      res.end(content, 'utf-8');
    });
  };

  // Attempt to resolve file path
  fs.access(absolutePath, fs.constants.F_OK, (err) => {
    if (!err) {
      serveFile(absolutePath);
      return;
    }

    // If not found in root, try the public directory (matches Vite behavior)
    const publicPath = path.join(__dirname, 'public', filePath);
    fs.access(publicPath, fs.constants.F_OK, (pubErr) => {
      if (!pubErr) {
        serveFile(publicPath);
        return;
      }

      // If not found, try appending '.js' (supports bare ES module relative imports)
      const jsPath = absolutePath + '.js';
      fs.access(jsPath, fs.constants.F_OK, (jsErr) => {
        if (!jsErr) {
          serveFile(jsPath);
          return;
        }

        // If still not found and the path has no file extension, serve index.html (SPA fallback)
        const extName = path.extname(absolutePath);
        if (!extName) {
          const indexFallback = path.join(__dirname, 'index.html');
          serveFile(indexFallback);
          return;
        }

        // True 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not Found: ${filePath}`);
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`⚡ Delio PWA Local Server running on Node.js ${process.version}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
