// Grid Snake Background Effect
(function() {
  // Inject background container
  const bg = document.createElement('div');
  bg.id = 'grid-snake-bg';
  document.body.appendChild(bg);

  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'grid-snake.css';
  document.head.appendChild(link);

  // Config
  function getCellSize() {
    return window.innerWidth <= 600 ? 24 : 60;
  }
  const cellSize = getCellSize();
  const snakeLength = 8;
  let cols, rows, grid, blocked = [];
  let snake = [], dir = {col: 1, row: 0}, path = null;
  let lastTurn = 0, turnInterval = 500 + Math.random() * 2500;
  let moveInterval = 240;
  let foodDot = null;
  let movingTo = null;
  let mobileFoodInterval = null;

  // UI avoidance
  function updateBlocked() {
    const cellSize = getCellSize();
    const importantSelectors = [
      '.navbar', '.mode-toggle-bar', '.about-card', '.gallery', '.download-btn', '.cv', '.contacts'
    ];
    blocked = Array.from({length: rows}, () => Array(cols).fill(false));
    for (const sel of importantSelectors) {
      document.querySelectorAll(sel).forEach(el => {
        const rect = el.getBoundingClientRect();
        const left = Math.floor(rect.left / cellSize);
        const right = Math.ceil(rect.right / cellSize);
        const top = Math.floor(rect.top / cellSize);
        const bottom = Math.ceil(rect.bottom / cellSize);
        for (let r = top; r < bottom; r++) {
          for (let c = left; c < right; c++) {
            if (r >= 0 && r < rows && c >= 0 && c < cols) blocked[r][c] = true;
          }
        }
      });
    }
  }

  function createGrid() {
    const cellSize = getCellSize();
    cols = Math.ceil(window.innerWidth / cellSize);
    rows = Math.ceil(window.innerHeight / cellSize);
    updateBlocked();
  }

  function renderSnake() {
    const cellSize = getCellSize();
    if (bg.firstChild) bg.removeChild(bg.firstChild);
    const gridDiv = document.createElement('div');
    gridDiv.className = 'grid-snake-grid';
    gridDiv.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    gridDiv.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    for (const seg of snake) {
      const idx = seg.row * cols + seg.col;
      const segDiv = document.createElement('div');
      segDiv.className = 'grid-snake-segment';
      segDiv.style.width = `${cellSize}px`;
      segDiv.style.height = `${cellSize}px`;
      segDiv.style.gridColumnStart = seg.col + 1;
      segDiv.style.gridRowStart = seg.row + 1;
      gridDiv.appendChild(segDiv);
    }
    if (foodDot) {
      const foodDiv = document.createElement('div');
      foodDiv.className = 'grid-snake-segment';
      foodDiv.style.background = '#e74c3c';
      foodDiv.style.opacity = 1;
      foodDiv.style.width = `${cellSize}px`;
      foodDiv.style.height = `${cellSize}px`;
      foodDiv.style.gridColumnStart = foodDot.col + 1;
      foodDiv.style.gridRowStart = foodDot.row + 1;
      gridDiv.appendChild(foodDiv);
    }
    bg.appendChild(gridDiv);
  }

  function isBlocked(col, row) {
    return blocked[row] && blocked[row][col];
  }

  function isSnake(col, row) {
    return snake.some(seg => seg.col === col && seg.row === row);
  }

  function validDir(d) {
    const head = snake[0];
    const nc = (head.col + d.col + cols) % cols;
    const nr = (head.row + d.row + rows) % rows;
    return !isBlocked(nc, nr) && !isSnake(nc, nr);
  }

  function randomTurn() {
    const dirs = [
      dir,
      {col: dir.row, row: -dir.col}, // left
      {col: -dir.row, row: dir.col}  // right
    ];
    const valid = dirs.filter(validDir);
    if (valid.length) dir = valid[Math.floor(Math.random() * valid.length)];
  }

  function bfsPath(start, goal) {
    const queue = [[start]];
    const visited = Array.from({length: rows}, () => Array(cols).fill(false));
    visited[start.row][start.col] = true;
    while (queue.length) {
      const path = queue.shift();
      const {col, row} = path[path.length-1];
      if (col === goal.col && row === goal.row) return path;
      for (const d of [
        {col:1,row:0},{col:-1,row:0},{col:0,row:1},{col:0,row:-1}
      ]) {
        const nc = (col + d.col + cols) % cols;
        const nr = (row + d.row + rows) % rows;
        if (!visited[nr][nc] && !isBlocked(nc, nr) && !isSnake(nc, nr)) {
          visited[nr][nc] = true;
          queue.push([...path, {col: nc, row: nr}]);
        }
      }
    }
    return null;
  }

  function moveSnake(ts) {
    if (foodDot && (!movingTo || (movingTo.col !== foodDot.col || movingTo.row !== foodDot.row))) {
      movingTo = {col: foodDot.col, row: foodDot.row};
      path = bfsPath(snake[0], movingTo);
    }
    if (movingTo && path && path.length > 1) {
      const next = path[1];
      dir = {col: (next.col - snake[0].col + cols) % cols, row: (next.row - snake[0].row + rows) % rows};
      if (dir.col > 1) dir.col = -1;
      if (dir.col < -1) dir.col = 1;
      if (dir.row > 1) dir.row = -1;
      if (dir.row < -1) dir.row = 1;
      snake.unshift(next);
      if (snake.length > snakeLength) snake.pop();
      path.shift();
      if (foodDot && next.col === foodDot.col && next.row === foodDot.row) {
        foodDot = null;
        movingTo = null;
        path = null;
      }
      if (path && path.length === 1) { movingTo = null; path = null; }
      renderSnake();
      return;
    }
    // Random turn
    if (!movingTo && ts - lastTurn > turnInterval) {
      randomTurn();
      lastTurn = ts;
      turnInterval = 500 + Math.random() * 2500;
    }
    // Move forward
    const head = snake[0];
    let nc = (head.col + dir.col + cols) % cols;
    let nr = (head.row + dir.row + rows) % rows;
    if (!isBlocked(nc, nr) && !isSnake(nc, nr)) {
      snake.unshift({col: nc, row: nr});
      if (snake.length > snakeLength) snake.pop();
    } else {
      randomTurn();
    }
    renderSnake();
  }

  function animate(ts) {
    moveSnake(ts);
    setTimeout(() => requestAnimationFrame(animate), Math.floor(moveInterval * 0.9));
  }

  function setup() {
    createGrid();
    snake = [];
    let startCol = Math.floor(cols/4), startRow = Math.floor(rows/2);
    for (let i = 0; i < snakeLength; i++) {
      snake.push({col: (startCol-i+cols)%cols, row: startRow});
    }
    dir = {col: 1, row: 0};
    path = null;
    movingTo = null;
    renderSnake();
    if (window.innerWidth <= 600) {
      if (mobileFoodInterval) clearInterval(mobileFoodInterval);
      spawnRandomFoodDot();
      mobileFoodInterval = setInterval(spawnRandomFoodDot, 10000);
    } else {
      if (mobileFoodInterval) clearInterval(mobileFoodInterval);
      mobileFoodInterval = null;
    }
  }

  function spawnRandomFoodDot() {
    if (window.innerWidth > 600) return;
    let tries = 0;
    while (tries < 100) {
      const col = Math.floor(Math.random() * cols);
      const row = Math.floor(Math.random() * rows);
      if (!isBlocked(col, row) && !isSnake(col, row)) {
        foodDot = {col, row};
        renderSnake();
        break;
      }
      tries++;
    }
  }

  window.addEventListener('resize', () => {
    createGrid();
    setup();
  });
  window.addEventListener('scroll', updateBlocked);

  // Listen for clicks globally
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 600) return;
    const cellSize = getCellSize();
    const x = e.clientX, y = e.clientY;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (
      col >= 0 && col < cols && row >= 0 && row < rows &&
      !isBlocked(col, row)
    ) {
      movingTo = {col, row};
      path = bfsPath(snake[0], movingTo);
      foodDot = {col, row};
    }
  });

  setup();
  requestAnimationFrame(animate);
})();
