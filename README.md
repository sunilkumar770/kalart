# KALART — Handmade Indian Craft Platform

KALART connects traditional Indian master artisans with customers seeking authentic handmade craft pieces and guided customisation — preview, approve, and track every commission.

Built with **React 18**, **TypeScript**, and **Vite**, optimized for zero-config production deployment on **Vercel**.

---

## 🚀 Quick Start for Developers

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9+ or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/sunilkumar770/kalart.git
cd kalart
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application with hot module replacement (HMR).

### 4. Build for Production
```bash
npm run build
```
This produces an optimized production build in the `dist/` folder, including all static references and hashed assets.

### 5. Preview Production Build Locally
```bash
npm run preview
```

---

## 🌐 Deploy to Vercel

### Option 1: One-Click Deploy via Vercel Dashboard (Recommended)
1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account (`sunilkumar770`).
3. Select and import the **`kalart`** repository:
   - **Repository:** `sunilkumar770/kalart`
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `vite build` (or default `npm run build`)
   - **Output Directory:** `dist`
4. Click **Deploy**. Vercel will build and assign a live production URL (e.g., `kalart.vercel.app`).
5. Every future git push to `main` (or default branch) will automatically trigger an instant preview / production deployment.

### Option 2: Deploy via Vercel CLI
1. Install or update Vercel CLI:
   ```bash
   npm install -g vercel@latest
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Link and deploy from the project root:
   ```bash
   vercel
   ```
4. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 📁 Project Architecture

```
kalart/
├── public/                 # Static assets copied directly to dist/
│   ├── img/                # Logos, icons, and illustrations
│   └── references/         # Authentic craft reference photos and index
├── references/             # Source craft catalog & reference manifests (30 craft forms)
├── src/
│   ├── components/         # Reusable UI components (Navbar, Footer, CraftCard, etc.)
│   ├── context/            # React context providers (Cart, Customizer state)
│   ├── data/               # Static craft datasets, GI tags, artisan profiles
│   ├── pages/              # Route pages (Home, Gallery, Customizer, Artisan, Cart)
│   ├── App.tsx             # Root application and route definitions
│   ├── base.css            # Base styles and resets
│   ├── components.css      # Component utility and layout styles
│   ├── tokens.css          # Design system color and typography tokens
│   └── main.tsx            # React application entrypoint
├── tools/                  # Python utilities for reference sourcing and craft generation
├── index.html              # HTML entry template with typography and meta tags
├── package.json            # Scripts, dependencies, and project metadata
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment routing, rewrites, and caching headers
└── vite.config.ts          # Vite configuration with React plugin
```

---

## ⚙️ Configuration Details

- **Client Routing**: Configured in `vercel.json` with rewrites `/{.*} -> /index.html` so React Router paths work without 404s.
- **Cache Headers**: Static craft references (`/references/*`) and bundle chunks (`/assets/*`) are served with immutable, long-lived cache headers for maximum speed.
- **Git Ignore**: Properly ignores `node_modules/`, `dist/`, `.env*`, and `.vercel/` to ensure clean CI/CD pipelines.

---

## 📜 License
ISC License — Developed for KALART.
