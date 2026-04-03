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
