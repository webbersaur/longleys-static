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
