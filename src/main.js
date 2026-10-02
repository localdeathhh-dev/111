import './styles.css';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const query = new URLSearchParams(window.location.search);
const subscriptionUrl = (query.get('subscription') || import.meta.env.VITE_SUBSCRIPTION_URL || '').trim();
const accessUrl = (import.meta.env.VITE_ACCESS_URL || '').trim();

// Appearance on scroll
const header = document.querySelector('.site-header');
const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Soft entrance choreography
const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

// Cursor aura
const cursorGlow = document.querySelector('.cursor-glow');
let glowX = innerWidth / 2;
let glowY = innerHeight / 2;
let targetGlowX = glowX;
let targetGlowY = glowY;
window.addEventListener('pointermove', (event) => {
  targetGlowX = event.clientX;
  targetGlowY = event.clientY;
}, { passive: true });

const renderGlow = () => {
  glowX += (targetGlowX - glowX) * 0.13;
  glowY += (targetGlowY - glowY) * 0.13;
  if (cursorGlow) cursorGlow.style.transform = `translate(${glowX - 190}px, ${glowY - 190}px)`;
  requestAnimationFrame(renderGlow);
};
if (!reduceMotion && matchMedia('(hover: hover)').matches) renderGlow();

// Magnetic calls to action
if (!reduceMotion && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.11}px, ${y * 0.15}px)`;
    });
    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });
}

// Gentle 3D card response
if (!reduceMotion && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const isPhone = card.classList.contains('phone-mockup');
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const base = isPhone ? 'rotate(4deg)' : '';
      card.style.transform = `${base} rotateY(${x * 10}deg) rotateX(${-y * 9}deg) translateZ(5px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = isPhone ? 'rotate(4deg)' : '';
    });
  });
}

// Hero depth for the small status chips
const hero = document.querySelector('.hero');
if (hero && !reduceMotion && matchMedia('(hover: hover)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const x = event.clientX / innerWidth - 0.5;
    const y = event.clientY / innerHeight - 0.5;
    hero.querySelectorAll('[data-parallax]').forEach((item) => {
      const strength = Number(item.dataset.parallax || 10);
      item.style.translate = `${x * strength}px ${y * strength}px`;
    });
  });
  hero.addEventListener('pointerleave', () => {
    hero.querySelectorAll('[data-parallax]').forEach((item) => { item.style.translate = ''; });
  });
}

// Interactive connection demo in the hero card
const demoButton = document.querySelector('[data-demo-connect]');
const appCard = document.querySelector('.app-card');
const statusText = document.querySelector('.connection-status');
const statusSubtitle = document.querySelector('.connection-subtitle');
let demoConnected = false;
let demoBusy = false;

demoButton?.addEventListener('click', () => {
  if (demoBusy) return;
  demoBusy = true;
  statusText.textContent = demoConnected ? 'Закрываем портал…' : 'Открываем портал…';
  statusSubtitle.textContent = 'Всего одно мгновение';
  demoButton.style.transform = 'scale(.94)';

  setTimeout(() => {
    demoConnected = !demoConnected;
    appCard?.classList.toggle('is-connected', demoConnected);
    statusText.textContent = demoConnected ? 'Вы в открытом интернете' : 'Готов к приключениям';
    statusSubtitle.textContent = demoConnected ? 'Защищённое соединение активно' : 'Нажмите, чтобы подключиться';
    demoButton.style.transform = '';
    demoBusy = false;
  }, reduceMotion ? 0 : 760);
});

// Three-step product preview
const steps = [...document.querySelectorAll('.step-item')];
const slides = [...document.querySelectorAll('.phone-slide')];
let activeStep = 0;
let stepTimer;

function setStep(index, fromUser = false) {
  activeStep = index;
  steps.forEach((step, stepIndex) => {
    const active = stepIndex === index;
    step.classList.toggle('is-active', active);
    step.setAttribute('aria-pressed', String(active));
  });
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === index);
    slide.classList.toggle('is-before', slideIndex < index);
  });
  if (fromUser) restartStepTimer();
}

function restartStepTimer() {
  window.clearInterval(stepTimer);
  if (!reduceMotion) {
    stepTimer = window.setInterval(() => setStep((activeStep + 1) % steps.length), 5200);
  }
}

steps.forEach((step, index) => step.addEventListener('click', () => setStep(index, true)));
if (steps.length) {
  setStep(0);
  restartStepTimer();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) window.clearInterval(stepTimer);
  else restartStepTimer();
});

// FAQ accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const button = item.querySelector('button');
  button?.addEventListener('click', () => {
    const willOpen = !item.classList.contains('is-open');
    faqItems.forEach((other) => {
      other.classList.remove('is-open');
      const otherButton = other.querySelector('button');
      const icon = other.querySelector('button i');
      otherButton?.setAttribute('aria-expanded', 'false');
      if (icon) icon.textContent = '＋';
    });
    if (willOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      const icon = button.querySelector('i');
      if (icon) icon.textContent = '×';
    }
  });
});

// Mobile navigation
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
function setMenu(open) {
  menuToggle?.classList.toggle('is-open', open);
  mobileMenu?.classList.toggle('is-open', open);
  menuToggle?.setAttribute('aria-expanded', String(open));
  mobileMenu?.setAttribute('aria-hidden', String(!open));
  if (mobileMenu) mobileMenu.inert = !open;
}
menuToggle?.addEventListener('click', () => setMenu(!mobileMenu?.classList.contains('is-open')));
mobileMenu?.querySelectorAll('a, button').forEach((item) => item.addEventListener('click', () => setMenu(false)));

// INCY import flow. The subscription is intentionally supplied through an env var,
// so no private service token is hard-coded into the public repository.
const modal = document.querySelector('.connect-modal');
const modalReady = modal?.querySelector('[data-modal-ready]');
const modalMissing = modal?.querySelector('[data-modal-missing]');
const accessLink = modal?.querySelector('.modal-access-link');
let lastFocusedElement;

function openModal() {
  lastFocusedElement = document.activeElement;
  const isReady = Boolean(subscriptionUrl);
  if (modalReady) {
    modalReady.hidden = !isReady;
    modalReady.inert = !isReady;
  }
  if (modalMissing) {
    modalMissing.hidden = isReady;
    modalMissing.inert = isReady;
  }

  if (!isReady && accessUrl && accessLink) {
    accessLink.hidden = false;
    accessLink.inert = false;
    accessLink.href = accessUrl;
    accessLink.target = '_blank';
    accessLink.rel = 'noreferrer';
  }

  if (modal) modal.inert = false;
  modal?.classList.add('is-open');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  window.setTimeout(() => modal?.querySelector(isReady ? '[data-launch-incy]' : '.modal-close')?.focus(), 50);
}

function closeModal() {
  modal?.classList.remove('is-open');
  modal?.setAttribute('aria-hidden', 'true');
  if (modal) modal.inert = true;
  document.body.classList.remove('is-locked');
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

document.querySelectorAll('[data-connect]').forEach((button) => button.addEventListener('click', openModal));
modal?.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', closeModal));

document.querySelector('[data-launch-incy]')?.addEventListener('click', () => {
  if (!subscriptionUrl) return;
  // INCY docs expect the source URL directly after incy://import/.
  window.location.href = `incy://import/${subscriptionUrl}`;
  showToast('Если INCY не открылся, установите приложение и попробуйте ещё раз.');
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
    setMenu(false);
  }
});

// Toasts for not-yet-published legal pages and graceful fallbacks
const toast = document.querySelector('.toast');
const toastCopy = toast?.querySelector('p');
let toastTimer;
function showToast(message) {
  if (!toast || !toastCopy) return;
  toastCopy.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3600);
}

document.querySelectorAll('[data-toast]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showToast(link.dataset.toast);
  });
});

// Lightweight constellation canvas (purely decorative)
const canvas = document.querySelector('#stardust');
const context = canvas?.getContext('2d');
let stars = [];
let canvasWidth = 0;
let canvasHeight = 0;
let canvasDpr = 1;

function resetCanvas() {
  if (!canvas || !context) return;
  canvasDpr = Math.min(devicePixelRatio || 1, 2);
  canvasWidth = innerWidth;
  canvasHeight = innerHeight;
  canvas.width = canvasWidth * canvasDpr;
  canvas.height = canvasHeight * canvasDpr;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  context.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);

  const count = Math.min(85, Math.max(32, Math.floor(canvasWidth / 17)));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius: Math.random() * 1.2 + 0.25,
    speed: Math.random() * 0.08 + 0.018,
    drift: (Math.random() - 0.5) * 0.035,
    alpha: Math.random() * 0.5 + 0.15,
    phase: Math.random() * Math.PI * 2,
  }));
}

function paintStars(time = 0) {
  if (!canvas || !context) return;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  const t = time * 0.001;

  stars.forEach((star) => {
    star.y -= star.speed;
    star.x += star.drift;
    if (star.y < -5) star.y = canvasHeight + 5;
    if (star.x < -5) star.x = canvasWidth + 5;
    if (star.x > canvasWidth + 5) star.x = -5;

    const pulse = star.alpha * (0.72 + Math.sin(t * 1.3 + star.phase) * 0.28);
    context.beginPath();
    context.fillStyle = `rgba(211, 199, 255, ${pulse})`;
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  });

  if (!reduceMotion) requestAnimationFrame(paintStars);
}

if (canvas && context) {
  resetCanvas();
  paintStars();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resetCanvas, 150);
  }, { passive: true });
}
