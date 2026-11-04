'use strict';
/* My Money — a private, customizable money tracker.
   Everything is stored in this browser's localStorage, one key per profile.
   Nothing is ever sent to a server. */

/* ================= Constants ================= */
const ACCENTS = ['#0d6b5f', '#2f6fde', '#6741d9', '#c2255c', '#e8590c', '#b7791f', '#2b8a3e', '#0b7285', '#343a40'];
const BUCKET_COLORS = ['#3b5bdb', '#c27c0a', '#d6336c', '#2b8a3e', '#7048e8', '#0b7285', '#e8590c', '#5c940d', '#862e9c', '#1864ab'];
const CAT_COLORS = ['#f08c00', '#1c7ed6', '#7048e8', '#e64980', '#12b886', '#fa5252', '#be4bdb', '#868e96', '#fab005', '#4c6ef5', '#20c997', '#ff922b'];
const PRESET_BUCKETS = [
  { id: 'pea', name: 'PEA', color: '#3b5bdb', saving: true },
  { id: 'savings', name: 'Savings', color: '#c27c0a', saving: true },
  { id: 'badminton', name: 'Badminton', color: '#d6336c', saving: false },
  { id: 'emergency', name: 'Emergency fund', color: '#2b8a3e', saving: true },
  { id: 'travel', name: 'Travel', color: '#0b7285', saving: false },
  { id: 'invest', name: 'Investments', color: '#7048e8', saving: true }
];
const DEFAULT_CATS = [['Food', '🍽️'], ['Transport', '🚇'], ['Housing', '🏠'], ['Bills', '🧾'], ['Fun', '🎉'], ['Health', '💊'], ['Shopping', '🛍️'], ['Other', '📦']];
const CURRENCIES = { EUR: 'fr-FR', USD: 'en-US', GBP: 'en-GB', INR: 'en-IN', CHF: 'de-CH', CAD: 'en-CA', AUD: 'en-AU', JPY: 'ja-JP', SGD: 'en-SG', AED: 'en-AE' };
const FONTS = {
  manrope: 'Manrope', grotesk: '"Space Grotesk"', dmsans: '"DM Sans"', system: '-apple-system,system-ui'
};
const FONT_LABELS = { manrope: 'Manrope', grotesk: 'Grotesk', dmsans: 'DM Sans', system: 'System' };
const RADII = { round: '22px', soft: '14px', sharp: '6px' };
const INCOME_COLOR = '#2b8a3e';
const KEY = { profiles: 'mm:profiles', active: 'mm:active', data: id => 'mm:data:' + id, unlocked: id => 'mm:u:' + id, legacy: 'mm1' };

/* ================= Icons ================= */
const ic = p => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  left: ic('<path d="M15 18l-6-6 6-6"/>'),
  right: ic('<path d="M9 18l6-6-6-6"/>'),
  back: ic('<path d="M19 12H5M12 19l-7-7 7-7"/>'),
  plus: ic('<path d="M12 5v14M5 12h14"/>'),
  x: ic('<path d="M18 6L6 18M6 6l12 12"/>'),
  gear: ic('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  eye: ic('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: ic('<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>'),
  search: ic('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>'),
  trash: ic('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>'),
  download: ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
  upload: ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>'),
  table: ic('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>'),
  lock: ic('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  users: ic('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
  restore: ic('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  shield: ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  palette: ic('<circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A5.6 5.6 0 0 0 22 9.8C22 5.5 17.5 2 12 2z"/>'),
  wifi: ic('<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>'),
  repeat: ic('<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'),
  logo: '<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path d="M6 22.5V12l10 7 10-7v10.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="8" r="2.6" fill="currentColor"/></svg>'
};

/* ================= Storage ================= */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { toast('Could not save: storage is full or blocked'); return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
};
const sess = {
  get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* ignore */ } }
};

/* ================= Helpers ================= */
const $ = id => document.getElementById(id);
function today() { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); }
function thisMonth() { return today().slice(0, 7); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function col(c) { return /^#[0-9a-f]{3,8}$/i.test(String(c)) ? c : '#868e96'; }
function uid() { return Date.now() * 1000 + Math.floor(Math.random() * 1000); }
function initial(n) { return (String(n || '?').trim()[0] || '?').toUpperCase(); }
function parseAmt(v) {
  let s = String(v == null ? '' : v).replace(/[\s  €$£¥₹]/g, '');
  if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else s = s.replace(',', '.');
  const n = parseFloat(s);
  return isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}
function ymShift(ym, n) { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
function monthLabel(ym, opt) { return new Date(ym + '-01T12:00:00').toLocaleDateString('en-GB', opt || { month: 'long', year: 'numeric' }); }
function daysIn(ym) { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); }
function dayLabel(d) {
  const t = today();
  if (d === t) return 'Today';
  const y = new Date(t + 'T12:00:00'); y.setDate(y.getDate() - 1);
  if (d === y.toISOString().slice(0, 10)) return 'Yesterday';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
function hx(h) { h = col(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, t) { const x = hx(a), y = hx(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function lum(h) { const c = hx(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function rgba(h, a) { const c = hx(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); el.focus(); }
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}
async function hashPin(pin, salt) {
  const data = new TextEncoder().encode(salt + ':' + pin);
  if (window.crypto && crypto.subtle) {
    const h = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0; for (const c of data) h = (h * 31 + c) | 0; return 'x' + h;
}

let _fmt = null, _fmtKey = '';
function money(n) {
  const c = (S && S.settings.currency) || 'EUR';
  if (c !== _fmtKey) {
    _fmtKey = c;
    try { _fmt = new Intl.NumberFormat(CURRENCIES[c] || undefined, { style: 'currency', currency: c }); }
    catch (e) { _fmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }); }
  }
  return _fmt.format(n || 0);
}

/* ================= State ================= */
let profiles = store.get(KEY.profiles, []);
if (!Array.isArray(profiles)) profiles = [];
let active = store.get(KEY.active, null);
let S = null;
let lastCat = null;
const ui = { view: 'month', month: thisMonth(), year: +today().slice(0, 4), ySel: null, editT: false, allCats: false, filter: 'all', q: '', sheet: null, onb: null };

function prof() { return profiles.find(p => p.id === active); }
function saveProfiles() { store.set(KEY.profiles, profiles); }
function save() { if (S && active) store.set(KEY.data(active), S); }

function normalize(d) {
  d = d && typeof d === 'object' ? d : {};
  d.v = 2;
  d.settings = Object.assign({ currency: 'EUR', theme: 'auto', accent: ACCENTS[0], privacy: false, font: 'manrope', radius: 'round' }, d.settings || {});
  if (!CURRENCIES[d.settings.currency]) d.settings.currency = 'EUR';
  d.inc = d.inc && typeof d.inc === 'object' ? d.inc : {};
  d.income = +d.income || 0;
  d.entries = Array.isArray(d.entries) ? d.entries.filter(e => e && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && +e.amount > 0) : [];
  d.entries.forEach(e => { e.amount = +e.amount; e.note = String(e.note || ''); e.cat = String(e.cat || ''); e.type = String(e.type || 'expense'); });
  d.budgets = d.budgets && typeof d.budgets === 'object' ? d.budgets : {};
  d.tpls = Array.isArray(d.tpls) ? d.tpls : [];
  d.rec = Array.isArray(d.rec) ? d.rec : [];
  if (!Array.isArray(d.buckets)) d.buckets = PRESET_BUCKETS.slice(0, 3).map(b => Object.assign({ goal: 0 }, b));
  d.buckets.forEach(b => { b.id = String(b.id).replace(/[^\w-]/g, '') || 'b' + uid().toString(36); b.goal = +b.goal || 0; b.color = col(b.color); });
  if (!Array.isArray(d.cats)) d.cats = DEFAULT_CATS.map((c, i) => ({ name: c[0], emoji: c[1], color: CAT_COLORS[i] }));
  d.cats.forEach(c => { c.color = col(c.color); });
  d.entries.forEach(e => ensureType(d, e.type));
  return d;
}
function ensureType(d, type, label) {
  if (type === 'expense' || type === 'income' || d.buckets.some(b => b.id === type)) return;
  d.buckets.push({ id: type, name: label || type, color: BUCKET_COLORS[d.buckets.length % BUCKET_COLORS.length], goal: 0, saving: false });
}

function getInc(m) {
  if (S.inc[m] != null) return S.inc[m];
  let b = null;
  Object.keys(S.inc).forEach(k => { if (k < m && (b === null || k > b)) b = k; });
  return b !== null ? S.inc[b] : (S.income || 0);
}
function bucket(id) { return S.buckets.find(b => b.id === id); }
function cat(name) { return S.cats.find(c => c.name === name); }
function tinfo(t) {
  if (t === 'expense') return { name: 'Expense', color: '#868e96' };
  if (t === 'income') return { name: 'Extra income', color: INCOME_COLOR };
  const b = bucket(t);
  return b ? { name: b.name, color: col(b.color) } : { name: 'Removed bucket', color: '#868e96' };
}
function entryName(e) { return e.type === 'expense' ? (e.cat || 'Expense') : tinfo(e.type).name; }
function entryIcon(e) {
  if (e.type === 'expense') { const c = cat(e.cat); return `<span class="ei" style="--c:${col(c && c.color)}">${esc(c ? c.emoji : '🏷️')}</span>`; }
  if (e.type === 'income') return `<span class="ei" style="--c:${INCOME_COLOR}">↓</span>`;
  const t = tinfo(e.type);
  return `<span class="ei" style="--c:${t.color}">${esc(initial(t.name))}</span>`;
}
function allTime(t) { return S.entries.reduce((a, e) => a + (e.type === t ? e.amount : 0), 0); }
function monthData(ym) {
  const E = S.entries.filter(e => e.date.slice(0, 7) === ym);
  const base = getInc(ym); let extra = 0, spent = 0, aside = 0; const byB = {}, byC = {};
  E.forEach(e => {
    if (e.type === 'income') extra += e.amount;
    else if (e.type === 'expense') { spent += e.amount; byC[e.cat] = (byC[e.cat] || 0) + e.amount; }
    else { aside += e.amount; byB[e.type] = (byB[e.type] || 0) + e.amount; }
  });
  const inc = base + extra, out = spent + aside;
  return { E, base, extra, inc, spent, aside, out, rest: inc - out, byB, byC };
}

/* ================= Theme ================= */
function applyTheme() {
  const s = S ? S.settings : { theme: 'auto', accent: ACCENTS[0], font: 'manrope', radius: 'round' };
  const dark = s.theme === 'dark' || (s.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const r = document.documentElement;
  r.dataset.theme = dark ? 'dark' : 'light';
  const a = col(s.accent);
  const acc = dark ? mix(a, '#ffffff', 0.22) : a;
  const acc2 = dark ? mix(a, '#000000', 0.18) : mix(a, '#000000', 0.35);
  r.style.setProperty('--acc', acc);
  r.style.setProperty('--acc2', acc2);
  r.style.setProperty('--on-acc', lum(mix(acc, acc2, 0.5)) > 0.36 ? '#0b1a17' : '#ffffff');
  r.style.setProperty('--acc-soft', rgba(acc, dark ? 0.16 : 0.12));
  r.style.setProperty('--font', (FONTS[s.font] || FONTS.manrope) + ',-apple-system,system-ui,"Segoe UI",sans-serif');
  r.style.setProperty('--r', RADII[s.radius] || RADII.round);
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = dark ? '#0a1114' : '#eef2f4';
}

/* ================= Render ================= */
function render() {
  applyTheme();
  document.body.classList.toggle('priv', !!(S && S.settings.privacy && ui.view !== 'lock'));
  $('fab').hidden = !(S && (ui.view === 'month' || ui.view === 'year'));
  const app = $('app');
  if (ui.view === 'onboard') { app.innerHTML = onboardHtml(); return; }
  if (ui.view === 'lock') { app.innerHTML = lockHtml(); setTimeout(() => { const p = $('pin'); if (p) p.focus(); }, 60); return; }
  let h = headerHtml();
  if (ui.view === 'settings') h += settingsHtml();
  else h += tabsHtml() + (ui.view === 'year' ? yearHtml() : monthHtml());
  app.innerHTML = h;
  if (ui.view === 'month') renderHist();
}
function go(v, anchor) {
  ui.view = v; ui.ySel = null; ui.editT = false;
  render();
  const app = $('app'); app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter');
  const el = anchor && $(anchor);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo(0, 0);
}
function greet() { const h = new Date().getHours(); return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }

function headerHtml() {
  const p = prof(), st = ui.view === 'settings';
  const left = st
    ? `<button class="icon" onclick="go('month')" aria-label="Back">${I.back}</button><div class="hi"><small>Make it yours</small><b>Settings</b></div>`
    : `<button class="avatar" style="--c:${col(S.settings.accent)}" onclick="openProfiles()" aria-label="Profiles">${esc(initial(p.name))}</button><div class="hi"><small>${greet()}</small><b>${esc(p.name || 'there')}</b></div>`;
  return `<header class="top">${left}
    <button class="icon" onclick="togglePrivacy()" aria-label="${S.settings.privacy ? 'Show' : 'Hide'} amounts" title="${S.settings.privacy ? 'Show' : 'Hide'} amounts">${S.settings.privacy ? I.eyeOff : I.eye}</button>
    ${st ? '' : `<button class="icon" onclick="go('settings')" aria-label="Settings" title="Settings">${I.gear}</button>`}</header>`;
}
function tabsHtml() {
  return `<nav class="seg tabs" role="tablist">${[['month', 'Month'], ['year', 'Year']].map(([k, l]) =>
    `<button role="tab" aria-selected="${ui.view === k}" class="${ui.view === k ? 'on' : ''}" onclick="go('${k}')">${l}</button>`).join('')}</nav>`;
}

/* ---------- Month ---------- */
function monthHtml() {
  const ym = ui.month, d = monthData(ym), isCur = ym === thisMonth();
  const pct = d.inc > 0 ? Math.min(100, d.out / d.inc * 100) : 0;
  let h = `<div class="mon"><button class="icon" onclick="shiftMonth(-1)" aria-label="Previous month">${I.left}</button>
    <button class="mon-l" onclick="ui.month=thisMonth();render()"><b>${monthLabel(ym)}</b>${isCur ? '<small class="mut">This month</small>' : '<small>Back to today</small>'}</button>
    <button class="icon" onclick="shiftMonth(1)" aria-label="Next month">${I.right}</button></div>`;
  h += '<div class="grid"><div class="col">';

  let hint = '';
  if (d.inc <= 0) hint = 'Type your monthly money below to see what is left.';
  else if (d.rest < 0) hint = `You're <b class="m">${money(-d.rest)}</b> over this month.`;
  else if (isCur) { const dl = daysIn(ym) - (+today().slice(8)) + 1; hint = `About <b class="m">${money(d.rest / dl)}</b> a day for the next ${dl} day${dl > 1 ? 's' : ''}.`; }
  else if (ym < thisMonth()) hint = `You kept <b class="m">${money(d.rest)}</b> this month.`;
  const pill = d.inc > 0 ? (d.rest < 0 ? '<span class="pill bad">Overspent</span>' : `<span class="pill">${Math.round(d.out / d.inc * 100)}% used</span>`) : '';
  h += `<section class="hero" aria-label="Summary">
    <div class="hero-top"><small>Left this month</small>${pill}</div>
    <div class="big m">${money(d.rest)}</div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <p class="hint">${hint}</p>
    <div class="hstats">
      <label class="hs"><small>Monthly money</small><input class="m" inputmode="decimal" value="${d.base || ''}" placeholder="0" onchange="setIncome(this.value)" aria-label="Monthly money"></label>
      <div class="hs"><small>Spent</small><b class="m">${money(d.spent)}</b></div>
      <div class="hs"><small>Set aside</small><b class="m">${money(d.aside)}</b></div>
    </div>
    ${d.extra > 0 ? `<p class="hint sm">Includes <b class="m">${money(d.extra)}</b> extra income.</p>` : ''}
  </section>`;

  if (S.tpls.length) {
    h += `<div class="sec-h"><h2>Quick add</h2><button class="lnk" onclick="ui.editT=!ui.editT;render()">${ui.editT ? 'Done' : 'Edit'}</button></div><div class="chips">` +
      S.tpls.map(t => {
        const c = t.type === 'expense' ? col(cat(t.cat) && cat(t.cat).color) : tinfo(t.type).color;
        return `<button class="chip qa${ui.editT ? ' rm' : ''}" onclick="${ui.editT ? 'delTpl' : 'useTpl'}(${+t.id})"><span class="dot" style="--c:${c}"></span>${esc(t.label)} <b class="m">${money(t.amount)}</b>${ui.editT ? ' ✕' : ''}</button>`;
      }).join('') + '</div>';
  }

  const act = S.buckets.filter(b => !b.archived);
  h += `<div class="sec-h"><h2>Where my money goes</h2><button class="lnk" onclick="go('settings','s-buckets')">Customize</button></div><div class="bks">`;
  act.forEach(b => {
    const all = allTime(b.id), mo = d.byB[b.id] || 0, g = b.goal > 0 ? Math.min(100, all / b.goal * 100) : 0;
    h += `<button class="bk" style="--c:${col(b.color)}" onclick="openEntry('${b.id}')" aria-label="Add to ${esc(b.name)}">
      <span class="bk-h"><span class="dot"></span><b>${esc(b.name)}</b><span class="plus">${I.plus}</span></span>
      <span class="bk-v m">${money(mo)}</span>
      <small>All time <span class="m">${money(all)}</span></small>
      ${b.goal > 0 ? `<span class="mini"><i style="width:${g}%"></i></span><small>${Math.round(all / b.goal * 100)}% of <span class="m">${money(b.goal)}</span>${all >= b.goal ? ' 🎉' : ''}</small>` : ''}
    </button>`;
  });
  h += `<button class="bk bk-new" onclick="go('settings','s-buckets')">${I.plus}<span>New bucket</span></button></div>`;

  h += `<div class="sec-h"><h2>Spending</h2><button class="lnk" onclick="go('settings','s-cats')">Categories</button></div><div class="card spend">${donut(d)}<div class="cats">`;
  const ks = S.cats.map((c, i) => ({ c, i, s: d.byC[c.name] || 0 })).sort((a, b) => b.s - a.s || (S.budgets[b.c.name] || 0) - (S.budgets[a.c.name] || 0));
  const mx = Math.max(1, ...ks.map(k => k.s));
  const showAll = ui.allCats || ks.every(k => k.s || S.budgets[k.c.name]);
  const vis = showAll ? ks : ks.filter(k => k.s || S.budgets[k.c.name]);
  const hidden = ks.length - vis.length;
  h += vis.map(({ c, i, s }) => {
    const b = S.budgets[c.name] || 0, p = b ? s / b * 100 : s / mx * 100;
    const cls = b && p > 100 ? 'over' : b && p >= 80 ? 'warn' : '';
    return `<button class="cat" onclick="openBudget(${i})"><span class="ei" style="--c:${col(c.color)}">${esc(c.emoji)}</span><span class="cat-b">
      <span class="row"><span>${esc(c.name)}</span><span class="m">${money(s)}${b ? `<small> / ${money(b)}</small>` : ''}</span></span>
      ${b || s ? `<span class="bar"><i class="${cls}" style="width:${Math.min(100, p)}%;${cls ? '' : 'background:' + col(c.color)}"></i></span>` : '<small>Tap to set a budget</small>'}
    </span></button>`;
  }).join('');
  if (hidden) h += `<button class="cat more" onclick="ui.allCats=true;render()"><span class="ei" style="--c:var(--mut)">${I.plus}</span><span class="cat-b"><span class="row"><span>${hidden} more categor${hidden > 1 ? 'ies' : 'y'}</span><small>Set budgets</small></span></span></button>`;
  else if (ui.allCats && ks.some(k => !k.s && !S.budgets[k.c.name])) h += `<button class="cat more" onclick="ui.allCats=false;render()"><span class="cat-b"><small>Show less</small></span></button>`;
  const orphan = Object.keys(d.byC).filter(k => !cat(k));
  if (orphan.length) h += orphan.map(k => `<div class="cat"><span class="ei" style="--c:#868e96">🏷️</span><span class="cat-b"><span class="row"><span>${esc(k || 'Uncategorised')}</span><span class="m">${money(d.byC[k])}</span></span></span></div>`).join('');
  h += '</div></div>';

  h += '</div><div class="col">';
  h += `<div class="sec-h"><h2>History</h2><span class="mut">${d.E.length} entr${d.E.length === 1 ? 'y' : 'ies'}</span></div>
    <div class="card hist"><label class="search">${I.search}<input id="q" type="search" placeholder="Search notes, categories, amounts" value="${esc(ui.q)}" oninput="ui.q=this.value;renderHist()" aria-label="Search history"></label>
    <div class="chips scroll" id="hf"></div><div id="hist"></div></div>`;
  if (S.rec.length) {
    const tot = S.rec.reduce((a, r) => a + (+r.amount || 0), 0);
    h += `<div class="sec-h"><h2>Repeats monthly</h2><span class="mut m">${money(tot)} / month</span></div><div class="card">` +
      S.rec.map(r => `<div class="li static">${entryIcon(r)}<span class="li-b"><b>${esc(entryName(r))}</b><small>Every month on day ${+r.day}${r.note ? ' · ' + esc(r.note) : ''}</small></span><b class="m">${money(r.amount)}</b><button class="x" onclick="delRec(${+r.id})" aria-label="Stop repeating" title="Stop repeating">${I.x}</button></div>`).join('') + '</div>';
  }
  h += `<p class="foot">${I.shield}<span>Your data lives only in this browser. Nobody else can see it. <button class="lnk" onclick="go('settings','s-data')">Back it up</button></span></p>`;
  h += '</div></div>';
  return h;
}
function donut(d) {
  const tot = d.spent, r = 44, C = 2 * Math.PI * r;
  let off = 0, segs = '';
  if (tot > 0) {
    Object.entries(d.byC).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
      const len = v / tot * C, c = cat(k);
      segs += `<circle r="${r}" cx="60" cy="60" fill="none" stroke="${col(c && c.color)}" stroke-width="11" stroke-dasharray="${Math.max(0, len - 1.5).toFixed(2)} ${(C - len + 1.5).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 60 60)"><title>${esc(k)}: ${money(v)}</title></circle>`;
      off += len;
    });
  }
  const bud = Object.values(S.budgets).reduce((a, v) => a + (+v || 0), 0);
  return `<div class="donut"><svg viewBox="0 0 120 120" role="img" aria-label="Spending by category"><circle r="${r}" cx="60" cy="60" fill="none" style="stroke:var(--line)" stroke-width="11"/>${segs}</svg>
    <div class="dc"><small>Spent</small><b class="m">${money(tot)}</b>${bud ? `<small>of <span class="m">${money(bud)}</span> budget</small>` : ''}</div></div>`;
}
function renderHist() {
  if (!$('hist')) return;
  const d = monthData(ui.month);
  const opts = [['all', 'All'], ['expense', 'Expenses']]
    .concat(S.buckets.filter(b => !b.archived || d.E.some(e => e.type === b.id)).map(b => [b.id, b.name]))
    .concat([['income', 'Income']]);
  if (!opts.some(o => o[0] === ui.filter)) ui.filter = 'all';
  $('hf').innerHTML = opts.map(([k, l]) => `<button class="chip${ui.filter === k ? ' on' : ''}" onclick="ui.filter='${k}';renderHist()">${esc(l)}</button>`).join('');
  const q = ui.q.trim().toLowerCase();
  const E = d.E.filter(e => (ui.filter === 'all' || e.type === ui.filter) &&
    (!q || [e.note, e.cat, tinfo(e.type).name, String(e.amount), money(e.amount)].join(' ').toLowerCase().includes(q)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  if (!E.length) {
    $('hist').innerHTML = `<div class="empty">${d.E.length ? 'No matches.' : `<div class="empty-ic">${I.plus}</div>Nothing logged for this month yet.<br><button class="lnk" onclick="openEntry('expense')">Add your first entry</button>`}</div>`;
    return;
  }
  let h = '', cur = '';
  E.forEach(e => {
    if (e.date !== cur) {
      cur = e.date;
      const out = E.filter(x => x.date === cur && x.type !== 'income').reduce((a, x) => a + x.amount, 0);
      h += `<div class="day"><span>${dayLabel(cur)}</span><span class="m">${out ? '−' + money(out) : ''}</span></div>`;
    }
    h += `<button class="li" onclick="openEntry('${e.type}',${+e.id})">${entryIcon(e)}<span class="li-b"><b>${esc(entryName(e))}</b>${e.note ? `<small>${esc(e.note)}</small>` : ''}</span><b class="m${e.type === 'income' ? ' pos' : ''}">${e.type === 'income' ? '+' : ''}${money(e.amount)}</b></button>`;
  });
  $('hist').innerHTML = h;
}

/* ---------- Year ---------- */
function yearHtml() {
  const Y = ui.year, cy = +today().slice(0, 4), cm = +today().slice(5, 7), last = Y === cy ? cm : Y > cy ? 0 : 12;
  const B = S.buckets, M = [], tb = {}, cats = {};
  let tin = 0, tout = 0, tsp = 0, mx = 1, activeMonths = 0;
  B.forEach(b => { tb[b.id] = 0; });
  for (let i = 0; i < 12; i++) {
    const ym = `${Y}-${String(i + 1).padStart(2, '0')}`, d = monthData(ym), act = d.E.length > 0 || S.inc[ym] != null, inc = act ? d.inc : 0;
    if (act) activeMonths++;
    M.push({ ym, d, inc }); tin += inc; tout += d.out; tsp += d.spent;
    B.forEach(b => { tb[b.id] += d.byB[b.id] || 0; });
    for (const k in d.byC) cats[k] = (cats[k] || 0) + d.byC[k];
    mx = Math.max(mx, d.out, inc);
  }
  const sel = ui.ySel, st = 344 / 12, bw = 16, base = 166, H = 150;
  let svg = `<svg class="chart" viewBox="0 0 360 192" role="img" aria-label="Money in and out by month">`;
  [0.25, 0.5, 0.75, 1].forEach(g => { svg += `<line x1="8" x2="352" y1="${base - H * g}" y2="${base - H * g}" style="stroke:var(--line)" stroke-dasharray="2 4"/>`; });
  M.forEach((m, i) => {
    const x = 8 + i * st + (st - bw) / 2; let y = base;
    if (i === sel) svg += `<rect x="${x - 6}" y="2" width="${bw + 12}" height="${base + 4}" rx="8" style="fill:var(--soft)"/>`;
    B.map(b => [m.d.byB[b.id] || 0, col(b.color), 1]).concat([[m.d.spent, 'var(--mut)', 0.45]]).forEach(([v, c, o]) => {
      const h = v / mx * H;
      if (h > 0) { y -= h; svg += `<rect x="${x}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="2" style="fill:${c};opacity:${o}"/>`; }
    });
    if (m.inc > 0) { const yi = base - m.inc / mx * H; svg += `<line x1="${x - 3}" x2="${x + bw + 3}" y1="${yi}" y2="${yi}" style="stroke:var(--ink)" stroke-width="2.5" stroke-linecap="round"/>`; }
    svg += `<text x="${x + bw / 2}" y="184" text-anchor="middle" class="tx${i === sel ? ' sel' : ''}">${'JFMAMJJASOND'[i]}</text>`;
    svg += `<rect x="${x - 6}" y="0" width="${bw + 12}" height="192" fill="transparent" style="cursor:pointer" onclick="ui.ySel=${i === sel ? 'null' : i};render()"><title>${monthLabel(m.ym, { month: 'long' })}</title></rect>`;
  });
  svg += '</svg>';
  let det = '<p class="det">Tap a month for details</p>';
  if (sel != null) {
    const m = M[sel], rest = m.inc - m.d.out;
    det = `<div class="det on"><div class="row"><b>${monthLabel(m.ym, { month: 'long' })}</b><button class="lnk" onclick="ui.month='${m.ym}';go('month')">Open month →</button></div>
      <div class="dl"><span>In <b class="m">${money(m.inc)}</b></span><span>Out <b class="m">${money(m.d.out)}</b></span><span>Rest <b class="m${rest < 0 ? ' neg' : ''}">${money(rest)}</b></span></div></div>`;
  }

  const shown = B.filter(b => S.entries.some(e => e.type === b.id && e.date.slice(0, 4) <= String(Y)));
  let s2 = '', lg2 = '';
  if (last > 0 && shown.length) {
    const series = shown.map(b => {
      let c = S.entries.filter(e => e.type === b.id && e.date.slice(0, 4) < String(Y)).reduce((a, e) => a + e.amount, 0);
      const a = []; for (let i = 0; i < last; i++) { c += M[i].d.byB[b.id] || 0; a.push(c); }
      return { b, a };
    });
    const cx = Math.max(1, ...series.flatMap(s => s.a));
    s2 = `<svg class="chart" viewBox="0 0 360 160" role="img" aria-label="Bucket growth over the year">`;
    [0.33, 0.66, 1].forEach(g => { s2 += `<line x1="8" x2="352" y1="${136 - 116 * g}" y2="${136 - 116 * g}" style="stroke:var(--line)" stroke-dasharray="2 4"/>`; });
    series.forEach(({ b, a }) => {
      const pts = a.map((v, i) => [(8 + i * st + st / 2).toFixed(1), (136 - v / cx * 116).toFixed(1)]), lp = pts[pts.length - 1], c = col(b.color);
      s2 += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" style="fill:none;stroke:${c};stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round"/><circle cx="${lp[0]}" cy="${lp[1]}" r="4" style="fill:${c};stroke:var(--card);stroke-width:2"/>`;
    });
    for (let j = 0; j < 12; j++) s2 += `<text class="tx" x="${8 + j * st + st / 2}" y="154" text-anchor="middle">${'JFMAMJJASOND'[j]}</text>`;
    s2 += '</svg>';
    lg2 = `<div class="lg">${series.map(({ b, a }) => `<span><i style="background:${col(b.color)}"></i>${esc(b.name)} <b class="m">${money(a[a.length - 1])}</b></span>`).join('')}</div>`;
  } else s2 = '<p class="empty">No bucket activity yet for this year.</p>';

  const saved = B.filter(b => b.saving).reduce((a, b) => a + tb[b.id], 0);
  const rate = tin > 0 ? Math.round(saved / tin * 100) + '%' : '–';
  const stat = (l, v, cls) => `<div><small class="mut">${l}</small><b class="${cls || 'm'}">${v}</b></div>`;
  let stats = stat('Money in', money(tin)) + stat('Spent & set aside', money(tout)) + stat('Rest', money(tin - tout)) + stat('Saving rate', rate, '') +
    stat('Expenses', money(tsp)) + stat('Avg. monthly spend', money(activeMonths ? tsp / activeMonths : 0));
  B.filter(b => !b.archived || tb[b.id] > 0).forEach(b => { stats += stat(`<i class="dot" style="--c:${col(b.color)}"></i>${esc(b.name)}`, money(tb[b.id])); });

  const top = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 6), tmx = top.length ? top[0][1] : 1;
  const topH = top.length ? top.map(([k, v]) => { const c = cat(k); return `<div class="cat"><span class="ei" style="--c:${col(c && c.color)}">${esc(c ? c.emoji : '🏷️')}</span><span class="cat-b"><span class="row"><span>${esc(k)}</span><span class="m">${money(v)}</span></span><span class="bar"><i style="width:${v / tmx * 100}%;background:${col(c && c.color)}"></i></span></span></div>`; }).join('') : '<p class="empty">No expenses yet for this year.</p>';

  return `<div class="mon"><button class="icon" onclick="ui.year--;ui.ySel=null;render()" aria-label="Previous year">${I.left}</button><button class="mon-l" onclick="ui.year=+today().slice(0,4);ui.ySel=null;render()"><b>${Y}</b>${Y === cy ? '<small class="mut">This year</small>' : '<small>Back to today</small>'}</button><button class="icon" onclick="ui.year++;ui.ySel=null;render()" aria-label="Next year">${I.right}</button></div>
  <div class="grid"><div class="col">
    <div class="card gs">${stats}</div>
    <div class="sec-h"><h2>Money in vs. out</h2></div>
    <div class="card pad">${det}${svg}<div class="lg">${B.filter(b => tb[b.id] > 0 || !b.archived).map(b => `<span><i style="background:${col(b.color)}"></i>${esc(b.name)}</span>`).join('')}<span><i style="background:var(--mut);opacity:.45"></i>Expenses</span><span><i class="ln"></i>Money in</span></div></div>
  </div><div class="col">
    <div class="sec-h"><h2>Bucket growth</h2></div><div class="card pad">${s2}${lg2}</div>
    <div class="sec-h"><h2>Top categories</h2></div><div class="card spend">${topH}</div>
  </div></div>`;
}

/* ---------- Settings ---------- */
function section(title, id, icon, body) { return `<section class="set" id="${id}"><h3>${icon}${title}</h3>${body}</section>`; }
function toggle(on, handler, label) { return `<label class="tg"><input type="checkbox" ${on ? 'checked' : ''} onchange="${handler}" aria-label="${esc(label)}"><span></span></label>`; }
function settingsHtml() {
  const s = S.settings, p = prof();
  let h = '<div class="settings">';
  h += section('Profile', 's-profile', I.users, `
    <div class="field"><label for="st-name">Your name</label><input class="f" id="st-name" value="${esc(p.name)}" maxlength="40" onchange="renameProfile(this.value)"></div>
    <div class="field"><label for="st-cur">Currency</label><select class="f" id="st-cur" onchange="setSetting('currency',this.value)">${Object.keys(CURRENCIES).map(c => `<option ${s.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
    <button class="act" onclick="openProfiles()">${I.users}<span>Profiles on this device<small>${profiles.length} profile${profiles.length > 1 ? 's' : ''} · each one is completely separate</small></span>${I.right}</button>`);

  h += section('Appearance', 's-look', I.palette, `
    <div class="field"><label>Theme</label><div class="seg sm">${['auto', 'light', 'dark'].map(t => `<button class="${s.theme === t ? 'on' : ''}" onclick="setSetting('theme','${t}')">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></div>
    <div class="field"><label>Accent colour</label><div class="sw">${ACCENTS.map(c => `<button class="swatch${s.accent === c ? ' on' : ''}" style="--c:${c}" onclick="setAccent('${c}')" aria-label="Accent ${c}"></button>`).join('')}
      <label class="swatch custom${ACCENTS.includes(s.accent) ? '' : ' on'}" style="--c:${col(s.accent)}" title="Pick any colour"><input type="color" value="${col(s.accent)}" onchange="setAccent(this.value)" aria-label="Custom accent colour"></label></div></div>
    <div class="field"><label>Font</label><div class="seg sm">${Object.keys(FONTS).map(f => `<button class="${s.font === f ? 'on' : ''}" style="font-family:${FONTS[f]},system-ui" onclick="setSetting('font','${f}')">${FONT_LABELS[f]}</button>`).join('')}</div></div>
    <div class="field"><label>Corners</label><div class="seg sm">${Object.keys(RADII).map(r => `<button class="${s.radius === r ? 'on' : ''}" onclick="setSetting('radius','${r}')">${r[0].toUpperCase() + r.slice(1)}</button>`).join('')}</div></div>
    <div class="field inline"><label>Hide amounts<small>Blur numbers when others are around</small></label>${toggle(s.privacy, 'togglePrivacy()', 'Hide amounts')}</div>`);

  h += section('Buckets', 's-buckets', '<span class="h3dot"></span>', `
    <p class="mut">Places you set money aside: investments, savings, hobbies. Add a goal to track progress. "Saving" buckets count toward your saving rate.</p>
    ${S.buckets.map((b, i) => b.archived ? '' : `<div class="ed">
      <label class="cdot" style="--c:${col(b.color)}" title="Colour"><input type="color" value="${col(b.color)}" onchange="setBucket(${i},'color',this.value);this.parentNode.style.setProperty('--c',this.value)" aria-label="Colour for ${esc(b.name)}"></label>
      <input class="f" value="${esc(b.name)}" maxlength="30" onchange="setBucket(${i},'name',this.value)" aria-label="Bucket name">
      <button class="icon sm" onclick="removeBucket(${i})" aria-label="Remove ${esc(b.name)}">${I.trash}</button>
      <div class="sub"><input class="f" inputmode="decimal" placeholder="Goal (optional)" value="${b.goal || ''}" onchange="setBucket(${i},'goal',this.value)" aria-label="Goal for ${esc(b.name)}">
      <label class="chk">${toggle(!!b.saving, `setBucket(${i},'saving',this.checked)`, 'Counts as saving')}<span>Saving</span></label></div>
    </div>`).join('')}
    <button class="add-row" onclick="addBucket()">${I.plus}Add bucket</button>
    ${S.buckets.some(b => b.archived) ? `<div class="arch"><small class="mut">Archived</small>${S.buckets.map((b, i) => b.archived ? `<button class="chip" onclick="restoreBucket(${i})"><span class="dot" style="--c:${col(b.color)}"></span>${esc(b.name)} · Restore</button>` : '').join('')}</div>` : ''}`);

  h += section('Expense categories', 's-cats', '<span class="h3dot"></span>', `
    ${S.cats.map((c, i) => `<div class="ed cat-ed">
      <label class="cdot" style="--c:${col(c.color)}" title="Colour"><input type="color" value="${col(c.color)}" onchange="setCat(${i},'color',this.value);this.parentNode.style.setProperty('--c',this.value)" aria-label="Colour for ${esc(c.name)}"></label>
      <input class="f emo" value="${esc(c.emoji)}" maxlength="4" onchange="setCat(${i},'emoji',this.value)" aria-label="Emoji for ${esc(c.name)}">
      <input class="f" value="${esc(c.name)}" maxlength="24" onchange="setCat(${i},'name',this.value)" aria-label="Category name">
      <button class="icon sm" onclick="removeCat(${i})" aria-label="Remove ${esc(c.name)}">${I.trash}</button>
    </div>`).join('')}
    <button class="add-row" onclick="addCat()">${I.plus}Add category</button>`);

  h += section('Privacy & security', 's-sec', I.lock, `
    <p class="mut">Your data is stored only in this browser on this device. It is never uploaded, so nobody else visiting this site can see it.</p>
    ${p.pin ? `<button class="act" onclick="openPin()">${I.lock}<span>Change PIN<small>Asked when you open the app</small></span>${I.right}</button>
      <button class="act" onclick="lockNow()">${I.lock}<span>Lock now</span>${I.right}</button>
      <button class="act" onclick="removePin()">${I.x}<span>Remove PIN</span>${I.right}</button>`
      : `<button class="act" onclick="openPin()">${I.lock}<span>Set a PIN<small>Keep others on this device out of your profile</small></span>${I.right}</button>`}`);

  h += section('Your data', 's-data', I.download, `
    <button class="act" onclick="exportJson()">${I.download}<span>Download backup<small>A .json file you can restore on any device</small></span>${I.right}</button>
    <button class="act" onclick="importFile(false)">${I.upload}<span>Restore or import<small>From a backup (.json) or a CSV (also the old “Copy as CSV” format)</small></span>${I.right}</button>
    <button class="act" onclick="exportCsv()">${I.table}<span>Download CSV<small>Open in Excel, Numbers or Google Sheets</small></span>${I.right}</button>
    <button class="act danger" onclick="eraseProfile()">${I.trash}<span>Erase this profile<small>Deletes all of ${esc(p.name)}'s data on this device</small></span>${I.right}</button>`);

  h += section('About', 's-about', I.wifi, `<p class="mut">My Money works offline. On your phone, use “Add to Home Screen” to install it like an app. Shortcut: press <kbd>N</kbd> to add an entry.</p>`);
  return h + '</div>';
}

/* ---------- Onboarding & lock ---------- */
function onboardHtml() {
  const o = ui.onb || (ui.onb = { buckets: ['pea', 'savings', 'badminton'], name: '', cur: 'EUR', inc: '' });
  const first = !profiles.length, legacy = first && store.get(KEY.legacy, null);
  return `<div class="center"><div class="onb">
    <div class="logo">${I.logo}</div>
    <h1>${first ? 'Welcome to My Money' : 'Add a person'}</h1>
    <p class="lead">${first ? 'A calm, private place to see what is left this month, where your money goes and how your savings grow.' : 'Each person gets their own private space on this device. Nothing is shared between profiles.'}</p>
    ${first ? `<ul class="feat"><li>${I.shield}<span><b>Private by design.</b> Your data stays in your browser and is never uploaded.</span></li>
      <li>${I.palette}<span><b>Make it yours.</b> Your own buckets, categories, colours and fonts.</span></li>
      <li>${I.wifi}<span><b>Works offline.</b> Install it on your home screen like an app.</span></li></ul>` : ''}
    <div class="field"><label for="o-name">What should we call you?</label><input class="f" id="o-name" placeholder="Your name" maxlength="40" value="${esc(o.name)}" onkeydown="if(event.key==='Enter')createProfile()"></div>
    <div class="two"><div class="field"><label for="o-cur">Currency</label><select class="f" id="o-cur">${Object.keys(CURRENCIES).map(c => `<option ${o.cur === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
      <div class="field"><label for="o-inc">Monthly money</label><input class="f" id="o-inc" inputmode="decimal" placeholder="e.g. 1500" value="${esc(o.inc)}"></div></div>
    ${legacy ? '<p class="note">We found data from the earlier version on this device. It will be brought into your profile.</p>'
      : `<div class="field"><label>What do you set money aside for?</label><div class="chips">${PRESET_BUCKETS.map(b => `<button class="chip${o.buckets.includes(b.id) ? ' on' : ''}" onclick="onbToggle('${b.id}')">${esc(b.name)}</button>`).join('')}</div><small class="mut">You can rename these or add your own any time.</small></div>`}
    <button class="save" onclick="createProfile()">Get started</button>
    ${first ? `<button class="ghost" onclick="importFile(true)">Restore from a backup</button>` : `<button class="ghost" onclick="cancelOnb()">Cancel</button>`}
  </div></div>`;
}
function lockHtml() {
  const p = prof();
  return `<div class="center"><div class="onb lock">
    <div class="avatar xl" style="--c:${col(p.color)}">${esc(initial(p.name))}</div>
    <h1>Hi ${esc(p.name)}</h1><p class="lead">Enter your PIN to open your money.</p>
    <input id="pin" class="f pin" type="password" inputmode="numeric" maxlength="8" autocomplete="off" placeholder="••••" onkeydown="if(event.key==='Enter')unlock()" aria-label="PIN">
    <button class="save" onclick="unlock()">Unlock</button>
    ${profiles.length > 1 ? `<button class="ghost" onclick="openProfiles()">Switch profile</button>` : ''}
    <button class="ghost" onclick="forgotPin()">Forgot PIN?</button>
  </div></div>`;
}

/* ================= Actions ================= */
function shiftMonth(n) { ui.month = ymShift(ui.month, n); render(); }
function setIncome(v) { S.inc[ui.month] = Math.max(0, parseAmt(v) || 0); save(); render(); }
function togglePrivacy() { S.settings.privacy = !S.settings.privacy; save(); render(); }
function setSetting(k, v) { S.settings[k] = v; save(); render(); }
function setAccent(c) { S.settings.accent = col(c); const p = prof(); if (p) { p.color = col(c); saveProfiles(); } save(); render(); }
function renameProfile(v) { v = v.trim(); if (!v) { render(); return; } prof().name = v; saveProfiles(); }

/* Entry sheet */
function openOv() { $('ov').classList.add('on'); document.body.classList.add('noscroll'); }
function closeSheet() { $('ov').classList.remove('on'); document.body.classList.remove('noscroll'); ui.sheet = null; }
function sheetHead(t) { return `<div class="sh-h"><b>${t}</b><button class="icon sm" onclick="closeSheet()" aria-label="Close">${I.x}</button></div>`; }
function defaultDate() { return ui.month === thisMonth() ? today() : ui.month + '-01'; }
function openEntry(type, id) {
  if (!S) return;
  const e = id ? S.entries.find(x => x.id === id) : null;
  const firstCat = (S.cats[0] && S.cats[0].name) || 'Other';
  ui.sheet = { kind: 'entry', type: e ? e.type : type, cat: e && e.type === 'expense' ? e.cat : (lastCat && cat(lastCat) ? lastCat : firstCat), rep: false, id: e ? e.id : null };
  drawEntry(e ? String(e.amount) : '', e ? e.note : '', e ? e.date : defaultDate());
  openOv();
  if (!e) setTimeout(() => { const a = $('amt'); if (a) a.focus(); }, 80);
}
function pickE(k, v) {
  const a = $('amt').value, n = $('note').value, d = $('dt').value;
  ui.sheet[k] = k === 'cat' ? S.cats[v].name : v;
  drawEntry(a, n, d);
}
function drawEntry(a, n, dt) {
  const s = ui.sheet;
  const types = [['expense', 'Expense']].concat(S.buckets.filter(b => !b.archived || b.id === s.type).map(b => [b.id, b.name])).concat([['income', 'Extra income']]);
  let h = sheetHead(s.id ? 'Edit entry' : 'New entry');
  h += `<div class="chips">${types.map(([k, l]) => `<button class="chip${s.type === k ? ' on' : ''}" onclick="pickE('type','${k}')">${k !== 'expense' && k !== 'income' ? `<span class="dot" style="--c:${tinfo(k).color}"></span>` : ''}${esc(l)}</button>`).join('')}</div>`;
  h += `<input class="amt" id="amt" inputmode="decimal" placeholder="${esc(money(0))}" value="${esc(a)}" aria-label="Amount" autocomplete="off" onkeydown="if(event.key==='Enter')commit()">`;
  if (s.type === 'expense') h += `<div class="chips">${S.cats.map((c, i) => `<button class="chip${s.cat === c.name ? ' on' : ''}" onclick="pickE('cat',${i})">${esc(c.emoji)} ${esc(c.name)}</button>`).join('')}</div>`;
  h += `<div class="two"><input class="f" id="note" placeholder="Note (optional)" value="${esc(n)}" maxlength="120" onkeydown="if(event.key==='Enter')commit()" aria-label="Note"><input class="f" id="dt" type="date" value="${esc(dt)}" aria-label="Date"></div>`;
  if (!s.id) h += `<label class="rp">${toggle(s.rep, 'ui.sheet.rep=this.checked', 'Repeat every month')}<span>Repeat every month</span></label>`;
  const verb = s.type === 'expense' ? 'Save expense' : s.type === 'income' ? 'Save income' : 'Add to ' + esc(tinfo(s.type).name);
  h += `<button class="save" onclick="commit()">${s.id ? 'Save changes' : verb}</button>`;
  h += s.id ? `<button class="ghost danger" onclick="delEntry(${+s.id})">Delete entry</button>` : `<button class="ghost" onclick="saveTpl()">Save as quick-add</button>`;
  $('sh').innerHTML = h;
}
function commit() {
  const a = parseAmt($('amt').value);
  if (!(a > 0)) { shake($('amt')); return; }
  const s = ui.sheet, date = $('dt').value || today(), note = $('note').value.trim(), c = s.type === 'expense' ? s.cat : '';
  if (s.id) {
    const e = S.entries.find(x => x.id === s.id);
    if (e) Object.assign(e, { type: s.type, cat: c, amount: a, note, date });
    toast('Entry updated');
  } else {
    S.entries.push({ id: uid(), type: s.type, cat: c, amount: a, note, date });
    if (s.rep) S.rec.push({ id: uid(), type: s.type, cat: c, amount: a, note, day: Math.min(28, +date.slice(8)), last: date.slice(0, 7) });
    let msg = `Saved ${money(a)}`;
    if (s.type === 'expense' && S.budgets[c]) {
      const sp = monthData(date.slice(0, 7)).byC[c] || 0, b = S.budgets[c];
      if (sp > b) msg = `${c} is over budget by ${money(sp - b)}`;
      else if (sp >= b * 0.8) msg = `${c}: ${money(b - sp)} left in budget`;
    }
    toast(msg);
  }
  if (s.type === 'expense') lastCat = c;
  save(); ui.month = date.slice(0, 7); closeSheet(); render();
}
function delEntry(id) {
  const i = S.entries.findIndex(x => x.id === id);
  if (i < 0) return;
  const e = S.entries.splice(i, 1)[0];
  save(); closeSheet(); render();
  toast('Entry deleted', 'Undo', () => { S.entries.push(e); save(); render(); });
}

/* Templates & repeats */
function saveTpl() {
  const a = parseAmt($('amt').value);
  if (!(a > 0)) { shake($('amt')); return; }
  const s = ui.sheet, n = $('note').value.trim();
  S.tpls.push({ id: uid(), type: s.type, cat: s.type === 'expense' ? s.cat : '', amount: a, note: n, label: n || (s.type === 'expense' ? s.cat : tinfo(s.type).name) });
  save(); closeSheet(); render(); toast('Quick-add saved');
}
function useTpl(id) {
  const t = S.tpls.find(x => x.id === id);
  if (!t) return;
  const date = ui.month === thisMonth() ? today() : defaultDate();
  const e = { id: uid(), type: t.type, cat: t.cat, amount: t.amount, note: t.note, date };
  S.entries.push(e); save(); render();
  toast('Added ' + money(t.amount), 'Undo', () => { S.entries = S.entries.filter(x => x.id !== e.id); save(); render(); });
}
function delTpl(id) { S.tpls = S.tpls.filter(x => x.id !== id); save(); render(); }
function delRec(id) {
  const r = S.rec.find(x => x.id === id);
  S.rec = S.rec.filter(x => x.id !== id); save(); render();
  if (r) toast('Stopped repeating', 'Undo', () => { S.rec.push(r); save(); render(); });
}
function applyRec() {
  const cm = thisMonth(), dd = +today().slice(8);
  let ch = false;
  S.rec.forEach(r => {
    let [y, m] = String(r.last).split('-').map(Number);
    if (!y || !m) return;
    for (let guard = 0; guard < 240; guard++) {
      m++; if (m > 12) { m = 1; y++; }
      const ym = y + '-' + String(m).padStart(2, '0');
      if (ym > cm || (ym === cm && r.day > dd)) break;
      S.entries.push({ id: uid() + guard, type: r.type, cat: r.cat, amount: r.amount, note: r.note, date: ym + '-' + String(r.day).padStart(2, '0') });
      r.last = ym; ch = true;
    }
  });
  if (ch) save();
}

/* Budgets */
function openBudget(i) {
  const c = S.cats[i];
  ui.sheet = { kind: 'budget' };
  $('sh').innerHTML = sheetHead(`${esc(c.emoji)} ${esc(c.name)}: monthly budget`) +
    `<input class="amt" id="bud" inputmode="decimal" placeholder="${esc(money(0))}" value="${S.budgets[c.name] || ''}" aria-label="Budget" onkeydown="if(event.key==='Enter')setBud(${i})">
    <button class="save" onclick="setBud(${i})">Save budget</button>
    <button class="ghost" onclick="closeSheet();ui.sheet=null;openEntryCat(${i})">Add an expense in ${esc(c.name)}</button>
    ${S.budgets[c.name] ? `<button class="ghost danger" onclick="$('bud').value='';setBud(${i})">Remove budget</button>` : ''}`;
  openOv(); setTimeout(() => $('bud').focus(), 80);
}
function openEntryCat(i) { lastCat = S.cats[i].name; openEntry('expense'); }
function setBud(i) {
  const k = S.cats[i].name, v = parseAmt($('bud').value);
  if (v > 0) S.budgets[k] = v; else delete S.budgets[k];
  save(); closeSheet(); render();
}

/* Buckets & categories */
function setBucket(i, k, v) {
  const b = S.buckets[i];
  if (k === 'name') { v = v.trim(); if (!v) { render(); return; } }
  if (k === 'goal') v = Math.max(0, parseAmt(v) || 0);
  if (k === 'color') v = col(v);
  b[k] = v; save();
}
function addBucket() {
  S.buckets.push({ id: 'b' + uid().toString(36), name: 'New bucket', color: BUCKET_COLORS[S.buckets.length % BUCKET_COLORS.length], goal: 0, saving: false });
  save(); render();
  const inputs = document.querySelectorAll('#s-buckets .ed input.f:not([inputmode])');
  const el = inputs[inputs.length - 1];
  if (el) { el.focus(); el.select(); }
}
function removeBucket(i) {
  const b = S.buckets[i], n = S.entries.filter(e => e.type === b.id).length;
  if (n) {
    if (!confirm(`"${b.name}" has ${n} entr${n > 1 ? 'ies' : 'y'}. Archive it? The entries are kept and you can restore it later.`)) return;
    b.archived = true;
  } else {
    if (!confirm(`Remove "${b.name}"?`)) return;
    S.buckets.splice(i, 1);
  }
  S.rec = S.rec.filter(r => r.type !== b.id);
  S.tpls = S.tpls.filter(t => t.type !== b.id);
  save(); render();
}
function restoreBucket(i) { delete S.buckets[i].archived; save(); render(); }
function setCat(i, k, v) {
  const c = S.cats[i];
  if (k === 'name') {
    v = v.trim();
    if (!v || S.cats.some((x, j) => j !== i && x.name.toLowerCase() === v.toLowerCase())) { toast(v ? 'That category already exists' : 'Name can’t be empty'); render(); return; }
    const old = c.name;
    S.entries.forEach(e => { if (e.type === 'expense' && e.cat === old) e.cat = v; });
    S.tpls.forEach(t => { if (t.cat === old) { t.cat = v; if (t.label === old) t.label = v; } });
    S.rec.forEach(r => { if (r.cat === old) r.cat = v; });
    if (S.budgets[old] != null) { S.budgets[v] = S.budgets[old]; delete S.budgets[old]; }
    if (lastCat === old) lastCat = v;
  }
  if (k === 'emoji') v = v.trim() || '🏷️';
  if (k === 'color') v = col(v);
  c[k] = v; save();
}
function addCat() {
  let n = 'New category', j = 2;
  while (cat(n)) n = 'New category ' + j++;
  S.cats.push({ name: n, emoji: '✨', color: CAT_COLORS[S.cats.length % CAT_COLORS.length] });
  save(); render();
  const inputs = document.querySelectorAll('#s-cats .ed input.f:not(.emo)');
  const el = inputs[inputs.length - 1];
  if (el) { el.focus(); el.select(); }
}
function removeCat(i) {
  if (S.cats.length < 2) { toast('Keep at least one category'); return; }
  const c = S.cats[i];
  if (!confirm(`Remove "${c.name}"? Past expenses keep their label.`)) return;
  S.cats.splice(i, 1); delete S.budgets[c.name];
  S.tpls = S.tpls.filter(t => !(t.type === 'expense' && t.cat === c.name));
  save(); render();
}

/* Profiles, PIN, lock */
function markUnlocked() { sess.set(KEY.unlocked(active), '1'); }
function openProfile(id) {
  active = id; store.set(KEY.active, id);
  S = normalize(store.get(KEY.data(id), null));
  _fmtKey = '';
  ui.month = thisMonth(); ui.year = +today().slice(0, 4); ui.filter = 'all'; ui.q = '';
  const p = prof();
  if (p.pin && !sess.get(KEY.unlocked(id))) ui.view = 'lock';
  else { ui.view = 'month'; applyRec(); }
  render(); window.scrollTo(0, 0);
}
function openProfiles() {
  ui.sheet = { kind: 'profiles' };
  const locked = ui.view === 'lock';
  $('sh').innerHTML = sheetHead('Profiles on this device') +
    `<p class="mut">Each person gets their own private space. Data is never mixed between profiles.</p><div class="plist">` +
    profiles.map(p => `<button class="pi${p.id === active ? ' on' : ''}" onclick="switchProfile('${p.id}')"><span class="avatar" style="--c:${col(p.color)}">${esc(initial(p.name))}</span><span class="li-b"><b>${esc(p.name)}</b><small>${p.pin ? 'PIN protected' : 'No PIN'}</small></span>${p.id === active ? '<span class="tag">Current</span>' : ''}</button>`).join('') +
    `</div><button class="save" onclick="newProfile()">Add a person</button>` +
    (!locked && prof() && prof().pin ? `<button class="ghost" onclick="lockNow()">Lock my profile now</button>` : '');
  openOv();
}
function switchProfile(id) {
  closeSheet();
  if (id === active && ui.view !== 'lock') return;
  if (id !== active) sess.del(KEY.unlocked(active));
  openProfile(id);
}
function newProfile() {
  closeSheet();
  if (active) sess.del(KEY.unlocked(active));
  ui.onb = null; ui.view = 'onboard'; S = null; render(); window.scrollTo(0, 0);
}
function cancelOnb() { ui.onb = null; openProfile(active && prof() ? active : profiles[0].id); }
function onbToggle(id) {
  const o = ui.onb; o.name = $('o-name').value; o.cur = $('o-cur').value; o.inc = $('o-inc').value;
  o.buckets = o.buckets.includes(id) ? o.buckets.filter(x => x !== id) : o.buckets.concat(id);
  render();
}
function addProfile(name, data) {
  const id = 'p' + uid().toString(36);
  const color = col(data.settings.accent);
  profiles.push({ id, name, color });
  saveProfiles(); store.set(KEY.data(id), data);
  sess.set(KEY.unlocked(id), '1');
  return id;
}
function createProfile() {
  const name = $('o-name').value.trim();
  if (!name) { shake($('o-name')); return; }
  const first = !profiles.length, legacy = first ? store.get(KEY.legacy, null) : null;
  const d = normalize(legacy ? JSON.parse(JSON.stringify(legacy)) : {});
  d.settings.currency = $('o-cur').value;
  if (!legacy) {
    const sel = ui.onb.buckets;
    d.buckets = PRESET_BUCKETS.filter(b => sel.includes(b.id)).map(b => Object.assign({ goal: 0 }, b));
    d.settings.accent = ACCENTS[profiles.length % ACCENTS.length];
  }
  const inc = parseAmt($('o-inc').value);
  if (inc > 0) d.inc[thisMonth()] = inc;
  const id = addProfile(name, d);
  ui.onb = null;
  openProfile(id);
  toast(`Welcome, ${name}!`);
}
function openPin() {
  ui.sheet = { kind: 'pin' };
  $('sh').innerHTML = sheetHead(prof().pin ? 'Change PIN' : 'Set a PIN') +
    `<p class="mut">You'll be asked for it when you open My Money. It keeps other people on this device out of your profile. It can't be recovered, so keep a backup.</p>
    <input class="f pin" id="p1" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password" placeholder="New PIN (4–8 digits)" aria-label="New PIN">
    <input class="f pin" id="p2" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password" placeholder="Repeat PIN" aria-label="Repeat PIN" onkeydown="if(event.key==='Enter')savePin()">
    <button class="save" onclick="savePin()">Save PIN</button>`;
  openOv(); setTimeout(() => $('p1').focus(), 80);
}
async function savePin() {
  const a = $('p1').value, b = $('p2').value;
  if (!/^\d{4,8}$/.test(a)) { toast('Use 4 to 8 digits'); shake($('p1')); return; }
  if (a !== b) { toast('PINs don’t match'); shake($('p2')); return; }
  const salt = uid().toString(36);
  prof().pin = { salt, hash: await hashPin(a, salt) };
  saveProfiles(); markUnlocked(); closeSheet(); render(); toast('PIN saved');
}
function removePin() { if (!confirm('Remove the PIN for this profile?')) return; delete prof().pin; saveProfiles(); render(); toast('PIN removed'); }
function lockNow() { closeSheet(); sess.del(KEY.unlocked(active)); ui.view = 'lock'; render(); }
async function unlock() {
  const p = prof(), el = $('pin');
  if (p.pin && await hashPin(el.value, p.pin.salt) === p.pin.hash) { markUnlocked(); ui.view = 'month'; applyRec(); render(); }
  else { el.value = ''; shake(el); toast('Wrong PIN'); }
}
function forgotPin() {
  if (confirm('A forgotten PIN can’t be recovered. Erase this profile and all its data on this device so you can start again?') && confirm('Really erase? This cannot be undone.')) deleteProfile(active);
}
function eraseProfile() {
  const p = prof();
  if (confirm(`Erase all of ${p.name}'s data on this device? Download a backup first if you might need it.`) && confirm('Really erase? This cannot be undone.')) deleteProfile(active);
}
function deleteProfile(id) {
  store.del(KEY.data(id)); sess.del(KEY.unlocked(id));
  profiles = profiles.filter(p => p.id !== id); saveProfiles();
  closeSheet();
  if (profiles.length) openProfile(profiles[0].id);
  else { active = null; store.del(KEY.active); S = null; ui.onb = null; ui.view = 'onboard'; render(); }
  toast('Profile erased');
}

/* Import / export */
function csvCell(v) { v = String(v == null ? '' : v); return /[",\n\r]/.test(v) || /^[=+\-@]/.test(v) ? '"' + (/^[=+\-@]/.test(v) ? "'" : '') + v.replace(/"/g, '""') + '"' : v; }
function exportCsv() {
  const rows = ['date,type,category,amount,note,label'].concat(S.entries.slice().sort((a, b) => a.date.localeCompare(b.date))
    .map(e => [e.date, e.type, e.cat, e.amount, e.note, tinfo(e.type).name].map(csvCell).join(',')));
  download(`my-money-${prof().name.replace(/\W+/g, '-').toLowerCase()}-${today()}.csv`, rows.join('\n'), 'text/csv');
  toast('CSV downloaded');
}
function exportJson() {
  const p = prof();
  download(`my-money-backup-${p.name.replace(/\W+/g, '-').toLowerCase()}-${today()}.json`,
    JSON.stringify({ app: 'my-money', version: 2, exported: new Date().toISOString(), profileName: p.name, data: S }, null, 1), 'application/json');
  toast('Backup downloaded');
}
function parseCsv(t) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
function csvInto(text, d) {
  const rows = parseCsv(text.replace(/^﻿/, ''));
  if (rows.length < 2) return 0;
  const hdr = rows.shift().map(x => x.trim().toLowerCase()), ix = k => hdr.indexOf(k);
  if (ix('date') < 0 || ix('amount') < 0) throw new Error('CSV needs at least "date" and "amount" columns');
  const seen = new Set(d.entries.map(e => [e.date, e.type, e.cat, e.amount, e.note].join('|')));
  let n = 0;
  rows.forEach(r => {
    const get = k => ix(k) >= 0 ? String(r[ix(k)] || '').trim() : '';
    const date = get('date'), amount = parseAmt(get('amount'));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !(amount > 0)) return;
    const raw = get('type') || 'expense', label = get('label');
    let type = raw.toLowerCase();
    if (type !== 'expense' && type !== 'income') {
      type = type.replace(/[^\w-]/g, '') || 'bucket';
      ensureType(d, type, label && label !== 'Removed bucket' ? label : raw);
    }
    const note = get('note').replace(/^'(?=[=+\-@])/, '');
    let c = type === 'expense' ? (get('category') || 'Other') : '';
    if (c && !d.cats.some(x => x.name === c)) d.cats.push({ name: c, emoji: '🏷️', color: CAT_COLORS[d.cats.length % CAT_COLORS.length] });
    const key = [date, type, c, amount, note].join('|');
    if (seen.has(key)) return;
    seen.add(key);
    d.entries.push({ id: uid() + n, type, cat: c, amount, note, date }); n++;
  });
  return n;
}
function importFile(asNew) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json,.csv,application/json,text/csv';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const text = String(rd.result), isJson = /^\s*[{[]/.test(text);
        if (asNew || !S) {
          const name = ($('o-name') && $('o-name').value.trim()) || '';
          let d, pname;
          if (isJson) { const j = JSON.parse(text); d = normalize(j.data || j); pname = name || j.profileName || 'Me'; }
          else { d = normalize({}); if (!csvInto(text, d)) throw new Error('No valid rows found'); pname = name || 'Me'; }
          const id = addProfile(pname, d); ui.onb = null; openProfile(id); toast('Backup restored');
          return;
        }
        if (isJson) {
          const j = JSON.parse(text), d = normalize(j.data || j);
          if (!confirm(`Replace ${prof().name}'s data with this backup (${d.entries.length} entries)? Current data on this device will be overwritten.`)) return;
          S = d; save(); render(); toast('Backup restored');
        } else {
          const copy = normalize(JSON.parse(JSON.stringify(S))), n = csvInto(text, copy);
          if (!n) { toast('No new entries found in that file'); return; }
          if (!confirm(`Add ${n} entr${n > 1 ? 'ies' : 'y'} from this CSV to ${prof().name}'s data?`)) return;
          S = copy; save(); render(); toast(`Imported ${n} entr${n > 1 ? 'ies' : 'y'}`);
        }
      } catch (err) { toast('Could not read that file: ' + err.message); }
    };
    rd.readAsText(f);
  };
  inp.click();
}

/* Toast */
let toastT;
function toast(msg, act, fn) {
  const t = $('ts');
  t.innerHTML = `<span>${esc(msg)}</span>${act ? `<button type="button">${esc(act)}</button>` : ''}`;
  if (act) t.querySelector('button').onclick = () => { t.classList.remove('on'); fn(); };
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), act ? 5000 : 2400);
}

/* ================= Boot ================= */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('ov').classList.contains('on')) { closeSheet(); return; }
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.metaKey || e.ctrlKey || e.altKey) return;
  if ((e.key === 'n' || e.key === 'N') && S && (ui.view === 'month' || ui.view === 'year') && !$('ov').classList.contains('on')) { e.preventDefault(); openEntry('expense'); }
});
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!S || S.settings.theme === 'auto') applyTheme(); });
window.addEventListener('storage', e => {
  if (e.key === KEY.profiles) profiles = store.get(KEY.profiles, []);
  if (S && active && e.key === KEY.data(active)) { S = normalize(store.get(KEY.data(active), null)); render(); }
});
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

(function boot() {
  if (!profiles.length) { ui.view = 'onboard'; render(); return; }
  if (!active || !profiles.some(p => p.id === active)) active = profiles[0].id;
  openProfile(active);
})();
