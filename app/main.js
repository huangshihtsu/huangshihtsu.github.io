'use strict';

/* ============================================================
   SUBPOCALYPSE — interaction engine
   ============================================================ */

const EASE = 'cubic-bezier(0.5, 0, 0.1, 1)';

const SUBS = [
  { name: 'HelloFresh',      mono: 'HF', price: 59.80, day: 11, flags: ['UNUSED 61 DAYS', 'SKIPS COST EXTRA'],
    hist: [54.9,54.9,54.9,57.9,57.9,57.9,57.9,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8,59.8],
    steps: ['Log in at hellofresh.com → Account Settings.', 'Scroll to Plan Settings → <em>Cancel Plan</em> (they hide it at the bottom).', 'Decline both "we\'ll give you a discount" screens.', 'Screenshot the confirmation. They have "forgotten" cancellations before.'] },
  { name: 'Planet Fitness',  mono: 'PF', price: 39.00, day: 17, flags: ['UNUSED 94 DAYS', 'PRICE ↑ 8%'],
    hist: [24.9,24.9,24.9,24.9,24.9,24.9,24.9,24.9,24.9,24.9,29.9,29.9,29.9,29.9,29.9,29.9,34.0,34.0,34.0,34.0,39.0,39.0,39.0,39.0],
    steps: ['This one requires going in person or certified mail. Yes, really.', 'Ask the front desk for a <em>cancellation form</em> — fill it on the spot.', 'Get the staff member\'s name and a copy of the form.', 'Check your bank statement next cycle. Dispute immediately if charged.'] },
  { name: 'Netflix',         mono: 'NF', price: 15.49, day: 4,  flags: ['PRICE ↑ 23% IN 2 YRS'],
    hist: [12.9,12.9,12.9,12.9,12.9,13.9,13.9,13.9,13.9,13.9,13.9,13.9,15.4,15.4,15.4,15.4,15.4,15.4,15.4,15.4,15.4,15.4,15.4,15.49],
    steps: ['netflix.com → your profile icon → Account.', 'Membership & Billing → <em>Cancel Membership</em>.', 'Confirm. No retention gauntlet — they play nice.', 'You keep access until the end of the paid period.'] },
  { name: 'Audible',         mono: 'AU', price: 14.95, day: 22, flags: ['1 CREDIT ROTTED', 'FREE ALT: LIBBY'],
    hist: [14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95,14.95],
    steps: ['audible.com (desktop, not the app) → Account Details.', 'Membership → <em>Cancel membership</em>.', 'Decline the "pause instead" and "half price" offers.', 'Your purchased books stay yours forever. Library app <em>Libby</em> is free.'] },
  { name: 'YouTube Premium', mono: 'YT', price: 13.99, day: 9,  flags: ['UNUSED 38 DAYS'],
    hist: [11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,13.99,13.99,13.99,13.99,13.99,13.99,13.99,13.99,13.99,13.99,13.99,13.99,13.99,13.99],
    steps: ['YouTube app → profile photo → Purchases & memberships.', 'Premium → <em>Deactivate</em>.', 'Decline the pause offer unless you genuinely want it.', 'Ads return immediately; downloads die at period end.'] },
  { name: 'Spotify',         mono: 'SP', price: 11.99, day: 14, flags: ['FAMILY PLAN = CHEAPER'],
    hist: [10.99,10.99,10.99,10.99,10.99,10.99,10.99,10.99,10.99,10.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99],
    steps: ['spotify.com/account in a browser (can\'t cancel in-app).', 'Manage plan → <em>Cancel Premium</em>.', 'Survive the three "are you sure" screens.', 'If 2+ people at home pay separately, Duo/Family saves real money instead.'] },
  { name: 'Dropbox',         mono: 'DB', price: 11.99, day: 26, flags: ['FREE ALT EXISTS'],
    hist: [11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99],
    steps: ['dropbox.com → avatar → Settings → Plan.', '<em>Cancel plan</em> at the very bottom.', 'Download anything over 2GB before the downgrade.', 'iCloud / Google Drive free tiers cover most people.'] },
  { name: 'Paramount+',      mono: 'P+', price: 11.99, day: 2,  flags: ['UNUSED 112 DAYS'],
    hist: [9.99,9.99,9.99,9.99,9.99,9.99,9.99,9.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99,11.99],
    steps: ['paramountplus.com → Account → Subscription.', '<em>Cancel Subscription</em> → confirm twice.', 'If you subscribed via Apple/Google, cancel there instead.', 'It has been 112 days. The shows will survive without you.'] },
  { name: 'NYT Games',       mono: 'NY', price: 5.99,  day: 19, flags: [],
    hist: [5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99,5.99],
    steps: ['nytimes.com → Account → Subscription Overview.', 'Games → <em>Cancel your subscription</em>.', 'Wordle stays free either way.', 'No red flags here — this one is genuinely your call.'] },
  { name: 'iCloud+',         mono: 'iC', price: 2.99,  day: 28, flags: [],
    hist: [2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99,2.99],
    steps: ['Settings app → your name → iCloud → Manage Plan.', 'Downgrade Options → <em>Free 5GB</em>.', 'Back up photos off-device first if you\'re over 5GB.', 'Cheap, but it adds up — $36/yr for a digital closet.'] },
];

const STREAM_LINES = [
  'Your receipt from Netflix · $15.49',
  'Payment successful — Spotify USA',
  'Your iCloud+ storage plan renewed',
  'HelloFresh: your box is on the way',
  'Audible — your monthly credit is here',
  'Dropbox Plus subscription confirmed',
  'planetfitness.com — monthly dues',
  'YouTube Premium membership receipt',
  'Paramount+ — thanks for renewing',
  'NYT Games: subscription confirmation',
  'Your order has shipped — Amazon',
  'Venmo payment to Alex — $20.00',
  'Uber trip receipt · $23.40',
  'DoorDash order #4471 — $31.02',
  'Chase: your statement is ready',
  'Netflix: new sign-in to your account',
  'Spotify: premium family invite',
  'Hulu — your plan price is changing',
  'Gym: we miss you! come back for $1',
  'Adobe — payment of $22.99 received',
];

const $ = (id) => document.getElementById(id);
const phone = $('phone');
const fx = $('fx');
const fctx = fx.getContext('2d');

const state = {
  killed: [],      // indices into SUBS
  kept: [],
  queue: [],
  streak: 0,
  saved: 0,
  scanning: false,
  onboarded: false,
  pro: false,
};

/* ---------- persistence ---------- */

const STORE_KEY = 'subpocalypse.v1';

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      killed: state.killed,
      kept: state.kept,
      saved: state.saved,
      onboarded: state.onboarded,
      pro: state.pro,
    }));
  } catch (e) { /* storage unavailable — session-only mode */ }
}

function restore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    state.killed = d.killed || [];
    state.kept = d.kept || [];
    state.saved = d.saved || 0;
    state.onboarded = !!d.onboarded;
    state.pro = !!d.pro;
    return state.onboarded;
  } catch (e) { return false; }
}

function wipeStore() {
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
}

const aliveMonthly = () =>
  SUBS.reduce((s, x, i) => s + (state.killed.includes(i) ? 0 : x.price), 0);

/* ---------- money helpers ---------- */

const monthlyTotal = () => SUBS.reduce((s, x) => s + x.price, 0);

function fmt(n, cents = true) {
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
}

/* ---------- screen manager ---------- */

const TAB_SCREENS = ['scr-report', 'scr-kill', 'scr-saved', 'scr-you'];

function show(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const el = $(id);
  el.classList.add('active');

  const isTab = TAB_SCREENS.includes(id) && state.onboarded;
  $('tabbar').classList.toggle('hidden', !isTab);
  TAB_SCREENS.forEach((sid) => $(sid).classList.toggle('with-tabs', state.onboarded));
  if (isTab) {
    document.querySelectorAll('.tab').forEach((t) =>
      t.classList.toggle('active', t.dataset.tab === id));
  }
  if (id === 'scr-report') renderReport();
  if (id === 'scr-saved') renderSaved();
  if (id === 'scr-you') renderYou();
}

function updateTabs() {
  $('tab-leak-num').textContent = fmt(aliveMonthly(), false);
  $('tab-kill-num').textContent = '×' + (SUBS.length - state.killed.length - state.kept.length);
  $('tab-save-num').textContent = fmt(state.saved, false);
}

document.querySelectorAll('.tab').forEach((t) =>
  t.addEventListener('click', () => {
    const target = t.dataset.tab;
    if (target === 'scr-kill') enterKillMode();
    else show(target);
  }));

/* ---------- number count-up ---------- */

function countUp(el, to, { cents = false, dur = 800, prefix = '$' } = {}) {
  const from = parseFloat(el.dataset.v || '0');
  const t0 = performance.now();
  function tick(t) {
    const p = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    const v = from + (to - from) * e;
    el.textContent = prefix + v.toLocaleString('en-US', {
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    });
    if (p < 1) requestAnimationFrame(tick);
    else el.dataset.v = to;
  }
  requestAnimationFrame(tick);
}

/* ---------- fx canvas: shard physics ---------- */

let shards = [];
let fxRunning = false;
let fxLast = 0;

function sizeFx() {
  const r = phone.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  fx.width = r.width * dpr;
  fx.height = r.height * dpr;
  fx.style.width = r.width + 'px';
  fx.style.height = r.height + 'px';
  fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', sizeFx);
sizeFx();

function shatter(rect, payload) {
  const pr = phone.getBoundingClientRect();
  const x0 = rect.left - pr.left;
  const y0 = rect.top - pr.top;
  const cols = 4, rows = 3;
  const w = rect.width / cols, h = rect.height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isPrice = r === 0 && c === cols - 1;
      const isMono = r === 1 && c === 0;
      shards.push({
        x: x0 + c * w,
        y: y0 + r * h,
        w, h,
        vx: (Math.random() - 0.5) * 900,
        vy: -200 - Math.random() * 700,
        a: 0,
        va: (Math.random() - 0.5) * 14,
        life: 0,
        max: 1.1 + Math.random() * 0.5,
        text: isPrice ? payload.price : isMono ? payload.mono : null,
        accent: isPrice,
      });
    }
  }
  if (!fxRunning) {
    fxRunning = true;
    fxLast = performance.now();
    requestAnimationFrame(fxLoop);
  }
}

function fxLoop(t) {
  const dt = Math.min(0.033, (t - fxLast) / 1000);
  fxLast = t;
  const W = fx.clientWidth, H = fx.clientHeight;
  fctx.clearRect(0, 0, W, H);

  const G = 2600;
  const REST = 0.7;      // restitution — borrowed physics feel
  const AIR = 0.99;      // frictionAir ≈ 0.01 per frame

  shards = shards.filter((s) => s.life < s.max);

  for (const s of shards) {
    s.life += dt;
    s.vy += G * dt;
    s.vx *= AIR;
    s.vy *= AIR;
    s.va *= AIR;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.a += s.va * dt;

    if (s.y + s.h > H) { s.y = H - s.h; s.vy = -Math.abs(s.vy) * REST; s.vx *= 0.8; s.va *= 0.6; }
    if (s.y < 0)       { s.y = 0;       s.vy = Math.abs(s.vy) * REST; }
    if (s.x + s.w > W) { s.x = W - s.w; s.vx = -Math.abs(s.vx) * REST; }
    if (s.x < 0)       { s.x = 0;       s.vx = Math.abs(s.vx) * REST; }

    const fade = 1 - Math.max(0, (s.life - s.max * 0.55) / (s.max * 0.45));

    fctx.save();
    fctx.globalAlpha = Math.max(0, fade);
    fctx.translate(s.x + s.w / 2, s.y + s.h / 2);
    fctx.rotate(s.a);
    fctx.fillStyle = '#0d0d0d';
    fctx.strokeStyle = '#ffffff';
    fctx.lineWidth = 1;
    fctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
    fctx.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h);
    if (s.text) {
      fctx.fillStyle = s.accent ? '#e6da1c' : '#ffffff';
      fctx.font = `700 ${Math.min(20, s.h * 0.42)}px "Space Mono", monospace`;
      fctx.textAlign = 'center';
      fctx.textBaseline = 'middle';
      fctx.fillText(s.text, 0, 0);
    }
    fctx.restore();
  }

  if (shards.length) requestAnimationFrame(fxLoop);
  else { fxRunning = false; fctx.clearRect(0, 0, W, H); }
}

/* ============================================================
   FLOW 1 — WELCOME → SCAN
   ============================================================ */

$('btn-scan').addEventListener('click', () => {
  show('scr-scan');
  runScan();
});

function runScan() {
  if (state.scanning) return;
  state.scanning = true;

  const pctEl = $('scan-pct');
  const barEl = $('scan-bar');
  const streamEl = $('scan-stream');
  const foundEl = $('found-list');
  const totalEl = $('found-total');
  foundEl.innerHTML = '';
  totalEl.dataset.v = '0';
  totalEl.textContent = '$0.00';

  // fake email stream
  let li = 0;
  const streamTimer = setInterval(() => {
    const div = document.createElement('div');
    div.className = 'stream-line';
    div.textContent = '▸ ' + STREAM_LINES[li % STREAM_LINES.length];
    streamEl.appendChild(div);
    while (streamEl.children.length > 5) streamEl.removeChild(streamEl.firstChild);
    li++;
  }, 110);

  // progress over 3.4s
  const DUR = 3400;
  const t0 = performance.now();
  function prog(t) {
    const p = Math.min(1, (t - t0) / DUR);
    const v = Math.floor(p * 100);
    pctEl.textContent = v + '%';
    barEl.style.width = v + '%';
    if (p < 1) requestAnimationFrame(prog);
    else finishScan();
  }
  requestAnimationFrame(prog);

  // reveal found subs progressively
  const order = [...SUBS.keys()];
  order.forEach((idx, k) => {
    setTimeout(() => {
      const s = SUBS[idx];
      const row = document.createElement('li');
      row.innerHTML = `<span>${s.name}</span><span class="price">${fmt(s.price)}/mo</span>`;
      foundEl.appendChild(row);
      const revealed = SUBS.slice(0, k + 1).reduce((a, x) => a + x.price, 0);
      countUp(totalEl, revealed, { cents: true, dur: 300 });
    }, 500 + k * 260);
  });

  function finishScan() {
    clearInterval(streamTimer);
    $('btn-report').classList.remove('hidden');
  }
}

/* ============================================================
   FLOW 2 — REPORT
   ============================================================ */

$('btn-report').addEventListener('click', () => {
  state.onboarded = true;
  persist();
  show('scr-report');
  updateTabs();
});

function renderReport() {
  const m = aliveMonthly();
  const numEl = $('bleed-num');
  countUp(numEl, m, { cents: false, dur: 900 });
  $('bleed-year').textContent = fmt(m * 12, false);

  // upcoming renewals, next 14 days
  const strip = $('up-strip');
  strip.innerHTML = '';
  const today = new Date();
  const items = SUBS.map((s, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), s.day);
    if (d < today) d.setMonth(d.getMonth() + 1);
    return { s, i, d, diff: Math.ceil((d - today) / 86400000) };
  }).filter((x) => x.diff <= 14)
    .sort((a, b) => a.d - b.d);

  if (!items.length) {
    strip.innerHTML = '<div class="up-chip"><span class="u-day">CLEAR</span><span class="u-name">No charges</span><span class="u-price">14 days</span></div>';
  }
  items.forEach(({ s, i, d, diff }) => {
    const chip = document.createElement('div');
    chip.className = 'up-chip' + (state.killed.includes(i) ? ' dead' : '');
    const label = diff === 0 ? 'TODAY' : diff === 1 ? 'TOMORROW'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    chip.innerHTML = `<span class="u-day">${label}</span><span class="u-name">${s.name}</span><span class="u-price">${fmt(s.price)}</span>`;
    chip.addEventListener('click', () => openSheet(i));
    strip.appendChild(chip);
  });

  const list = $('leak-list');
  list.innerHTML = '';
  [...SUBS]
    .map((s, i) => ({ ...s, i }))
    .sort((a, b) => b.price - a.price)
    .forEach((s, k) => {
      const dead = state.killed.includes(s.i);
      const li = document.createElement('li');
      li.className = 'leak-row' + (dead ? ' dead' : '');
      li.style.opacity = '0';
      li.style.transform = 'translateY(10px)';
      li.style.transition = `opacity 0.4s ${EASE} ${k * 0.05}s, transform 0.4s ${EASE} ${k * 0.05}s`;
      const flags = s.flags.map((f) => `<span class="flag">${f}</span>`).join('');
      li.innerHTML = `
        <span class="leak-mono">${s.mono}</span>
        <div class="leak-info">
          <div class="leak-name">${s.name}</div>
          <div class="leak-flags">${dead ? '<span class="flag">SLAIN</span>' : (flags || '<span class="flag">NO RED FLAGS — YET</span>')}</div>
        </div>
        <span class="leak-price">${fmt(s.price)}<small>/mo</small></span>`;
      li.addEventListener('click', () => openSheet(s.i));
      list.appendChild(li);
      requestAnimationFrame(() => {
        li.style.opacity = '1';
        li.style.transform = 'translateY(0)';
      });
    });
  updateTabs();
}

/* ============================================================
   FLOW 3 — KILL MODE
   ============================================================ */

function enterKillMode() {
  state.queue = SUBS.map((_, i) => i)
    .filter((i) => !state.killed.includes(i) && !state.kept.includes(i));
  state.streak = 0;
  $('saved-num').dataset.v = state.saved;
  $('saved-num').textContent = fmt(state.saved, false);
  $('kill-streak').textContent = 'STREAK ×0';
  $('kill-streak').style.color = '';
  $('btn-finish').classList.add('hidden');
  $('btn-keep').classList.remove('hidden');
  nextKillCard();
  show('scr-kill');
}

$('btn-killmode').addEventListener('click', enterKillMode);

function nextKillCard() {
  const card = $('kill-card');
  const hint = $('kill-hint');

  if (!state.queue.length) {
    card.style.display = 'none';
    hint.textContent = 'EVERY VAMPIRE HAS FACED JUDGMENT';
    $('btn-keep').classList.add('hidden');
    $('btn-finish').classList.remove('hidden');
    return;
  }

  const idx = state.queue[0];
  const s = SUBS[idx];
  card.style.display = 'block';
  card.style.visibility = 'visible';
  card.style.opacity = '0';
  card.style.transform = 'translateY(16px)';
  const flags = s.flags.map((f) => `<span class="kc-flag">${f}</span>`).join('');
  card.innerHTML = `
    <div class="kc-top">
      <span class="kc-name">${s.name}</span>
      <span class="kc-price">${fmt(s.price)}<small>/mo</small></span>
    </div>
    <div class="kc-flags">${flags || '<span class="kc-flag">NO RED FLAGS — YOUR CALL</span>'}</div>
    <div class="kc-hold"><div class="kc-hold-fill" id="hold-fill"></div></div>
    <p class="kc-hold-label">HOLD CARD TO KILL · ${fmt(s.price * 12, false)}/YR RECOVERED</p>`;
  hint.textContent = `${state.queue.length} REMAINING`;
  requestAnimationFrame(() => {
    card.style.transition = `opacity 0.4s ${EASE}, transform 0.4s ${EASE}`;
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });

  bindHold(card, s, idx);
}

let holdRAF = null;
let activeHold = null; // {card, down, cancel} — removed before each rebind

function bindHold(card, sub, idx) {
  if (activeHold) {
    const h = activeHold;
    h.card.removeEventListener('pointerdown', h.down);
    h.card.removeEventListener('pointerup', h.cancel);
    h.card.removeEventListener('pointerleave', h.cancel);
    h.card.removeEventListener('pointercancel', h.cancel);
  }
  const fill = () => card.querySelector('#hold-fill');
  let start = null;
  const HOLD_MS = 620;

  function step(t) {
    if (start === null) start = t;
    const p = Math.min(1, (t - start) / HOLD_MS);
    const f = fill();
    if (f) f.style.width = p * 100 + '%';
    card.classList.add('squeezing');
    if (p >= 1) { cancel(); kill(card, sub, idx); return; }
    holdRAF = requestAnimationFrame(step);
  }

  function down(e) { e.preventDefault(); start = null; holdRAF = requestAnimationFrame(step); }
  function cancel() {
    if (holdRAF) cancelAnimationFrame(holdRAF);
    holdRAF = null;
    card.classList.remove('squeezing');
    const f = fill();
    if (f) { f.style.transition = `width 0.2s ${EASE}`; f.style.width = '0%'; }
  }

  card.addEventListener('pointerdown', down);
  card.addEventListener('pointerup', cancel);
  card.addEventListener('pointerleave', cancel);
  card.addEventListener('pointercancel', cancel);
  activeHold = { card, down, cancel };
}

function kill(card, sub, idx) {
  if (holdRAF) cancelAnimationFrame(holdRAF);
  holdRAF = null;
  const rect = card.getBoundingClientRect();
  card.style.visibility = 'hidden';

  shatter(rect, { price: fmt(sub.price, false), mono: sub.mono });

  state.queue.shift();
  state.killed.push(idx);
  state.streak++;
  state.saved += sub.price * 12;
  persist();
  updateTabs();

  const savedEl = $('saved-num');
  countUp(savedEl, state.saved, { cents: false, dur: 600 });
  savedEl.classList.add('pulse');
  setTimeout(() => savedEl.classList.remove('pulse'), 250);
  $('kill-streak').textContent = 'STREAK ×' + state.streak;
  $('kill-streak').style.color = state.streak >= 3 ? '#e6da1c' : '';

  setTimeout(nextKillCard, 750);
}

$('btn-keep').addEventListener('click', () => {
  if (!state.queue.length) return;
  const idx = state.queue.shift();
  state.kept.push(idx);
  state.streak = 0;
  persist();
  updateTabs();
  $('kill-streak').textContent = 'STREAK ×0';
  $('kill-streak').style.color = '';
  const card = $('kill-card');
  card.style.transition = `transform 0.4s ${EASE}, opacity 0.4s ${EASE}`;
  card.style.transform = 'translateX(60px)';
  card.style.opacity = '0';
  setTimeout(nextKillCard, 380);
});

$('btn-finish').addEventListener('click', () => {
  show('scr-saved');
});

/* ============================================================
   FLOW 4 — SAVED SUMMARY
   ============================================================ */

function renderSaved() {
  const big = $('saved-big');
  big.dataset.v = '0';
  countUp(big, state.saved, { cents: false, dur: 900 });

  $('badge-count').textContent = state.killed.length;
  const grid = $('badge-grid');
  grid.innerHTML = '';

  state.killed.forEach((idx, k) => {
    const s = SUBS[idx];
    const d = document.createElement('div');
    d.className = 'badge';
    d.style.animationDelay = k * 0.07 + 's';
    d.innerHTML = `
      <span class="b-mono">${s.mono}</span>
      <span class="b-name">${s.name}</span>
      <span class="b-save">+${fmt(s.price * 12, false)}/yr</span>`;
    grid.appendChild(d);
  });

  // empty coffins
  const empties = Math.max(0, 6 - state.killed.length);
  for (let i = 0; i < empties; i++) {
    const d = document.createElement('div');
    d.className = 'badge empty';
    d.style.animationDelay = (state.killed.length + i) * 0.07 + 's';
    d.innerHTML = `<span class="b-mono">†</span><span class="b-name">UNCLAIMED</span><span class="b-save">&nbsp;</span>`;
    grid.appendChild(d);
  }
}

/* ============================================================
   FLOW 5 — SHARE CARD
   ============================================================ */

$('btn-share').addEventListener('click', () => {
  drawShareCard();
  show('scr-share');
});

function drawShareCard() {
  const cv = $('share-canvas');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // frame
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 1;
  ctx.strokeRect(18.5, 18.5, W - 37, H - 37);

  // kicker
  ctx.fillStyle = '#8a8a8a';
  ctx.font = '400 13px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('S U B P O C A L Y P S E', 40, 62);
  ctx.textAlign = 'right';
  ctx.fillText(new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase(), W - 40, 62);

  // the number — accent yellow, the only color on the card
  ctx.textAlign = 'left';
  ctx.fillStyle = '#e6da1c';
  ctx.font = '700 96px "Space Mono", monospace';
  ctx.fillText(fmt(state.saved, false), 38, 190);

  ctx.fillStyle = '#ffffff';
  ctx.font = '400 15px "Space Mono", monospace';
  ctx.fillText('SAVED PER YEAR', 40, 226);

  ctx.fillStyle = '#8a8a8a';
  ctx.font = '400 12px "Space Mono", monospace';
  ctx.fillText(`${state.killed.length} VAMPIRE${state.killed.length === 1 ? '' : 'S'} SLAIN · HOLD-BY-HOLD`, 40, 254);

  // divider
  ctx.strokeStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.moveTo(40, 288);
  ctx.lineTo(W - 40, 288);
  ctx.stroke();

  // killed list — struck through
  let y = 330;
  ctx.font = '400 17px "Space Grotesk", sans-serif';
  state.killed.forEach((idx) => {
    const s = SUBS[idx];
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(s.name, 40, y);
    const wName = ctx.measureText(s.name).width;
    ctx.strokeStyle = '#e6da1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, y - 6);
    ctx.lineTo(40 + wName, y - 6);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillStyle = '#8a8a8a';
    ctx.font = '400 14px "Space Mono", monospace';
    ctx.fillText('+' + fmt(s.price * 12, false) + '/yr', W - 40, y);
    ctx.font = '400 17px "Space Grotesk", sans-serif';
    y += 38;
  });

  // kept, if any — quieter
  if (state.kept.length) {
    ctx.fillStyle = '#3a3a3a';
    ctx.font = '400 11px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SPARED: ${state.kept.map((i) => SUBS[i].name).join(' · ')}`.toUpperCase(), 40, H - 88);
  }

  ctx.fillStyle = '#8a8a8a';
  ctx.font = '400 11px "Space Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SCAN YOURS → SUBPOCALYPSE.APP', 40, H - 52);
}

$('btn-download').addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = 'subpocalypse-receipt.png';
  a.href = $('share-canvas').toDataURL('image/png');
  a.click();
});

$('btn-again').addEventListener('click', () => {
  wipeStore();
  location.reload();
});

/* ============================================================
   DETAIL SHEET
   ============================================================ */

let sheetIdx = null;

function openSheet(idx) {
  sheetIdx = idx;
  const s = SUBS[idx];
  $('dt-mono').textContent = s.mono;
  $('dt-name').textContent = s.name;
  $('dt-price').textContent = fmt(s.price) + '/MO · ' + fmt(s.price * 12, false) + '/YR';
  $('dt-save').textContent = fmt(s.price * 12, false);
  $('dt-flags').innerHTML = (state.killed.includes(idx)
    ? '<span class="kc-flag">SLAIN · SAVINGS COUNTED</span>'
    : (s.flags.map((f) => `<span class="kc-flag">${f}</span>`).join('') ||
       '<span class="kc-flag">NO RED FLAGS — YOUR CALL</span>'));
  $('dt-kill').style.display = state.killed.includes(idx) ? 'none' : '';
  $('dt-steps').innerHTML = s.steps.map((st) => `<li>${st}</li>`).join('');
  drawHistory(s.hist, s.price);
  $('sheet-veil').classList.add('open');
  $('sheet').classList.add('open');
}

function closeSheet() {
  $('sheet-veil').classList.remove('open');
  $('sheet').classList.remove('open');
}

function drawHistory(hist, cur) {
  const cv = $('dt-chart');
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  const max = Math.max(...hist) * 1.15;
  const bw = W / hist.length;
  hist.forEach((v, i) => {
    const h = (v / max) * (H - 16);
    const isLast = i === hist.length - 1;
    const rose = i > 0 && v > hist[i - 1];
    ctx.fillStyle = isLast ? '#e6da1c' : rose ? '#ffffff' : '#3a3a3a';
    ctx.fillRect(i * bw + 2, H - h, bw - 4, h);
  });
  ctx.fillStyle = '#8a8a8a';
  ctx.font = '400 18px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(fmt(cur), W - 4, 20);
}

$('sheet-veil').addEventListener('click', closeSheet);
$('dt-close').addEventListener('click', closeSheet);

$('dt-kill').addEventListener('click', () => {
  if (sheetIdx === null || state.killed.includes(sheetIdx)) return;
  const idx = sheetIdx;
  const s = SUBS[idx];
  const rect = document.querySelector('.sheet-head').getBoundingClientRect();
  closeSheet();

  state.killed.push(idx);
  state.kept = state.kept.filter((i) => i !== idx);
  state.saved += s.price * 12;
  persist();
  updateTabs();

  setTimeout(() => shatter(rect, { price: fmt(s.price, false), mono: s.mono }), 250);
  renderReport();
});

/* ============================================================
   YOU SCREEN + PAYWALL
   ============================================================ */

function renderYou() {
  $('you-saved').textContent = fmt(state.saved, false);
  $('you-sub-line').textContent =
    `${state.killed.length} VAMPIRE${state.killed.length === 1 ? '' : 'S'} SLAIN · ${state.pro ? 'PRO ACTIVE' : 'FREE PLAN'}`;
  $('pro-status').textContent = state.pro ? 'ACTIVE ✓' : '$4.99/MO →';
}

$('row-pro').addEventListener('click', () => show('scr-paywall'));
$('btn-pay-back').addEventListener('click', () => show('scr-you'));

$('btn-subscribe').addEventListener('click', () => {
  state.pro = true;
  persist();
  renderYou();
  const btn = $('btn-subscribe');
  btn.textContent = 'PRO ACTIVE · WELCOME TO THE IRONY';
  setTimeout(() => { show('scr-you'); btn.textContent = 'SUBSCRIBE (SIMULATED)'; }, 900);
});

$('row-rescan').addEventListener('click', () => {
  state.scanning = false;
  show('scr-scan');
  runScan();
});

$('row-reset').addEventListener('click', () => {
  const btn = $('row-reset');
  if (btn.dataset.arm === '1') {
    wipeStore();
    location.reload();
  } else {
    btn.dataset.arm = '1';
    btn.querySelector('span').textContent = 'ARE YOU SURE? TAP AGAIN';
    setTimeout(() => {
      btn.dataset.arm = '';
      btn.querySelector('span').textContent = 'BURN ALL DATA';
    }, 3000);
  });
});

/* ============================================================
   BOOT + SERVICE WORKER
   ============================================================ */

if (restore()) {
  show('scr-report');
  updateTabs();
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
