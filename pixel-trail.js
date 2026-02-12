// Pixel Trail Background Effect
(function() {
  // Inject background container
  const bg = document.createElement('div');
  bg.id = 'pixel-trail-bg';
  document.body.appendChild(bg);

  let cols, rows, grid, pixels = [], barriers = [];
  // Reduce grid unit size by 70% for mobile
  let cellSize = 60;
  let pixelSize = 60;
  if (window.isMobile) {
    cellSize = Math.round(60 * 0.3); // 70% reduction
    pixelSize = Math.round(60 * 0.3);
  }
  // Standardize snake color for mobile (pixel-trail.js uses window.isMobile)
  if (window.isMobile) {
    cellSize = 22;
    pixelSize = 22;
  }
  let food = null;

  // Utility: Check if a cell is a barrier
  function isBarrier(col, row) {
    for (const rect of barriers) {
      const x = ((col * cellSize + cellSize / 2) % window.innerWidth);
      const y = ((row * cellSize + cellSize / 2) % window.innerHeight);
      if (
        x >= rect.left && x <= rect.right &&
        y >= rect.top && y <= rect.bottom
      ) {
        return true;
      }
    }
    return false;
  }

  // Get all UI element bounding rects as barriers
  function updateBarriers() {
    const importantSelectors = [
      '.navbar', '.mode-toggle-bar', '.about-card', '.gallery', '.download-btn', '.cv', '.contacts'
    ];
    barriers = [];
    for (const sel of importantSelectors) {
      document.querySelectorAll(sel).forEach(el => {
        barriers.push(el.getBoundingClientRect());
      });
    }
  }

  function createGrid() {
    if (grid) bg.removeChild(grid);
    cols = Math.ceil(window.innerWidth / cellSize);
    rows = Math.ceil(window.innerHeight / cellSize);
    grid = document.createElement('div');
    grid.className = 'pixel-trail-grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    pixels = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = document.createElement('div');
        px.className = 'pixel-trail-pixel';
        px.dataset.col = c;
        px.dataset.row = r;
        // Only set pixel size for mobile, let CSS handle desktop
        if (window.isMobile) {
          px.style.width = pixelSize + 'px';
          px.style.height = pixelSize + 'px';
        }
        grid.appendChild(px);
        pixels.push(px);
      }
    }
    bg.appendChild(grid);
  }

  // Snake state
  let snake = [{col: 2, row: 2}], dir = {col: 1, row: 0}, snakeLen = 8;
  let lastMove = 0;
  let lastTurn = 0;
  let turnInterval = 500 + Math.random() * 2500; // 0.5-3 seconds

  function randomDirection(currentDir) {
    const dirs = [
      {col:1,row:0},{col:-1,row:0},{col:0,row:1},{col:0,row:-1}
    ];
    // Remove reverse direction
    return dirs.filter(d => !(d.col === -currentDir.col && d.row === -currentDir.row));
  }

  function moveSnake(ts) {
    const head = {...snake[0]};
    let next;
    // Food pathfinding
    if (food) {
      const path = findPath(head, food);
      if (path && path.length > 1) {
        next = path[1];
        // Set direction toward food
        dir = {col: next.col - head.col, row: next.row - head.row};
        // Handle wrapping
        if (dir.col > 1) dir.col = -1;
        if (dir.col < -1) dir.col = 1;
        if (dir.row > 1) dir.row = -1;
        if (dir.row < -1) dir.row = 1;
      }
    }
    // Random turn every 0.5-3 seconds
    if (!food && ts - lastTurn > turnInterval) {
      const options = randomDirection(dir).filter(d => {
        const nc = (head.col + d.col + cols) % cols;
        const nr = (head.row + d.row + rows) % rows;
        return !isBarrier(nc, nr);
      });
      if (options.length) {
        dir = options[Math.floor(Math.random() * options.length)];
      }
      lastTurn = ts;
      turnInterval = 500 + Math.random() * 2500;
    }
    if (!next) {
      // Move forward in current direction
      let nc = (head.col + dir.col + cols) % cols;
      let nr = (head.row + dir.row + rows) % rows;
      if (!isBarrier(nc, nr)) {
        next = {col: nc, row: nr};
      } else {
        // Try to turn if blocked
        const options = randomDirection(dir).filter(d => {
          const nc2 = (head.col + d.col + cols) % cols;
          const nr2 = (head.row + d.row + rows) % rows;
          return !isBarrier(nc2, nr2);
        });
        if (options.length) {
          dir = options[Math.floor(Math.random() * options.length)];
          next = {col: (head.col + dir.col + cols) % cols, row: (head.row + dir.row + rows) % rows};
        } else {
          next = head;
        }
      }
    }
    // Wrap around edges
    next.col = (next.col + cols) % cols;
    next.row = (next.row + rows) % rows;
    snake.unshift(next);
    if (food && next.col === food.col && next.row === food.row) {
      snakeLen++;
      food = null;
    }
    while (snake.length > snakeLen) snake.pop();
    // Animate
    pixels.forEach(px => { if (px) { px.style.opacity = 0; px.style.background = '#ffa04f'; } });
    for (const seg of snake) {
      const idx = seg.row * cols + seg.col;
      if (pixels[idx]) pixels[idx].style.opacity = 1;
    }
    // Draw food
    if (food) {
      const idx = food.row * cols + food.col;
      if (pixels[idx]) {
        pixels[idx].style.opacity = 1;
        pixels[idx].style.background = '#ffa04f';
      }
    }
  }

  function animateSnake(ts) {
    if (!lastMove || ts - lastMove > 156) { // 120 * 1.3 = 156 (30% slower)
      moveSnake(ts);
      lastMove = ts;
    }
    requestAnimationFrame(animateSnake);
  }

  function setup() {
    updateBarriers();
    createGrid();
    snake = [{col: 2, row: 2}];

    dir = {col: 1, row: 0};
    snakeLen = 8;
    food = null;
  }

  window.addEventListener('resize', () => {
    updateBarriers();
    createGrid();
  });
  window.addEventListener('scroll', updateBarriers);

  // Place food on click if not on barrier or snake
  bg.addEventListener('click', function(e) {
    const rect = bg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    // Only allow clicks on active points (not snake, not barrier)
    if (
      col >= 0 && col < cols && row >= 0 && row < rows &&
      !isBarrier(col, row) &&
      !snake.some(seg => seg.col === col && seg.row === row)
    ) {
      food = {col, row};
      // Turn the clicked dot red immediately
      const idx = row * cols + col;
      if (pixels[idx]) {
        pixels[idx].style.opacity = 1;
        pixels[idx].style.background = '#e74c3c';
      }
    }
  });

  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'pixel-trail.css';
  document.head.appendChild(link);

  setup();
  requestAnimationFrame(animateSnake);
})();
