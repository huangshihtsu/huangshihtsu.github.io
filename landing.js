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

/* ---------- waitlist (Supabase backend + local fallback) ---------- */

const WL_KEY = 'subpocalypse.waitlist';
const BASE_COUNT = 4841; // display base — replace with real count once API exposes it
const SB_URL = 'https://iyfeudixftqnbvitopme.supabase.co';
const SB_KEY = 'sb_publishable_DN_PBoiHRUwChdy2AoiNXQ_v6qE51wz';
const SB_TABLE = 'subpocalypse_waitlist';

function getList() {
  try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; }
  catch (e) { return []; }
}

const countEl = document.getElementById('wl-count');

function renderCount(animate) {
  const total = BASE_COUNT + getList().length;
  if (animate) countUpEl(countEl, total, { dur: 900 });
  else countEl.textContent = total.toLocaleString('en-US');
}

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
  if (res.status === 201 || res.status === 409) return true;
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
    await postToSupabase(email);
  } catch (err) {
    // offline or backend hiccup — the local copy above is the safety net
    console.warn('waitlist: stored locally, will need manual sync', err);
  }

  document.getElementById('wl-form').classList.add('hidden');
  const ok = document.getElementById('wl-success');
  ok.classList.remove('hidden');
  document.getElementById('wl-num').textContent = (BASE_COUNT + list.length).toLocaleString('en-US');
  renderCount(true);
});

// returning visitor already joined?
if (getList().length) {
  document.getElementById('wl-form').classList.add('hidden');
  document.getElementById('wl-success').classList.remove('hidden');
  document.getElementById('wl-num').textContent = (BASE_COUNT + getList().length).toLocaleString('en-US');
}

renderCount(false);
