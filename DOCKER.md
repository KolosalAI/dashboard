# Docker: Build, Push, Pull, and Run

This app is a small Node/Express server that serves the static dashboard and exposes a runtime config at `/config.js`.

- Default container port: 3000 (configurable via `PORT`)
- Runtime envs: `API_BASE_URL`, `DOCLING_BASE_URL`, `MARKITDOWN_BASE_URL`, `PORT`

The commands below are for Windows PowerShell.

## 1) Build the image (optional)

You can build locally and tag it for your registry namespace. Replace `kolosalai/dashboard` with your actual registry/repository if different (Docker Hub repo names are lowercase).

```powershell
# Build locally (tag as latest)
docker build -t kolosalai/dashboard:latest .

# (Optional) Use a versioned tag
# docker build -t kolosalai/dashboard:v1 .
```

## 2) Push to registry (Docker Hub example)

```powershell
# Log in to Docker Hub (enter credentials when prompted)
docker login

# Push the image
docker push kolosalai/dashboard:latest

# (Optional) push a version tag as well
# docker push kolosalai/dashboard:v1
```

Notes

- If your org/user on Docker Hub is capitalized (e.g., `KolosalAI`), still use lowercase in the image name (e.g., `kolosalai/dashboard`).
- For GitHub Container Registry (GHCR), your name is part of the path, e.g.: `ghcr.io/kolosalai/dashboard:latest`. You would need to run `docker login ghcr.io` and push to that name instead.

## 3) Pull the image

```powershell
docker pull kolosalai/dashboard:latest
```

## 4) Run the container

By default the app listens on container port `3000`. Map that to your host, and set any API base URLs you need.

```powershell
# Default port (3000) and default API URLs
docker run --rm -p 3000:3000 `
  -e API_BASE_URL=https://api.kolosal.ai `
  -e DOCLING_BASE_URL=https://api.kolosal.ai `
  -e MARKITDOWN_BASE_URL=https://api.kolosal.ai `
  kolosalai/dashboard:latest
```

Override the port by setting `PORT` and mapping the same port from host to container:

```powershell
# Run on port 8080
docker run --rm -e PORT=8080 -p 8080:8080 `
  -e API_BASE_URL=https://api.kolosal.ai `
  kolosalai/dashboard:latest
```

Point to a backend running on your Windows host (use `host.docker.internal`):

```powershell
docker run --rm -p 3000:3000 `
  -e API_BASE_URL=http://host.docker.internal:8000 `
  kolosalai/dashboard:latest
```

## 5) Verify

- Open http://localhost:3000 (or your chosen port)
- Health check: http://localhost:3000/health
- The page loads `/config.js` which contains the env-driven config.
