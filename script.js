document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('header nav a');
  const sections = document.querySelectorAll('section[id]');
  const quoteForm = document.querySelector('.quote-box form');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('header nav');
  const statusMessage = document.createElement('div');

  statusMessage.className = 'quote-status';

  // Hamburger menu toggle
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when a link is clicked
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

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
    const payload = {
      service: form.querySelector('select').value.trim(),
      name: form.querySelector('input[type="text"]').value.trim(),
      phone: form.querySelector('input[type="tel"]').value.trim(),
      email: form.querySelector('input[type="email"]').value.trim(),
      message: form.querySelector('textarea').value.trim(),
    };

    const response = await fetch('/api/submit_quote', {
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
