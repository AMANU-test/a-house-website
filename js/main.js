// Shared jump-to-section helper used by any page's subnav (Directory, Events, ...).
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Shared header behavior across all pages: mobile menu toggle + active nav link.
(function () {
  const header = document.querySelector('header[data-header]');
  if (!header) return;

  const toggle = header.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('menu-open');
    });
  }

  const page = header.getAttribute('data-page');
  header.querySelectorAll('a[data-page]').forEach(function (link) {
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });

  // Close mobile menu after a link is tapped.
  header.querySelectorAll('.mobile-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      header.classList.remove('menu-open');
    });
  });
})();
