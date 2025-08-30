// Minimal Node/Express server to serve static files and inject runtime config
// Allows overriding API endpoints via environment variables at container/deploy time

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Runtime config from env
const config = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.kolosal.ai',
  DOCLING_BASE_URL: process.env.DOCLING_BASE_URL || process.env.API_BASE_URL || 'https://api.kolosal.ai',
  MARKITDOWN_BASE_URL: process.env.MARKITDOWN_BASE_URL || process.env.API_BASE_URL || 'https://api.kolosal.ai',
};

// Serve a config JS that sets window.__APP_CONFIG__ at runtime
app.get('/config.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.end(`window.__APP_CONFIG__ = ${JSON.stringify(config)};`);
});

// Basic health endpoint for probes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve static assets from project root
app.use(express.static(__dirname));

// Default route to index.html
app.get('*', (req, res) => {
  const file = req.path && req.path !== '/' ? req.path : '/index.html';
  res.sendFile(path.join(__dirname, file));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
