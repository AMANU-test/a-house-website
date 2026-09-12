// Self-touring "elevator" for the About page's tower illustration (Core
// Competencies section) — visits Harmony -> Opportunity -> Mentorship ->
// Engagement -> Lobby -> repeat, pausing ~4.2s at each floor to show its
// highlight ring, info card, and lit badge. Clicking (or Enter/Space-ing,
// since badges are real buttons) any badge jumps straight there and
// restarts the tour from that floor.
//
// Same pause-on-interaction idea as the site's photo carousels
// (js/carousel.js): an endlessly auto-cycling element is distracting on a
// page a visitor is trying to read, so the tour pauses while the scene is
// hovered or a badge has keyboard focus, and doesn't run at all for anyone
// who prefers reduced motion (only badge clicks move the elevator then).
(function () {
  const scene = document.getElementById('towerScene');
  if (!scene) return;

  const FLOORS = {
    0: { top: 86.392, color: '--gold', name: 'Lobby' },
    1: { top: 21.112, color: '--red', name: 'Harmony' },
    2: { top: 37.793, color: '--amber', name: 'Opportunity' },
    3: { top: 54.069, color: '--blue', name: 'Mentorship' },
    4: { top: 70.208, color: '--green', name: 'Engagement' },
  };
  const TOUR = [1, 2, 3, 4, 0]; // physical top-to-bottom order, including the Lobby
  const DWELL_MS = 4200;

  const car = document.getElementById('towerCar');
  const badges = scene.querySelectorAll('.tower-badge');
  const highlights = scene.querySelectorAll('.tower-hl');
  const infos = scene.querySelectorAll('.tower-info');
  const announce = document.getElementById('towerAnnounce');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let tourIndex = 0;
  let timer = null;
  let paused = false;

  function goToFloor(n) {
    n = Number(n);
    const f = FLOORS[n];
    if (!f) return;

    car.style.top = f.top + '%';

    badges.forEach(function (b) {
      b.classList.toggle('active', b.dataset.room === String(n));
    });
    highlights.forEach(function (h) {
      h.classList.toggle('on', h.dataset.room === String(n));
    });
    infos.forEach(function (box) {
      box.classList.toggle('show', box.id === ('towerInfo' + n));
    });

    // The active floor's color is read off .tower-scene's own --red/--amber/
    // --blue/--green/--gold (scoped there in css/style.css, not on :root) and
    // pushed onto that floor's highlight ring + info card border.
    if (f.color) {
      const hex = getComputedStyle(scene).getPropertyValue(f.color).trim();
      scene.querySelectorAll('.tower-hl.rm' + n).forEach(function (h) {
        h.style.setProperty('--hl-color', hex);
      });
      scene.querySelectorAll('.tower-info.rm' + n).forEach(function (box) {
        box.style.setProperty('--ic-color', hex);
      });
    }

    if (announce) announce.textContent = 'Now viewing: ' + f.name;
  }

  function startTour() {
    if (reduceMotion) return; // stays put — only badge clicks move the elevator
    if (timer) clearInterval(timer);
    timer = setInterval(function () {
      if (paused) return;
      tourIndex = (tourIndex + 1) % TOUR.length;
      goToFloor(TOUR[tourIndex]);
    }, DWELL_MS);
  }

  badges.forEach(function (b) {
    b.addEventListener('click', function () {
      const n = Number(b.dataset.room);
      tourIndex = TOUR.indexOf(n);
      goToFloor(n);
      startTour();
    });
  });

  // Pause while a visitor is actually engaging with the scene — hovering it
  // with a mouse, or focused on a badge via keyboard — then resume once
  // they move on.
  scene.addEventListener('mouseenter', function () { paused = true; });
  scene.addEventListener('mouseleave', function () { paused = false; });
  scene.addEventListener('focusin', function () { paused = true; });
  scene.addEventListener('focusout', function () { paused = false; });

  car.style.transform = 'translateY(-50%)';
  goToFloor(TOUR[0]);
  startTour();
})();
