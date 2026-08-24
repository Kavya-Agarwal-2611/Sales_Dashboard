-- ============================================================================
-- VOYX SALES DASHBOARD - SUPABASE SQL SCHEMA & SAMPLE DATA
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/riqztbfyepfesqehxrmd/sql)
-- ============================================================================

-- 1. Enable Row Level Security (RLS) and grant read/write permissions for anon key
-- ----------------------------------------------------------------------------

-- Table 1: KPI Metrics
CREATE TABLE IF NOT EXISTS public.kpi_metrics (
    id SERIAL PRIMARY KEY,
    today_orders INT DEFAULT 33,
    today_revenue TEXT DEFAULT '₹30.80K',
    mtd_orders INT DEFAULT 658,
    mtd_revenue TEXT DEFAULT '₹574.69K',
    prev_same_day_orders INT DEFAULT 536,
    prev_same_day_revenue TEXT DEFAULT '₹459.44K',
    prev_month_orders INT DEFAULT 964,
    prev_month_revenue TEXT DEFAULT '₹818.90K',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table 2: Sales Leaderboard
CREATE TABLE IF NOT EXISTS public.sales_leaderboard (
    id SERIAL PRIMARY KEY,
    rank INT NOT NULL,
    name TEXT NOT NULL UNIQUE,
    day_orders INT DEFAULT 0,
    day_rev TEXT DEFAULT '₹0.0',
    mtd_orders INT DEFAULT 0,
    mtd_rev TEXT DEFAULT '₹0.0K',
    arpu TEXT DEFAULT '₹0',
    target_pct INT DEFAULT 0,
    target_val INT DEFAULT 125,
    pv_month INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table 3: Top Destinations
CREATE TABLE IF NOT EXISTS public.top_destinations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table 4: Daily Summary (Daily Trend Chart)
CREATE TABLE IF NOT EXISTS public.daily_summary (
    id SERIAL PRIMARY KEY,
    date_label TEXT NOT NULL UNIQUE,
    order_count INT NOT NULL DEFAULT 0
);

-- Table 5: Monthly Summary (Monthly Trend Chart)
CREATE TABLE IF NOT EXISTS public.monthly_summary (
    id SERIAL PRIMARY KEY,
    month_label TEXT NOT NULL UNIQUE,
    order_count INT NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- Enable RLS and setup public Anon access policies
-- ----------------------------------------------------------------------------
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_summary ENABLE ROW LEVEL SECURITY;

-- Allow Anon Read & Write for seamless dashboard operations
CREATE POLICY "Allow public read access on kpi_metrics" ON public.kpi_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on kpi_metrics" ON public.kpi_metrics FOR ALL USING (true);

CREATE POLICY "Allow public read access on sales_leaderboard" ON public.sales_leaderboard FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on sales_leaderboard" ON public.sales_leaderboard FOR ALL USING (true);

CREATE POLICY "Allow public read access on top_destinations" ON public.top_destinations FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on top_destinations" ON public.top_destinations FOR ALL USING (true);

CREATE POLICY "Allow public read access on daily_summary" ON public.daily_summary FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on daily_summary" ON public.daily_summary FOR ALL USING (true);

CREATE POLICY "Allow public read access on monthly_summary" ON public.monthly_summary FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on monthly_summary" ON public.monthly_summary FOR ALL USING (true);

-- Enable Realtime publication for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kpi_metrics;

-- ----------------------------------------------------------------------------
-- 2. Populate Initial Seed Data (Matches Dashboard Image)
-- ----------------------------------------------------------------------------

-- Seed KPI Metrics
INSERT INTO public.kpi_metrics (id, today_orders, today_revenue, mtd_orders, mtd_revenue, prev_same_day_orders, prev_same_day_revenue, prev_month_orders, prev_month_revenue)
VALUES (1, 33, '₹30.80K', 658, '₹574.69K', 536, '₹459.44K', 964, '₹818.90K')
ON CONFLICT (id) DO UPDATE SET
    today_orders = EXCLUDED.today_orders,
    today_revenue = EXCLUDED.today_revenue,
    mtd_orders = EXCLUDED.mtd_orders,
    mtd_revenue = EXCLUDED.mtd_revenue,
    prev_same_day_orders = EXCLUDED.prev_same_day_orders,
    prev_same_day_revenue = EXCLUDED.prev_same_day_revenue,
    prev_month_orders = EXCLUDED.prev_month_orders,
    prev_month_revenue = EXCLUDED.prev_month_revenue;

-- Seed Leaderboard Data
INSERT INTO public.sales_leaderboard (rank, name, day_orders, day_rev, mtd_orders, mtd_rev, arpu, target_pct, target_val, pv_month)
VALUES
    (1, 'Faizan', 10, '₹9.5', 155, '₹143.3K', '₹924', 124, 125, 84),
    (2, 'Talha', 4, '₹5.0', 121, '₹103.7K', '₹857', 97, 125, 44),
    (3, 'Bhageshri', 4, '₹2.5', 119, '₹94.0K', '₹790', 95, 125, 60),
    (4, 'Nidhi', 5, '₹4.2', 95, '₹78.8K', '₹829', 76, 125, 50),
    (5, 'Sanika', 5, '₹5.7', 95, '₹83.3K', '₹877', 76, 125, 54),
    (6, 'Prabhat', 3, '₹2.8', 64, '₹62.6K', '₹979', 51, 125, 75),
    (7, 'Farooq', 2, '₹1.1', 9, '₹9.0K', '₹997', 7, 125, 0)
ON CONFLICT (name) DO NOTHING;

-- Seed Top Destinations
INSERT INTO public.top_destinations (name, count)
VALUES
    ('Thailand [True]', 231),
    ('Thailand', 206),
    ('Singapore, Malaysia', 33),
    ('Vietnam', 30),
    ('Singapore, Malaysia, Thailand...', 17),
    ('Japan', 15),
    ('Singapore, Malaysia, Indonesia...', 10)
ON CONFLICT (name) DO NOTHING;

-- Seed Daily Summary Chart Points
INSERT INTO public.daily_summary (date_label, order_count)
VALUES
    ('01-06', 36), ('02-06', 44), ('03-06', 35), ('04-06', 48),
    ('05-06', 31), ('06-06', 32), ('07-06', 57), ('08-06', 41),
    ('09-06', 39), ('10-06', 25), ('11-06', 41), ('12-06', 23),
    ('13-06', 27), ('14-06', 28), ('15-06', 54), ('16-06', 30),
    ('17-06', 31), ('18-06', 33)
ON CONFLICT (date_label) DO NOTHING;

-- Seed Monthly Summary Chart Points
INSERT INTO public.monthly_summary (month_label, order_count)
VALUES
    ('Nov 25', 85), ('Dec 25', 210), ('Jan 26', 340), ('Feb 26', 420),
    ('Mar 26', 530), ('Apr 26', 690), ('May 26', 964), ('Jun 26', 658)
ON CONFLICT (month_label) DO NOTHING;
