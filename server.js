const esbuild = require('esbuild');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.wasm': 'application/wasm',
};

async function start() {
  // Ensure the public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Copy HTML files to the public directory
  if (fs.existsSync('index.html')) {
    fs.copyFileSync('index.html', path.join(PUBLIC_DIR, 'index.html'));
  }
  if (fs.existsSync('workertest.html')) {
    fs.copyFileSync('workertest.html', path.join(PUBLIC_DIR, 'workertest.html'));
  }

  // Setup ESBuild contexts for watch mode
  const mainCtx = await esbuild.context({
    entryPoints: ['game/index.ts'],
    bundle: true,
    outfile: 'public/index.js',
    sourcemap: true,
    target: 'es2024'
  });

  const workerCtx = await esbuild.context({
    entryPoints: ['worker.ts'],
    bundle: true,
    outfile: 'public/worker.js',
    sourcemap: true,
    target: 'es2024'
  });

  const workerTestCtx = await esbuild.context({
    entryPoints: ['workertest.ts'],
    bundle: true,
    outfile: 'public/workertest.js',
    sourcemap: true,
    target: 'es2024'
  });

  await mainCtx.watch();
  await workerCtx.watch();
  await workerTestCtx.watch();
  console.log('esbuild is watching for changes...');

  // Create an HTTP server
  const server = http.createServer((req, res) => {
    let urlPath = req.url === '/' ? '/workertest.html' : req.url;
    let filePath = path.join(PUBLIC_DIR, urlPath);

    // Provide a fallback to root for HTML files during development
    if (!fs.existsSync(filePath) && urlPath.endsWith('.html')) {
      const rootPath = path.join(__dirname, urlPath);
      if (fs.existsSync(rootPath)) {
        filePath = rootPath;
      }
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500);
        res.end(err.code === 'ENOENT' ? '404 Not Found' : `Server Error: ${err.code}`);
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          // Required headers for SharedArrayBuffer
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp'
        });
        res.end(content, 'utf-8');
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}/`);
  });
}

start().catch(console.error);