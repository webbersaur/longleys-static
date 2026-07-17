/* Longley's — Photos page: category filter + lightbox. */
(() => {
  const tiles = Array.from(document.querySelectorAll('.photo-tile'));
  const filters = document.querySelectorAll('.photo-filter');
  const lightbox = document.querySelector('.lightbox');
  if (!tiles.length || !lightbox) return;

  // --- Category filter ---
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.toggle('active', b === btn));
      const cat = btn.dataset.filter;
      tiles.forEach((tile) => {
        tile.hidden = cat !== 'all' && tile.dataset.cat !== cat;
      });
    });
  });

  // --- Lightbox ---
  const img = lightbox.querySelector('.lightbox-img');
  const caption = lightbox.querySelector('.lightbox-caption');
  let current = -1;

  const visibleTiles = () => tiles.filter((t) => !t.hidden);

  const show = (tile) => {
    const source = tile.querySelector('img');
    img.src = source.src;
    img.alt = source.alt;
    caption.textContent = source.alt;
    current = visibleTiles().indexOf(tile);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    lightbox.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
  };

  const step = (dir) => {
    const vis = visibleTiles();
    if (!vis.length) return;
    current = (current + dir + vis.length) % vis.length;
    show(vis[current]);
  };

  tiles.forEach((tile) => tile.addEventListener('click', () => show(tile)));
  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
  lightbox.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); step(1); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
})();
