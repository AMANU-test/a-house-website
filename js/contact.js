// Submits the Contact page's Netlify Form via fetch so the page doesn't
// navigate away — Netlify still processes it exactly like a normal POST
// since the static markup was detected at deploy time.
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const success = document.getElementById('contact-success');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = new FormData(form);
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString()
    })
      .then(function () {
        form.hidden = true;
        success.hidden = false;
      })
      .catch(function () {
        alert("Something went wrong sending your message — please email us directly at ahouse.connect@gmail.com.");
      });
  });
})();
