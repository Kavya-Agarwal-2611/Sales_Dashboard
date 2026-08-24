/**
 * VOYX SALES PERFORMANCE DASHBOARD - JAVASCRIPT ENGINE
 * Full Supabase v2 Integration with Real-Time Data & Interactive Chart.js
 */

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://riqztbfyepfesqehxrmd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpcXp0YmZ5ZXBmZXNxZWh4cm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzOTI5NjgsImV4cCI6MjA5Njk2ODk2OH0.0TUeRqisUjVdGk3f6SQwrXCCYHu9ZKAdlJ8KhFCJR8o';

let supabaseClient = null;
let isSupabaseOnline = false;

// Initialize Supabase Client
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

// --- Default / Initial Dataset (Matches Screenshot) ---
const DEFAULT_DATA = {
  kpi: {
    today_orders: 33,
    today_revenue: '₹30.80K',
    mtd_orders: 658,
    mtd_revenue: '₹574.69K',
    prev_same_day_orders: 536,
    prev_same_day_revenue: '₹459.44K',
    prev_month_orders: 964,
    prev_month_revenue: '₹818.90K'
  },
  leaderboard: [
    { rank: 1, name: 'Faizan', day_orders: 10, day_rev: '₹9.5', mtd_orders: 155, mtd_rev: '₹143.3K', arpu: '₹924', target_pct: 124, target_val: 125, pv_month: 84 },
    { rank: 2, name: 'Talha', day_orders: 4, day_rev: '₹5.0', mtd_orders: 121, mtd_rev: '₹103.7K', arpu: '₹857', target_pct: 97, target_val: 125, pv_month: 44 },
    { rank: 3, name: 'Bhageshri', day_orders: 4, day_rev: '₹2.5', mtd_orders: 119, mtd_rev: '₹94.0K', arpu: '₹790', target_pct: 95, target_val: 125, pv_month: 60 },
    { rank: 4, name: 'Nidhi', day_orders: 5, day_rev: '₹4.2', mtd_orders: 95, mtd_rev: '₹78.8K', arpu: '₹829', target_pct: 76, target_val: 125, pv_month: 50 },
    { rank: 5, name: 'Sanika', day_orders: 5, day_rev: '₹5.7', mtd_orders: 95, mtd_rev: '₹83.3K', arpu: '₹877', target_pct: 76, target_val: 125, pv_month: 54 },
    { rank: 6, name: 'Prabhat', day_orders: 3, day_rev: '₹2.8', mtd_orders: 64, mtd_rev: '₹62.6K', arpu: '₹979', target_pct: 51, target_val: 125, pv_month: 75 },
    { rank: 7, name: 'Farooq', day_orders: 2, day_rev: '₹1.1', mtd_orders: 9, mtd_rev: '₹9.0K', arpu: '₹997', target_pct: 7, target_val: 125, pv_month: 0 }
  ],
  destinations: [
    { name: 'Thailand [True]', count: 231 },
    { name: 'Thailand', count: 206 },
    { name: 'Singapore, Malaysia', count: 33 },
    { name: 'Vietnam', count: 30 },
    { name: 'Singapore, Malaysia, Thailand...', count: 17 },
    { name: 'Japan', count: 15 },
    { name: 'Singapore, Malaysia, Indonesia...', count: 10 }
  ],
  dailyChart: {
    labels: ['01-06', '02-06', '03-06', '04-06', '05-06', '06-06', '07-06', '08-06', '09-06', '10-06', '11-06', '12-06', '13-06', '14-06', '15-06', '16-06', '17-06', '18-06'],
    data: [36, 44, 35, 48, 31, 32, 57, 41, 39, 25, 41, 23, 27, 28, 54, 30, 31, 33]
  },
  monthlyChart: {
    labels: ['Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26'],
    data: [85, 210, 340, 420, 530, 690, 964, 658]
  }
};

// Application State
let appState = {
  kpi: { ...DEFAULT_DATA.kpi },
  leaderboard: [ ...DEFAULT_DATA.leaderboard ],
  destinations: [ ...DEFAULT_DATA.destinations ],
  dailyChart: { ...DEFAULT_DATA.dailyChart },
  monthlyChart: { ...DEFAULT_DATA.monthlyChart },
  selectedDate: '2026-06-18'
};

// Chart References
let dailyChartInstance = null;
let monthlyChartInstance = null;

// --- DOM Elements ---
const dom = {
  dbStatusBadge: document.getElementById('dbStatusBadge'),
  kpiTodayOrders: document.getElementById('kpiTodayOrders'),
  kpiTodayRevenue: document.getElementById('kpiTodayRevenue'),
  kpiMtdOrders: document.getElementById('kpiMtdOrders'),
  kpiMtdRevenue: document.getElementById('kpiMtdRevenue'),
  kpiPrevSameDayOrders: document.getElementById('kpiPrevSameDayOrders'),
  kpiPrevSameDayRevenue: document.getElementById('kpiPrevSameDayRevenue'),
  kpiPrevMonthOrders: document.getElementById('kpiPrevMonthOrders'),
  kpiPrevMonthRevenue: document.getElementById('kpiPrevMonthRevenue'),
  leaderboardBody: document.getElementById('leaderboardBody'),
  destinationsList: document.getElementById('destinationsList'),
  currentDateDisplay: document.getElementById('currentDateDisplay'),
  datePickerInput: document.getElementById('datePickerInput'),
  btnDownloadCsv: document.getElementById('btnDownloadCsv'),
  btnRefreshData: document.getElementById('btnRefreshData'),
  btnAddRepModal: document.getElementById('btnAddRepModal'),
  recordModal: document.getElementById('recordModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnCancelModal: document.getElementById('btnCancelModal'),
  salesRepForm: document.getElementById('salesRepForm'),
  tabDashboard: document.getElementById('tabDashboard'),
  tabWallet: document.getElementById('tabWallet'),
  mainDashboardView: document.getElementById('mainDashboardView'),
  walletSummaryView: document.getElementById('walletSummaryView'),
  btnBackToDashboard: document.getElementById('btnBackToDashboard'),
  toastContainer: document.getElementById('toastContainer')
};

// --- Toast Notification Helper ---
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-info'}"></i> <span>${message}</span>`;
  dom.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Render KPI Metrics ---
function renderKPIs() {
  const { kpi } = appState;
  dom.kpiTodayOrders.textContent = kpi.today_orders;
  dom.kpiTodayRevenue.textContent = `${kpi.today_revenue} Revenue`;
  
  dom.kpiMtdOrders.textContent = kpi.mtd_orders;
  dom.kpiMtdRevenue.textContent = `${kpi.mtd_revenue} Revenue`;
  
  dom.kpiPrevSameDayOrders.textContent = kpi.prev_same_day_orders;
  dom.kpiPrevSameDayRevenue.textContent = `${kpi.prev_same_day_revenue} Revenue`;
  
  dom.kpiPrevMonthOrders.textContent = kpi.prev_month_orders;
  dom.kpiPrevMonthRevenue.textContent = `${kpi.prev_month_revenue} Revenue`;
}

// --- Render Daily Leaderboard Table ---
function renderLeaderboard() {
  dom.leaderboardBody.innerHTML = '';
  
  const sortedReps = [...appState.leaderboard].sort((a, b) => a.rank - b.rank);
  
  sortedReps.forEach(rep => {
    const tr = document.createElement('tr');
    const barWidth = Math.min(rep.target_pct, 100);
    
    tr.innerHTML = `
      <td class="td-rank">${rep.rank}</td>
      <td class="td-rep">${escapeHtml(rep.name)}</td>
      <td class="td-day">
        <div class="day-orders">${rep.day_orders}</div>
        <div class="day-revenue">${rep.day_rev}</div>
      </td>
      <td class="td-mtd">${rep.mtd_orders}</td>
      <td class="td-mtd-rev">${rep.mtd_rev}</td>
      <td class="td-arpu">${rep.arpu}</td>
      <td class="td-target">
        <div class="target-cell">
          <div class="target-numbers">
            <span class="target-pct">${rep.target_pct}%</span>
            <span class="target-val">${rep.target_val}</span>
          </div>
          <div class="target-bar-bg">
            <div class="target-bar-fill" style="width: ${barWidth}%;"></div>
          </div>
        </div>
      </td>
      <td class="td-pv-month">${rep.pv_month}</td>
    `;
    dom.leaderboardBody.appendChild(tr);
  });
}

// --- Render Top Destinations List ---
function renderDestinations() {
  dom.destinationsList.innerHTML = '';
  
  appState.destinations.forEach(item => {
    const div = document.createElement('div');
    div.className = 'dest-item';
    div.innerHTML = `
      <span class="dest-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
      <span class="dest-badge">${item.count}</span>
    `;
    dom.destinationsList.appendChild(div);
  });
}

// --- Render Spline Area Charts with Chart.js ---
function initCharts() {
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.color = '#8a94a6';

  // 1. Daily Summary Chart
  const dailyCanvas = document.getElementById('dailySummaryChart');
  if (dailyCanvas) {
    const ctx = dailyCanvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(243, 101, 35, 0.15)');
    gradient.addColorStop(1, 'rgba(243, 101, 35, 0.00)');

    if (dailyChartInstance) dailyChartInstance.destroy();

    dailyChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: appState.dailyChart.labels,
        datasets: [{
          data: appState.dailyChart.data,
          borderColor: '#f36523',
          borderWidth: 2.2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.42,
          pointBackgroundColor: '#f36523',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 3.5,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#f36523',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#101524',
            titleColor: '#ffffff',
            bodyColor: '#f36523',
            bodyFont: { weight: 'bold' },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `Orders: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              font: { size: 10 },
              color: '#8a94a6',
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            min: 0,
            max: 60,
            ticks: {
              stepSize: 10,
              font: { size: 10 },
              color: '#8a94a6'
            },
            grid: {
              color: '#f1f5f9',
              drawBorder: false
            }
          }
        }
      }
    });
  }

  // 2. Monthly Summary Chart
  const monthlyCanvas = document.getElementById('monthlySummaryChart');
  if (monthlyCanvas) {
    const ctx = monthlyCanvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(243, 101, 35, 0.15)');
    gradient.addColorStop(1, 'rgba(243, 101, 35, 0.00)');

    if (monthlyChartInstance) monthlyChartInstance.destroy();

    monthlyChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: appState.monthlyChart.labels,
        datasets: [{
          data: appState.monthlyChart.data,
          borderColor: '#f36523',
          borderWidth: 2.2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f36523',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 3.5,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#f36523',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#101524',
            titleColor: '#ffffff',
            bodyColor: '#f36523',
            bodyFont: { weight: 'bold' },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `Total Orders: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              font: { size: 10 },
              color: '#8a94a6'
            }
          },
          y: {
            min: 0,
            max: 1000,
            ticks: {
              stepSize: 100,
              font: { size: 10 },
              color: '#8a94a6'
            },
            grid: {
              color: '#f1f5f9',
              drawBorder: false
            }
          }
        }
      }
    });
  }
}

// Update charts with current state
function updateCharts() {
  if (dailyChartInstance) {
    dailyChartInstance.data.labels = appState.dailyChart.labels;
    dailyChartInstance.data.datasets[0].data = appState.dailyChart.data;
    dailyChartInstance.update();
  }
  if (monthlyChartInstance) {
    monthlyChartInstance.data.labels = appState.monthlyChart.labels;
    monthlyChartInstance.data.datasets[0].data = appState.monthlyChart.data;
    monthlyChartInstance.update();
  }
}

// --- Supabase Data Fetching & Sync ---
async function fetchSupabaseData() {
  if (!supabaseClient) {
    setConnectionStatus('fallback', 'Local Mock Mode');
    return;
  }

  setConnectionStatus('loading', 'Connecting...');

  try {
    let hasCustomData = false;

    // 1. Try fetching from 'sales_leaderboard'
    const { data: leaderboardData, error: lError } = await supabaseClient
      .from('sales_leaderboard')
      .select('*')
      .order('rank', { ascending: true });

    if (!lError && leaderboardData && leaderboardData.length > 0) {
      appState.leaderboard = leaderboardData;
      hasCustomData = true;
    } else {
      // Fallback: Check if user has 'users' & 'orders' tables
      const { data: usersData, error: uError } = await supabaseClient.from('users').select('*');
      const { data: ordersData, error: oError } = await supabaseClient.from('orders').select('*');

      if (!uError && !oError && usersData && usersData.length > 0) {
        // Aggregate rep data dynamically from existing users & orders tables
        const repMap = {};
        usersData.forEach((u, i) => {
          repMap[u.user_id] = {
            rank: i + 1,
            name: u.name || `Rep #${u.user_id}`,
            day_orders: 0,
            day_rev: '₹0.0',
            mtd_orders: 0,
            mtd_rev: '₹0.0K',
            arpu: '₹0',
            target_pct: 0,
            target_val: 125,
            pv_month: 0
          };
        });

        if (ordersData && ordersData.length > 0) {
          ordersData.forEach(o => {
            if (repMap[o.user_id]) {
              repMap[o.user_id].mtd_orders += 1;
              const amt = Number(o.amount) || 0;
              const currentRev = parseFloat(repMap[o.user_id].mtd_rev.replace(/[^\d.]/g, '')) || 0;
              repMap[o.user_id].mtd_rev = `₹${(currentRev + amt / 1000).toFixed(1)}K`;
            }
          });
        }

        appState.leaderboard = Object.values(repMap);
        hasCustomData = true;
      }
    }

    // 2. Fetch KPI Metrics
    const { data: kpiData, error: kError } = await supabaseClient
      .from('kpi_metrics')
      .select('*')
      .single();

    if (!kError && kpiData) {
      appState.kpi = { ...appState.kpi, ...kpiData };
      hasCustomData = true;
    }

    // 3. Fetch Top Destinations
    const { data: destData, error: dError } = await supabaseClient
      .from('top_destinations')
      .select('*')
      .order('count', { ascending: false });

    if (!dError && destData && destData.length > 0) {
      appState.destinations = destData;
      hasCustomData = true;
    }

    // 4. Fetch Daily Summary Chart Data
    const { data: dailyData, error: dailyError } = await supabaseClient
      .from('daily_summary')
      .select('*')
      .order('date_label', { ascending: true });

    if (!dailyError && dailyData && dailyData.length > 0) {
      appState.dailyChart.labels = dailyData.map(d => d.date_label);
      appState.dailyChart.data = dailyData.map(d => d.order_count);
      hasCustomData = true;
    }

    // 5. Fetch Monthly Summary Chart Data
    const { data: monthlyData, error: mError } = await supabaseClient
      .from('monthly_summary')
      .select('*')
      .order('id', { ascending: true });

    if (!mError && monthlyData && monthlyData.length > 0) {
      appState.monthlyChart.labels = monthlyData.map(m => m.month_label);
      appState.monthlyChart.data = monthlyData.map(m => m.order_count);
      hasCustomData = true;
    }

    isSupabaseOnline = true;
    setConnectionStatus('connected', 'Supabase Connected');
    if (hasCustomData) {
      showToast('Live Supabase data loaded!', 'success');
    }

  } catch (err) {
    console.warn('Supabase query error:', err);
    setConnectionStatus('fallback', 'Supabase Ready');
  }

  // Refresh UI
  renderKPIs();
  renderLeaderboard();
  renderDestinations();
  updateCharts();
}

// Setup Supabase Real-time Channel Subscriptions
function setupRealtimeSubscriptions() {
  if (!supabaseClient) return;

  try {
    supabaseClient
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales_leaderboard' },
        () => {
          fetchSupabaseData();
          showToast('Live leaderboard update received!', 'info');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchSupabaseData();
          showToast('New order detected in Supabase!', 'info');
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kpi_metrics' },
        () => {
          fetchSupabaseData();
        }
      )
      .subscribe((status) => {
        console.log('Supabase realtime status:', status);
      });
  } catch (e) {
    console.warn('Realtime subscription error:', e);
  }
}

// --- Save Record to Supabase or Local State ---
async function saveSalesRecord(formData) {
  const newRecord = {
    rank: parseInt(formData.rank, 10),
    name: formData.name.trim(),
    day_orders: parseInt(formData.dayOrders, 10),
    day_rev: `₹${formData.dayRev}`,
    mtd_orders: parseInt(formData.mtdOrders, 10),
    mtd_rev: `₹${formData.mtdRev}K`,
    arpu: `₹${formData.arpu}`,
    target_pct: Math.round((parseInt(formData.mtdOrders, 10) / parseInt(formData.targetVal, 10)) * 100),
    target_val: parseInt(formData.targetVal, 10),
    pv_month: parseInt(formData.prevMonthOrders, 10)
  };

  // Try writing to Supabase table
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient
        .from('sales_leaderboard')
        .upsert([newRecord], { onConflict: 'name' });

      if (!error) {
        showToast(`Saved ${newRecord.name} to Supabase!`, 'success');
        await fetchSupabaseData();
        return;
      }
    } catch (err) {
      console.warn('Supabase upsert note:', err);
    }
  }

  // Fallback to updating in-memory state
  const existingIdx = appState.leaderboard.findIndex(r => r.name.toLowerCase() === newRecord.name.toLowerCase());
  if (existingIdx >= 0) {
    appState.leaderboard[existingIdx] = newRecord;
  } else {
    appState.leaderboard.push(newRecord);
  }
  
  renderLeaderboard();
  showToast(`Updated ${newRecord.name} in dashboard!`, 'success');
}

// --- UI Event Handlers & Interactions ---
function setupEventListeners() {
  if (dom.datePickerInput) {
    dom.datePickerInput.addEventListener('change', (e) => {
      const selected = new Date(e.target.value);
      if (!isNaN(selected)) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const formatted = selected.toLocaleDateString('en-GB', options);
        dom.currentDateDisplay.textContent = formatted;
        appState.selectedDate = e.target.value;
        showToast(`Filtered for ${formatted}`, 'info');
      }
    });
  }

  if (dom.btnRefreshData) {
    dom.btnRefreshData.addEventListener('click', () => {
      fetchSupabaseData();
      showToast('Refreshing dashboard data...', 'info');
    });
  }

  if (dom.btnDownloadCsv) {
    dom.btnDownloadCsv.addEventListener('click', exportToCsv);
  }

  if (dom.btnAddRepModal) {
    dom.btnAddRepModal.addEventListener('click', () => {
      dom.recordModal.classList.remove('hidden');
    });
  }

  if (dom.btnCloseModal) {
    dom.btnCloseModal.addEventListener('click', () => {
      dom.recordModal.classList.add('hidden');
    });
  }

  if (dom.btnCancelModal) {
    dom.btnCancelModal.addEventListener('click', () => {
      dom.recordModal.classList.add('hidden');
    });
  }

  if (dom.salesRepForm) {
    dom.salesRepForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        name: document.getElementById('repName').value,
        rank: document.getElementById('repRank').value,
        dayOrders: document.getElementById('dayOrders').value,
        dayRev: document.getElementById('dayRev').value,
        mtdOrders: document.getElementById('mtdOrders').value,
        mtdRev: document.getElementById('mtdRev').value,
        arpu: document.getElementById('arpu').value,
        targetVal: document.getElementById('targetVal').value,
        prevMonthOrders: document.getElementById('prevMonthOrders').value
      };

      await saveSalesRecord(formData);
      dom.salesRepForm.reset();
      dom.recordModal.classList.add('hidden');
    });
  }

  if (dom.tabDashboard && dom.tabWallet) {
    dom.tabDashboard.addEventListener('click', () => {
      dom.tabDashboard.classList.add('active');
      dom.tabWallet.classList.remove('active');
      dom.mainDashboardView.classList.remove('hidden');
      dom.walletSummaryView.classList.add('hidden');
    });

    dom.tabWallet.addEventListener('click', () => {
      dom.tabWallet.classList.add('active');
      dom.tabDashboard.classList.remove('active');
      dom.mainDashboardView.classList.add('hidden');
      dom.walletSummaryView.classList.remove('hidden');
    });
  }

  if (dom.btnBackToDashboard) {
    dom.btnBackToDashboard.addEventListener('click', () => {
      dom.tabDashboard.click();
    });
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      showToast('Logged out of session', 'info');
    });
  }
}

// --- CSV Export Engine ---
function exportToCsv() {
  const rows = [];
  rows.push(['# Rank', 'Sales Representative', 'Day Orders', 'Day Revenue', 'MTD Orders', 'MTD Revenue', 'ARPU', 'Target %', 'Target Goal', 'Prev Month Orders']);
  
  appState.leaderboard.forEach(r => {
    rows.push([
      r.rank,
      `"${r.name}"`,
      r.day_orders,
      `"${r.day_rev}"`,
      r.mtd_orders,
      `"${r.mtd_rev}"`,
      `"${r.arpu}"`,
      `${r.target_pct}%`,
      r.target_val,
      r.pv_month
    ]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `voyx_sales_leaderboard_${appState.selectedDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast('Leaderboard exported to CSV', 'success');
}

// --- Helper Utilities ---
function setConnectionStatus(type, label) {
  dom.dbStatusBadge.className = `db-status-badge ${type}`;
  dom.dbStatusBadge.querySelector('.status-text').textContent = label;
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}

// --- Application Bootstrap ---
document.addEventListener('DOMContentLoaded', () => {
  renderKPIs();
  renderLeaderboard();
  renderDestinations();
  initCharts();
  setupEventListeners();

  fetchSupabaseData();
  setupRealtimeSubscriptions();
});
