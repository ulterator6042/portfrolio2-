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

modeToggle.addEventListener('click', () => {
  body.classList.toggle('night');
});

// Download button placeholder
const downloadBtn = document.querySelector('.download-btn');
downloadBtn.addEventListener('click', () => {
  alert('Download portfolio (placeholder)');
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
