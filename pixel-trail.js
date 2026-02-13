// Pixel Trail Background Effect
(function() {
  // Inject background container
  const bg = document.createElement('div');
  bg.id = 'pixel-trail-bg';
  document.body.appendChild(bg);

  let cols, rows, grid, pixels = [], barriers = [];
  // Set grid and pixel size for mobile/desktop
  let cellSize = window.isMobile ? 22 : 60;
  let pixelSize = window.isMobile ? 22 : 60;
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
    // Add border barriers for mobile
    if (window.isMobile) {
      // Top and bottom rows
      for (let c = 0; c < cols; c++) {
        barriers.push({left: c * cellSize, right: (c+1) * cellSize, top: 0, bottom: cellSize});
        barriers.push({left: c * cellSize, right: (c+1) * cellSize, top: (rows-1) * cellSize, bottom: rows * cellSize});
      }
      // Left and right columns
      for (let r = 0; r < rows; r++) {
        barriers.push({left: 0, right: cellSize, top: r * cellSize, bottom: (r+1) * cellSize});
        barriers.push({left: (cols-1) * cellSize, right: cols * cellSize, top: r * cellSize, bottom: (r+1) * cellSize});
      }
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
    // Robust movement toward food, avoid snake body, minimal zigzag
    if (food) {
      let dx = food.col - head.col;
      let dy = food.row - head.row;
      let preferredDirs = [];
      if (dx > 0) preferredDirs.push({col: 1, row: 0});
      if (dx < 0) preferredDirs.push({col: -1, row: 0});
      if (dy > 0) preferredDirs.push({col: 0, row: 1});
      if (dy < 0) preferredDirs.push({col: 0, row: -1});
      // 5% chance to turn randomly for some spread, but mostly direct
      let found = false;
      if (Math.random() < 0.05) {
        let allDirs = [
          {col: 1, row: 0},
          {col: -1, row: 0},
          {col: 0, row: 1},
          {col: 0, row: -1}
        ];
        // Shuffle directions
        for (let i = allDirs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allDirs[i], allDirs[j]] = [allDirs[j], allDirs[i]];
        }
        for (const d of allDirs) {
          let nc = (head.col + d.col + cols) % cols;
          let nr = (head.row + d.row + rows) % rows;
          if (!isBarrier(nc, nr) && !snake.some(seg => seg.col === nc && seg.row === nr)) {
            dir = d;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        for (const d of preferredDirs) {
          let nc = (head.col + d.col + cols) % cols;
          let nr = (head.row + d.row + rows) % rows;
          if (!isBarrier(nc, nr) && !snake.some(seg => seg.col === nc && seg.row === nr)) {
            dir = d;
            found = true;
            break;
          }
        }
      }
      // If all preferred/random directions are blocked, try all directions in random order
      if (!found) {
        let allDirs = [
          {col: 1, row: 0},
          {col: -1, row: 0},
          {col: 0, row: 1},
          {col: 0, row: -1}
        ];
        // Shuffle directions
        for (let i = allDirs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allDirs[i], allDirs[j]] = [allDirs[j], allDirs[i]];
        }
        for (const d of allDirs) {
          let nc = (head.col + d.col + cols) % cols;
          let nr = (head.row + d.row + rows) % rows;
          if (!isBarrier(nc, nr) && !snake.some(seg => seg.col === nc && seg.row === nr)) {
            dir = d;
            found = true;
            break;
          }
        }
        // If all directions are blocked, stay in place
        if (!found) {
          dir = {col: 0, row: 0};
        }
      }
    }
    // If no food, keep moving in current direction
    // If blocked, turn randomly
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
      // Move forward in current direction, avoid snake body
      let nc = (head.col + dir.col + cols) % cols;
      let nr = (head.row + dir.row + rows) % rows;
      if (!isBarrier(nc, nr) && !snake.some(seg => seg.col === nc && seg.row === nr)) {
        next = {col: nc, row: nr};
      } else {
        // Try to turn if blocked
        const options = randomDirection(dir).filter(d => {
          const nc2 = (head.col + d.col + cols) % cols;
          const nr2 = (head.row + d.row + rows) % rows;
          return !isBarrier(nc2, nr2) && !snake.some(seg => seg.col === nc2 && seg.row === nr2);
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
    // Prevent overlap: if next is already in snake, stay in place
    if (snake.some(seg => seg.col === next.col && seg.row === next.row)) {
      next = head;
    }
    snake.unshift(next);
    if (food && next.col === food.col && next.row === food.row) {
      snakeLen++;
      food = null;
      spawnRandomApple();
    }
    while (snake.length > snakeLen) snake.pop();
    // Animate
    pixels.forEach(px => {
      if (px) {
        px.style.opacity = 0;
        px.style.background = '#63b8a7'; // Snake body color
      }
    });
    // Render snake body first, then head to reduce flicker
    for (let i = snake.length - 1; i > 0; i--) {
      const seg = snake[i];
      const idx = seg.row * cols + seg.col;
      if (pixels[idx]) {
        pixels[idx].style.opacity = 1;
        pixels[idx].style.background = '#63b8a7'; // Snake body color
      }
    }
    // Render head last
    const headIdx = snake[0].row * cols + snake[0].col;
    if (pixels[headIdx]) {
      pixels[headIdx].style.opacity = 1;
      pixels[headIdx].style.background = '#4e9385'; // Snake head color
    }
    // Draw food
    if (food) {
      const idx = food.row * cols + food.col;
      if (pixels[idx]) {
        pixels[idx].style.opacity = 1;
        pixels[idx].style.background = '#e74c3c'; // Always red apple
      }
    }
}

// Always spawn an apple if none exists
function spawnRandomApple() {
  if (food) return;
  // Find all reachable cells from snake head
  const head = snake[0];
  let visited = Array.from({length: rows}, () => Array(cols).fill(false));
  let queue = [head];
  visited[head.row][head.col] = true;
  let reachable = [];
  while (queue.length) {
    const curr = queue.shift();
    // Only consider cells not occupied by snake and not barriers
    if (!isBarrier(curr.col, curr.row) && !snake.some(seg => seg.col === curr.col && seg.row === curr.row)) {
      reachable.push({col: curr.col, row: curr.row});
    }
    // Explore neighbors
    for (const d of [{col:1,row:0},{col:-1,row:0},{col:0,row:1},{col:0,row:-1}]) {
      const nc = (curr.col + d.col + cols) % cols;
      const nr = (curr.row + d.row + rows) % rows;
      if (!visited[nr][nc] && !isBarrier(nc, nr)) {
        visited[nr][nc] = true;
        queue.push({col: nc, row: nr});
      }
    }
  }
  // Pick a random reachable cell for apple
  if (reachable.length > 0) {
    const idx = Math.floor(Math.random() * reachable.length);
    food = reachable[idx];
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
    spawnRandomApple();
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
