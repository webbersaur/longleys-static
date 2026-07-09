// Mobile nav toggle
const toggle = document.querySelector('.menu-toggle');
const navList = document.querySelector('.nav-list');

toggle.addEventListener('click', () => {
  navList.classList.toggle('open');
  toggle.textContent = navList.classList.contains('open') ? '\u2715' : '\u2630';
});

// Close nav on link click
navList.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    toggle.textContent = '\u2630';
  });
});

// Scroll-triggered fade-in
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.15 }
);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Weekly specials — rendered from data/specials.json (published via the change portal).
// The block stays hidden unless there is a live, unexpired special, so a stale or
// empty file simply shows nothing. Expiry is handled here on the client: once the
// posted week's Sunday night (the `expires` timestamp) has passed, the band is hidden.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Format a "YYYY-MM-DD" string as "July 9, 2026" without timezone drift.
function formatPostedDate(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || ''));
  if (!m) return '';
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return '';
  return `${month} ${Number(m[3])}, ${m[1]}`;
}

async function renderSpecials() {
  const mount = document.getElementById('hero-specials');
  if (!mount) return;

  let data;
  try {
    const res = await fetch(`data/specials.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return; // network/parse failure — leave the hero clean
  }

  const items = Array.isArray(data.items)
    ? data.items.map(s => String(s).trim()).filter(Boolean)
    : [];
  if (!items.length) return;

  // Expiry: hide once the posted week's Sunday night has passed.
  const expiresAt = Date.parse(data.expires);
  if (!Number.isNaN(expiresAt) && Date.now() > expiresAt) return;

  const heading = (typeof data.heading === 'string' && data.heading.trim())
    ? data.heading.trim()
    : "This Week's Specials";

  const h = document.createElement('h2');
  h.className = 'hero-specials-heading';
  h.textContent = heading;
  mount.appendChild(h);

  const list = document.createElement('ul');
  list.className = 'hero-specials-list';
  if (items.length > 6) list.classList.add('two-col'); // split long lists so they don't run down the page
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item; // verbatim, as typed — textContent guards against markup
    list.appendChild(li);
  }
  mount.appendChild(list);

  const posted = formatPostedDate(data.posted);
  if (posted) {
    const p = document.createElement('p');
    p.className = 'hero-specials-posted';
    p.textContent = `Posted ${posted}`;
    mount.appendChild(p);
  }

  mount.hidden = false;
}

renderSpecials();

// Newsletter signup — posts to the change-portal newsletter-subscribe edge
// function (double opt-in: this only sends a confirmation email; the address
// isn't subscribed until the recipient clicks the link). The endpoint is a
// public --no-verify-jwt function, so no auth header is needed. Fails quietly
// with an inline message; the honeypot 'website' field weeds out bots.
const SIGNUP_ENDPOINT =
  'https://gkixwwhxqclyxjfkolog.supabase.co/functions/v1/newsletter-subscribe';
const SIGNUP_CLIENT_SLUG = 'longleys';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

(function initSignup() {
  const form = document.getElementById('signup-form');
  if (!form) return;
  const statusEl = document.getElementById('signup-status');
  const emailEl = document.getElementById('signup-email');
  const hpEl = document.getElementById('signup-website');
  const btn = form.querySelector('button[type="submit"]');

  const setStatus = (text, kind) => {
    statusEl.textContent = text;
    statusEl.className = 'signup-status' + (kind ? ' is-' + kind : '');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailEl.value.trim();
    if (!EMAIL_RE.test(email)) {
      setStatus('Please enter a valid email address.', 'error');
      return;
    }
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Signing up...';
    setStatus('', '');
    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_slug: SIGNUP_CLIENT_SLUG,
          email,
          website: hpEl ? hpEl.value : '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        form.reset();
        setStatus('Almost there — check your inbox and click the confirmation link to finish.', 'success');
      } else {
        setStatus(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch {
      setStatus('Network error. Please try again in a moment.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();
