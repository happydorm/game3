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
  {
    id:'tidy',
    x:620,
    title:'깔끔한 룸메이트',
    text:'깨끗하고 정돈된 공간에서 함께 지내는 걸 좋아해요!\n\n사용한 물건은 제자리에 두고, 방이나 공용공간도 깔끔하게 유지하는 타입이에요. 서로 조금씩 배려하면서 쾌적한 기숙사 생활을 만들어가고 싶어 해요.\n\n🧹 사용한 물건은 바로 정리해요\n✨ 깨끗하고 정돈된 공간을 좋아해요\n🏠 공용공간도 함께 사용하는 사람을 배려해요'
  },
  {
    id:'quiet',
    x:1260,
    title:'조용한 룸메이트',
    text:'서로의 생활시간과 혼자만의 시간을 존중하는 걸 좋아해요!\n\n각자의 시간을 편안하게 보내는 걸 중요하게 생각하는 타입이에요. 공부하거나 쉬는 시간에는 서로 방해하지 않고, 함께 지낼 때도 편안하고 차분한 분위기를 좋아해요.\n\n📖 혼자만의 시간을 소중하게 생각해요\n🌙 늦은 시간에는 조용히 생활해요\n🎧 서로의 생활 리듬을 존중해요'
  },
  {
    id:'active',
    x:1900,
    title:'활발한 룸메이트',
    text:'같이하면 기숙사 생활도 더 즐거워요!\n\n친구와 이야기하고, 같이 밥을 먹고, 소소한 재미를 함께 나누는 걸 좋아하는 타입이에요. 기숙사에서도 즐겁고 활기찬 추억을 많이 만들고 싶어 해요.\n\n🍚 같이 밥 먹고 이야기하는 걸 좋아해요\n🎮 함께 놀거나 활동하는 걸 좋아해요\n🎉 새로운 사람과 쉽게 어울리는 편이에요'
  }
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
