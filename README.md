# VOYX Sales Performance Dashboard

A pixel-perfect, responsive sales performance dashboard built with **HTML5**, **CSS3**, **Vanilla JavaScript**, **Chart.js**, and **Supabase Database & Realtime**.

---

## 📁 File Structure

```
sales-dashboard/
├── index.html            # Dashboard markup, navigation, KPI cards, table & chart containers
├── style.css             # Modern stylesheet matching the design specifications
├── app.js                # Application logic, Supabase v2 client, charts, CSV export & modals
└── supabase_schema.sql   # SQL setup script to create tables and seed default data in Supabase
```

---

## 🚀 How to Run

1. Open `index.html` directly in any web browser (Chrome, Edge, Safari, Firefox), or run a simple local web server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Or using Node / npx
   npx serve .
   ```
2. Navigate to `http://localhost:8000`.

---

## 🗄️ Supabase Configuration & Database Setup

The application is pre-configured with your Supabase credentials in `app.js`:
- **Project URL:** `https://riqztbfyepfesqehxrmd.supabase.co`
- **Anon Key:** Pre-configured and initialized.

### 1-Click Database Setup (Optional & Recommended)
To populate your Supabase database with live tables and starter data:
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard/project/riqztbfyepfesqehxrmd/sql).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and paste the entire contents of [`supabase_schema.sql`](supabase_schema.sql).
4. Click **Run**.

---

## ✨ Features Included

- **Exact Visual Match:** Custom styling, dark metric cards, leaderboard progress indicators, and destination pills.
- **Dynamic Charts:** Smooth spline area charts for *Daily Summary* and *Monthly Summary* using Chart.js.
- **Supabase Integration:** Realtime subscriptions, live data queries, and dynamic upserts.
- **Fallback / Demo Mode:** Automatically falls back to bundled visual data if Supabase tables are being initialized.
- **Interactive Modals:** Add or update sales representative records directly from the UI.
- **Export to CSV:** 1-click CSV download for sales reports and leaderboard data.
- **Tab Navigation:** Toggle between the Main Dashboard and the Wallet Summary view.
