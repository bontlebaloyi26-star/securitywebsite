document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('header nav a');
  const sections = document.querySelectorAll('section[id]');
  const quoteForm = document.querySelector('.quote-box form');
  const statusMessage = document.createElement('div');

  statusMessage.className = 'quote-status';
  statusMessage.style.cssText = 'margin-top: 20px; color: #facc15; font-weight: 700; text-align: center;';

  function setActiveNav() {
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPosition >= top && scrollPosition < bottom) {
        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }

  function validateQuoteForm(form) {
    const service = form.querySelector('select').value.trim();
    const name = form.querySelector('input[type="text"]').value.trim();
    const phone = form.querySelector('input[type="tel"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const message = form.querySelector('textarea').value.trim();

    if (!service || service === 'Select Service' || !name || !phone || !email || !message) {
      return 'Please complete all fields before submitting your request.';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return 'Please enter a valid email address.';
    }

    return '';
  }

  async function submitQuote(form) {
    if (window.location.protocol === 'file:') {
      throw new Error('Please run this page from a PHP-enabled HTTP server, not directly from the file system. Example: php -S localhost:8000');
    }

    const payload = {
      service: form.querySelector('select').value.trim(),
      name: form.querySelector('input[type="text"]').value.trim(),
      phone: form.querySelector('input[type="tel"]').value.trim(),
      email: form.querySelector('input[type="email"]').value.trim(),
      message: form.querySelector('textarea').value.trim(),
    };

    const response = await fetch('submit_quote.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Network error');
    }

    return response.json();
  }

  if (quoteForm) {
    quoteForm.appendChild(statusMessage);

    quoteForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const errorMessage = validateQuoteForm(quoteForm);
      if (errorMessage) {
        statusMessage.textContent = errorMessage;
        statusMessage.style.color = '#f97316';
        return;
      }

      statusMessage.textContent = 'Sending your request...';
      statusMessage.style.color = '#facc15';

      try {
        const result = await submitQuote(quoteForm);
        statusMessage.textContent = result.message || 'Thank you! Your quote request has been received.';
        statusMessage.style.color = '#facc15';
        quoteForm.reset();
      } catch (error) {
        statusMessage.textContent = error.message || 'Sorry, there was a problem sending your request.';
        statusMessage.style.color = '#f97316';
        console.error(error);
      }
    });
  }

  if (navLinks.length && sections.length) {
    setActiveNav();
    window.addEventListener('scroll', setActiveNav);
  }
});
