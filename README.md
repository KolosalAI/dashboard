# Kolosal Dashboard

This repo serves a static dashboard UI with a tiny Node/Express server, packaged for Docker and Helm. All API base URLs are runtime-configurable via environment variables.

## Runtime configuration

The server exposes `/config.js` that injects `window.__APP_CONFIG__` used by `script/config.js`.

Environment variables:

- `API_BASE_URL` (default: <https://api.kolosal.ai>)
- `DOCLING_BASE_URL` (default: same as API_BASE_URL)
- `MARKITDOWN_BASE_URL` (default: same as API_BASE_URL)
- `PORT` (default: 3000)

## Local run

1. Install deps
   - Node 18+ recommended
2. Start the server

```powershell
# Windows PowerShell
$env:API_BASE_URL="https://api.kolosal.ai"; npm install; npm start
```

Open <http://localhost:3000>.

## Docker

Build and run:

```powershell
# Build
docker build -t kolosal-dashboard:local .

# Run with env overrides
docker run --rm -p 3000:3000 `
  -e API_BASE_URL=https://api.kolosal.ai `
  -e DOCLING_BASE_URL=https://docling.example.com `
  -e MARKITDOWN_BASE_URL=https://markitdown.example.com `
  kolosal-dashboard:local
```

To run on a different port, set `PORT` and map the same host port:

```powershell
docker run --rm -e PORT=8080 -p 8080:8080 `
  -e API_BASE_URL=https://api.kolosal.ai `
  kolosal-dashboard:local
```

## Helm

Update `charts/kolosal-dashboard/values.yaml` or pass overrides:

```powershell
helm upgrade --install kolosal-dashboard charts/kolosal-dashboard `
  --set image.repository=your-registry/kolosal-dashboard `
  --set image.tag=latest `
  --set env.API_BASE_URL=https://api.kolosal.ai `
  --set env.DOCLING_BASE_URL=https://docling.svc.cluster.local `
  --set env.MARKITDOWN_BASE_URL=https://markitdown.svc.cluster.local
```

Service exposes HTTP on port 80 by default. Add an Ingress if needed.

## Notes

- The UI layout is untouched; only JS was refactored to use a centralized config.
- Docling uploads use multipart/form-data at `/v1/convert/file`.
- MarkItDown uses specific parse endpoints: `/parse_pdf`, `/parse_docx`, `/parse_xlsx`, `/parse_pptx`, `/parse_html`.
- The app does not proxy requests; ensure CORS is enabled on the APIs for the dashboard origin when using remote hosts.
