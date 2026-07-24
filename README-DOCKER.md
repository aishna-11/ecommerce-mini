# Docker Setup Guide for E-Commerce Project

## Prerequisites
- Docker Desktop installed on Windows ([Download here](https://www.docker.com/products/docker-desktop/))
- Docker Desktop running (check system tray)

## Quick Start

### 1. Start Everything with One Command
Open terminal in the project root folder and run:

```bash
docker compose up
```

This will:
- Download MongoDB image (first time only)
- Build the backend container
- Start MongoDB on port 27017
- Start the backend API on port 5000
- Serve the frontend from the same server

### 2. Open Your Browser
Go to: **http://localhost:5000**

The Amazon-style shopping page will load!

### 3. Seed the Database (First Time Only)
In a new terminal, run:

```bash
docker compose exec backend node seed.js
```

This adds sample products to the database.

### 4. Stop Everything
Press `Ctrl + C` in the terminal, then:

```bash
docker compose down
```

---

## Useful Commands

```bash
# Start in background (detached mode)
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Stop and remove database data
docker compose down -v

# Rebuild after code changes
docker compose up --build

# Run seed script
docker compose exec backend node seed.js

# Access MongoDB shell
docker compose exec mongodb mongosh mini_ecommerce
```

---

## Troubleshooting

### Port Already in Use
If port 5000 or 27017 is busy:

1. Edit `docker-compose.yml`
2. Change `"5000:5000"` to `"5001:5000"` (or any free port)
3. Open `http://localhost:5001`

### Can't Connect to Database
```bash
# Check if MongoDB is running
docker compose ps

# Restart containers
docker compose restart
```

### See Backend Logs
```bash
docker compose logs backend
```

---

## Why Docker?

✅ **No MongoDB installation needed** — runs in a container  
✅ **No "Access Denied" errors** — no Windows services  
✅ **Works on any OS** — same setup on Windows/Mac/Linux  
✅ **Clean environment** — doesn't pollute your system  
✅ **One command to start** — `docker compose up`  

---

## Development Workflow

The `backend` and `frontend` folders are mounted as volumes, so:

- Edit code in VS Code
- Changes reflect immediately (nodemon auto-restarts)
- No need to rebuild containers for code changes

Only rebuild when changing `Dockerfile` or `package.json`:
```bash
docker compose up --build
```
