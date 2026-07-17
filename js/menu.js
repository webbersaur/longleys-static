/* Longley's — Menu page: category jump-nav scrollspy. */
(() => {
  const jumpnav = document.querySelector('.jumpnav-list');
  if (!jumpnav) return;

  const links = Array.from(jumpnav.querySelectorAll('a'));
  const sections = links
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-150px 0px -60% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
})();
