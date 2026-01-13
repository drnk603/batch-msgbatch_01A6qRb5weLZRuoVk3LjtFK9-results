(function () {
  'use strict';

  if (window.__appInitialized) {
    return;
  }
  window.__appInitialized = true;

  const state = {
    burgerOpen: false,
    currentForm: null,
    modalOpen: false
  };

  function debounce(fn, delay) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, arguments), delay);
    };
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[]\]/g, '\\\$&');
  }

  function initBurgerMenu() {
    const toggle = document.querySelector('.navbar-toggler, .c-nav__toggle');
    const nav = document.querySelector('.navbar-collapse, .c-nav');
    const navLinks = document.querySelectorAll('.nav-link, .c-nav__link');
    const body = document.body;

    if (!toggle || !nav) return;

    function closeMenu() {
      nav.classList.remove('show', 'is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      state.burgerOpen = false;
    }

    function openMenu() {
      nav.classList.add('show', 'is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      state.burgerOpen = true;
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.burgerOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.burgerOpen) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (state.burgerOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (state.burgerOpen) {
          closeMenu();
        }
      });
    });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 1024 && state.burgerOpen) {
        closeMenu();
      }
    }, 200));
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    const isHomepage = window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname === '';

    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (!isHomepage && href.startsWith('#')) {
        const sectionId = href.substring(1);
        if (!document.getElementById(sectionId)) {
          link.setAttribute('href', '/#' + sectionId);
        }
      }

      link.addEventListener('click', (e) => {
        const targetHref = link.getAttribute('href');
        if (targetHref.startsWith('#') && targetHref.length > 1) {
          const targetId = targetHref.substring(1);
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            e.preventDefault();
            const header = document.querySelector('.l-header, header');
            const offset = header ? header.offsetHeight : 70;
            const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
            history.pushState(null, null, targetHref);
          }
        }
      });
    });
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.nav-link, .c-nav__link');

    if (sections.length === 0 || navLinks.length === 0) return;

    function updateActiveLink() {
      const header = document.querySelector('.l-header, header');
      const offset = header ? header.offsetHeight + 50 : 120;
      let currentSection = '';

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (window.pageYOffset >= sectionTop - offset && window.pageYOffset < sectionTop + sectionHeight - offset) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        const href = link.getAttribute('href');
        if (href && href === '#' + currentSection) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }

    window.addEventListener('scroll', debounce(updateActiveLink, 100));
    updateActiveLink();
  }

  function initActiveMenu() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .c-nav__link');

    navLinks.forEach((link) => {
      const linkPath = link.getAttribute('href');
      link.classList.remove('active');
      link.removeAttribute('aria-current');

      if (linkPath === currentPath ||
        (currentPath === '/' && linkPath === '/index.html') ||
        (currentPath === '/index.html' && linkPath === '/') ||
        (currentPath === '' && linkPath === '/')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initScrollToTop() {
    const btn = document.querySelector('.c-button--scroll-top, [data-scroll-top]');
    if (!btn) return;

    function toggleVisibility() {
      if (window.pageYOffset > 300) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', debounce(toggleVisibility, 100));
    toggleVisibility();
  }

  function initCountUp() {
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    const observerOptions = { threshold: 0.5 };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          const target = parseInt(entry.target.getAttribute('data-count'), 10);
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;

          const counter = setInterval(() => {
            current += step;
            if (current >= target) {
              entry.target.textContent = target;
              clearInterval(counter);
            } else {
              entry.target.textContent = Math.floor(current);
            }
          }, 16);
        }
      });
    }, observerOptions);

    counters.forEach((counter) => observer.observe(counter));
  }

  function initForms() {
    const forms = document.querySelectorAll('.c-form, form[id*="contact"], form[id*="Contact"]');

    function showNotification(message, type) {
      let container = document.getElementById('notify-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'notify-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.maxWidth = '320px';
        document.body.appendChild(container);
      }

      const alert = document.createElement('div');
      alert.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
      alert.setAttribute('role', 'alert');
      alert.innerHTML = message + '<button type="button" class="btn-close" aria-label="Close"></button>';

      const closeBtn = alert.querySelector('.btn-close');
      closeBtn.addEventListener('click', () => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
      });

      container.appendChild(alert);

      setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
      }, 5000);
    }

    function validateField(field) {
      const value = field.value.trim();
      const type = field.type;
      const id = field.id;
      const name = field.name || id;

      field.classList.remove('is-invalid');
      let feedback = field.parentElement.querySelector('.invalid-feedback');
      if (feedback) feedback.remove();

      if (field.hasAttribute('required') && !value) {
        field.classList.add('is-invalid');
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = 'Dit veld is verplicht';
        field.parentElement.appendChild(feedback);
        return false;
      }

      if (type === 'email' && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          field.classList.add('is-invalid');
          feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          feedback.textContent = 'Voer een geldig e-mailadres in';
          field.parentElement.appendChild(feedback);
          return false;
        }
      }

      if (type === 'tel' && value) {
        const phonePattern = /^[\+\-\d\s\(\)]{10,20}$/;
        if (!phonePattern.test(value)) {
          field.classList.add('is-invalid');
          feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          feedback.textContent = 'Voer een geldig telefoonnummer in';
          field.parentElement.appendChild(feedback);
          return false;
        }
      }

      if (name === 'name' || name === 'firstName' || name === 'lastName') {
        const namePattern = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
        if (value && !namePattern.test(value)) {
          field.classList.add('is-invalid');
          feedback = document.createElement('div');
          feedback.className = 'invalid-feedback';
          feedback.textContent = 'Voer een geldige naam in (2-50 tekens)';
          field.parentElement.appendChild(feedback);
          return false;
        }
      }

      if (field.tagName === 'TEXTAREA' && value && value.length < 10) {
        field.classList.add('is-invalid');
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = 'Bericht moet minimaal 10 tekens bevatten';
        field.parentElement.appendChild(feedback);
        return false;
      }

      if (type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        field.classList.add('is-invalid');
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = 'U moet akkoord gaan met de voorwaarden';
        field.parentElement.appendChild(feedback);
        return false;
      }

      field.classList.add('is-valid');
      return true;
    }

    forms.forEach((form) => {
      const fields = form.querySelectorAll('input, textarea, select');
      fields.forEach((field) => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', debounce(() => {
          if (field.classList.contains('is-invalid')) {
            validateField(field);
          }
        }, 300));
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let isValid = true;
        fields.forEach((field) => {
          if (!validateField(field)) {
            isValid = false;
          }
        });

        if (!isValid) {
          showNotification('Vul alle verplichte velden correct in.', 'danger');
          return;
        }

        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';

          setTimeout(() => {
            showNotification('Bedankt! Uw aanvraag is verzonden.', 'success');
            form.reset();
            fields.forEach((field) => {
              field.classList.remove('is-valid', 'is-invalid');
            });
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            setTimeout(() => {
              window.location.href = 'thank_you.html';
            }, 1500);
          }, 1500);
        }
      });
    });
  }

  function initModal() {
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.c-modal');

    modalTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = trigger.getAttribute('data-modal-target');
        const modal = document.getElementById(targetId);
        if (modal) {
          modal.classList.add('is-open');
          document.body.classList.add('u-no-scroll');
          state.modalOpen = true;
        }
      });
    });

    modals.forEach((modal) => {
      const closeBtn = modal.querySelector('.c-modal__close');
      const backdrop = modal.querySelector('.c-modal__backdrop');

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.classList.remove('is-open');
          document.body.classList.remove('u-no-scroll');
          state.modalOpen = false;
        });
      }

      if (backdrop) {
        backdrop.addEventListener('click', () => {
          modal.classList.remove('is-open');
          document.body.classList.remove('u-no-scroll');
          state.modalOpen = false;
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
          modal.classList.remove('is-open');
          document.body.classList.remove('u-no-scroll');
          state.modalOpen = false;
        }
      });
    });
  }

  function initAccordion() {
    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = button.getAttribute('data-bs-target');
        const target = document.querySelector(targetId);
        const parent = button.closest('.accordion');

        if (!target) return;

        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        if (parent) {
          const allCollapses = parent.querySelectorAll('.accordion-collapse');
          const allButtons = parent.querySelectorAll('.accordion-button');

          allCollapses.forEach((collapse) => {
            if (collapse !== target) {
              collapse.classList.remove('show');
            }
          });

          allButtons.forEach((btn) => {
            if (btn !== button) {
              btn.classList.add('collapsed');
              btn.setAttribute('aria-expanded', 'false');
            }
          });
        }

        if (isExpanded) {
          button.classList.add('collapsed');
          button.setAttribute('aria-expanded', 'false');
          target.classList.remove('show');
        } else {
          button.classList.remove('collapsed');
          button.setAttribute('aria-expanded', 'true');
          target.classList.add('show');
        }
      });
    });
  }

  function initLanguageButtons() {
    const langButtons = document.querySelectorAll('.c-button--language');

    langButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        langButtons.forEach((btn) => {
          btn.classList.remove('is-active');
          btn.removeAttribute('aria-current');
        });
        button.classList.add('is-active');
        button.setAttribute('aria-current', 'true');
      });
    });
  }

  function init() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initScrollToTop();
    initCountUp();
    initForms();
    initModal();
    initAccordion();
    initLanguageButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
