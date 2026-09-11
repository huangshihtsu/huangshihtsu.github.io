'use strict';

/* landing page interactions: stat count-up, waitlist, smooth anchors */

const EASE = 'cubic-bezier(0.5, 0, 0.1, 1)';

/* ---------- hero stat count-up on view ---------- */

function countUpEl(el, to, { prefix = '', suffix = '', dur = 1200 } = {}) {
  const t0 = performance.now();
  function tick(t) {
    const p = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(to * e) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    statsObserver.unobserve(el);
    if (el.dataset.static) { el.textContent = el.dataset.static; return; }
    const n = parseInt(el.dataset.count, 10);
    if (el.textContent.startsWith('$')) countUpEl(el, n, { prefix: '$' });
    else countUpEl(el, n, { suffix: '%' });
  });
}, { threshold: 0.6 });

document.querySelectorAll('.hm-num').forEach((el) => statsObserver.observe(el));

/* ---------- waitlist (Supabase backend + real count via count-only RPC) ---------- */

const WL_KEY = 'subpocalypse.waitlist';
const SB_URL = 'https://cginoxngltunrfdmoodu.supabase.co';
const SB_KEY = 'sb_publishable_6q-GPW_kWz7vI_bom1vyGA_jFfno5sE';
const SB_TABLE = 'subpocalypse_waitlist';

function getList() {
  try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; }
  catch (e) { return []; }
}

const countEl = document.getElementById('wl-count');
let remoteCount = null; // real headcount from the count-only RPC; null until first fetch

function currentCount() {
  return remoteCount !== null ? remoteCount : getList().length;
}

function renderCount(animate) {
  const total = currentCount();
  if (animate) countUpEl(countEl, total, { dur: 900 });
  else countEl.textContent = total.toLocaleString('en-US');
}

async function fetchRemoteCount() {
  const res = await fetch(`${SB_URL}/rest/v1/rpc/waitlist_count`, {
    method: 'POST',
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  if (!res.ok) throw new Error('rpc ' + res.status);
  return await res.json();
}

fetchRemoteCount()
  .then((n) => { remoteCount = n; renderCount(false); })
  .catch(() => { /* offline or backend hiccup — local fallback stays */ });

async function postToSupabase(email) {
  const res = await fetch(`${SB_URL}/rest/v1/${SB_TABLE}`, {
    method: 'POST',
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ email }),
  });
  // 201 = joined · 409 = already on the list (unique constraint) — both are success
  if (res.status === 201 || res.status === 409) return res.status;
  throw new Error('supabase ' + res.status);
}

document.getElementById('wl-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('wl-email');
  const email = input.value.trim().toLowerCase();
  if (!email || !email.includes('@')) return;

  const list = getList();
  if (!list.includes(email)) {
    list.push(email);
    try { localStorage.setItem(WL_KEY, JSON.stringify(list)); } catch (err) {}
  }

  try {
    const status = await postToSupabase(email);
    if (status === 201 && remoteCount !== null) remoteCount++;
  } catch (err) {
    // offline or backend hiccup — the local copy above is the safety net
    console.warn('waitlist: stored locally, will need manual sync', err);
  }

  document.getElementById('wl-form').classList.add('hidden');
  const ok = document.getElementById('wl-success');
  ok.classList.remove('hidden');
  document.getElementById('wl-num').textContent = currentCount().toLocaleString('en-US');
  renderCount(true);
});

// returning visitor already joined?
if (getList().length) {
  document.getElementById('wl-form').classList.add('hidden');
  document.getElementById('wl-success').classList.remove('hidden');
  document.getElementById('wl-num').textContent = currentCount().toLocaleString('en-US');
}

renderCount(false);
