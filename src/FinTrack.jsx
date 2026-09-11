import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  Target,
  PiggyBank,
  BarChart3,
  Settings,
  ShoppingCart,
  Wallet,
  Calculator,
  Boxes,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ChevronRight,
  Menu as MenuIcon,
  MoreHorizontal,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/* ======================= KONSTANTA ======================= */

const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const PERSONAL_INCOME_CATS = [
  "Gaji",
  "Uang Saku",
  "Bonus",
  "Penjualan",
  "Lainnya",
];
const PERSONAL_EXPENSE_CATS = [
  "Makanan",
  "Transportasi",
  "Tagihan",
  "Belanja",
  "Hiburan",
  "Pendidikan",
  "Kesehatan",
  "Lainnya",
];
const PAYMENT_METHODS = [
  "Tunai",
  "Transfer Bank",
  "E-Wallet",
  "Kartu Debit",
  "Kartu Kredit",
];

const BUSINESS_EXPENSE_CATS = [
  "Bahan Baku",
  "Produksi",
  "Packaging",
  "Pengiriman",
  "Marketing",
  "Operasional",
  "Sewa",
  "Listrik",
  "Internet",
  "Lainnya",
];
const BUSINESS_EXPENSE_BUCKET_DEFAULT = {
  "Bahan Baku": "Produksi",
  Produksi: "Produksi",
  Packaging: "Produksi",
  Pengiriman: "Operasional",
  Marketing: "Operasional",
  Operasional: "Operasional",
  Sewa: "Operasional",
  Listrik: "Operasional",
  Internet: "Operasional",
  Lainnya: "Operasional",
};
const SALES_STATUS = ["Lunas", "DP", "Belum Lunas"];
const CAPITAL_TYPES = ["Modal Awal", "Tambahan Modal", "Penarikan Modal"];
const CAPITAL_TYPE_MAP = {
  "Modal Awal": "awal",
  "Tambahan Modal": "tambahan",
  "Penarikan Modal": "penarikan",
};
const CAPITAL_TYPE_LABEL = {
  awal: "Modal Awal",
  tambahan: "Tambahan Modal",
  penarikan: "Penarikan Modal",
};
const TARGET_TYPES_USAHA = [
  "Omzet",
  "Laba",
  "Penjualan Produk",
  "Modal",
  "Jumlah Produksi",
];

const PIE_COLORS = [
  "#0E9F6E",
  "#2F6FED",
  "#D97706",
  "#DC4C4C",
  "#7B61FF",
  "#0EA5B7",
  "#B45309",
];

/* ======================= HELPERS ======================= */

let idCounter = 1;
const uid = () => `id_${Date.now().toString(36)}_${(idCounter++).toString(36)}`;

const formatIDR = (n) =>
  "Rp" + Math.round(Number(n) || 0).toLocaleString("id-ID");

const formatDateID = (isoStr) => {
  if (!isoStr) return "-";
  const d = new Date(isoStr + "T00:00:00");
  if (isNaN(d.getTime())) return isoStr;
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
};

const isoDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const monthKeyOf = (isoStr) => (isoStr || "").slice(0, 7); // YYYY-MM

const todayMonthKey = () => new Date().toISOString().slice(0, 7);

const isThisMonth = (isoStr) => monthKeyOf(isoStr) === todayMonthKey();

const isThisYear = (isoStr) =>
  (isoStr || "").slice(0, 4) === new Date().getFullYear().toString();

const lastMonthKey = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7);
};

const last6Months = () => {
  const out = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: MONTHS_ID[d.getMonth()],
    });
  }
  return out;
};

const inPeriod = (isoStr, period, customFrom, customTo) => {
  if (!isoStr) return false;
  if (period === "bulan_ini") return isThisMonth(isoStr);
  if (period === "bulan_lalu") return monthKeyOf(isoStr) === lastMonthKey();
  if (period === "tahun_ini") return isThisYear(isoStr);
  if (period === "custom") {
    if (!customFrom || !customTo) return true;
    return isoStr >= customFrom && isoStr <= customTo;
  }
  return true;
};

const downloadCSV = (filename, rows) => {
  const csv = rows
    .map((r) =>
      r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ======================= DATA DUMMY ======================= */

const initialPersonalTransactions = [];

const initialPersonalTargets = [];

const initialPersonalBudgets = [];

const initialBusinessProducts = [];

const initialBusinessSales = [];

const initialBusinessExpenses = [];

const initialBusinessCapital = [];

const initialBusinessHPP = [];

const initialBusinessTargets = [];

const initialStockMovements = [];

/* ======================= STYLE ======================= */

const GlobalStyle = () => (
  <style>{`
    .ft-root * { box-sizing: border-box; }
    .ft-root {
      --bg: #F6F8F6; --surface: #FFFFFF; --border: #E3E7E3; --border-soft: #EDF0ED;
      --text: #16211C; --text-muted: #667066; --text-faint: #93998F;
      --green: #0E9F6E; --green-dark: #0B7A54; --green-tint: #E6F6EE;
      --blue: #2F6FED; --blue-dark: #1E4FC2; --blue-tint: #EAF1FF;
      --red: #DC4C4C; --red-dark: #A62F2F; --red-tint: #FCEBEB;
      --amber: #D97706; --amber-dark: #92500A; --amber-tint: #FBF0DD;
      --accent: var(--green); --accent-dark: var(--green-dark); --accent-tint: var(--green-tint);
      font-family: 'Plus Jakarta Sans', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--text); background: var(--bg); min-height: 100vh;
      font-variant-numeric: tabular-nums;
    }
    .ft-root.theme-usaha { --accent: var(--blue); --accent-dark: var(--blue-dark); --accent-tint: var(--blue-tint); }
    .ft-shell { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; }
    .ft-sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: 20px 14px; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
    .ft-brand { display: flex; align-items: center; gap: 8px; padding: 4px 8px 18px; }
    .ft-brand-mark { width: 30px; height: 30px; border-radius: 9px; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
    .ft-brand-name { font-weight: 700; font-size: 16.5px; letter-spacing: -0.01em; }
    .ft-brand-tag { font-size: 10.5px; color: var(--text-faint); margin-top: -2px; }
    .ft-mode-switch { display: flex; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 3px; gap: 3px; margin-bottom: 18px; }
    .ft-mode-btn { flex: 1; border: none; background: transparent; padding: 8px 6px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--text-muted); cursor: pointer; display:flex; align-items:center; justify-content:center; gap:5px; }
    .ft-mode-btn.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
    .ft-mode-btn.active.p { color: var(--green-dark); }
    .ft-mode-btn.active.u { color: var(--blue-dark); }
    .ft-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; overflow-y: auto; }
    .ft-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 9px; border: none; background: transparent; color: var(--text-muted); font-size: 13.5px; font-weight: 500; cursor: pointer; text-align: left; width: 100%; }
    .ft-nav-item:hover { background: var(--bg); color: var(--text); }
    .ft-nav-item.active { background: var(--accent-tint); color: var(--accent-dark); font-weight: 700; }
    .ft-sidebar-foot { padding-top: 10px; border-top: 1px solid var(--border-soft); margin-top: 8px; }
    .ft-main { min-width: 0; display: flex; flex-direction: column; }
    .ft-topbar { display: none; }
    .ft-page { padding: 26px 30px 90px; max-width: 1180px; width: 100%; margin: 0 auto; }
    .ft-page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
    .ft-page-header h2 { font-size: 21px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
    .ft-page-header p { font-size: 13px; color: var(--text-muted); margin: 3px 0 0; }
    .ft-transfer-btn { display: flex; align-items: center; gap: 6px; background: var(--text); color: #fff; border: none; padding: 9px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 15px 16px; }
    .stat-icon { width: 30px; height: 30px; border-radius: 8px; background: var(--accent-tint); color: var(--accent-dark); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
    .stat-card.tone-red .stat-icon { background: var(--red-tint); color: var(--red-dark); }
    .stat-card.tone-amber .stat-icon { background: var(--amber-tint); color: var(--amber-dark); }
    .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }
    .stat-value { font-size: 20px; font-weight: 700; margin-top: 4px; letter-spacing: -0.01em; }
    .stat-sub { font-size: 11.5px; color: var(--text-faint); margin-top: 3px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
    .card-title { font-size: 14.5px; font-weight: 700; margin: 0 0 3px; }
    .card-sub { font-size: 12px; color: var(--text-muted); margin: 0 0 14px; }
    .grid-2 { display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px; }
    .row-gap { display: flex; flex-direction: column; gap: 12px; }
    .toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
    .search-box { display: flex; align-items: center; gap: 7px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; flex: 1; min-width: 160px; color: var(--text-faint); }
    .search-box input { border: none; outline: none; background: transparent; font-size: 13px; color: var(--text); width: 100%; }
    .ft-select { border: 1px solid var(--border); background: var(--surface); border-radius: 10px; padding: 8px 10px; font-size: 13px; color: var(--text); }
    .btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; padding: 9px 14px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; white-space: nowrap; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: var(--accent-dark); }
    .btn-ghost { background: var(--surface); border-color: var(--border); color: var(--text); }
    .btn-ghost:hover { background: var(--bg); }
    .btn-sm { padding: 6px 10px; font-size: 12px; }
    .icon-btn { border: 1px solid var(--border); background: var(--surface); border-radius: 8px; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); }
    .icon-btn:hover { background: var(--bg); color: var(--text); }
    .icon-btn.danger:hover { background: var(--red-tint); color: var(--red-dark); border-color: var(--red-tint); }
    .table-wrap { overflow-x: auto; border: 1px solid var(--border-soft); border-radius: 12px; }
    table.table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 640px; }
    table.table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-faint); font-weight: 700; padding: 10px 12px; background: var(--bg); border-bottom: 1px solid var(--border-soft); white-space: nowrap; }
    table.table td { padding: 10px 12px; border-bottom: 1px solid var(--border-soft); color: var(--text); }
    table.table tr:last-child td { border-bottom: none; }
    table.table tr:hover td { background: #FAFBF9; }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; }
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; }
    .badge-green { background: var(--green-tint); color: var(--green-dark); }
    .badge-red { background: var(--red-tint); color: var(--red-dark); }
    .badge-amber { background: var(--amber-tint); color: var(--amber-dark); }
    .badge-blue { background: var(--blue-tint); color: var(--blue-dark); }
    .badge-gray { background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); }
    .empty-state { padding: 34px 20px; text-align: center; color: var(--text-faint); font-size: 13px; }
    .progress { height: 8px; background: var(--bg); border-radius: 999px; overflow: hidden; border: 1px solid var(--border-soft); }
    .progress-bar { height: 100%; background: var(--accent); border-radius: 999px; }
    .progress-bar.over { background: var(--red); }
    .progress-bar.warn { background: var(--amber); }
    .target-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .target-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .target-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .target-name { font-weight: 700; font-size: 14px; }
    .target-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .target-nums { display: flex; justify-content: space-between; font-size: 12.5px; color: var(--text-muted); }
    .target-nums b { color: var(--text); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(15,20,17,0.45); display: flex; align-items: center; justify-content: center; z-index: 60; padding: 16px; }
    .modal { background: var(--surface); border-radius: 16px; width: 100%; max-width: 480px; max-height: 88vh; overflow-y: auto; padding: 20px; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .modal-header h3 { font-size: 16px; margin: 0; font-weight: 700; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .field { display: flex; flex-direction: column; gap: 5px; font-size: 12.5px; color: var(--text-muted); font-weight: 600; }
    .field-full { grid-column: 1 / -1; }
    .input, .select { border: 1px solid var(--border); border-radius: 10px; padding: 9px 10px; font-size: 13.5px; color: var(--text); font-family: inherit; background: var(--surface); }
    textarea.input { resize: vertical; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .callout { display: flex; gap: 10px; background: var(--amber-tint); color: var(--amber-dark); border-radius: 12px; padding: 12px 14px; font-size: 12.5px; line-height: 1.5; }
    .callout.info { background: var(--accent-tint); color: var(--accent-dark); }
    .segmented { display: inline-flex; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 3px; gap: 3px; }
    .segmented button { border: none; background: transparent; padding: 7px 12px; border-radius: 8px; font-size: 12.5px; font-weight: 600; color: var(--text-muted); cursor: pointer; }
    .segmented button.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
    .plaid { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-soft); font-size: 13px; }
    .plaid:last-child { border-bottom: none; }
    .statement-row { display: flex; justify-content: space-between; padding: 9px 0; font-size: 13.5px; border-bottom: 1px dashed var(--border-soft); }
    .statement-row.total { font-weight: 700; border-bottom: none; border-top: 1px solid var(--border); margin-top: 4px; padding-top: 10px; }
    .statement-row .neg { color: var(--red-dark); }
    .ft-bottom-nav { display: none; }
    .ft-more-sheet { position: fixed; inset: 0; background: rgba(15,20,17,0.4); z-index: 70; display: flex; align-items: flex-end; }
    .ft-more-panel { background: var(--surface); width: 100%; border-radius: 18px 18px 0 0; padding: 16px; max-height: 70vh; overflow-y: auto; }
    
    .desktop-only { display: block; }
    .mobile-only { display: none; }

    @media (max-width: 900px) {
      .ft-shell { display: block !important; }
      .ft-sidebar { display: none !important; }
      .ft-topbar { display: flex !important; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 16px; background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 40; }
      .ft-page { padding: 18px 14px 90px !important; }
      .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .grid-2 { grid-template-columns: 1fr !important; }
      .form-grid { grid-template-columns: 1fr !important; }
      .target-grid { grid-template-columns: 1fr !important; }
      .ft-bottom-nav { display: flex !important; position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border); padding: 6px 4px 8px; justify-content: space-around; z-index: 50; }
      .ft-bottom-item { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 10.5px; color: var(--text-muted); background: none; border: none; padding: 5px 4px; font-weight: 600; flex: 1; }
      .ft-bottom-item.active { color: var(--accent-dark); }
    }
    
    @media (max-width: 768px) {
      .desktop-only { display: none; }
      .mobile-only { display: block; }
    }
  `}</style>
);

/* ======================= KOMPONEN UI DASAR ======================= */

function useCrud(initial) {
  const [items, setItems] = useState(initial);
  const add = (item) => setItems((prev) => [{ ...item, id: uid() }, ...prev]);
  const update = (id, patch) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  return [items, { add, update, remove, setItems }];
}

function StatCard({ icon: Icon, label, value, sub, tone }) {
  return (
    <div className={`stat-card ${tone ? "tone-" + tone : ""}`}>
      <div className="stat-icon">
        <Icon size={16} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub ? <div className="stat-sub">{sub}</div> : null}
    </div>
  );
}

function ProgressBar({ percent, tone }) {
  const p = Math.max(0, Math.min(100, percent || 0));
  return (
    <div className="progress">
      <div
        className={`progress-bar ${tone || ""}`}
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="ft-page-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function Badge({ children, tone }) {
  return <span className={`badge badge-${tone || "gray"}`}>{children}</span>;
}

function EmptyState({ text }) {
  return <div className="empty-state">{text || "Belum ada data."}</div>;
}

function Toolbar({ search, setSearch, children, placeholder }) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <Search size={14} />
        <input
          placeholder={placeholder || "Cari..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {children}
    </div>
  );
}

function DataTable({
  columns,
  rows,
  onEdit,
  onDelete,
  emptyText,
  extraAction,
}) {
  if (!rows.length) return <EmptyState text={emptyText} />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.align ? { textAlign: c.align } : undefined}
              >
                {c.label}
              </th>
            ))}
            {(onEdit || onDelete || extraAction) && <th></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={c.align ? { textAlign: c.align } : undefined}
                >
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
              {(onEdit || onDelete || extraAction) && (
                <td>
                  <div className="row-actions">
                    {extraAction ? extraAction(r) : null}
                    {onEdit && (
                      <button className="icon-btn" onClick={() => onEdit(r)}>
                        <Pencil size={13} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="icon-btn danger"
                        onClick={() => {
                          if (window.confirm("Hapus data ini?")) onDelete(r.id);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormModal({
  title,
  fields,
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}) {
  const [values, setValues] = useState(() => {
    const v = {};
    fields.forEach((f) => {
      v[f.name] =
        initial && initial[f.name] !== undefined
          ? initial[f.name]
          : f.type === "number"
            ? 0
            : "";
    });
    return v;
  });
  const set = (name, val) => setValues((prev) => ({ ...prev, [name]: val }));
  const submit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onCancel}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            {fields.map((f) => (
              <label
                key={f.name}
                className={`field ${f.span === "full" ? "field-full" : ""}`}
              >
                <span>{f.label}</span>
                {f.type === "select" ? (
                  <select
                    className="select"
                    value={values[f.name]}
                    onChange={(e) => set(f.name, e.target.value)}
                    required={f.required}
                  >
                    <option value="" disabled>
                      Pilih {f.label.toLowerCase()}
                    </option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    className="input"
                    rows={2}
                    value={values[f.name]}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                ) : (
                  <input
                    className="input"
                    type={f.type || "text"}
                    value={values[f.name]}
                    required={f.required}
                    min={f.type === "number" ? 0 : undefined}
                    onChange={(e) =>
                      set(
                        f.name,
                        f.type === "number"
                          ? e.target.value === ""
                            ? ""
                            : Number(e.target.value)
                          : e.target.value,
                      )
                    }
                  />
                )}
              </label>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              {submitLabel || "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PeriodFilter({
  period,
  setPeriod,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
}) {
  return (
    <div className="toolbar">
      <div className="segmented">
        {[
          ["bulan_ini", "Bulan Ini"],
          ["bulan_lalu", "Bulan Lalu"],
          ["tahun_ini", "Tahun Ini"],
          ["custom", "Custom"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={period === key ? "active" : ""}
            onClick={() => setPeriod(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {period === "custom" && (
        <>
          <input
            type="date"
            className="ft-select"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
          />
          <span style={{ color: "var(--text-faint)", fontSize: 12 }}>s/d</span>
          <input
            type="date"
            className="ft-select"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
          />
        </>
      )}
    </div>
  );
}

/* ======================= MODE PRIBADI: DASHBOARD ======================= */

function PersonalDashboard({ transactions, targets }) {
  const data = useMemo(() => {
    const thisMonth = transactions.filter((t) => isThisMonth(t.date));
    const income = thisMonth
      .filter((t) => t.type === "in")
      .reduce((s, t) => s + t.amount, 0);
    const expense = thisMonth
      .filter((t) => t.type === "out")
      .reduce((s, t) => s + t.amount, 0);
    const totalIncomeAll = transactions
      .filter((t) => t.type === "in")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenseAll = transactions
      .filter((t) => t.type === "out")
      .reduce((s, t) => s + t.amount, 0);
    const balance = totalIncomeAll - totalExpenseAll;
    const netCF = income - expense;

    const catMap = {};
    thisMonth
      .filter((t) => t.type === "out" && !t.isTransfer)
      .forEach((t) => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      });
    const catData = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const months = last6Months();
    const series = months.map((m) => {
      const inM = transactions
        .filter((t) => t.type === "in" && monthKeyOf(t.date) === m.key)
        .reduce((s, t) => s + t.amount, 0);
      const outM = transactions
        .filter((t) => t.type === "out" && monthKeyOf(t.date) === m.key)
        .reduce((s, t) => s + t.amount, 0);
      return { name: m.label, Pemasukan: inM, Pengeluaran: outM };
    });

    const recent = [...transactions]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 6);

    const totalTarget = targets.reduce((s, t) => s + t.targetAmount, 0);
    const totalCollected = targets.reduce((s, t) => s + t.currentAmount, 0);
    const targetPct =
      totalTarget > 0 ? (totalCollected / totalTarget) * 100 : 0;

    return {
      income,
      expense,
      balance,
      netCF,
      catData,
      series,
      recent,
      totalTarget,
      totalCollected,
      targetPct,
    };
  }, [transactions, targets]);

  return (
    <div>
      <PageHeader title="Dashboard Finance" subtitle="by Yudha Awanugrahesa" />

      <div className="stat-grid">
        <StatCard
          icon={Wallet}
          label="Total Saldo"
          value={formatIDR(data.balance)}
          sub="Pemasukan − pengeluaran keseluruhan"
        />
        <StatCard
          icon={ArrowDownRight}
          label="Pemasukan Bulan Ini"
          value={formatIDR(data.income)}
          tone=""
        />
        <StatCard
          icon={ArrowUpRight}
          label="Pengeluaran Bulan Ini"
          value={formatIDR(data.expense)}
          tone="red"
        />
        <StatCard
          icon={data.netCF >= 0 ? TrendingUp : TrendingDown}
          label="Sisa Cash Flow"
          value={formatIDR(data.netCF)}
          sub={data.netCF >= 0 ? "Surplus bulan ini" : "Defisit bulan ini"}
          tone={data.netCF >= 0 ? "" : "red"}
        />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div>
            <div className="card-title">Target Tabungan Keseluruhan</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>
              {formatIDR(data.totalCollected)} dari{" "}
              {formatIDR(data.totalTarget)} target
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {data.targetPct.toFixed(0)}%
          </div>
        </div>
        <ProgressBar percent={data.targetPct} />
      </div>

      <div className="grid-2" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-title">Pemasukan vs Pengeluaran</div>
          <div className="card-sub">6 bulan terakhir</div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={data.series}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-soft)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#93998F" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#93998F" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                />
                <Tooltip formatter={(v) => formatIDR(v)} />
                <Area
                  type="monotone"
                  dataKey="Pemasukan"
                  stroke="#0E9F6E"
                  fill="#0E9F6E"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Pengeluaran"
                  stroke="#DC4C4C"
                  fill="#DC4C4C"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Pengeluaran per Kategori</div>
          <div className="card-sub">Bulan ini</div>
          {data.catData.length ? (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.catData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {data.catData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatIDR(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="Belum ada pengeluaran bulan ini." />
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Transaksi Terbaru</div>
        <div className="card-sub">6 transaksi terakhir</div>
        {data.recent.map((t) => (
          <div className="plaid" key={t.id}>
            <div>
              <div style={{ fontWeight: 600 }}>
                {t.description || t.category}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
                {formatDateID(t.date)} · {t.category}
              </div>
            </div>
            <div
              style={{
                fontWeight: 700,
                color:
                  t.type === "in" ? "var(--green-dark)" : "var(--red-dark)",
              }}
            >
              {t.type === "in" ? "+" : "-"}
              {formatIDR(t.amount)}
            </div>
          </div>
        ))}
        {!data.recent.length && <EmptyState text="Belum ada transaksi." />}
      </div>
    </div>
  );
}

/* ======================= MODE PRIBADI: TRANSAKSI ======================= */

function PersonalTransactions({ transactions, crud }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [modal, setModal] = useState(null);

  // Ambil data otomatis dari database XAMPP saat halaman pertama kali dibuka atau direfresh
  useEffect(() => {
    fetch("http://localhost:5000/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((item) => ({
          id: item.ID,
          date: item.Tanggal,
          type: item.Jenis_Transaksi === "Pemasukan" ? "in" : "out",
          category: item.Kategori,
          amount: Number(item.Nominal) || 0,
          description: item.Deskripsi,
          method: item.Metode_Pembayaran,
          note: item.Keterangan,
          isTransfer: false,
        }));
        crud.setItems(formattedData);
      })
      .catch((err) => console.error("Gagal memuat data dari database:", err));
  }, []);

  const rows = useMemo(() => {
    return transactions
      .filter((t) => !filterType || t.type === filterType)
      .filter((t) => !filterCat || t.category === filterCat)
      .filter((t) => {
        const q = search.toLowerCase();
        return (
          !q ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, search, filterType, filterCat]);

  const allCats = [...PERSONAL_INCOME_CATS, ...PERSONAL_EXPENSE_CATS];

  const fields = (type) => [
    { name: "date", label: "Tanggal", type: "date", required: true },
    {
      name: "typeLabel",
      label: "Jenis Transaksi",
      type: "select",
      options: ["Pemasukan", "Pengeluaran"],
      required: true,
    },
    {
      name: "category",
      label: "Kategori",
      type: "select",
      options:
        type === "Pemasukan" ? PERSONAL_INCOME_CATS : PERSONAL_EXPENSE_CATS,
      required: true,
    },
    { name: "amount", label: "Nominal (Rp)", type: "number", required: true },
    { name: "description", label: "Deskripsi", type: "text" },
    {
      name: "method",
      label: "Metode Pembayaran",
      type: "select",
      options: PAYMENT_METHODS,
    },
    { name: "note", label: "Catatan", type: "textarea", span: "full" },
  ];

  const openAdd = () => setModal({ mode: "add", typeLabel: "Pengeluaran" });
  const openEdit = (row) =>
    setModal({
      mode: "edit",
      row,
      typeLabel: row.type === "in" ? "Pemasukan" : "Pengeluaran",
    });

  // FUNGSI SUBMIT (Kirim ke backend dulu, jika sukses baru update state lokal)
  const handleSubmit = async (values) => {
    try {
      const transactionDataToBackend = {
        tanggal: values.date,
        deskripsi: values.description || "-",
        jenis_transaksi: values.typeLabel,
        kategori: values.category,
        nominal: Number(values.amount) || 0,
        metode_pembayaran: values.method || "-",
        keterangan: values.note || "-",
      };

      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionDataToBackend),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Berhasil masuk ke database XAMPP:", result.message);

        const payload = {
          id: result.id,
          date: values.date,
          type: values.typeLabel === "Pemasukan" ? "in" : "out",
          category: values.category,
          amount: Number(values.amount) || 0,
          description: values.description,
          method: values.method,
          note: values.note,
          isTransfer: false,
        };

        if (modal.mode === "add") crud.add(payload);
        else crud.update(modal.row.id, payload);

        setModal(null);
      } else {
        console.error("Gagal simpan ke database:", result.error);
        alert("Gagal menyimpan ke database: " + result.error);
      }
    } catch (error) {
      console.error(
        "Server backend (port 5000) tidak aktif atau terputus:",
        error,
      );
      alert("Tidak dapat terhubung ke server backend di port 5000!");
    }
  };

  return (
    <div>
      <PageHeader
        title="Transaksi Pribadi"
        subtitle="Catat semua pemasukan dan pengeluaran pribadi"
        action={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> Tambah Transaksi
          </button>
        }
      />
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Cari deskripsi atau kategori..."
      >
        <select
          className="ft-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Semua Jenis</option>
          <option value="in">Pemasukan</option>
          <option value="out">Pengeluaran</option>
        </select>
        <select
          className="ft-select"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {allCats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Toolbar>

      <DataTable
        emptyText="Belum ada transaksi yang cocok."
        columns={[
          {
            key: "date",
            label: "Tanggal",
            render: (r) => formatDateID(r.date),
          },
          {
            key: "type",
            label: "Jenis",
            render: (r) => (
              <Badge tone={r.type === "in" ? "green" : "red"}>
                {r.type === "in" ? "Pemasukan" : "Pengeluaran"}
              </Badge>
            ),
          },
          { key: "category", label: "Kategori" },
          { key: "description", label: "Deskripsi" },
          { key: "method", label: "Metode" },
          {
            key: "amount",
            label: "Nominal",
            align: "right",
            render: (r) => (
              <span
                style={{
                  fontWeight: 700,
                  color:
                    r.type === "in" ? "var(--green-dark)" : "var(--red-dark)",
                }}
              >
                {r.type === "in" ? "+" : "-"}
                {formatIDR(r.amount)}
              </span>
            ),
          },
        ]}
        rows={rows}
        onEdit={openEdit}
        onDelete={crud.remove}
      />

      {modal && (
        <FormModal
          title={modal.mode === "add" ? "Tambah Transaksi" : "Edit Transaksi"}
          fields={fields(modal.typeLabel)}
          initial={
            modal.row
              ? { ...modal.row, typeLabel: modal.typeLabel }
              : { typeLabel: modal.typeLabel, date: isoDaysAgo(0) }
          }
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
} /* ======================= MODE PRIBADI: CASH FLOW ======================= */

function PersonalCashflow({ transactions }) {
  const data = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "in")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "out")
      .reduce((s, t) => s + t.amount, 0);
    const net = totalIncome - totalExpense;
    const saldoAwal = 0;
    const saldoAkhir = saldoAwal + net;

    const months = last6Months();
    const series = months.map((m) => {
      const inM = transactions
        .filter((t) => t.type === "in" && monthKeyOf(t.date) === m.key)
        .reduce((s, t) => s + t.amount, 0);
      const outM = transactions
        .filter((t) => t.type === "out" && monthKeyOf(t.date) === m.key)
        .reduce((s, t) => s + t.amount, 0);
      return { name: m.label, Bersih: inM - outM };
    });
    return { totalIncome, totalExpense, net, saldoAwal, saldoAkhir, series };
  }, [transactions]);

  return (
    <div>
      <PageHeader
        title="Cash Flow Pribadi"
        subtitle="Pantau arus kas masuk dan keluar"
      />
      <div className="stat-grid">
        <StatCard
          icon={Wallet}
          label="Saldo Awal"
          value={formatIDR(data.saldoAwal)}
        />
        <StatCard
          icon={ArrowDownRight}
          label="Total Pemasukan"
          value={formatIDR(data.totalIncome)}
        />
        <StatCard
          icon={ArrowUpRight}
          label="Total Pengeluaran"
          value={formatIDR(data.totalExpense)}
          tone="red"
        />
        <StatCard
          icon={data.net >= 0 ? TrendingUp : TrendingDown}
          label="Saldo Akhir"
          value={formatIDR(data.saldoAkhir)}
          sub={
            data.net >= 0 ? "Net cash flow surplus" : "Net cash flow defisit"
          }
          tone={data.net >= 0 ? "" : "red"}
        />
      </div>
      <div className="card">
        <div className="card-title">Net Cash Flow Bulanan</div>
        <div className="card-sub">6 bulan terakhir</div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data.series}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-soft)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#93998F" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#93998F" }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
              />
              <Tooltip formatter={(v) => formatIDR(v)} />
              <Bar dataKey="Bersih" radius={[6, 6, 0, 0]}>
                {data.series.map((s, i) => (
                  <Cell key={i} fill={s.Bersih >= 0 ? "#0E9F6E" : "#DC4C4C"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ======================= MODE PRIBADI: TARGET ======================= */

function TargetCard({ t, onEdit, onDelete, unitSuffix, formatVal }) {
  const pct =
    t.targetAmount > 0 || t.targetValue > 0
      ? ((t.currentAmount ?? t.currentValue) /
          (t.targetAmount ?? t.targetValue)) *
        100
      : 0;
  const target = t.targetAmount ?? t.targetValue;
  const current = t.currentAmount ?? t.currentValue;
  const sisa = Math.max(0, target - current);
  const now = new Date().toISOString().slice(0, 10);
  const tercapai = current >= target;
  const lewatDeadline = t.deadline && t.deadline < now && !tercapai;
  return (
    <div className="target-card">
      <div className="target-card-head">
        <div>
          <div className="target-name">{t.name}</div>
          <div className="target-desc">{t.description}</div>
        </div>
        <div className="row-actions">
          <button className="icon-btn" onClick={() => onEdit(t)}>
            <Pencil size={13} />
          </button>
          <button
            className="icon-btn danger"
            onClick={() => {
              if (window.confirm("Hapus target ini?")) onDelete(t.id);
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <ProgressBar
        percent={pct}
        tone={tercapai ? "" : lewatDeadline ? "over" : ""}
      />
      <div className="target-nums">
        <span>
          <b>{formatVal(current)}</b>
          {unitSuffix} / {formatVal(target)}
          {unitSuffix}
        </span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
          Sisa {formatVal(sisa)}
          {unitSuffix} · {formatDateID(t.deadline)}
        </span>
        <Badge tone={tercapai ? "green" : lewatDeadline ? "red" : "blue"}>
          {tercapai ? "Tercapai" : lewatDeadline ? "Lewat Tenggat" : "Berjalan"}
        </Badge>
      </div>
    </div>
  );
}

function PersonalTargets({ targets, crud }) {
  const [modal, setModal] = useState(null);
  const fields = [
    { name: "name", label: "Nama Target", type: "text", required: true },
    {
      name: "targetAmount",
      label: "Target Nominal (Rp)",
      type: "number",
      required: true,
    },
    { name: "currentAmount", label: "Nominal Terkumpul (Rp)", type: "number" },
    { name: "deadline", label: "Deadline", type: "date", required: true },
    { name: "description", label: "Deskripsi", type: "textarea", span: "full" },
  ];
  const handleSubmit = (values) => {
    const payload = {
      ...values,
      targetAmount: Number(values.targetAmount) || 0,
      currentAmount: Number(values.currentAmount) || 0,
    };
    if (modal.mode === "add") crud.add(payload);
    else crud.update(modal.row.id, payload);
    setModal(null);
  };
  return (
    <div>
      <PageHeader
        title="Target Keuangan Pribadi"
        subtitle="Contoh: dana darurat, beli laptop, liburan, modal usaha"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal({ mode: "add" })}
          >
            <Plus size={15} /> Tambah Target
          </button>
        }
      />
      {targets.length ? (
        <div className="target-grid">
          {targets.map((t) => (
            <TargetCard
              key={t.id}
              t={t}
              onEdit={(row) => setModal({ mode: "edit", row })}
              onDelete={crud.remove}
              unitSuffix=""
              formatVal={formatIDR}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState text="Belum ada target. Tambahkan target pertamamu." />
        </div>
      )}
      {modal && (
        <FormModal
          title={modal.mode === "add" ? "Tambah Target" : "Edit Target"}
          fields={fields}
          initial={modal.row}
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ======================= MODE PRIBADI: BUDGET ======================= */

function PersonalBudget({ transactions, budgets, crud }) {
  const [modal, setModal] = useState(null);
  const usedCats = budgets.map((b) => b.category);
  const availableCats = PERSONAL_EXPENSE_CATS.filter(
    (c) => !usedCats.includes(c),
  );

  const realisasiFor = (cat) =>
    transactions
      .filter(
        (t) =>
          t.type === "out" &&
          t.category === cat &&
          isThisMonth(t.date) &&
          !t.isTransfer,
      )
      .reduce((s, t) => s + t.amount, 0);

  const fields = [
    {
      name: "category",
      label: "Kategori",
      type: "select",
      options:
        modal && modal.mode === "edit" ? PERSONAL_EXPENSE_CATS : availableCats,
      required: true,
    },
    {
      name: "budgetAmount",
      label: "Anggaran Bulanan (Rp)",
      type: "number",
      required: true,
    },
  ];

  const handleSubmit = (values) => {
    const payload = {
      category: values.category,
      budgetAmount: Number(values.budgetAmount) || 0,
    };
    if (modal.mode === "add") crud.add(payload);
    else crud.update(modal.row.id, payload);
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Budget Pribadi"
        subtitle="Atur anggaran bulanan per kategori pengeluaran"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal({ mode: "add" })}
            disabled={!availableCats.length}
          >
            <Plus size={15} /> Tambah Budget
          </button>
        }
      />
      {budgets.length ? (
        <div className="row-gap">
          {budgets.map((b) => {
            const realisasi = realisasiFor(b.category);
            const pct =
              b.budgetAmount > 0 ? (realisasi / b.budgetAmount) * 100 : 0;
            const sisa = b.budgetAmount - realisasi;
            const tone = pct > 100 ? "over" : pct >= 80 ? "warn" : "";
            return (
              <div className="card" key={b.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div className="card-title" style={{ marginBottom: 2 }}>
                      {b.category}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {formatIDR(realisasi)} dari {formatIDR(b.budgetAmount)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "flex-start",
                    }}
                  >
                    <Badge
                      tone={pct > 100 ? "red" : pct >= 80 ? "amber" : "green"}
                    >
                      {pct.toFixed(0)}%
                    </Badge>
                    <button
                      className="icon-btn"
                      onClick={() => setModal({ mode: "edit", row: b })}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => {
                        if (window.confirm("Hapus budget ini?"))
                          crud.remove(b.id);
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <ProgressBar percent={pct} tone={tone} />
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-faint)",
                    marginTop: 6,
                  }}
                >
                  {sisa >= 0
                    ? `Sisa budget ${formatIDR(sisa)}`
                    : `Melebihi budget ${formatIDR(Math.abs(sisa))}`}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <EmptyState text="Belum ada budget yang diatur." />
        </div>
      )}
      {modal && (
        <FormModal
          title={modal.mode === "add" ? "Tambah Budget" : "Edit Budget"}
          fields={fields}
          initial={modal.row}
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ======================= MODE PRIBADI: LAPORAN ======================= */

function PersonalReports({ transactions }) {
  const [period, setPeriod] = useState("bulan_ini");
  const [customFrom, setCustomFrom] = useState(isoDaysAgo(30));
  const [customTo, setCustomTo] = useState(isoDaysAgo(0));

  const filtered = useMemo(
    () =>
      transactions.filter((t) =>
        inPeriod(t.date, period, customFrom, customTo),
      ),
    [transactions, period, customFrom, customTo],
  );

  const income = filtered
    .filter((t) => t.type === "in")
    .reduce((s, t) => s + t.amount, 0);
  const expense = filtered
    .filter((t) => t.type === "out")
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  const catMap = {};
  filtered
    .filter((t) => t.type === "out")
    .forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
  const catRows = Object.entries(catMap)
    .map(([category, total]) => ({ id: category, category, total }))
    .sort((a, b) => b.total - a.total);

  const handleExport = () => {
    const rows = [
      ["Tanggal", "Jenis", "Kategori", "Deskripsi", "Metode", "Nominal"],
    ];
    filtered.forEach((t) =>
      rows.push([
        t.date,
        t.type === "in" ? "Pemasukan" : "Pengeluaran",
        t.category,
        t.description,
        t.method,
        t.amount,
      ]),
    );
    downloadCSV(`laporan-pribadi-${period}.csv`, rows);
  };

  return (
    <div>
      <PageHeader
        title="Laporan Keuangan Pribadi"
        subtitle="Ringkasan transaksi berdasarkan periode"
        action={
          <button className="btn btn-ghost" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </button>
        }
      />
      <PeriodFilter
        period={period}
        setPeriod={setPeriod}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
      />

      <div
        className="stat-grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        <StatCard
          icon={ArrowDownRight}
          label="Total Pemasukan"
          value={formatIDR(income)}
        />
        <StatCard
          icon={ArrowUpRight}
          label="Total Pengeluaran"
          value={formatIDR(expense)}
          tone="red"
        />
        <StatCard
          icon={net >= 0 ? TrendingUp : TrendingDown}
          label="Net Cash Flow"
          value={formatIDR(net)}
          tone={net >= 0 ? "" : "red"}
        />
      </div>

      <div className="card">
        <div className="card-title">Pengeluaran per Kategori</div>
        <div className="card-sub">Sesuai periode terpilih</div>
        <DataTable
          emptyText="Tidak ada pengeluaran pada periode ini."
          columns={[
            { key: "category", label: "Kategori" },
            {
              key: "total",
              label: "Total",
              align: "right",
              render: (r) => formatIDR(r.total),
            },
          ]}
          rows={catRows}
        />
      </div>
    </div>
  );
}

/* ======================= PENGATURAN (SHARED) ======================= */

function SettingsPage({ mode, onResetDemo }) {
  return (
    <div>
      <PageHeader
        title="Pengaturan"
        subtitle={`Mode aktif: ${mode === "pribadi" ? "Keuangan Pribadi" : "Keuangan Usaha"}`}
      />
      <div className="row-gap">
        <div className="callout info">
          <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            Versi ini menyimpan data sementara selama sesi berjalan di
            perangkatmu (belum terhubung ke database online). Data akan kembali
            ke contoh awal jika halaman dimuat ulang. Struktur data sudah
            dipisah rapi per modul sehingga siap dihubungkan ke database online
            pada tahap pengembangan berikutnya.
          </div>
        </div>
        <div className="card">
          <div className="card-title">Tentang CloudTrack</div>
          <div className="card-sub">
            Kelola keuangan pribadi dan usaha dalam satu aplikasi, tanpa
            tercampur.
          </div>
          <div className="plaid">
            <span>Mata uang</span>
            <b>Rupiah (IDR)</b>
          </div>
          <div className="plaid">
            <span>Bahasa</span>
            <b>Indonesia</b>
          </div>
          <div className="plaid">
            <span>Versi</span>
            <b>1.0 — Data Lokal</b>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Reset Data</div>
          <div className="card-sub">
            Muat ulang seluruh data ke data contoh bawaan.
          </div>
          <button className="btn btn-ghost" onClick={onResetDemo}>
            Muat Ulang Data Contoh
          </button>
        </div>
      </div>
    </div>
  );
}

/* ======================= MODE USAHA: DASHBOARD ======================= */

function BusinessDashboard({ sales, expenses, capital, products, targets }) {
  const data = useMemo(() => {
    const hppOf = (name) => {
      const p = products.find(
        (p) => p.name.toLowerCase() === (name || "").toLowerCase(),
      );
      return p ? p.hpp : 0;
    };
    const thisMonthSales = sales.filter((s) => isThisMonth(s.date));
    const thisMonthExpenses = expenses.filter((e) => isThisMonth(e.date));

    const omzetMonth = thisMonthSales.reduce((s, x) => s + x.total, 0);
    const hppMonth = thisMonthSales.reduce(
      (s, x) => s + x.qty * hppOf(x.product),
      0,
    );
    const biayaOperasionalMonth = thisMonthExpenses
      .filter((e) => e.bucket === "Operasional")
      .reduce((s, e) => s + e.amount, 0);
    const biayaProduksiMonth = thisMonthExpenses
      .filter((e) => e.bucket === "Produksi")
      .reduce((s, e) => s + e.amount, 0);
    const labaKotor = omzetMonth - hppMonth;
    const labaBersih = labaKotor - biayaOperasionalMonth;
    const marginLB = omzetMonth > 0 ? (labaBersih / omzetMonth) * 100 : 0;

    const capitalAwal = capital
      .filter((c) => c.type === "awal")
      .reduce((s, c) => s + c.amount, 0);
    const capitalTambahan = capital
      .filter((c) => c.type === "tambahan")
      .reduce((s, c) => s + c.amount, 0);
    const capitalPenarikan = capital
      .filter((c) => c.type === "penarikan")
      .reduce((s, c) => s + c.amount, 0);
    const paidSalesAll = sales
      .filter((s) => s.status !== "Belum Lunas")
      .reduce((s, x) => s + x.total, 0);
    const expenseAllTotal = expenses.reduce((s, e) => s + e.amount, 0);
    const kas =
      capitalAwal +
      (paidSalesAll + capitalTambahan) -
      (expenseAllTotal + capitalPenarikan);

    const stockValue = products.reduce(
      (s, p) => s + (p.stockAwal + p.stockMasuk - p.stockKeluar) * p.hpp,
      0,
    );
    const productsSoldMonth = thisMonthSales.reduce((s, x) => s + x.qty, 0);

    const omzetTarget = targets.find((t) => t.type === "Omzet");

    const months = last6Months();
    const salesSeries = months.map((m) => ({
      name: m.label,
      Omzet: sales
        .filter((s) => monthKeyOf(s.date) === m.key)
        .reduce((s2, x) => s2 + x.total, 0),
    }));
    const labaSeries = months.map((m) => {
      const salesM = sales.filter((s) => monthKeyOf(s.date) === m.key);
      const expM = expenses
        .filter(
          (e) => monthKeyOf(e.date) === m.key && e.bucket === "Operasional",
        )
        .reduce((s2, e) => s2 + e.amount, 0);
      const omzetM = salesM.reduce((s2, x) => s2 + x.total, 0);
      const hppM = salesM.reduce((s2, x) => s2 + x.qty * hppOf(x.product), 0);
      return { name: m.label, Laba: omzetM - hppM - expM };
    });

    const prodMap = {};
    sales.forEach((s) => {
      prodMap[s.product] = (prodMap[s.product] || 0) + s.total;
    });
    const prodData = Object.entries(prodMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      omzetMonth,
      hppMonth,
      biayaOperasionalMonth,
      biayaProduksiMonth,
      labaKotor,
      labaBersih,
      marginLB,
      kas,
      stockValue,
      productsSoldMonth,
      omzetTarget,
      salesSeries,
      labaSeries,
      prodData,
    };
  }, [sales, expenses, capital, products, targets]);

  return (
    <div>
      <PageHeader
        title="Dashboard Usaha"
        subtitle="Ringkasan keuangan bisnis bulan ini"
      />
      <div className="stat-grid">
        <StatCard
          icon={Wallet}
          label="Saldo Kas Usaha"
          value={formatIDR(data.kas)}
        />
        <StatCard
          icon={ShoppingCart}
          label="Omzet Bulan Ini"
          value={formatIDR(data.omzetMonth)}
        />
        <StatCard
          icon={Calculator}
          label="HPP Bulan Ini"
          value={formatIDR(data.hppMonth)}
        />
        <StatCard
          icon={data.labaBersih >= 0 ? TrendingUp : TrendingDown}
          label="Laba Bersih Bulan Ini"
          value={formatIDR(data.labaBersih)}
          sub={
            data.labaBersih >= 0
              ? `Usaha Untung · margin ${data.marginLB.toFixed(1)}%`
              : `Usaha Rugi · margin ${data.marginLB.toFixed(1)}%`
          }
          tone={data.labaBersih >= 0 ? "" : "red"}
        />
      </div>
      <div className="stat-grid">
        <StatCard
          icon={TrendingUp}
          label="Laba Kotor Bulan Ini"
          value={formatIDR(data.labaKotor)}
        />
        <StatCard
          icon={Receipt}
          label="Biaya Operasional"
          value={formatIDR(data.biayaOperasionalMonth)}
          tone="amber"
        />
        <StatCard
          icon={Boxes}
          label="Nilai Stok"
          value={formatIDR(data.stockValue)}
          sub={`${data.productsSoldMonth} pcs terjual bulan ini`}
        />
        <StatCard
          icon={Target}
          label="Target Omzet"
          value={
            data.omzetTarget
              ? `${((data.omzetTarget.currentValue / data.omzetTarget.targetValue) * 100).toFixed(0)}%`
              : "-"
          }
          sub={
            data.omzetTarget
              ? `${formatIDR(data.omzetTarget.currentValue)} / ${formatIDR(data.omzetTarget.targetValue)}`
              : "Belum ada target"
          }
        />
      </div>

      <div className="grid-2" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-title">Penjualan Bulanan</div>
          <div className="card-sub">6 bulan terakhir</div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={data.salesSeries}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-soft)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#93998F" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#93998F" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                />
                <Tooltip formatter={(v) => formatIDR(v)} />
                <Bar dataKey="Omzet" fill="#2F6FED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Penjualan per Produk</div>
          <div className="card-sub">Berdasarkan total nilai</div>
          {data.prodData.length ? (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.prodData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {data.prodData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatIDR(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState text="Belum ada data penjualan." />
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Laba Bersih Bulanan</div>
        <div className="card-sub">6 bulan terakhir</div>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={data.labaSeries}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-soft)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#93998F" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#93998F" }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
              />
              <Tooltip formatter={(v) => formatIDR(v)} />
              <Line
                type="monotone"
                dataKey="Laba"
                stroke="#2F6FED"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ======================= MODE USAHA: PENJUALAN ======================= */

function BusinessSales({ sales, crud, products }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null);

  const productNames = useMemo(
    () => [...new Set(products.map((p) => p.name))],
    [products],
  );

  const rows = useMemo(() => {
    return sales
      .filter((s) => !filterStatus || s.status === filterStatus)
      .filter((s) => {
        const q = search.toLowerCase();
        return (
          !q ||
          s.product.toLowerCase().includes(q) ||
          s.trxNo.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [sales, search, filterStatus]);

  const fields = [
    { name: "date", label: "Tanggal", type: "date", required: true },
    { name: "trxNo", label: "Nomor Transaksi", type: "text", required: true },
    {
      name: "product",
      label: "Nama Produk",
      type: "select",
      options: productNames.length ? productNames : ["Produk"],
      required: true,
    },
    { name: "variant", label: "Varian / Ukuran", type: "text" },
    { name: "qty", label: "Jumlah Terjual", type: "number", required: true },
    {
      name: "price",
      label: "Harga Jual per Unit (Rp)",
      type: "number",
      required: true,
    },
    {
      name: "method",
      label: "Metode Pembayaran",
      type: "select",
      options: PAYMENT_METHODS,
    },
    {
      name: "status",
      label: "Status Pembayaran",
      type: "select",
      options: SALES_STATUS,
      required: true,
    },
    { name: "note", label: "Catatan", type: "textarea", span: "full" },
  ];

  const handleSubmit = (values) => {
    const qty = Number(values.qty) || 0;
    const price = Number(values.price) || 0;
    const payload = { ...values, qty, price, total: qty * price };
    if (modal.mode === "add") crud.add(payload);
    else crud.update(modal.row.id, payload);
    setModal(null);
  };

  const nextTrxNo = () => {
    const nums = sales
      .map((s) => parseInt((s.trxNo || "").replace(/\D/g, ""), 10))
      .filter((n) => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 1000) + 1;
    return `INV-${next}`;
  };

  return (
    <div>
      <PageHeader
        title="Penjualan Usaha"
        subtitle="Catat setiap transaksi penjualan produk"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal({ mode: "add", trxNo: nextTrxNo() })}
          >
            <Plus size={15} /> Tambah Penjualan
          </button>
        }
      />
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Cari produk atau no. transaksi..."
      >
        <select
          className="ft-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          {SALES_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Toolbar>
      <DataTable
        emptyText="Belum ada penjualan yang cocok."
        columns={[
          {
            key: "date",
            label: "Tanggal",
            render: (r) => formatDateID(r.date),
          },
          { key: "trxNo", label: "No. Trx" },
          { key: "product", label: "Produk" },
          { key: "variant", label: "Varian" },
          { key: "qty", label: "Qty", align: "right" },
          {
            key: "price",
            label: "Harga",
            align: "right",
            render: (r) => formatIDR(r.price),
          },
          {
            key: "total",
            label: "Total",
            align: "right",
            render: (r) => <b>{formatIDR(r.total)}</b>,
          },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <Badge
                tone={
                  r.status === "Lunas"
                    ? "green"
                    : r.status === "DP"
                      ? "amber"
                      : "red"
                }
              >
                {r.status}
              </Badge>
            ),
          },
        ]}
        rows={rows}
        onEdit={(row) => setModal({ mode: "edit", row })}
        onDelete={crud.remove}
      />
      {modal && (
        <FormModal
          title={modal.mode === "add" ? "Tambah Penjualan" : "Edit Penjualan"}
          fields={fields}
          initial={
            modal.row || {
              date: isoDaysAgo(0),
              trxNo: modal.trxNo,
              status: "Lunas",
              method: "Transfer Bank",
            }
          }
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ======================= MODE USAHA: PENGELUARAN ======================= */

function BusinessExpenses({ expenses, crud }) {
  const [search, setSearch] = useState("");
  const [filterBucket, setFilterBucket] = useState("");
  const [modal, setModal] = useState(null);

  const rows = useMemo(() => {
    return expenses
      .filter((e) => !filterBucket || e.bucket === filterBucket)
      .filter((e) => {
        const q = search.toLowerCase();
        return (
          !q ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [expenses, search, filterBucket]);

  const totalProduksiMonth = expenses
    .filter((e) => e.bucket === "Produksi" && isThisMonth(e.date))
    .reduce((s, e) => s + e.amount, 0);
  const totalOperasionalMonth = expenses
    .filter((e) => e.bucket === "Operasional" && isThisMonth(e.date))
    .reduce((s, e) => s + e.amount, 0);

  const fields = [
    { name: "date", label: "Tanggal", type: "date", required: true },
    {
      name: "category",
      label: "Kategori",
      type: "select",
      options: BUSINESS_EXPENSE_CATS,
      required: true,
    },
    {
      name: "bucket",
      label: "Jenis Biaya",
      type: "select",
      options: ["Produksi", "Operasional"],
      required: true,
    },
    { name: "amount", label: "Nominal (Rp)", type: "number", required: true },
    { name: "description", label: "Deskripsi", type: "text" },
    {
      name: "method",
      label: "Metode Pembayaran",
      type: "select",
      options: PAYMENT_METHODS,
    },
    { name: "note", label: "Catatan", type: "textarea", span: "full" },
  ];

  const handleSubmit = (values) => {
    const payload = { ...values, amount: Number(values.amount) || 0 };
    if (modal.mode === "add") crud.add(payload);
    else crud.update(modal.row.id, payload);
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Pengeluaran Usaha"
        subtitle="Biaya produksi digunakan untuk HPP, biaya operasional untuk laba bersih"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal({ mode: "add", bucket: "Operasional" })}
          >
            <Plus size={15} /> Tambah Pengeluaran
          </button>
        }
      />
      <div
        className="stat-grid"
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        <StatCard
          icon={Calculator}
          label="Biaya Produksi Bulan Ini"
          value={formatIDR(totalProduksiMonth)}
          sub="Dipakai untuk perhitungan HPP"
        />
        <StatCard
          icon={Receipt}
          label="Biaya Operasional Bulan Ini"
          value={formatIDR(totalOperasionalMonth)}
          tone="amber"
          sub="Dipakai untuk perhitungan laba bersih"
        />
      </div>
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Cari deskripsi atau kategori..."
      >
        <select
          className="ft-select"
          value={filterBucket}
          onChange={(e) => setFilterBucket(e.target.value)}
        >
          <option value="">Semua Jenis</option>
          <option value="Produksi">Produksi</option>
          <option value="Operasional">Operasional</option>
        </select>
      </Toolbar>
      <DataTable
        emptyText="Belum ada pengeluaran yang cocok."
        columns={[
          {
            key: "date",
            label: "Tanggal",
            render: (r) => formatDateID(r.date),
          },
          { key: "category", label: "Kategori" },
          {
            key: "bucket",
            label: "Jenis",
            render: (r) => (
              <Badge tone={r.bucket === "Produksi" ? "blue" : "amber"}>
                {r.bucket}
              </Badge>
            ),
          },
          { key: "description", label: "Deskripsi" },
          { key: "method", label: "Metode" },
          {
            key: "amount",
            label: "Nominal",
            align: "right",
            render: (r) => (
              <b style={{ color: "var(--red-dark)" }}>-{formatIDR(r.amount)}</b>
            ),
          },
        ]}
        rows={rows}
        onEdit={(row) => setModal({ mode: "edit", row })}
        onDelete={crud.remove}
      />
      {modal && (
        <FormModal
          title={
            modal.mode === "add" ? "Tambah Pengeluaran" : "Edit Pengeluaran"
          }
          fields={fields}
          initial={modal.row || { date: isoDaysAgo(0), bucket: modal.bucket }}
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ======================= MODE USAHA: MODAL ======================= */

function BusinessCapital({ capital, crud }) {
  const [modal, setModal] = useState(null);
  const awal = capital
    .filter((c) => c.type === "awal")
    .reduce((s, c) => s + c.amount, 0);
  const tambahan = capital
    .filter((c) => c.type === "tambahan")
    .reduce((s, c) => s + c.amount, 0);
  const penarikan = capital
    .filter((c) => c.type === "penarikan")
    .reduce((s, c) => s + c.amount, 0);
  const modalAkhir = awal + tambahan - penarikan;

  const fields = [
    { name: "date", label: "Tanggal", type: "date", required: true },
    {
      name: "typeLabel",
      label: "Jenis Modal",
      type: "select",
      options: CAPITAL_TYPES,
      required: true,
    },
    { name: "amount", label: "Nominal (Rp)", type: "number", required: true },
    { name: "source", label: "Sumber Modal", type: "text" },
    { name: "note", label: "Keterangan", type: "textarea", span: "full" },
  ];

  const handleSubmit = (values) => {
    const payload = {
      date: values.date,
      type: CAPITAL_TYPE_MAP[values.typeLabel],
      amount: Number(values.amount) || 0,
      source: values.source,
      note: values.note,
    };
    if (modal.mode === "add") crud.add(payload);
    else crud.update(modal.row.id, payload);
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Modal Usaha"
        subtitle="Pisahkan modal usaha, keuntungan usaha, dan uang pribadi"
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setModal({ mode: "add", typeLabel: "Tambahan Modal" })
            }
          >
            <Plus size={15} /> Tambah Modal
          </button>
        }
      />
      <div className="callout">
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          Saldo kas usaha tidak selalu sama dengan laba. Modal, keuntungan, dan
          penarikan pribadi dicatat terpisah agar perhitungan tetap akurat.
        </div>
      </div>
      <div className="stat-grid" style={{ margin: "12px 0 16px" }}>
        <StatCard icon={Wallet} label="Modal Awal" value={formatIDR(awal)} />
        <StatCard
          icon={ArrowDownRight}
          label="Tambahan Modal"
          value={formatIDR(tambahan)}
        />
        <StatCard
          icon={ArrowUpRight}
          label="Penarikan Modal"
          value={formatIDR(penarikan)}
          tone="amber"
        />
        <StatCard
          icon={PiggyBank}
          label="Modal Akhir"
          value={formatIDR(modalAkhir)}
        />
      </div>
      <DataTable
        emptyText="Belum ada catatan modal."
        columns={[
          {
            key: "date",
            label: "Tanggal",
            render: (r) => formatDateID(r.date),
          },
          {
            key: "type",
            label: "Jenis",
            render: (r) => (
              <Badge tone={r.type === "penarikan" ? "amber" : "green"}>
                {CAPITAL_TYPE_LABEL[r.type]}
              </Badge>
            ),
          },
          { key: "source", label: "Sumber" },
          { key: "note", label: "Keterangan" },
          {
            key: "amount",
            label: "Nominal",
            align: "right",
            render: (r) => formatIDR(r.amount),
          },
        ]}
        rows={[...capital].sort((a, b) => (a.date < b.date ? 1 : -1))}
        onEdit={(row) =>
          setModal({
            mode: "edit",
            row: { ...row, typeLabel: CAPITAL_TYPE_LABEL[row.type] },
          })
        }
        onDelete={crud.remove}
      />
      {modal && (
        <FormModal
          title={modal.mode === "add" ? "Tambah Modal" : "Edit Modal"}
          fields={fields}
          initial={
            modal.row || { date: isoDaysAgo(0), typeLabel: modal.typeLabel }
          }
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ======================= MODE USAHA: HPP PRODUK ======================= */

function BusinessHPPPage({ hppList, crud, products, productsCrud }) {
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");

  const fields = [
    { name: "productName", label: "Nama Produk", type: "text", required: true },
    {
      name: "bahanBaku",
      label: "Bahan Baku (Rp)",
      type: "number",
      required: true,
    },
    {
      name: "tenagaKerja",
      label: "Biaya Tenaga Kerja (Rp)",
      type: "number",
      required: true,
    },
    {
      name: "overhead",
      label: "Biaya Overhead (Rp)",
      type: "number",
      required: true,
    },
    {
      name: "jumlahProduksi",
      label: "Jumlah Produksi (pcs)",
      type: "number",
      required: true,
    },
  ];

  const handleSubmit = (values) => {
    const payload = {
      productName: values.productName,
      bahanBaku: Number(values.bahanBaku) || 0,
      tenagaKerja: Number(values.tenagaKerja) || 0,
      overhead: Number(values.overhead) || 0,
      jumlahProduksi: Number(values.jumlahProduksi) || 0,
    };
    if (modal.mode === "add") crud.add(payload);
    else crud.update(modal.row.id, payload);
    setModal(null);
  };

  const applyToProduct = (row) => {
    const totalBiaya = row.bahanBaku + row.tenagaKerja + row.overhead;
    const hppPerUnit =
      row.jumlahProduksi > 0 ? totalBiaya / row.jumlahProduksi : 0;
    const matches = products.filter(
      (p) => p.name.toLowerCase() === row.productName.toLowerCase(),
    );
    if (!matches.length) {
      setNotice(
        `Produk "${row.productName}" belum terdaftar di Stok Produk. Tambahkan produk itu dulu di halaman Stok Produk.`,
      );
      return;
    }
    matches.forEach((p) =>
      productsCrud.update(p.id, { hpp: Math.round(hppPerUnit) }),
    );
    setNotice(
      `HPP sebesar ${formatIDR(hppPerUnit)}/unit diterapkan ke ${matches.length} varian produk "${row.productName}".`,
    );
  };

  const rows = hppList.map((r) => {
    const totalBiaya = r.bahanBaku + r.tenagaKerja + r.overhead;
    const hppPerUnit = r.jumlahProduksi > 0 ? totalBiaya / r.jumlahProduksi : 0;
    return { ...r, totalBiaya, hppPerUnit };
  });

  return (
    <div>
      <PageHeader
        title="HPP Produk"
        subtitle="Hitung Harga Pokok Produksi lalu terapkan ke produk"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal({ mode: "add" })}
          >
            <Plus size={15} /> Hitung HPP
          </button>
        }
      />
      {notice && (
        <div className="callout info" style={{ marginBottom: 14 }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>{notice}</div>
        </div>
      )}
      <DataTable
        emptyText="Belum ada perhitungan HPP."
        columns={[
          { key: "productName", label: "Produk" },
          {
            key: "bahanBaku",
            label: "Bahan Baku",
            align: "right",
            render: (r) => formatIDR(r.bahanBaku),
          },
          {
            key: "tenagaKerja",
            label: "T. Kerja",
            align: "right",
            render: (r) => formatIDR(r.tenagaKerja),
          },
          {
            key: "overhead",
            label: "Overhead",
            align: "right",
            render: (r) => formatIDR(r.overhead),
          },
          {
            key: "totalBiaya",
            label: "Total Biaya",
            align: "right",
            render: (r) => formatIDR(r.totalBiaya),
          },
          {
            key: "jumlahProduksi",
            label: "Jumlah",
            align: "right",
            render: (r) => `${r.jumlahProduksi} pcs`,
          },
          {
            key: "hppPerUnit",
            label: "HPP / Unit",
            align: "right",
            render: (r) => <b>{formatIDR(r.hppPerUnit)}</b>,
          },
        ]}
        rows={rows}
        onEdit={(row) => setModal({ mode: "edit", row })}
        onDelete={crud.remove}
        extraAction={(row) => (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => applyToProduct(row)}
          >
            Terapkan
          </button>
        )}
      />
      {modal && (
        <FormModal
          title={modal.mode === "add" ? "Hitung HPP Produk" : "Edit HPP Produk"}
          fields={fields}
          initial={modal.row}
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ======================= MODE USAHA: STOK PRODUK ======================= */

function BusinessStock({ products, crud, movements, movementsCrud }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [modal, setModal] = useState(null);
  const [moveModal, setMoveModal] = useState(null);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  );

  const withStock = products.map((p) => ({
    ...p,
    stockAkhir: p.stockAwal + p.stockMasuk - p.stockKeluar,
  }));

  const rows = withStock
    .filter((p) => !filterCat || p.category === filterCat)
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      );
    });

  const productFields = [
    { name: "code", label: "Kode Produk", type: "text", required: true },
    { name: "name", label: "Nama Produk", type: "text", required: true },
    { name: "category", label: "Kategori", type: "text", required: true },
    { name: "variant", label: "Varian", type: "text" },
    { name: "size", label: "Ukuran", type: "text" },
    { name: "color", label: "Warna", type: "text" },
    {
      name: "sellPrice",
      label: "Harga Jual (Rp)",
      type: "number",
      required: true,
    },
    { name: "hpp", label: "HPP (Rp)", type: "number" },
    { name: "stockAwal", label: "Stok Awal", type: "number" },
  ];

  const handleProductSubmit = (values) => {
    const payload = {
      ...values,
      sellPrice: Number(values.sellPrice) || 0,
      hpp: Number(values.hpp) || 0,
      stockAwal: Number(values.stockAwal) || 0,
    };
    if (modal.mode === "add")
      crud.add({ ...payload, stockMasuk: 0, stockKeluar: 0 });
    else crud.update(modal.row.id, payload);
    setModal(null);
  };

  const moveFields = [
    { name: "date", label: "Tanggal", type: "date", required: true },
    {
      name: "typeLabel",
      label: "Jenis",
      type: "select",
      options: ["Stok Masuk", "Stok Keluar"],
      required: true,
    },
    { name: "qty", label: "Jumlah (pcs)", type: "number", required: true },
    { name: "note", label: "Catatan", type: "textarea", span: "full" },
  ];

  const handleMoveSubmit = (values) => {
    const qty = Number(values.qty) || 0;
    const isMasuk = values.typeLabel === "Stok Masuk";
    const product = moveModal.product;
    crud.update(
      product.id,
      isMasuk
        ? { stockMasuk: product.stockMasuk + qty }
        : { stockKeluar: product.stockKeluar + qty },
    );
    movementsCrud.add({
      date: values.date,
      productId: product.id,
      productLabel: `${product.name} - ${product.size}`,
      type: isMasuk ? "masuk" : "keluar",
      qty,
      note: values.note,
    });
    setMoveModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Stok Produk"
        subtitle="Kelola stok sederhana per varian produk"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal({ mode: "add" })}
          >
            <Plus size={15} /> Tambah Produk
          </button>
        }
      />
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Cari nama atau kode produk..."
      >
        <select
          className="ft-select"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Toolbar>
      <DataTable
        emptyText="Belum ada produk yang cocok."
        columns={[
          { key: "code", label: "Kode" },
          {
            key: "name",
            label: "Produk",
            render: (r) => (
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                  {r.variant} · {r.size} · {r.color}
                </div>
              </div>
            ),
          },
          {
            key: "sellPrice",
            label: "Harga Jual",
            align: "right",
            render: (r) => formatIDR(r.sellPrice),
          },
          {
            key: "hpp",
            label: "HPP",
            align: "right",
            render: (r) => formatIDR(r.hpp),
          },
          {
            key: "stockAkhir",
            label: "Stok Akhir",
            align: "right",
            render: (r) => (
              <Badge tone={r.stockAkhir <= 5 ? "red" : "green"}>
                {r.stockAkhir} pcs{r.stockAkhir <= 5 ? " · Menipis" : ""}
              </Badge>
            ),
          },
        ]}
        rows={rows}
        onEdit={(row) => setModal({ mode: "edit", row })}
        onDelete={crud.remove}
        extraAction={(row) => (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setMoveModal({ product: row })}
          >
            + Stok
          </button>
        )}
      />

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Riwayat Stok Masuk / Keluar</div>
        <div className="card-sub">Pergerakan stok terbaru</div>
        <DataTable
          emptyText="Belum ada riwayat pergerakan stok."
          columns={[
            {
              key: "date",
              label: "Tanggal",
              render: (r) => formatDateID(r.date),
            },
            { key: "productLabel", label: "Produk" },
            {
              key: "type",
              label: "Jenis",
              render: (r) => (
                <Badge tone={r.type === "masuk" ? "green" : "amber"}>
                  {r.type === "masuk" ? "Stok Masuk" : "Stok Keluar"}
                </Badge>
              ),
            },
            {
              key: "qty",
              label: "Jumlah",
              align: "right",
              render: (r) => `${r.qty} pcs`,
            },
            { key: "note", label: "Catatan" },
          ]}
          rows={[...movements].sort((a, b) => (a.date < b.date ? 1 : -1))}
        />
      </div>

      {modal && (
        <FormModal
          title={modal.mode === "add" ? "Tambah Produk" : "Edit Produk"}
          fields={productFields}
          initial={modal.row}
          onCancel={() => setModal(null)}
          onSubmit={handleProductSubmit}
        />
      )}
      {moveModal && (
        <FormModal
          title={`Pergerakan Stok — ${moveModal.product.name} (${moveModal.product.size})`}
          fields={moveFields}
          initial={{ date: isoDaysAgo(0), typeLabel: "Stok Masuk" }}
          onCancel={() => setMoveModal(null)}
          onSubmit={handleMoveSubmit}
        />
      )}
    </div>
  );
}

/* ======================= MODE USAHA: CASH FLOW ======================= */

function BusinessCashflow({ sales, expenses, capital }) {
  const data = useMemo(() => {
    const capitalAwal = capital
      .filter((c) => c.type === "awal")
      .reduce((s, c) => s + c.amount, 0);
    const capitalTambahan = capital
      .filter((c) => c.type === "tambahan")
      .reduce((s, c) => s + c.amount, 0);
    const capitalPenarikan = capital
      .filter((c) => c.type === "penarikan")
      .reduce((s, c) => s + c.amount, 0);
    const paidSales = sales
      .filter((s) => s.status !== "Belum Lunas")
      .reduce((s, x) => s + x.total, 0);
    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

    const saldoAwal = capitalAwal;
    const totalPemasukan = paidSales + capitalTambahan;
    const totalPengeluaran = expenseTotal + capitalPenarikan;
    const net = totalPemasukan - totalPengeluaran;
    const saldoAkhir = saldoAwal + net;

    const months = last6Months();
    const series = months.map((m) => {
      const salesM = sales
        .filter(
          (s) => monthKeyOf(s.date) === m.key && s.status !== "Belum Lunas",
        )
        .reduce((s2, x) => s2 + x.total, 0);
      const expM = expenses
        .filter((e) => monthKeyOf(e.date) === m.key)
        .reduce((s2, e) => s2 + e.amount, 0);
      return { name: m.label, Bersih: salesM - expM };
    });

    return {
      saldoAwal,
      totalPemasukan,
      totalPengeluaran,
      net,
      saldoAkhir,
      series,
    };
  }, [sales, expenses, capital]);

  return (
    <div>
      <PageHeader
        title="Cash Flow Usaha"
        subtitle="Pantau arus kas masuk dan keluar usaha"
      />
      <div className="stat-grid">
        <StatCard
          icon={Wallet}
          label="Saldo Awal"
          value={formatIDR(data.saldoAwal)}
          sub="Dari modal awal"
        />
        <StatCard
          icon={ArrowDownRight}
          label="Total Pemasukan"
          value={formatIDR(data.totalPemasukan)}
          sub="Penjualan lunas + tambahan modal"
        />
        <StatCard
          icon={ArrowUpRight}
          label="Total Pengeluaran"
          value={formatIDR(data.totalPengeluaran)}
          tone="amber"
          sub="Biaya usaha + penarikan modal"
        />
        <StatCard
          icon={data.net >= 0 ? TrendingUp : TrendingDown}
          label="Saldo Akhir"
          value={formatIDR(data.saldoAkhir)}
          tone={data.net >= 0 ? "" : "red"}
        />
      </div>
      <div className="card">
        <div className="card-title">Cash Flow Bulanan</div>
        <div className="card-sub">6 bulan terakhir</div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data.series}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-soft)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#93998F" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#93998F" }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
              />
              <Tooltip formatter={(v) => formatIDR(v)} />
              <Bar dataKey="Bersih" radius={[6, 6, 0, 0]}>
                {data.series.map((s, i) => (
                  <Cell key={i} fill={s.Bersih >= 0 ? "#2F6FED" : "#DC4C4C"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ======================= MODE USAHA: TARGET ======================= */

function BusinessTargets({ targets, crud }) {
  const [modal, setModal] = useState(null);
  const fields = [
    { name: "name", label: "Nama Target", type: "text", required: true },
    {
      name: "type",
      label: "Jenis Target",
      type: "select",
      options: TARGET_TYPES_USAHA,
      required: true,
    },
    {
      name: "targetValue",
      label: "Target (Rp atau pcs)",
      type: "number",
      required: true,
    },
    { name: "currentValue", label: "Pencapaian Saat Ini", type: "number" },
    { name: "deadline", label: "Deadline", type: "date", required: true },
    { name: "description", label: "Deskripsi", type: "textarea", span: "full" },
  ];
  const handleSubmit = (values) => {
    const payload = {
      ...values,
      targetValue: Number(values.targetValue) || 0,
      currentValue: Number(values.currentValue) || 0,
    };
    if (modal.mode === "add") crud.add(payload);
    else crud.update(modal.row.id, payload);
    setModal(null);
  };
  const isUnitCount = (type) =>
    type === "Penjualan Produk" || type === "Jumlah Produksi";
  return (
    <div>
      <PageHeader
        title="Target Usaha"
        subtitle="Target omzet, laba, penjualan produk, modal, dan produksi"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal({ mode: "add" })}
          >
            <Plus size={15} /> Tambah Target
          </button>
        }
      />
      {targets.length ? (
        <div className="target-grid">
          {targets.map((t) => (
            <TargetCard
              key={t.id}
              t={t}
              onEdit={(row) => setModal({ mode: "edit", row })}
              onDelete={crud.remove}
              unitSuffix={isUnitCount(t.type) ? " pcs" : ""}
              formatVal={isUnitCount(t.type) ? (v) => Math.round(v) : formatIDR}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState text="Belum ada target usaha." />
        </div>
      )}
      {modal && (
        <FormModal
          title={
            modal.mode === "add" ? "Tambah Target Usaha" : "Edit Target Usaha"
          }
          fields={fields}
          initial={modal.row}
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ======================= MODE USAHA: LAPORAN ======================= */

function BusinessReports({ sales, expenses, products }) {
  const [period, setPeriod] = useState("bulan_ini");
  const [customFrom, setCustomFrom] = useState(isoDaysAgo(30));
  const [customTo, setCustomTo] = useState(isoDaysAgo(0));

  const hppOf = (name) => {
    const p = products.find(
      (p) => p.name.toLowerCase() === (name || "").toLowerCase(),
    );
    return p ? p.hpp : 0;
  };

  const salesInPeriod = useMemo(
    () => sales.filter((s) => inPeriod(s.date, period, customFrom, customTo)),
    [sales, period, customFrom, customTo],
  );
  const expensesInPeriod = useMemo(
    () =>
      expenses.filter((e) => inPeriod(e.date, period, customFrom, customTo)),
    [expenses, period, customFrom, customTo],
  );

  const omzet = salesInPeriod.reduce((s, x) => s + x.total, 0);
  const hpp = salesInPeriod.reduce((s, x) => s + x.qty * hppOf(x.product), 0);
  const labaKotor = omzet - hpp;
  const biayaOperasional = expensesInPeriod
    .filter((e) => e.bucket === "Operasional")
    .reduce((s, e) => s + e.amount, 0);
  const labaBersih = labaKotor - biayaOperasional;
  const marginLB = omzet > 0 ? (labaBersih / omzet) * 100 : 0;

  const prodMap = {};
  salesInPeriod.forEach((s) => {
    prodMap[s.product] = (prodMap[s.product] || 0) + s.qty;
  });
  const topProducts = Object.entries(prodMap)
    .map(([product, qty]) => ({ id: product, product, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  const expMap = {};
  expensesInPeriod.forEach((e) => {
    expMap[e.category] = (expMap[e.category] || 0) + e.amount;
  });
  const expRows = Object.entries(expMap)
    .map(([category, total]) => ({ id: category, category, total }))
    .sort((a, b) => b.total - a.total);

  const handleExport = () => {
    const rows = [["Tanggal", "Tipe", "Detail", "Nominal"]];
    salesInPeriod.forEach((s) =>
      rows.push([s.date, "Penjualan", `${s.product} x${s.qty}`, s.total]),
    );
    expensesInPeriod.forEach((e) =>
      rows.push([e.date, "Pengeluaran", e.category, -e.amount]),
    );
    downloadCSV(`laporan-usaha-${period}.csv`, rows);
  };

  return (
    <div>
      <PageHeader
        title="Laporan Usaha"
        subtitle="Laporan penjualan, HPP, laba rugi, dan pengeluaran"
        action={
          <button className="btn btn-ghost" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </button>
        }
      />
      <PeriodFilter
        period={period}
        setPeriod={setPeriod}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
      />

      <div className="grid-2" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-title">Laporan Laba Rugi</div>
          <div className="card-sub">Sesuai periode terpilih</div>
          <div className="statement-row">
            <span>Omzet</span>
            <b>{formatIDR(omzet)}</b>
          </div>
          <div className="statement-row">
            <span>(-) HPP</span>
            <span className="neg">-{formatIDR(hpp)}</span>
          </div>
          <div className="statement-row total">
            <span>= Laba Kotor</span>
            <b>{formatIDR(labaKotor)}</b>
          </div>
          <div className="statement-row">
            <span>(-) Biaya Operasional</span>
            <span className="neg">-{formatIDR(biayaOperasional)}</span>
          </div>
          <div className="statement-row total">
            <span>= Laba Bersih</span>
            <b
              style={{
                color:
                  labaBersih >= 0 ? "var(--green-dark)" : "var(--red-dark)",
              }}
            >
              {formatIDR(labaBersih)}
            </b>
          </div>
          <div style={{ marginTop: 10 }}>
            <Badge tone={labaBersih >= 0 ? "green" : "red"}>
              {labaBersih >= 0 ? "Usaha Untung" : "Usaha Rugi"} · margin{" "}
              {marginLB.toFixed(1)}%
            </Badge>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Produk Terlaris</div>
          <div className="card-sub">Berdasarkan jumlah terjual</div>
          <DataTable
            emptyText="Tidak ada penjualan pada periode ini."
            columns={[
              { key: "product", label: "Produk" },
              {
                key: "qty",
                label: "Terjual",
                align: "right",
                render: (r) => `${r.qty} pcs`,
              },
            ]}
            rows={topProducts}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Pengeluaran per Kategori</div>
        <div className="card-sub">Sesuai periode terpilih</div>
        <DataTable
          emptyText="Tidak ada pengeluaran pada periode ini."
          columns={[
            { key: "category", label: "Kategori" },
            {
              key: "total",
              label: "Total",
              align: "right",
              render: (r) => formatIDR(r.total),
            },
          ]}
          rows={expRows}
        />
      </div>
    </div>
  );
}

/* ======================= TRANSFER PRIBADI <-> USAHA ======================= */

function TransferModal({ onCancel, onSubmit }) {
  const fields = [
    { name: "date", label: "Tanggal", type: "date", required: true },
    {
      name: "direction",
      label: "Arah Transfer",
      type: "select",
      options: [
        "Pribadi → Usaha (Tambahan Modal)",
        "Usaha → Pribadi (Penarikan Keuntungan)",
      ],
      required: true,
    },
    { name: "amount", label: "Nominal (Rp)", type: "number", required: true },
    { name: "note", label: "Catatan", type: "textarea", span: "full" },
  ];
  const handleSubmit = (values) => {
    const isP2U = values.direction.startsWith("Pribadi");
    onSubmit({
      date: values.date,
      direction: isP2U ? "p2u" : "u2p",
      amount: Number(values.amount) || 0,
      note: values.note,
    });
  };
  return (
    <FormModal
      title="Transfer Pribadi ↔ Usaha"
      fields={fields}
      initial={{
        date: isoDaysAgo(0),
        direction: "Pribadi → Usaha (Tambahan Modal)",
      }}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      submitLabel="Proses Transfer"
    />
  );
}

/* ======================= NAVIGASI ======================= */

const NAV_PERSONAL = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "transaksi", label: "Transaksi", icon: Receipt },
  { key: "cashflow", label: "Cash Flow", icon: ArrowLeftRight },
  { key: "target", label: "Target Keuangan", icon: Target },
  { key: "budget", label: "Budget", icon: PiggyBank },
  { key: "laporan", label: "Laporan", icon: BarChart3 },
  { key: "pengaturan", label: "Pengaturan", icon: Settings },
];

const NAV_BUSINESS = [
  { key: "dashboard", label: "Dashboard Usaha", icon: LayoutDashboard },
  { key: "penjualan", label: "Penjualan", icon: ShoppingCart },
  { key: "pengeluaran", label: "Pengeluaran", icon: Receipt },
  { key: "modal", label: "Modal", icon: Wallet },
  { key: "hpp", label: "HPP Produk", icon: Calculator },
  { key: "stok", label: "Stok Produk", icon: Boxes },
  { key: "cashflow", label: "Cash Flow", icon: ArrowLeftRight },
  { key: "target", label: "Target Usaha", icon: Target },
  { key: "laporan", label: "Laporan", icon: BarChart3 },
  { key: "pengaturan", label: "Pengaturan", icon: Settings },
];

/* ======================= APP ======================= */

export default function FinTrackApp() {
  const [mode, setMode] = useState("pribadi");
  const [page, setPage] = useState("dashboard");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [personalTransactions, personalTxCrud] = useCrud(
    initialPersonalTransactions,
  );
  // TEMPELKAN KODE useEffect DI SINI (sekitar baris 1723)
     useEffect(() => {
       fetch("http://localhost:5000/api/transactions")
         .then((res) => res.json())
         .then((data) => {
           const formattedData = data.map((item) => ({
             id: item.ID,
             date: item.Tanggal,
             type: item.Jenis_Transaksi === "Pemasukan" ? "in" : "out",
             category: item.Kategori,
             amount: Number(item.Nominal) || 0,
             description: item.Deskripsi,
             method: item.Metode_Pembayaran,
             note: item.Keterangan,
             isTransfer: false,
           }));
           personalTxCrud.setItems(formattedData);
         })
         .catch((err) => console.error("Gagal memuat data awal:", err));
     }, []);
  const [personalTargets, personalTargetsCrud] = useCrud(
    initialPersonalTargets,
  );
  const [personalBudgets, personalBudgetsCrud] = useCrud(
    initialPersonalBudgets,
  );

  const [businessSales, businessSalesCrud] = useCrud(initialBusinessSales);
  const [businessExpenses, businessExpensesCrud] = useCrud(
    initialBusinessExpenses,
  );
  const [businessCapital, businessCapitalCrud] = useCrud(
    initialBusinessCapital,
  );
  const [businessProducts, businessProductsCrud] = useCrud(
    initialBusinessProducts,
  );
  const [businessHPP, businessHPPCrud] = useCrud(initialBusinessHPP);
  const [businessTargets, businessTargetsCrud] = useCrud(
    initialBusinessTargets,
  );
  const [stockMovements, stockMovementsCrud] = useCrud(initialStockMovements);

  const switchMode = (m) => {
    setMode(m);
    setPage("dashboard");
  };

  const handleTransfer = ({ date, direction, amount, note }) => {
    if (amount <= 0) {
      setShowTransfer(false);
      return;
    }
    if (direction === "p2u") {
      personalTxCrud.add({
        date,
        type: "out",
        category: "Transfer ke Usaha",
        amount,
        description: "Transfer ke usaha",
        method: "Transfer Bank",
        note,
        isTransfer: true,
      });
      businessCapitalCrud.add({
        date,
        type: "tambahan",
        amount,
        source: "Transfer dari pribadi",
        note: note || "Transfer dari keuangan pribadi",
      });
    } else {
      personalTxCrud.add({
        date,
        type: "in",
        category: "Transfer dari Usaha",
        amount,
        description: "Transfer dari usaha",
        method: "Transfer Bank",
        note,
        isTransfer: true,
      });
      businessCapitalCrud.add({
        date,
        type: "penarikan",
        amount,
        source: "Transfer ke pribadi",
        note: note || "Penarikan keuntungan untuk pribadi",
      });
    }
    setShowTransfer(false);
  };

  const resetDemo = () => {
    if (!window.confirm("Muat ulang seluruh data ke data contoh awal?")) return;
    personalTxCrud.setItems(initialPersonalTransactions);
    personalTargetsCrud.setItems(initialPersonalTargets);
    personalBudgetsCrud.setItems(initialPersonalBudgets);
    businessSalesCrud.setItems(initialBusinessSales);
    businessExpensesCrud.setItems(initialBusinessExpenses);
    businessCapitalCrud.setItems(initialBusinessCapital);
    businessProductsCrud.setItems(initialBusinessProducts);
    businessHPPCrud.setItems(initialBusinessHPP);
    businessTargetsCrud.setItems(initialBusinessTargets);
    stockMovementsCrud.setItems(initialStockMovements);
  };

  const nav = mode === "pribadi" ? NAV_PERSONAL : NAV_BUSINESS;
  const activeLabel = nav.find((n) => n.key === page)?.label || "";

  const renderPage = () => {
    if (mode === "pribadi") {
      switch (page) {
        case "dashboard":
          return (
            <PersonalDashboard
              transactions={personalTransactions}
              targets={personalTargets}
            />
          );
        case "transaksi":
          return (
            <PersonalTransactions
              transactions={personalTransactions}
              crud={personalTxCrud}
            />
          );
        case "cashflow":
          return <PersonalCashflow transactions={personalTransactions} />;
        case "target":
          return (
            <PersonalTargets
              targets={personalTargets}
              crud={personalTargetsCrud}
            />
          );
        case "budget":
          return (
            <PersonalBudget
              transactions={personalTransactions}
              budgets={personalBudgets}
              crud={personalBudgetsCrud}
            />
          );
        case "laporan":
          return <PersonalReports transactions={personalTransactions} />;
        case "pengaturan":
          return <SettingsPage mode={mode} onResetDemo={resetDemo} />;
        default:
          return null;
      }
    }
    switch (page) {
      case "dashboard":
        return (
          <BusinessDashboard
            sales={businessSales}
            expenses={businessExpenses}
            capital={businessCapital}
            products={businessProducts}
            targets={businessTargets}
          />
        );
      case "penjualan":
        return (
          <BusinessSales
            sales={businessSales}
            crud={businessSalesCrud}
            products={businessProducts}
          />
        );
      case "pengeluaran":
        return (
          <BusinessExpenses
            expenses={businessExpenses}
            crud={businessExpensesCrud}
          />
        );
      case "modal":
        return (
          <BusinessCapital
            capital={businessCapital}
            crud={businessCapitalCrud}
          />
        );
      case "hpp":
        return (
          <BusinessHPPPage
            hppList={businessHPP}
            crud={businessHPPCrud}
            products={businessProducts}
            productsCrud={businessProductsCrud}
          />
        );
      case "stok":
        return (
          <BusinessStock
            products={businessProducts}
            crud={businessProductsCrud}
            movements={stockMovements}
            movementsCrud={stockMovementsCrud}
          />
        );
      case "cashflow":
        return (
          <BusinessCashflow
            sales={businessSales}
            expenses={businessExpenses}
            capital={businessCapital}
          />
        );
      case "target":
        return (
          <BusinessTargets
            targets={businessTargets}
            crud={businessTargetsCrud}
          />
        );
      case "laporan":
        return (
          <BusinessReports
            sales={businessSales}
            expenses={businessExpenses}
            products={businessProducts}
          />
        );
      case "pengaturan":
        return <SettingsPage mode={mode} onResetDemo={resetDemo} />;
      default:
        return null;
    }
  };

  const bottomMain = nav.slice(0, 4);
  const bottomMore = nav.slice(4);

  return (
    <div className={`ft-root theme-${mode}`}>
      <GlobalStyle />
      <div className="ft-shell">
        <aside className="ft-sidebar">
          <div className="ft-brand">
            <div className="ft-brand-mark">CT</div>
            <div>
              <div className="ft-brand-name">CloudTrack</div>
              <div className="ft-brand-tag">Pribadi & Usaha</div>
            </div>
          </div>

          <div className="ft-mode-switch">
            <button
              className={`ft-mode-btn p ${mode === "pribadi" ? "active" : ""}`}
              onClick={() => switchMode("pribadi")}
            >
              <Wallet size={14} /> Pribadi
            </button>
            <button
              className={`ft-mode-btn u ${mode === "usaha" ? "active" : ""}`}
              onClick={() => switchMode("usaha")}
            >
              <ShoppingCart size={14} /> Usaha
            </button>
          </div>

          <nav className="ft-nav">
            {nav.map((n) => {
              const Icon = n.icon;
              return (
                <button
                  key={n.key}
                  className={`ft-nav-item ${page === n.key ? "active" : ""}`}
                  onClick={() => setPage(n.key)}
                >
                  <Icon size={16} /> {n.label}
                </button>
              );
            })}
          </nav>

          <div className="ft-sidebar-foot">
            <button
              className="ft-nav-item"
              onClick={() => setShowTransfer(true)}
              style={{ color: "var(--accent-dark)", fontWeight: 700 }}
            >
              <ArrowLeftRight size={16} /> Transfer Pribadi ↔ Usaha
            </button>
          </div>
        </aside>

        <div className="ft-main">
          <div className="ft-topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                className="ft-brand-mark"
                style={{ width: 26, height: 26, fontSize: 12 }}
              >
                FT
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                {activeLabel}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="ft-mode-switch" style={{ margin: 0 }}>
                <button
                  className={`ft-mode-btn p ${mode === "pribadi" ? "active" : ""}`}
                  onClick={() => switchMode("pribadi")}
                >
                  Pribadi
                </button>
                <button
                  className={`ft-mode-btn u ${mode === "usaha" ? "active" : ""}`}
                  onClick={() => switchMode("usaha")}
                >
                  Usaha
                </button>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowTransfer(true)}
                aria-label="Transfer"
              >
                <ArrowLeftRight size={15} />
              </button>
            </div>
          </div>

          <div className="ft-page">{renderPage()}</div>
        </div>
      </div>

      <nav className="ft-bottom-nav">
        {bottomMain.map((n) => {
          const Icon = n.icon;
          return (
            <button
              key={n.key}
              className={`ft-bottom-item ${page === n.key ? "active" : ""}`}
              onClick={() => setPage(n.key)}
            >
              <Icon size={19} />
              {n.label.split(" ")[0]}
            </button>
          );
        })}
        <button
          className={`ft-bottom-item ${bottomMore.some((n) => n.key === page) ? "active" : ""}`}
          onClick={() => setShowMore(true)}
        >
          <MoreHorizontal size={19} />
          Lainnya
        </button>
      </nav>

      {showMore && (
        <div className="ft-more-sheet" onClick={() => setShowMore(false)}>
          <div className="ft-more-panel" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15 }}>Menu Lainnya</div>
              <button className="icon-btn" onClick={() => setShowMore(false)}>
                <X size={16} />
              </button>
            </div>
            <button
              className="ft-nav-item"
              style={{
                color: "var(--accent-dark)",
                fontWeight: 700,
                marginBottom: 4,
              }}
              onClick={() => {
                setShowMore(false);
                setShowTransfer(true);
              }}
            >
              <ArrowLeftRight size={16} /> Transfer Pribadi ↔ Usaha
            </button>
            {bottomMore.map((n) => {
              const Icon = n.icon;
              return (
                <button
                  key={n.key}
                  className={`ft-nav-item ${page === n.key ? "active" : ""}`}
                  onClick={() => {
                    setPage(n.key);
                    setShowMore(false);
                  }}
                >
                  <Icon size={16} /> {n.label}
                  <ChevronRight
                    size={14}
                    style={{ marginLeft: "auto", opacity: 0.4 }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showTransfer && (
        <TransferModal
          onCancel={() => setShowTransfer(false)}
          onSubmit={handleTransfer}
        />
      )}
    </div>
  );
}
