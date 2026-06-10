/* ==========================================================
   Sovra AI — Contact Form Handler
   Submits to info@hopn.eu via mailto fallback
   For production: swap fetch() target to a PHP mailer endpoint
   ========================================================== */

(function () {
  'use strict';

  function initContactForms() {
    document.querySelectorAll('[data-contact-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        const originalText = btn.textContent;

        // Gather fields
        const name    = form.querySelector('[name="name"]')?.value || '';
        const company = form.querySelector('[name="company"]')?.value || '';
        const email   = form.querySelector('[name="email"]')?.value || '';
        const industry= form.querySelector('[name="industry"]')?.value || '';
        const message = form.querySelector('[name="message"]')?.value || '';
        const subject = form.getAttribute('data-subject') || 'Sovra AI Inquiry';

        // Basic validation
        if (!name || !email || !message) {
          showFormError(form, 'Please fill in all required fields.');
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Sending…';

        // Build body
        const body = [
          'Name: ' + name,
          'Company: ' + company,
          'Email: ' + email,
          'Industry: ' + industry,
          '',
          'Message:',
          message,
        ].join('\n');

        // Option A: mailto fallback (works on PHP hosting without SMTP config)
        const mailtoLink = 'mailto:info@hopn.eu'
          + '?subject=' + encodeURIComponent(subject + ' — ' + name)
          + '&body=' + encodeURIComponent(body);

        // Option B (preferred for production): POST to PHP mailer
        // fetch('/mailer.php', { method: 'POST', body: new FormData(form) })
        //   .then(r => r.json())
        //   .then(d => { if (d.ok) showSuccess(form, btn, originalText); })
        //   .catch(() => window.location.href = mailtoLink);

        // For now: open mailto
        window.location.href = mailtoLink;

        setTimeout(function () {
          showFormSuccess(form, btn, originalText);
        }, 500);
      });
    });
  }

  function showFormSuccess(form, btn, originalText) {
    btn.disabled = false;
    btn.textContent = originalText;
    let msg = form.querySelector('.form-success-msg');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'form-success-msg';
      msg.style.cssText = 'margin-top:1rem;padding:0.75rem 1rem;background:var(--color-success-highlight);color:var(--color-success);border-radius:var(--radius-md);font-size:var(--text-sm);font-weight:600;';
      form.appendChild(msg);
    }
    msg.textContent = '✅ Message sent! We will get back to you within 24 hours.';
    msg.style.display = 'block';
    setTimeout(function () { msg.style.display = 'none'; form.reset(); }, 6000);
  }

  function showFormError(form, text) {
    let msg = form.querySelector('.form-error-msg');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'form-error-msg';
      msg.style.cssText = 'margin-top:0.75rem;padding:0.75rem 1rem;background:var(--color-error-highlight);color:var(--color-error);border-radius:var(--radius-md);font-size:var(--text-sm);font-weight:600;';
      form.appendChild(msg);
    }
    msg.textContent = text;
    msg.style.display = 'block';
    setTimeout(function () { msg.style.display = 'none'; }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForms);
  } else {
    initContactForms();
  }
})();
