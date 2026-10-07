import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const base = '/pressguide/';
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json',
};
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    );
    if (!pathname.startsWith(base)) {
      response.writeHead(404).end();
      return;
    }
    const relative = pathname.slice(base.length);
    const path = resolve(
      root,
      relative.endsWith('/')
        ? `${relative}index.html`
        : relative || 'index.html',
    );
    if (!path.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const content = await readFile(path);
    response
      .writeHead(200, {
        'Content-Type': types[extname(path)] || 'application/octet-stream',
      })
      .end(content);
  } catch {
    response.writeHead(404).end();
  }
}).listen(47321, '127.0.0.1');
