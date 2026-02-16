// --- Project Square Grid Expand/Collapse Logic ---
document.addEventListener('DOMContentLoaded', function () {
  const squares = document.querySelectorAll('.project-square-grid .project-square');
  let expandedSquare = null;

  function expandSquare(square) {
    if (expandedSquare) return;
    squares.forEach(sq => {
      if (sq !== square) sq.classList.add('hide');
    });
    square.classList.add('expanded');
    expandedSquare = square;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      square.querySelector('.project-square-close').focus();
    }, 200);
  }

  function collapseSquare() {
    if (!expandedSquare) return;
    expandedSquare.classList.remove('expanded');
    squares.forEach(sq => {
      sq.classList.remove('hide');
    });
    expandedSquare = null;
    document.body.style.overflow = '';
  }

  squares.forEach(square => {
    square.addEventListener('click', function (e) {
      if (expandedSquare) return;
      expandSquare(square);
    });
    square.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !expandedSquare) {
        e.preventDefault();
        expandSquare(square);
      }
    });
    square.querySelector('.project-square-close').addEventListener('click', function (e) {
      e.stopPropagation();
      collapseSquare();
    });
    square.querySelector('.project-square-expand').addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        collapseSquare();
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && expandedSquare) {
      collapseSquare();
    }
  });
});
// --- Project Menu Grid Expand/Collapse Logic ---
document.addEventListener('DOMContentLoaded', function () {
  const cards = document.querySelectorAll('.project-menu-grid .project-card');
  let expandedCard = null;


  const grid = document.querySelector('.project-menu-grid');

  function expandCard(card) {
    if (expandedCard) return;
    // Hide all other cards with animation
    cards.forEach(c => {
      if (c !== card) c.classList.add('hide');
    });
    card.classList.add('expanded');
    grid.classList.add('blur');
    expandedCard = card;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      card.querySelector('.project-card-expand').focus();
    }, 200);
  }

  function collapseCard() {
    if (!expandedCard) return;
    expandedCard.classList.remove('expanded');
    // Show all cards with animation
    cards.forEach(c => {
      c.classList.remove('hide');
    });
    grid.classList.remove('blur');
    expandedCard = null;
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', function (e) {
      // Only expand if not already expanded
      if (expandedCard) return;
      expandCard(card);
    });
    card.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !expandedCard) {
        e.preventDefault();
        expandCard(card);
      }
    });
    card.querySelector('.project-card-close').addEventListener('click', function (e) {
      e.stopPropagation();
      collapseCard();
    });
    card.querySelector('.project-card-expand').addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        collapseCard();
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && expandedCard) {
      collapseCard();
    }
  });
});
// ...existing code...
// Accordion functionality for About Me section (mobile only)
document.addEventListener('DOMContentLoaded', function() {
  if (window.innerWidth <= 800 || /Mobi|Android/i.test(navigator.userAgent)) {
    const accordions = document.querySelectorAll('.about-accordion .accordion-item');
    accordions.forEach((item, idx) => {
      const btn = item.querySelector('.accordion-toggle');
      btn.addEventListener('click', function() {
        const isActive = item.classList.contains('active');
        // Close all items
        accordions.forEach(i => i.classList.remove('active'));
        // Open clicked item if it wasn't already open
        if (!isActive) {
          item.classList.add('active');
          item.scrollIntoView({behavior:'smooth',block:'center'});
        }
      });
    });
    // Always open the bio section (first accordion) when About is shown
    function openBioAccordion() {
      if (accordions[0]) {
        accordions.forEach(i => i.classList.remove('active'));
        accordions[0].classList.add('active');
      }
    }
    // Listen for About nav click
    const aboutBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => btn.dataset.section === 'about');
    if (aboutBtn) {
      aboutBtn.addEventListener('click', openBioAccordion);
    }
    // Also open on load if About is active
    if (document.getElementById('about') && document.getElementById('about').classList.contains('active')) {
      openBioAccordion();
    }
  }
});
const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const modeToggle = document.querySelector('.mode-toggle');
const body = document.body;

let currentPage = 0;

function showPage(index) {
  pages.forEach((page, i) => {
    page.classList.remove('active');
    page.style.left = `${(i - index) * 100}vw`;
  });
  pages[index].classList.add('active');
  navBtns.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
  currentPage = index;

  // Always open the bio accordion when About is shown (mobile only)
  if ((window.innerWidth <= 800 || /Mobi|Android/i.test(navigator.userAgent)) && pages[index].id === 'about') {
    const accordions = document.querySelectorAll('.about-accordion .accordion-item');
    if (accordions[0]) {
      // Open the first accordion directly, without scrollIntoView
      accordions.forEach(i => i.classList.remove('active'));
      accordions[0].classList.add('active');
    }
  }

  // Show/hide snake effect only on home (page 0)
  if (window.isMobile === false) {
    // Desktop: grid-snake
    const snakeBg = document.getElementById('grid-snake-bg');
    if (snakeBg) {
      snakeBg.style.display = (index === 0) ? 'block' : 'none';
    }
  } else {
    // Mobile: pixel-trail
    const pixelTrailBg = document.getElementById('pixel-trail-bg');
    if (pixelTrailBg) {
      pixelTrailBg.style.display = (index === 0) ? 'block' : 'none';
    }
  }
}

navBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    showPage(i);
  });
});

// Initial page and effect visibility
showPage(currentPage);

// Set correct icon on load
function updateModeToggleIcon() {
  // Use CSS variable for accent color
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--nav-active-bg').trim() || '#63b8a7';
  modeToggle.innerHTML = body.classList.contains('night')
    ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 0112.79 3a7.5 7.5 0 100 15A9 9 0 0121 12.79z" fill="${accent}"/></svg>`
    : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="6" fill="${accent}"/><g stroke="${accent}" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></g></svg>`;
}
updateModeToggleIcon();

modeToggle.addEventListener('click', () => {
  body.classList.toggle('night');
  updateModeToggleIcon();
});

// Download button (update this to real download logic if needed)
const downloadBtn = document.querySelector('.download-btn');
downloadBtn.addEventListener('click', () => {
  // TODO: Implement real download logic
});

// Swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
  touchEndX = e.touches[0].clientX;
}

function handleTouchEnd() {
  if (touchEndX === 0) return;
  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) > 50) {
    if (diff < 0 && currentPage < pages.length - 1) {
      showPage(currentPage + 1);
    } else if (diff > 0 && currentPage > 0) {
      showPage(currentPage - 1);
    }
  }
  touchStartX = 0;
  touchEndX = 0;
}

document.querySelector('.container').addEventListener('touchstart', handleTouchStart);
document.querySelector('.container').addEventListener('touchmove', handleTouchMove);
document.querySelector('.container').addEventListener('touchend', handleTouchEnd);
