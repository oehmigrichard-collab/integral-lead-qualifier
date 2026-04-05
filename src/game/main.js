import * as THREE from 'three';
import { createArena } from './arena.js';
import { Player } from './player.js';
import { EnemyManager } from './enemies.js';
import { ProjectileManager } from './projectiles.js';
import { ParticleSystem } from './particles.js';
import { updateMinimap } from './minimap.js';
import { AudioManager } from './audio.js';

// ─── Game State ───
const state = {
    running: false,
    score: 0,
    wave: 1,
    kills: 0,
    killsForNextWave: 5,
};

// ─── Renderer ───
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);

// ─── Scene ───
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.008);

// ─── Camera ───
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);

// ─── Managers ───
const clock = new THREE.Clock();
const audio = new AudioManager();
const particles = new ParticleSystem(scene);
const projectiles = new ProjectileManager(scene, particles);
const player = new Player(scene, camera, projectiles, particles, audio);
const enemies = new EnemyManager(scene, projectiles, particles, player, audio);

// ─── Build Arena ───
createArena(scene);

// ─── Lighting ───
const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
dirLight.position.set(30, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 150;
dirLight.shadow.camera.left = -60;
dirLight.shadow.camera.right = 60;
dirLight.shadow.camera.top = 60;
dirLight.shadow.camera.bottom = -60;
dirLight.shadow.bias = -0.001;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
fillLight.position.set(-20, 30, -10);
scene.add(fillLight);

// Rim / backlight
const rimLight = new THREE.DirectionalLight(0xff4488, 0.3);
rimLight.position.set(0, 10, -40);
scene.add(rimLight);

// Point lights for arena flair
const arenaColors = [0xff0044, 0x00ccff, 0x44ff00, 0xff8800];
arenaColors.forEach((color, i) => {
    const light = new THREE.PointLight(color, 8, 40);
    const angle = (i / arenaColors.length) * Math.PI * 2;
    light.position.set(Math.cos(angle) * 35, 8, Math.sin(angle) * 35);
    scene.add(light);
});

// ─── HUD Elements ───
const scoreEl = document.getElementById('score');
const healthBar = document.getElementById('health-bar');
const healthText = document.getElementById('health-text');
const ammoEl = document.getElementById('ammo');
const superBar = document.getElementById('super-bar');
const superText = document.getElementById('super-text');
const killfeedEl = document.getElementById('killfeed');
const damageOverlay = document.getElementById('damage-overlay');
const waveBanner = document.getElementById('wave-banner');

function updateHUD() {
    scoreEl.textContent = `SCORE: ${state.score}`;

    const hp = player.health;
    const maxHp = player.maxHealth;
    const hpPercent = (hp / maxHp) * 100;
    healthBar.style.width = `${hpPercent}%`;
    healthText.textContent = `HP ${Math.ceil(hp)} / ${maxHp}`;

    if (hpPercent < 30) {
        healthBar.style.background = 'linear-gradient(90deg, #ff0000, #ff3300)';
    } else if (hpPercent < 60) {
        healthBar.style.background = 'linear-gradient(90deg, #ff4400, #ffaa00)';
    } else {
        healthBar.style.background = 'linear-gradient(90deg, #00cc66, #00ff88)';
    }

    ammoEl.textContent = `AMMO: ${player.ammo} / ${player.maxAmmo}`;
    superBar.style.width = `${(player.superCharge / player.maxSuperCharge) * 100}%`;

    if (player.superCharge >= player.maxSuperCharge) {
        superText.textContent = 'SUPER BEREIT! [Q]';
        superText.style.color = '#ffdd00';
    } else {
        superText.textContent = `SUPER [Q] — ${Math.floor((player.superCharge / player.maxSuperCharge) * 100)}%`;
        superText.style.color = 'rgba(255,200,0,0.6)';
    }
}

function addKillMessage(name) {
    const msg = document.createElement('div');
    msg.className = 'kill-msg';
    msg.innerHTML = `Du hast <strong style="color:#ff4444">${name}</strong> eliminiert!`;
    killfeedEl.appendChild(msg);
    setTimeout(() => msg.remove(), 3500);
}

function showDamage() {
    damageOverlay.style.opacity = '1';
    setTimeout(() => damageOverlay.style.opacity = '0', 200);
}

function showWaveBanner(wave) {
    waveBanner.textContent = `WELLE ${wave}`;
    waveBanner.style.opacity = '1';
    setTimeout(() => waveBanner.style.opacity = '0', 2000);
}

// ─── Game Events ───
player.onDamage = () => showDamage();
player.onDeath = () => {
    state.running = false;
    document.exitPointerLock();
    document.getElementById('final-score').textContent = `Score: ${state.score} | Kills: ${state.kills} | Welle: ${state.wave}`;
    document.getElementById('gameover-screen').style.display = 'flex';
};

enemies.onEnemyKilled = (enemy) => {
    state.score += 100 * state.wave;
    state.kills++;
    addKillMessage(enemy.name);
    player.superCharge = Math.min(player.superCharge + 20, player.maxSuperCharge);

    if (state.kills >= state.killsForNextWave) {
        state.wave++;
        state.killsForNextWave += 5 + state.wave * 2;
        showWaveBanner(state.wave);
        enemies.spawnWave(state.wave);
    }
};

// ─── Game Loop ───
function gameLoop() {
    requestAnimationFrame(gameLoop);

    const delta = Math.min(clock.getDelta(), 0.05);

    if (state.running) {
        player.update(delta, enemies.enemies);
        enemies.update(delta);
        projectiles.update(delta, player, enemies.enemies);
        particles.update(delta);
        updateMinimap(player, enemies.enemies);
    }

    updateHUD();
    renderer.render(scene, camera);
}

// ─── Start Game ───
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('gameover-screen').style.display = 'none';
    renderer.domElement.requestPointerLock();

    state.running = true;
    state.score = 0;
    state.kills = 0;
    state.wave = 1;
    state.killsForNextWave = 5;

    player.reset();
    enemies.reset();
    enemies.spawnWave(1);
    showWaveBanner(1);
    clock.getDelta(); // Reset clock
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement && state.running) {
        // Paused
    }
});

// ─── Resize ───
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Start Loop ───
gameLoop();
