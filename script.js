const LAUNCH = new Date('2027-03-15T18:00:00');

const WORLDS = {
  'Neon City': ['#ff2bd6', '#2a0a4a', 'Orașul care nu doarme. Sari peste dronele de securitate și traversează autostrăzile de lumină.'],
  'Data Swamp': ['#39ff88', '#06301f', 'O mlaștină de cod corupt, unde platformele dispar și reapar fără avertisment.'],
  'Orbital Dock': ['#ffe14a', '#5a1a0a', 'Docuri spațiale în gravitate zero, cu lupta finală împotriva virusului.']
};

const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const countdownEl = document.getElementById('countdown');
const tabsEl = document.getElementById('tabs');
const worldEl = document.getElementById('world');
const form = document.getElementById('signup');
const msg = document.getElementById('msg');

function setNav(open) {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
}

burger.addEventListener('click', () => setNav(!nav.classList.contains('open')));
nav.addEventListener('click', event => {
  if (event.target.tagName === 'A') setNav(false);
});

function tick() {
  let left = Math.max(0, LAUNCH - Date.now());
  if (!left) {
    countdownEl.innerHTML = '<div><b>ACUM</b><span>disponibil</span></div>';
    return;
  }
  const parts = [
    ['zile', Math.floor(left / 86400000)],
    ['ore', Math.floor(left / 3600000) % 24],
    ['min', Math.floor(left / 60000) % 60],
    ['sec', Math.floor(left / 1000) % 60]
  ];
  countdownEl.innerHTML = parts.map(([label, value]) =>
    `<div><b>${String(value).padStart(2, '0')}</b><span>${label}</span></div>`
  ).join('');
}

tick();
setInterval(tick, 1000);

function showWorld(name) {
  const [main, dark, text] = WORLDS[name];
  worldEl.style.setProperty('--w1', main);
  worldEl.style.setProperty('--w2', dark);
  tabsEl.style.setProperty('--w1', main);
  document.getElementById('worldName').textContent = name;
  document.getElementById('worldText').textContent = text;
  tabsEl.querySelectorAll('.tab').forEach(tab => {
    tab.setAttribute('aria-selected', tab.dataset.name === name);
  });
}

tabsEl.innerHTML = Object.keys(WORLDS).map(name =>
  `<button class="tab" role="tab" data-name="${name}">${name}</button>`
).join('');

tabsEl.addEventListener('click', event => {
  const tab = event.target.closest('.tab');
  if (tab) showWorld(tab.dataset.name);
});

showWorld(Object.keys(WORLDS)[0]);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

form.addEventListener('submit', event => {
  event.preventDefault();
  let valid = true;

  form.querySelectorAll('input, select').forEach(field => {
    const bad = !field.value.trim() || (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(field.value));
    field.classList.toggle('invalid', bad);
    if (bad) valid = false;
  });

  if (!valid) {
    msg.className = 'msg err';
    msg.textContent = 'Introdu un email valid și alege platforma.';
    return;
  }

  msg.className = 'msg ok';
  msg.textContent = 'Ești pe listă! Te anunțăm când se deschid precomenzile.';
  form.reset();
});

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const W = canvas.width;
const H = canvas.height;
const GROUND = 190;
const SPRITE = ['..cccc..', '.cwwwwc.', '.cwkwkc.', '.cwwwwc.', '..cmmc..', '.cmmmmc.', '..m..m..', '.mm..mm.'];
const COLORS = { c: '#19f9ff', w: '#ffffff', k: '#0a0614', m: '#ff2bd6' };

let state = 'idle';
let visible = false;
let player, obstacles, speed, score, spawn, offset, best;

try {
  best = Number(localStorage.getItem('glitchwave-best')) || 0;
} catch (error) {
  best = 0;
}
bestEl.textContent = best;

function reset() {
  player = { x: 60, y: GROUND - 24, vy: 0 };
  obstacles = [];
  speed = 5;
  score = 0;
  spawn = 60;
  offset = 0;
}

function jump() {
  if (state === 'idle' || state === 'over') {
    reset();
    state = 'run';
    return;
  }
  if (player.y >= GROUND - 24) player.vy = -11.5;
}

function update() {
  player.vy += 0.62;
  player.y = Math.min(player.y + player.vy, GROUND - 24);
  if (player.y >= GROUND - 24) player.vy = 0;

  speed = 5 + score / 300;
  offset = (offset + speed) % 60;
  spawn--;
  if (spawn <= 0) {
    const h = 22 + Math.random() * 26;
    obstacles.push({ x: W, w: 22 + Math.random() * 14, h });
    spawn = 55 + Math.random() * 60 - Math.min(score / 20, 25);
  }

  obstacles.forEach(o => {
    o.x -= speed;
  });
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  for (const o of obstacles) {
    const hit = player.x + 20 > o.x && player.x + 4 < o.x + o.w && player.y + 24 > GROUND - o.h;
    if (hit) {
      state = 'over';
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        try {
          localStorage.setItem('glitchwave-best', best);
        } catch (error) {}
      }
    }
  }

  score += 1;
  scoreEl.textContent = Math.floor(score / 6);
}

function drawSprite(x, y, size) {
  SPRITE.forEach((row, j) => {
    [...row].forEach((cell, i) => {
      if (cell !== '.') {
        ctx.fillStyle = COLORS[cell];
        ctx.fillRect(x + i * size, y + j * size, size, size);
      }
    });
  });
}

function draw() {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, '#0a0614');
  sky.addColorStop(1, '#4a0f6e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ffe14a';
  ctx.beginPath();
  ctx.arc(500, 120, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff2bd6';
  ctx.fillRect(448, 128, 104, 5);
  ctx.fillRect(448, 142, 104, 7);

  ctx.fillStyle = '#12062a';
  ctx.fillRect(0, GROUND, W, H - GROUND);
  ctx.strokeStyle = 'rgba(25, 249, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND);
  ctx.lineTo(W, GROUND);
  for (let x = -offset; x < W + 60; x += 60) {
    ctx.moveTo(x, GROUND);
    ctx.lineTo(x - 90 + (x - W / 2) * 0.5, H);
  }
  ctx.stroke();

  if (!player) reset();
  ctx.shadowColor = '#19f9ff';
  ctx.shadowBlur = 12;
  drawSprite(player.x, player.y, 3);

  ctx.shadowColor = '#ff2bd6';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ff2bd6';
  obstacles.forEach(o => ctx.fillRect(o.x, GROUND - o.h, o.w, o.h));
  ctx.shadowBlur = 0;

  if (state !== 'run') {
    ctx.fillStyle = 'rgba(10, 6, 20, 0.7)';
    ctx.fillRect(0, 70, W, 70);
    ctx.fillStyle = '#ffe14a';
    ctx.font = '18px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state === 'over' ? 'GAME OVER' : 'PRESS START', W / 2, 108);
    ctx.fillStyle = '#19f9ff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(state === 'over' ? 'SARI SAU ATINGE CA SĂ REÎNCEPI' : 'SPAȚIU SAU ATINGE CA SĂ ÎNCEPI', W / 2, 130);
  }
}

function loop() {
  if (visible) {
    if (state === 'run') update();
    draw();
  }
  requestAnimationFrame(loop);
}

new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
}, { threshold: 0.3 }).observe(canvas);

canvas.addEventListener('pointerdown', event => {
  event.preventDefault();
  jump();
});

document.addEventListener('keydown', event => {
  if ((event.code === 'Space' || event.code === 'ArrowUp') && visible && !['INPUT', 'SELECT'].includes(event.target.tagName)) {
    event.preventDefault();
    jump();
  }
});

reset();
draw();
loop();