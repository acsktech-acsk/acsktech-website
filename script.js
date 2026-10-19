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
      if (window.turnstile) window.turnstile.reset();
      status.textContent = form.dataset.formKind === 'feedback'
        ? 'Thank you — your feedback has been sent to the ACSKTech team.'
        : 'Thank you — your enquiry has been sent. The ACSKTech team will get back to you.';
      status.classList.add('success');
    } catch (error) {
      if (window.turnstile) window.turnstile.reset();
      status.textContent = `${error.message || 'Message delivery is temporarily unavailable.'} You can contact us at acsktech@gmail.com.`;
      status.classList.add('error');
    } finally {
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
});


// ACSKTech cookie notice and preference controls (English only).
(() => {
  const key = 'acsktech-cookie-preferences-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } };
  const save = (analytics) => {
    try { localStorage.setItem(key, JSON.stringify({ necessary: true, analytics: Boolean(analytics), savedAt: new Date().toISOString() })); } catch (_) {}
  };
  const footer = document.querySelector('.footer-bottom');
  const banner = document.createElement('section');
  banner.className = 'cookie-banner';
  banner.setAttribute('aria-label', 'Cookie notice');
  banner.hidden = true;
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <p>We use essential technologies to keep this website working and help protect our forms from abuse. Optional analytics are currently not active. Review <a href="privacy.html">our Privacy Policy</a> or manage your choices below.</p>
      <div class="cookie-banner-actions">
        <button type="button" class="cookie-button cookie-button-secondary" data-cookie-decline>Decline optional</button>
        <button type="button" class="cookie-button cookie-button-primary" data-cookie-accept>Accept optional</button>
        <button type="button" class="cookie-button cookie-button-link" data-cookie-open>Cookie settings</button>
      </div>
    </div>
    <div class="cookie-settings-panel" data-cookie-panel hidden>
      <div class="cookie-settings-heading"><h2>Cookie and privacy settings</h2><button type="button" class="cookie-close" data-cookie-close aria-label="Close settings">×</button></div>
      <p>Essential technologies are always enabled because they support core website functions and security. Optional analytics are not currently active; this preference can be updated at any time.</p>
      <label class="cookie-preference"><span><strong>Essential</strong><small>Required for website functionality and security.</small></span><input type="checkbox" checked disabled aria-label="Essential technologies are always enabled"></label>
      <label class="cookie-preference"><span><strong>Optional analytics</strong><small>Usage measurement, if introduced in the future.</small></span><input type="checkbox" data-cookie-analytics></label>
      <div class="cookie-banner-actions"><button type="button" class="cookie-button cookie-button-primary" data-cookie-save>Save preferences</button><button type="button" class="cookie-button cookie-button-secondary" data-cookie-decline>Decline optional</button></div>
    </div>`;
  document.body.appendChild(banner);
  if (footer && !footer.querySelector('[data-cookie-settings-link]')) {
    const link = document.createElement('a');
    link.href = '#cookie-settings'; link.textContent = 'Cookie settings'; link.dataset.cookieSettingsLink = '';
    link.addEventListener('click', (event) => { event.preventDefault(); openSettings(); });
    footer.appendChild(link);
  }
  const panel = banner.querySelector('[data-cookie-panel]');
  const analytics = banner.querySelector('[data-cookie-analytics]');
  const hide = () => { banner.hidden = true; panel.hidden = true; };
  function openSettings() {
    banner.hidden = false; panel.hidden = false;
    const pref = read(); analytics.checked = Boolean(pref && pref.analytics);
    analytics.focus();
  }
  if (!read()) banner.hidden = false;
  banner.querySelector('[data-cookie-open]').addEventListener('click', openSettings);
  banner.querySelector('[data-cookie-close]').addEventListener('click', () => { panel.hidden = true; });
  banner.querySelector('[data-cookie-accept]').addEventListener('click', () => { save(true); hide(); });
  banner.querySelectorAll('[data-cookie-decline]').forEach((button) => button.addEventListener('click', () => { save(false); hide(); }));
  banner.querySelector('[data-cookie-save]').addEventListener('click', () => { save(analytics.checked); hide(); });
})();
