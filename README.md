# il-tools — Local Setup Guide (for beginners)

Run this Hebrew RTL comparison platform on your own computer in ~15 minutes.
You need two things installed: **Node.js** (runs the app) and **PostgreSQL** (the database).

---

## Step 0 — Get the code on your computer

Download the project as a ZIP and extract it somewhere easy to find
(e.g. `Desktop/il-tools`). Remember the folder location.

---

## Step 1 — Install Node.js

### Windows
1. Go to **https://nodejs.org** and click the big green **LTS** button.
2. Run the downloaded `.msi` and click **Next** through everything (keep all defaults checked, including "add to PATH").
3. Open **PowerShell** (Start Menu → type `powershell` → Enter) and verify:

```powershell
node -v
npm -v
```

You should see `v22.x.x` (or newer) and a version number. If `node` "is not recognized", close and reopen PowerShell.

### macOS
1. Go to **https://nodejs.org** → download the **LTS** `.pkg` → double-click → continue through the installer.
2. Open **Terminal** (Cmd+Space → type `terminal`) and verify:

```bash
node -v && npm -v
```

### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

---

## Step 2 — Install PostgreSQL and create the database

### Windows
1. Go to **https://www.postgresql.org/download/windows/** → "Download the installer" → pick the newest version for Windows x86-64.
2. Run the installer. Keep defaults, **except**:
   - When asked for a password, type: **`postgres`** (this matches the project's config — do not change it).
   - Keep port **`5432`**.
   - At the end, **uncheck** "Launch Stack Builder".
3. Open the Start Menu → type **`SQL Shell (psql)`** → open it. Press **Enter 4 times** (accepts the defaults), then type the password `postgres` (you won't see it while typing — that's normal).
4. At the `postgres=#` prompt, type exactly (note the semicolon):

```sql
CREATE DATABASE app_db;
\q
```

### macOS
1. Download **Postgres.app** from **https://postgresapp.com** → unzip → drag the elephant icon into **Applications**.
2. Open **Postgres** from Applications and click **Start** (it should say "Running").
3. In Terminal, run these two lines:

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/psql -c "CREATE DATABASE app_db;"
/Applications/Postgres.app/Contents/Versions/latest/bin/psql -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';"
```

> Every time you restart your Mac, reopen Postgres.app and click **Start** before running the app.

### Linux (Ubuntu/Debian)

```bash
sudo apt update && sudo apt install -y postgresql
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb app_db
```

---

## Step 3 — Set up the project (same commands on all systems)

Open a terminal **inside the project folder**:
- **Windows:** Shift + Right-click the folder → "Open PowerShell window here"
- **Mac:** Finder → right-click the folder → "New Terminal at Folder"

Then paste these four commands, one at a time:

```bash
# 1) Install all dependencies (1–3 minutes; ignore any "vulnerabilities" audit note for local play)
npm install

# 2) Create the .env file pointing at your local database (works identically on Windows/Mac/Linux)
node -e "require('fs').writeFileSync('.env','DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db\n')"

# 3) Create all database tables
npx drizzle-kit push

# 4) Fill the database with the catalog + demo users
npx tsx src/db/seed.ts
```

Success looks like: `9 tools upserted`, `3 guides upserted`, `created admin ...`, `Seed complete.`

---

## Step 4 — Run the website

```bash
npm run dev
```

Wait for `Ready`, then open **http://localhost:3000** in your browser. (The site itself is in Hebrew, right-to-left — that's expected.)

To stop: press **Ctrl + C** in the terminal. To start again later, just run `npm run dev` again from the project folder (and make sure PostgreSQL is running).

To run it in "production mode" instead: `npm run build` then `npm run start`.

---

## Demo accounts (RBAC tiers)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@il-tools.co.il` | `Admin12345!` |
| Premium | `premium@il-tools.co.il` | `Premium12345!` |
| Free | `free@il-tools.co.il` | `Free12345!` |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `node` / `npm` "is not recognized" (Windows) | Close and reopen PowerShell after installing Node.js. |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL isn't running. Windows: it starts automatically — reinstall if not. Mac: open Postgres.app → Start. Linux: `sudo service postgresql start`. |
| `database "app_db" does not exist` | You skipped Step 2's `CREATE DATABASE app_db;` command — run it. |
| `password authentication failed` | The DB password isn't `postgres`. Recreate the user (Linux/Mac) or reinstall PostgreSQL with the password `postgres`. |
| Port 3000 already in use | The dev server automatically offers port 3001 — open that URL instead. |
| Uploads 400 "סוג קובץ לא נתמך" | Only PDF/images/CSV/ZIP/Office files up to 50MB are allowed (by design). |

---

## Deploying to production (your own domain)

Architecture for going live: **GitHub** (code) → **Vercel** (runs the app) → **Neon** (hosted PostgreSQL) → **Cloudflare** (DNS for your domain).

1. **Push the code to GitHub** (the included `.gitignore` keeps `.env` and uploads out):
   `git init && git add . && git commit -m "il-tools" && git branch -M main && git remote add origin https://github.com/<you>/<repo>.git && git push -u origin main`
2. **Create a database at https://neon.tech** (free tier) → copy the pooled connection string (`postgresql://...neon.tech/neondb?sslmode=require`).
3. **Deploy:** https://vercel.com → sign in with GitHub → **Add New → Project** → import your repo → add environment variables:
   - `DATABASE_URL` = the Neon connection string
   - `SITE_URL` = `https://your-domain.com`
   Then click **Deploy**.
4. **Initialize the production DB from your computer:** temporarily paste the Neon string into `.env` (`DATABASE_URL=...`) **and** into `drizzle.config.json` (`"url": "..."`), then run `npx drizzle-kit push` and `npx tsx src/db/seed.ts`, then change both files back to the localhost values.
5. **Point your domain:** Vercel → Project → **Settings → Domains** → add your domain. Then Cloudflare → **DNS → Records**:
   - `A` record: name `@` → `76.76.21.21` (Proxy: **DNS only** while the certificate is issued)
   - `CNAME` record: name `www` → `cname.vercel-dns.com` (DNS only)
   Set Cloudflare **SSL/TLS → Full (strict)**. Once Vercel shows the domain as verified with HTTPS, you may turn the orange-cloud proxy back on.

From then on, `git push` to `main` = automatic production deploy in about a minute.

**Production caveats:** chunked-upload files are written to the server disk, which on serverless hosts is ephemeral (redeploys wipe them) — swap `src/lib/storage.ts` for a Cloudflare R2/S3 driver when you need permanent object storage. In-memory rate limiting and the activity bus are per-instance — fine at hobby scale.
