const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const primaryAction = document.querySelector("#primaryAction");
const overlay = document.querySelector("#stateOverlay");
const stateLabel = document.querySelector("#stateLabel");
const stateTitle = document.querySelector("#stateTitle");
const stateHint = document.querySelector("#stateHint");
const scoreValue = document.querySelector("#scoreValue");
const bestValue = document.querySelector("#bestValue");
const timeValue = document.querySelector("#timeValue");
const pressureValue = document.querySelector("#pressureValue");
const powerValue = document.querySelector("#powerValue");
const languageButtons = document.querySelectorAll("[data-lang]");
const PAUSE_PLACEMENT_CLASSES = ["pause-top-left", "pause-top-right", "pause-bottom-left", "pause-bottom-right"];
const PAUSE_OVERLAY_CLASSES = ["is-paused", ...PAUSE_PLACEMENT_CLASSES];
const POWER_DURATIONS = {
  shield: 4.2,
  slow: 5.2,
};

const TRANSLATIONS = {
  en: {
    documentTitle: "Bullet Drift",
    gameRegion: "Bullet Drift game",
    languageSwitch: "Language",
    canvas: "Dodge the incoming bullets",
    sidePanel: "Game status and controls",
    powerGuide: "Power-up guide",
    kicker: "Survival run",
    title: "Bullet Drift",
    start: "Start run",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    readyLabel: "Ready",
    readyTitle: "Stay inside the drift",
    readyHint: "Move with WASD, arrows, or drag inside the arena",
    pausedLabel: "Paused",
    pausedTitle: "Game is paused",
    pausedHint: "P / Esc / resume",
    impactLabel: "Impact",
    impactTitle: (score) => `Score ${score}`,
    impactHint: "Press Space or restart for another run.",
    scoreLabel: "Score",
    bestLabel: "Best",
    timeLabel: "Time",
    pressureLabel: "Pressure",
    powerLabel: "Power",
    timeValue: (seconds) => `${seconds.toFixed(1)}s`,
    pressureValue: (value) => `${value.toFixed(1)}x`,
    powerReady: "Ready",
    powerAvailable: "Grab",
    powerWaiting: (seconds) => `${seconds.toFixed(0)}s`,
    powerClear: "Cleared",
    powerShield: (seconds) => `Shield ${seconds.toFixed(1)}s`,
    powerSlow: (seconds) => `Slow ${seconds.toFixed(1)}s`,
    powerGuideLabel: "Power-ups",
    powerClearGuide: "Clears hostile bullets",
    powerShieldGuide: "Blocks collision briefly",
    powerSlowGuide: "Slows hostile bullets",
    objectiveLabel: "Objective",
    objectiveText: "Survive the bullet field as long as possible.",
    ruleOne: "Near misses keep the run tense; distance and calm movement matter more than speed.",
    ruleTwo: "Patterns accelerate over time. Restart is instant after impact.",
    keyboardLabel: "Keyboard",
    keyboardValue: "WASD / arrows",
    touchLabel: "Touch",
    touchValue: "Drag in arena",
    runLabel: "Run",
    runValue: "Space / button",
    pauseLabel: "Pause",
    pauseValue: "P / Esc",
  },
  zh: {
    documentTitle: "弹幕漂移",
    gameRegion: "弹幕漂移游戏",
    languageSwitch: "语言",
    canvas: "躲避来袭弹幕",
    sidePanel: "游戏状态和操作",
    powerGuide: "道具说明",
    kicker: "生存挑战",
    title: "弹幕漂移",
    start: "开始",
    pause: "暂停",
    resume: "继续",
    restart: "重新开始",
    readyLabel: "准备",
    readyTitle: "别被弹幕带走",
    readyHint: "用 WASD、方向键，或在场地内拖动来移动",
    pausedLabel: "暂停",
    pausedTitle: "游戏已暂停",
    pausedHint: "P / Esc / 继续",
    impactLabel: "撞击",
    impactTitle: (score) => `得分 ${score}`,
    impactHint: "按空格或点击重新开始，再来一局。",
    scoreLabel: "得分",
    bestLabel: "最高",
    timeLabel: "时间",
    pressureLabel: "压力",
    powerLabel: "道具",
    timeValue: (seconds) => `${seconds.toFixed(1)} 秒`,
    pressureValue: (value) => `${value.toFixed(1)}x`,
    powerReady: "待命",
    powerAvailable: "可拾取",
    powerWaiting: (seconds) => `${seconds.toFixed(0)}s`,
    powerClear: "已清场",
    powerShield: (seconds) => `护盾${seconds.toFixed(1)}s`,
    powerSlow: (seconds) => `减速${seconds.toFixed(1)}s`,
    powerGuideLabel: "道具说明",
    powerClearGuide: "清除场上敌对球",
    powerShieldGuide: "短时间免疫碰撞",
    powerSlowGuide: "大幅减速敌对球",
    objectiveLabel: "目标",
    objectiveText: "在弹幕场中尽可能活得更久。",
    ruleOne: "贴近弹幕会让节奏更紧，保持距离和稳定移动比乱冲更重要。",
    ruleTwo: "弹幕会随时间加速。撞击后可以立刻重开。",
    keyboardLabel: "键盘",
    keyboardValue: "WASD / 方向键",
    touchLabel: "触控",
    touchValue: "场地内拖动",
    runLabel: "开局",
    runValue: "空格 / 按钮",
    pauseLabel: "暂停",
    pauseValue: "P / Esc",
  },
};

const WORLD = { width: 960, height: 540 };
const keys = new Set();
const pointer = { active: false, x: WORLD.width / 2, y: WORLD.height / 2 };

let bestScore = Number(localStorage.getItem("bullet-drift-best") || 0);
let language = localStorage.getItem("bullet-drift-language") || preferredLanguage();
let lastFrame = 0;
let pauseOverlayCleanupTimer = 0;
let game = createGame("ready");

applyLanguage();
requestAnimationFrame(frame);

primaryAction.addEventListener("click", () => {
  if (game.state === "running") {
    pauseGame();
  } else if (game.state === "paused") {
    resumeGame();
  } else {
    startGame();
  }
});

for (const button of languageButtons) {
  button.addEventListener("click", () => {
    language = button.dataset.lang;
    localStorage.setItem("bullet-drift-language", language);
    applyLanguage();
  });
}

window.addEventListener("keydown", (event) => {
  const code = event.code;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "Space", "KeyP", "Escape"].includes(code)) {
    event.preventDefault();
  }

  if (code === "KeyP" || code === "Escape") {
    togglePause();
    return;
  }

  if (code === "Space") {
    if (game.state === "paused") {
      resumeGame();
    } else if (game.state !== "running") {
      startGame();
    }
    return;
  }

  keys.add(code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

canvas.addEventListener("pointerdown", (event) => {
  if (game.state === "paused") return;
  canvas.setPointerCapture(event.pointerId);
  pointer.active = true;
  updatePointer(event);
  if (game.state === "ready" || game.state === "over") startGame();
});

canvas.addEventListener("pointermove", (event) => {
  if (!pointer.active) return;
  updatePointer(event);
});

canvas.addEventListener("pointerup", () => {
  pointer.active = false;
});

canvas.addEventListener("pointercancel", () => {
  pointer.active = false;
});

function createGame(state) {
  return {
    state,
    elapsed: 0,
    score: 0,
    spawnTimer: 0,
    burstTimer: 1.8,
    shake: 0,
    powerSpawnTimer: 6,
    powerMessageTimer: 0,
    player: {
      x: WORLD.width / 2,
      y: WORLD.height / 2,
      radius: 11,
      speed: 295,
      invuln: 0.55,
    },
    bullets: [],
    powerups: [],
    particles: [],
    effects: {
      shield: 0,
      slow: 0,
      lastPower: "",
    },
  };
}

function startGame() {
  game = createGame("running");
  pointer.x = game.player.x;
  pointer.y = game.player.y;
  clearPauseOverlayNow();
  overlay.classList.add("is-hidden");
  syncActionButton();
  updateHud();
}

function pauseGame() {
  if (game.state !== "running") return;
  game.state = "paused";
  pointer.active = false;
  keys.clear();
  cancelPauseOverlayCleanup();
  syncActionButton();
  syncOverlay();
  updatePauseOverlayPlacement();
  overlay.classList.add("is-paused");
  overlay.classList.remove("is-hidden");
}

function resumeGame() {
  if (game.state !== "paused") return;
  game.state = "running";
  overlay.classList.add("is-hidden");
  syncActionButton();
  schedulePauseOverlayCleanup();
}

function togglePause() {
  if (game.state === "running") {
    pauseGame();
  } else if (game.state === "paused") {
    resumeGame();
  }
}

function endGame() {
  game.state = "over";
  game.shake = 10;
  game.powerups = [];
  bestScore = Math.max(bestScore, Math.floor(game.score));
  localStorage.setItem("bullet-drift-best", String(bestScore));
  bestValue.textContent = String(bestScore);
  syncActionButton();
  syncOverlay();
  clearPauseOverlayNow();
  overlay.classList.remove("is-hidden");
  addBurst(game.player.x, game.player.y, 26, "danger");
}

function frame(timestamp) {
  const dt = Math.min((timestamp - lastFrame) / 1000 || 0, 0.032);
  lastFrame = timestamp;
  game.shake = Math.max(0, game.shake - dt * 42);

  if (game.state === "running") {
    updateGame(dt);
  } else if (game.state !== "paused") {
    updateParticles(dt);
  }

  draw();
  updateHud();
  requestAnimationFrame(frame);
}

function updateGame(dt) {
  game.elapsed += dt;
  game.score += dt * (10 + pressure() * 2);
  game.player.invuln = Math.max(0, game.player.invuln - dt);
  game.effects.shield = Math.max(0, game.effects.shield - dt);
  game.effects.slow = Math.max(0, game.effects.slow - dt);
  game.powerMessageTimer = Math.max(0, game.powerMessageTimer - dt);

  movePlayer(dt);
  spawnBullets(dt);
  spawnPowerups(dt);
  updateBullets(dt);
  updateParticles(dt);
  checkCollisions();
  checkPowerupCollisions();
}

function movePlayer(dt) {
  let vx = 0;
  let vy = 0;
  if (keys.has("ArrowLeft") || keys.has("KeyA")) vx -= 1;
  if (keys.has("ArrowRight") || keys.has("KeyD")) vx += 1;
  if (keys.has("ArrowUp") || keys.has("KeyW")) vy -= 1;
  if (keys.has("ArrowDown") || keys.has("KeyS")) vy += 1;

  if (pointer.active) {
    const dx = pointer.x - game.player.x;
    const dy = pointer.y - game.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 3) {
      vx += dx / dist;
      vy += dy / dist;
    }
  }

  const mag = Math.hypot(vx, vy) || 1;
  const speed = game.player.speed * (pointer.active ? 1.08 : 1);
  game.player.x += (vx / mag) * speed * dt;
  game.player.y += (vy / mag) * speed * dt;

  const pad = game.player.radius + 8;
  game.player.x = clamp(game.player.x, pad, WORLD.width - pad);
  game.player.y = clamp(game.player.y, pad, WORLD.height - pad);
}

function spawnBullets(dt) {
  const d = difficulty();
  game.spawnTimer -= dt;

  if (game.spawnTimer <= 0) {
    game.spawnTimer = d.smallInterval;
    spawnBlueSmall(d);
  }

  if (!d.heavyUnlocked) return;

  game.burstTimer -= dt;
  if (game.burstTimer <= 0) {
    spawnPattern(d);
    game.burstTimer = d.patternInterval;
  }
}

function spawnPattern(d) {
  if (d.arcUnlocked && Math.random() < 0.42) {
    spawnRedArc(d);
    return;
  }

  if (d.redUnlocked && Math.random() < 0.58) {
    spawnRedBullet(d);
    return;
  }

  spawnBlueHeavy(d);
}

function spawnBlueSmall(d) {
  const origin = randomEdgePoint();
  const angle = Math.atan2(game.player.y - origin.y, game.player.x - origin.x) + random(-0.34, 0.34);
  const speed = random(72, 104) * d.speedScale;
  game.bullets.push(makeBullet(origin.x, origin.y, angle, speed, random(4.5, 6.4), "blue-small"));
}

function spawnBlueHeavy(d) {
  const origin = randomEdgePoint();
  const angle = Math.atan2(game.player.y - origin.y, game.player.x - origin.x) + random(-0.24, 0.24);
  const speed = random(58, 82) * d.speedScale;
  game.bullets.push(makeBullet(origin.x, origin.y, angle, speed, random(11, 14), "blue-heavy"));
}

function spawnRedBullet(d) {
  const origin = randomEdgePoint();
  const angle = Math.atan2(game.player.y - origin.y, game.player.x - origin.x) + random(-0.2, 0.2);
  const speed = random(98, 132) * d.speedScale;
  game.bullets.push(makeBullet(origin.x, origin.y, angle, speed, random(6.5, 8.5), "red"));
}

function spawnRedArc(d) {
  const origin = randomEdgePoint();
  const base = Math.atan2(game.player.y - origin.y, game.player.x - origin.x);
  const count = Math.min(11, 4 + Math.floor(game.elapsed / 18));
  const spread = 0.65 + Math.min(0.55, game.elapsed / 90);
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = base - spread / 2 + spread * t;
    const speed = (82 + i * 2.5) * d.speedScale;
    game.bullets.push(makeBullet(origin.x, origin.y, angle, speed, 6.4, "red-arc"));
  }
}

function makeBullet(x, y, angle, speed, radius, kind) {
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius,
    kind,
    age: 0,
  };
}

function updateBullets(dt) {
  const slowFactor = game.effects.slow > 0 ? 0.32 : 1;
  for (const bullet of game.bullets) {
    bullet.x += bullet.vx * dt * slowFactor;
    bullet.y += bullet.vy * dt * slowFactor;
    bullet.age += dt;
  }

  game.bullets = game.bullets.filter((bullet) => {
    return bullet.x > -80 && bullet.x < WORLD.width + 80 && bullet.y > -80 && bullet.y < WORLD.height + 80;
  });

  if (game.bullets.length > 280) {
    game.bullets.splice(0, game.bullets.length - 280);
  }
}

function checkCollisions() {
  if (game.player.invuln > 0 || game.effects.shield > 0) return;

  for (const bullet of game.bullets) {
    const dist = Math.hypot(bullet.x - game.player.x, bullet.y - game.player.y);
    if (dist < bullet.radius + game.player.radius) {
      endGame();
      return;
    }

    if (dist < bullet.radius + game.player.radius + 18) {
      game.score += 0.02;
    }
  }
}

function spawnPowerups(dt) {
  if (game.powerups.length > 0) return;

  game.powerSpawnTimer -= dt;
  if (game.powerSpawnTimer > 0) return;

  const kind = choosePowerupKind();
  game.powerups.push({
    kind,
    x: random(90, WORLD.width - 90),
    y: random(80, WORLD.height - 80),
    radius: 13,
    age: 0,
  });
  game.powerSpawnTimer = random(8, 12);
}

function choosePowerupKind() {
  const roll = Math.random();
  if (roll < 0.34) return "clear";
  if (roll < 0.67) return "shield";
  return "slow";
}

function checkPowerupCollisions() {
  for (const powerup of game.powerups) {
    const dist = Math.hypot(powerup.x - game.player.x, powerup.y - game.player.y);
    if (dist <= powerup.radius + game.player.radius) {
      activatePowerup(powerup.kind);
      game.powerups = game.powerups.filter((item) => item !== powerup);
      return;
    }
  }
}

function activatePowerup(kind) {
  game.effects.lastPower = kind;
  game.powerMessageTimer = 1.4;

  if (kind === "clear") {
    const cleared = game.bullets.length;
    game.bullets = [];
    addBurst(game.player.x, game.player.y, Math.min(34, 12 + cleared), "clear");
  } else if (kind === "shield") {
    game.effects.shield = POWER_DURATIONS.shield;
    addBurst(game.player.x, game.player.y, 18, "shield");
  } else if (kind === "slow") {
    game.effects.slow = POWER_DURATIONS.slow;
    addBurst(game.player.x, game.player.y, 18, "slow");
  }
}

function addBurst(x, y, count, tone) {
  for (let i = 0; i < count; i += 1) {
    const angle = random(0, Math.PI * 2);
    const speed = random(80, 260);
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: random(0.25, 0.7),
      maxLife: 0.7,
      tone,
    });
  }
}

function updateParticles(dt) {
  for (const particle of game.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.96;
    particle.vy *= 0.96;
    particle.life -= dt;
  }
  game.particles = game.particles.filter((particle) => particle.life > 0);
}

function draw() {
  fitCanvas();
  ctx.save();
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);

  if (game.shake > 0) {
    ctx.translate(random(-game.shake, game.shake), random(-game.shake, game.shake));
  }

  drawArena();
  drawBullets();
  if (game.state === "running" || game.state === "paused") {
    drawPowerups();
  }
  drawParticles();
  if (game.state === "running" || game.state === "paused") {
    drawPlayer();
    drawEffectCountdowns();
  }
  ctx.restore();
}

function drawArena() {
  const gradient = ctx.createLinearGradient(0, 0, WORLD.width, WORLD.height);
  gradient.addColorStop(0, "#08131d");
  gradient.addColorStop(0.56, "#101623");
  gradient.addColorStop(1, "#1b1018");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.strokeStyle = "rgba(137, 215, 255, 0.09)";
  ctx.lineWidth = 1;
  const grid = 48;
  for (let x = grid; x < WORLD.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD.height);
    ctx.stroke();
  }
  for (let y = grid; y < WORLD.height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(127, 255, 201, 0.26)";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, WORLD.width - 24, WORLD.height - 24);
}

function drawPlayer() {
  const p = game.player;
  const pulse = 1 + Math.sin(performance.now() * 0.012) * 0.1;
  const shielded = game.effects.shield > 0;

  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius * (shielded ? 3.4 : 2.7) * pulse, 0, Math.PI * 2);
  ctx.fillStyle = shielded ? "rgba(255, 218, 105, 0.16)" : p.invuln > 0 ? "rgba(127, 255, 201, 0.12)" : "rgba(127, 255, 201, 0.08)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#7fffc9";
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = shielded ? "#ffd969" : "#d8fff2";
  ctx.stroke();
}

function drawEffectCountdowns() {
  const effects = activeTimedPowers();
  if (effects.length === 0) return;

  const p = game.player;
  const badgeWidth = 48;
  const badgeHeight = 22;
  const gap = 6;
  const totalWidth = effects.length * badgeWidth + (effects.length - 1) * gap;
  const minFirstX = 30 + badgeWidth / 2;
  const maxFirstX = WORLD.width - 30 - totalWidth + badgeWidth / 2;
  const startX = clamp(p.x - totalWidth / 2 + badgeWidth / 2, minFirstX, maxFirstX);
  const y = clamp(p.y - p.radius * 3.6, 28, WORLD.height - 28);

  effects.forEach((effect, index) => {
    const x = startX + index * (badgeWidth + gap);
    const color = powerupColors(effect.kind).fill;

    ctx.beginPath();
    ctx.roundRect(x - badgeWidth / 2, y - badgeHeight / 2, badgeWidth, badgeHeight, 8);
    ctx.fillStyle = "rgba(8, 14, 24, 0.78)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = "800 15px Segoe UI, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(effect.remaining.toFixed(1), x, y + 0.5);
  });
}

function drawBullets() {
  for (const bullet of game.bullets) {
    const red = bullet.kind === "red" || bullet.kind === "red-arc";
    const heavy = bullet.kind === "blue-heavy";
    const glow = red ? "rgba(255, 106, 86, 0.34)" : "rgba(111, 214, 255, 0.28)";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius * (heavy ? 1.75 : 2.15), 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fillStyle = red ? "#ff6a56" : "#6fd6ff";
    ctx.fill();
  }
}

function drawPowerups() {
  for (const powerup of game.powerups) {
    powerup.age += 0.016;
    const colors = powerupColors(powerup.kind);
    const pulse = 1 + Math.sin((performance.now() * 0.006) + powerup.x) * 0.12;

    ctx.beginPath();
    ctx.arc(powerup.x, powerup.y, powerup.radius * 2.3 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = colors.glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(powerup.x, powerup.y, powerup.radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.fill;
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = colors.stroke;
    ctx.stroke();

    ctx.fillStyle = colors.icon;
    ctx.font = "700 14px Segoe UI, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(powerupIcon(powerup.kind), powerup.x, powerup.y + 0.5);
  }
}

function powerupColors(kind) {
  if (kind === "clear") {
    return { fill: "#ffd969", stroke: "#fff0a6", glow: "rgba(255, 217, 105, 0.24)", icon: "#1a1422" };
  }
  if (kind === "shield") {
    return { fill: "#7fffc9", stroke: "#d8fff2", glow: "rgba(127, 255, 201, 0.22)", icon: "#102018" };
  }
  return { fill: "#9aa8ff", stroke: "#dde1ff", glow: "rgba(154, 168, 255, 0.24)", icon: "#11162b" };
}

function powerupIcon(kind) {
  if (kind === "clear") return "C";
  if (kind === "shield") return "S";
  return "L";
}

function drawParticles() {
  for (const particle of game.particles) {
    const alpha = Math.max(0, particle.life / particle.maxLife);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3 + alpha * 3, 0, Math.PI * 2);
    ctx.fillStyle = particleColor(particle.tone, alpha);
    ctx.fill();
  }
}

function particleColor(tone, alpha) {
  if (tone === "danger") return `rgba(255, 106, 86, ${alpha})`;
  if (tone === "clear") return `rgba(255, 217, 105, ${alpha})`;
  if (tone === "shield") return `rgba(127, 255, 201, ${alpha})`;
  if (tone === "slow") return `rgba(154, 168, 255, ${alpha})`;
  return `rgba(127, 255, 201, ${alpha})`;
}

function updateHud() {
  scoreValue.textContent = String(Math.floor(game.score));
  bestValue.textContent = String(bestScore);
  timeValue.textContent = t().timeValue(game.elapsed);
  pressureValue.textContent = t().pressureValue(pressure());
  powerValue.textContent = powerStatusText();
}

function powerStatusText() {
  const copy = t();
  if (game.state === "ready" || game.state === "over") return copy.powerReady;
  if (game.effects.shield > 0) return copy.powerShield(game.effects.shield);
  if (game.effects.slow > 0) return copy.powerSlow(game.effects.slow);
  if (game.powerMessageTimer > 0 && game.effects.lastPower === "clear") return copy.powerClear;
  if (game.powerups.length > 0) return copy.powerAvailable;
  return copy.powerWaiting(game.powerSpawnTimer);
}

function activeTimedPowers() {
  const effects = [];
  if (game.effects.shield > 0) effects.push({ kind: "shield", remaining: game.effects.shield });
  if (game.effects.slow > 0) effects.push({ kind: "slow", remaining: game.effects.slow });
  return effects;
}

function applyLanguage() {
  const copy = t();
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = copy.documentTitle;

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = copy[element.dataset.i18n];
  }

  for (const element of document.querySelectorAll("[data-i18n-aria]")) {
    element.setAttribute("aria-label", copy[element.dataset.i18nAria]);
  }

  for (const button of languageButtons) {
    const isActive = button.dataset.lang === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }

  syncActionButton();
  syncOverlay();
  updateHud();
}

function syncActionButton() {
  if (game.state === "running") {
    primaryAction.textContent = t().pause;
  } else if (game.state === "paused") {
    primaryAction.textContent = t().resume;
  } else if (game.state === "over") {
    primaryAction.textContent = t().restart;
  } else {
    primaryAction.textContent = t().start;
  }
}

function syncOverlay() {
  const copy = t();
  if (game.state === "over") {
    stateLabel.textContent = copy.impactLabel;
    stateTitle.textContent = copy.impactTitle(Math.floor(game.score));
    stateHint.textContent = copy.impactHint;
    return;
  }

  if (game.state === "paused") {
    stateLabel.textContent = copy.pausedLabel;
    stateTitle.textContent = copy.pausedTitle;
    stateHint.textContent = copy.pausedHint;
    updatePauseOverlayPlacement();
    return;
  }

  stateLabel.textContent = copy.readyLabel;
  stateTitle.textContent = copy.readyTitle;
  stateHint.textContent = copy.readyHint;
}

function t() {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}

function preferredLanguage() {
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function updatePauseOverlayPlacement() {
  overlay.classList.remove(...PAUSE_PLACEMENT_CLASSES);
  if (game.state !== "paused") return;

  const vertical = game.player.y < WORLD.height / 2 ? "bottom" : "top";
  const horizontal = game.player.x < WORLD.width / 2 ? "right" : "left";
  overlay.classList.add(`pause-${vertical}-${horizontal}`);
}

function schedulePauseOverlayCleanup() {
  cancelPauseOverlayCleanup();
  pauseOverlayCleanupTimer = window.setTimeout(() => {
    if (game.state === "running") {
      overlay.classList.remove(...PAUSE_OVERLAY_CLASSES);
    }
    pauseOverlayCleanupTimer = 0;
  }, 190);
}

function cancelPauseOverlayCleanup() {
  if (!pauseOverlayCleanupTimer) return;
  window.clearTimeout(pauseOverlayCleanupTimer);
  pauseOverlayCleanupTimer = 0;
}

function clearPauseOverlayNow() {
  cancelPauseOverlayCleanup();
  overlay.classList.remove(...PAUSE_OVERLAY_CLASSES);
}

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * WORLD.width;
  pointer.y = ((event.clientY - rect.top) / rect.height) * WORLD.height;
}

function fitCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  const targetWidth = Math.round(displayWidth * dpr);
  const targetHeight = Math.round(displayHeight * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.setTransform(targetWidth / WORLD.width, 0, 0, targetHeight / WORLD.height, 0, 0);
}

function pressure() {
  return 1 + game.elapsed / 30;
}

function difficulty() {
  const elapsed = game.elapsed;
  const speedScale = 1 + Math.min(elapsed / 70, 1.45);
  return {
    speedScale,
    heavyUnlocked: elapsed >= 10,
    redUnlocked: elapsed >= 24,
    arcUnlocked: elapsed >= 38,
    smallInterval: random(Math.max(0.28, 0.82 - elapsed * 0.012), Math.max(0.36, 0.98 - elapsed * 0.012)),
    patternInterval: random(Math.max(1.05, 3.2 - elapsed * 0.045), Math.max(1.35, 4.2 - elapsed * 0.048)),
  };
}

function randomEdgePoint() {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) return { x: random(0, WORLD.width), y: -20 };
  if (edge === 1) return { x: WORLD.width + 20, y: random(0, WORLD.height) };
  if (edge === 2) return { x: random(0, WORLD.width), y: WORLD.height + 20 };
  return { x: -20, y: random(0, WORLD.height) };
}

function random(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
