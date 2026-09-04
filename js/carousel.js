// Native horizontal scroll-snap carousel. Swipe/scroll/drag to browse, click a
// numbered tab to jump to a slide, and it auto-advances when left alone —
// pausing the moment someone touches or scrolls it manually, then resuming
// a beat after they stop. Works off data-carousel root.
(function () {
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    const track = root.querySelector('.carousel-track');
    const realSlides = Array.from(track.children);
    const count = realSlides.length;

    // Clone slide 01 onto the end. Scrolling (or auto-advancing) past the last
    // real slide lands here first — visually identical to slide 01 — then we
    // snap back to the real slide 01 without animating. Reaching the end this
    // way continues forward instead of smooth-scrolling backward through
    // every slide to get back to the start.
    const loopClone = realSlides[0].cloneNode(true);
    loopClone.setAttribute('aria-hidden', 'true');
    track.appendChild(loopClone);

    const tabsWrap = root.querySelector('.carousel-tabs');
    let timer = null;
    let settleTimeout = null;

    for (let i = 0; i < count; i++) {
      const tab = document.createElement('button');
      const label = String(i + 1).padStart(2, '0');
      tab.textContent = label;
      tab.setAttribute('aria-label', 'Go to slide ' + label);
      if (i === 0) tab.classList.add('active');
      tab.addEventListener('click', function () {
        goTo(i);
      });
      tabsWrap.appendChild(tab);
    }
    const tabs = Array.from(tabsWrap.children);

    // Arrow buttons are optional — only the hero-style carousel on the home
    // page has them (see .carousel-arrow in style.css). goTo/next below
    // already restart the auto-advance timer via the track's own scroll
    // listener, so an arrow click is treated the same as a tab click.
    const prevBtn = root.querySelector('.carousel-arrow.prev');
    const nextBtn = root.querySelector('.carousel-arrow.next');
    if (prevBtn) prevBtn.addEventListener('click', function () {
      const i = rawIndex();
      goTo(i === 0 ? count - 1 : i - 1);
    });
    if (nextBtn) nextBtn.addEventListener('click', next);

    function rawIndex() {
      return Math.round(track.scrollLeft / track.clientWidth);
    }

    function updateActiveTab() {
      const index = rawIndex() % count;
      tabs.forEach(function (t, i) {
        t.classList.toggle('active', i === index);
      });
    }

    function goTo(i) {
      track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
    }

    function next() {
      track.scrollTo({ left: track.clientWidth * (rawIndex() + 1), behavior: 'smooth' });
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, 5000);
    }

    function pause() {
      if (timer) clearInterval(timer);
    }

    let ticking = false;
    track.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          updateActiveTab();
          ticking = false;
        });
        ticking = true;
      }
      // Any scroll activity (manual or auto) pushes the settle check out, so
      // it only fires once things have actually stopped moving.
      clearTimeout(settleTimeout);
      settleTimeout = setTimeout(function () {
        if (rawIndex() === count) {
          // 'instant', not 'auto' — the track's CSS scroll-behavior:smooth means
          // 'auto' would defer to it and animate, which is exactly what a snap-
          // back reset must not do.
          track.scrollTo({ left: 0, behavior: 'instant' });
        }
        restart();
      }, 500);
    });

    track.addEventListener('pointerdown', pause);
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', restart);

    updateActiveTab();
    restart();
  });
})();
