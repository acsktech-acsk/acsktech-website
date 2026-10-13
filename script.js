document.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());

const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('nav a').forEach(a => {
  if (a.getAttribute('href') === path || (path === '' && a.getAttribute('href') === 'index.html')) {
    a.classList.add('active');
  }
});

// Contact form posts to a Cloudflare Pages Function. No email credentials belong in browser code.
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const status = document.querySelector('#contact-status');
  const submit = document.querySelector('#contact-submit');

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    status.className = 'form-status';

    const data = Object.fromEntries(new FormData(contactForm).entries());
    if (data.company_website) return; // honeypot: silently ignore automated spam

    submit.disabled = true;
    submit.textContent = 'Sending…';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not send your enquiry. Please try again.');
      contactForm.reset();
      status.textContent = 'Thank you! Your enquiry has been sent. We will get back to you soon.';
      status.classList.add('success');
    } catch (error) {
      status.textContent = error.message || 'Something went wrong. Please email acsktech@gmail.com directly.';
      status.classList.add('error');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send Enquiry';
    }
  });
}
