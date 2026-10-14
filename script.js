document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

const menuButton = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
if (menuButton && primaryNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    primaryNav.classList.toggle('is-open', !isOpen);
  });
  primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('is-open');
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      menuButton.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('is-open');
      menuButton.focus();
    }
  });
}

// Contact and feedback forms post to a Cloudflare Pages Function. Never put email API keys in browser code.
document.querySelectorAll('[data-email-form]').forEach((form) => {
  const status = form.querySelector('.form-status');
  const submit = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = '';
    status.className = 'form-status';
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.company_website) { status.textContent = 'Thank you.'; status.classList.add('success'); return; }
    const originalText = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, kind: form.dataset.formKind || 'enquiry' })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not send your message. Please email acsktech@gmail.com directly.');
      form.reset();
      status.textContent = form.dataset.formKind === 'feedback'
        ? 'Thank you — your feedback has been sent to the ACSKTech team.'
        : 'Thank you — your enquiry has been sent. The ACSKTech team will get back to you.';
      status.classList.add('success');
    } catch (error) {
      status.textContent = `${error.message || 'Message delivery is temporarily unavailable.'} You can contact us at acsktech@gmail.com.`;
      status.classList.add('error');
    } finally {
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
});
