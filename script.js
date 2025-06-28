let water = 100;
let gameRunning = false;
let waterInterval;
let difficulty = 'easy';

document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    difficulty = e.target.value;
  });
});

function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  gameRunning = true;
  water = 100;
  document.getElementById('water').innerText = water;

  // Simulate water loss
  waterInterval = setInterval(() => {
    if (!gameRunning) return;
    water--;
    document.getElementById('water').innerText = water;

    if (water <= 0) {
      endGame(false);
    }
  }, 200);

  // Remove old wells
  removeWell();
  spawnWell(); // Only spawn one well at a random position
}

function endGame(win) {
  gameRunning = false;
  clearInterval(waterInterval);
  if (win) {
    document.getElementById('win-sound').play();
  }
  document.getElementById(win ? 'win-screen' : 'lose-screen').style.display = 'flex';
}

function resetGame() {
  document.getElementById('win-screen').style.display = 'none';
  document.getElementById('lose-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  water = 100;
  document.getElementById('water').innerText = water;
}

const player = document.getElementById('player');
let playerX = 0;
let isJumping = false;
const moveStep = 20; // pixels per arrow press

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;

  if (e.key === 'ArrowRight') {
    moveDirection = 1; // Move world left (player moves right)
    player.style.transform = 'scaleX(-1)'; // Face right
    checkWellCollision();
  }
  if (e.key === 'ArrowLeft') {
    moveDirection = -1; // Move world right (player moves left)
    player.style.transform = 'scaleX(1)'; // Face left
    checkWellCollision();
  }
  if ((e.key === 'ArrowUp' || e.key === ' ') && !isJumping) {
    isJumping = true;
    player.classList.add('jumping');
    setTimeout(() => {
      player.classList.remove('jumping');
      isJumping = false;
    }, 500);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    moveDirection = 0;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    moveDirection = 0;
  }
});

const background = document.getElementById('background');
let bgPosition = 0;
let moveDirection = 0; // -1 for left, 1 for right, 0 for none
const bgSpeed = 4; // Adjust for desired speed

let worldOffset = 0; // How far we've "walked" in the world
let wellWorldX = 0;  // The well's position in the world
let well = null;     // The well DOM element

function spawnWell() {
  if (!gameRunning) return;
  // Set world width and well distance based on difficulty
  let worldWidth, minX, maxX;
  if (difficulty === 'hard') {
    worldWidth = 4000;
    minX = 1200;
    maxX = worldWidth - 800;
  } else {
    worldWidth = 2000;
    minX = 400;
    maxX = worldWidth - 800;
  }
  wellWorldX = Math.floor(minX + Math.random() * (maxX - minX));
  well = document.createElement('div');
  well.className = 'well';
  well.style.left = (wellWorldX - worldOffset) + 'px';
  well.style.bottom = '80px';
  document.getElementById('game-container').appendChild(well);
}

// Update well's position as the world scrolls
function updateWell() {
  if (well) {
    well.style.left = (wellWorldX - worldOffset) + 'px';
  }
}

// Call this in your animation/game loop or after updating worldOffset
// updateWell();

function removeWell() {
  if (well) {
    well.remove();
    well = null;
  }
}

// Collision: player is always at left: 100px
function checkWellCollision() {
  if (!well) return;
  const playerScreenX = 100; // Player's fixed screen position
  const wellScreenX = parseInt(well.style.left, 10);
  const playerWidth = 48;
  const wellWidth = 40;
  if (
    playerScreenX + playerWidth > wellScreenX &&
    playerScreenX < wellScreenX + wellWidth
  ) {
    removeWell();
    endGame(true); // Win the game!
  }
}

// Update background and wells when moving
function updateBackground() {
  if (moveDirection !== 0) {
    worldOffset += moveDirection * bgSpeed;
    background.style.backgroundPosition = `${-worldOffset}px bottom`;
    updateWell();
    checkWellCollision(); // <-- Check collision every frame!
  }
  requestAnimationFrame(updateBackground);
}
updateBackground();