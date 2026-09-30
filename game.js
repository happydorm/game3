const game = document.getElementById('game');
const world = document.getElementById('world');
const player = document.getElementById('player');
const count = document.getElementById('count');

const roommateModal = document.getElementById('roommateModal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const continueBtn = document.getElementById('continueBtn');

const finishModal = document.getElementById('finishModal');
const choiceResult = document.getElementById('choiceResult');
const restartBtn = document.getElementById('restartBtn');

const roommateData = [
  { id:'tidy', x:620, title:'깔끔한 룸메이트', text:'깨끗하고 정돈된 공간이 좋아!'},
  { id:'quiet', x:1260, title:'조용한 룸메이트', text:'조용하고 편안한 생활이 좋아!'},
  { id:'active', x:1900, title:'활발한 룸메이트', text:'같이 이야기하고 노는 게 좋아!'}
];

roommateData.forEach(r => {
  const el = document.getElementById(r.id);
  el.style.left = r.x + 'px';
});

let playerX = 90;
let playerY = 0;
let velocityY = 0;
let jumping = false;
let paused = false;
let finished = false;
let met = new Set();
const keys = new Set();

const MOVE_SPEED = 4.2;
const GRAVITY = 0.62;
const JUMP_POWER = 11.5;
const WORLD_WIDTH = 2700;

function viewportWidth() {
  return game.clientWidth;
}

function cameraX() {
  // Keep the player around the center once they pass the first screen.
  const desired = playerX - viewportWidth() * 0.38;
  return Math.max(0, Math.min(desired, WORLD_WIDTH - viewportWidth()));
}

function render() {
  player.style.left = playerX + 'px';
  player.style.bottom = (116 + playerY) + 'px';
  world.style.transform = `translate3d(${-cameraX()}px,0,0)`;
}

function jump() {
  if (paused || jumping || finished) return;
  jumping = true;
  velocityY = JUMP_POWER;
}

function openRoommate(r) {
  paused = true;
  met.add(r.id);
  document.getElementById(r.id).classList.add('met');
  count.textContent = `${met.size} / 3`;
  modalTitle.textContent = r.title;
  modalText.textContent = r.text;
  roommateModal.classList.remove('hidden');
}

continueBtn.addEventListener('click', () => {
  roommateModal.classList.add('hidden');
  paused = false;

  if (met.size === 3) {
    finished = true;
    setTimeout(() => finishModal.classList.remove('hidden'), 220);
  }
});

document.querySelectorAll('.choices button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.choices button').forEach(b => b.classList.remove('selected'));
    button.classList.add('selected');
    choiceResult.textContent = `💙 ${button.dataset.choice}와 함께하고 싶어요!`;
  });
});

restartBtn.addEventListener('click', () => location.reload());

function checkCollisions() {
  for (const r of roommateData) {
    if (met.has(r.id)) continue;

    const distance = Math.abs((playerX + 48) - r.x);
    // Slightly generous collision box so the encounter feels natural.
    if (distance < 82 && Math.abs(playerY) < 35) {
      openRoommate(r);
      return;
    }
  }
}

function update() {
  if (!paused && !finished) {
    if (keys.has('ArrowRight') || keys.has('d')) playerX += MOVE_SPEED;
    if (keys.has('ArrowLeft') || keys.has('a')) playerX -= MOVE_SPEED;

    playerX = Math.max(25, Math.min(WORLD_WIDTH - 130, playerX));

    if (jumping) {
      playerY += velocityY;
      velocityY -= GRAVITY;
      if (playerY <= 0) {
        playerY = 0;
        velocityY = 0;
        jumping = false;
      }
    }

    checkCollisions();
    render();
  }
  requestAnimationFrame(update);
}

window.addEventListener('keydown', e => {
  if (['ArrowLeft','ArrowRight',' ','a','d','A','D'].includes(e.key)) e.preventDefault();
  if (e.key === ' ') jump();
  keys.add(e.key);
});
window.addEventListener('keyup', e => keys.delete(e.key));

function bindHold(id, key) {
  const button = document.getElementById(id);
  const down = e => { e.preventDefault(); keys.add(key); };
  const up = e => { e.preventDefault(); keys.delete(key); };
  button.addEventListener('pointerdown', down);
  ['pointerup','pointercancel','pointerleave'].forEach(ev => button.addEventListener(ev, up));
}
bindHold('leftBtn','ArrowLeft');
bindHold('rightBtn','ArrowRight');
document.getElementById('jumpBtn').addEventListener('pointerdown', e => { e.preventDefault(); jump(); });

render();
update();
