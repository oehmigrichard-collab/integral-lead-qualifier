// ===== MAIN GAME =====
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas.getContext('2d');

let gameStarted = false;
let game = null;

// ===== INPUT =====
const keys = {};
const mouse = { x: 0, y: 0, down: false, worldX: 0, worldY: 0 };

window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (game) {
        if (e.key.toLowerCase() === 'f') game.toggleVehicle();
        if (e.key.toLowerCase() === 'e') game.interact();
        if (e.key.toLowerCase() === 'shift') game.player.sprinting = true;
    }
});
window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
    if (e.key.toLowerCase() === 'shift' && game) game.player.sprinting = false;
});
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mousedown', e => { mouse.down = true; });
window.addEventListener('mouseup', e => { mouse.down = false; });
window.addEventListener('contextmenu', e => e.preventDefault());

// ===== CAMERA =====
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.zoom = 1;
    }

    follow(target) {
        this.x = lerp(this.x, target.x - this.w / 2, 0.08);
        this.y = lerp(this.y, target.y - this.h / 2, 0.08);
        this.x = clamp(this.x, 0, CONFIG.WORLD_WIDTH - this.w);
        this.y = clamp(this.y, 0, CONFIG.WORLD_HEIGHT - this.h);
    }

    screenToWorld(sx, sy) {
        return { x: sx + this.x, y: sy + this.y };
    }
}

// ===== GAME CLASS =====
class Game {
    constructor() {
        this.city = new City();
        this.camera = new Camera();
        this.player = new Player(CONFIG.WORLD_WIDTH / 2, CONFIG.WORLD_HEIGHT / 2);
        this.vehicles = [];
        this.npcs = [];
        this.police = [];
        this.bullets = [];
        this.pickups = [];
        this.explosions = [];
        this.missionSystem = new MissionSystem();
        this.wantedLevel = 0;
        this.wantedTimer = 0;
        this.wantedDecayTimer = 0;
        this.messageText = '';
        this.messageTimer = 0;
        this.score = 0;
        this.gameOver = false;
        this.respawnTimer = 0;

        this.spawnVehicles();
        this.spawnNPCs();
        this.spawnPickups();
        this.spawnPolice();

        // Start first mission
        this.missionSystem.autoStartNext();
        if (this.missionSystem.currentMission) {
            this.showMessage('Mission: ' + this.missionSystem.currentMission.title + '\n' + this.missionSystem.currentMission.description);
        }
    }

    spawnVehicles() {
        const types = ['sedan', 'sedan', 'sedan', 'sports', 'truck', 'taxi', 'sedan', 'sports'];
        for (let i = 0; i < CONFIG.PARKED_CAR_COUNT; i++) {
            let x, y, attempts = 0;
            do {
                x = randFloat(100, CONFIG.WORLD_WIDTH - 100);
                y = randFloat(100, CONFIG.WORLD_HEIGHT - 100);
                attempts++;
            } while ((!this.city.isRoad(x, y) || this.city.isWater(x, y)) && attempts < 50);

            if (attempts < 50) {
                const type = types[Math.floor(Math.random() * types.length)];
                this.vehicles.push(new Vehicle(x, y, type));
            }
        }
    }

    spawnNPCs() {
        for (let i = 0; i < CONFIG.NPC_COUNT; i++) {
            let x, y, attempts = 0;
            do {
                x = randFloat(100, CONFIG.WORLD_WIDTH - 100);
                y = randFloat(100, CONFIG.WORLD_HEIGHT - 100);
                attempts++;
            } while ((this.city.isBuilding(x, y, 15) || this.city.isWater(x, y)) && attempts < 50);
            if (attempts < 50) {
                this.npcs.push(new NPC(x, y, this.city));
            }
        }
    }

    spawnPickups() {
        for (let i = 0; i < CONFIG.MONEY_PICKUP_COUNT; i++) {
            let x, y, attempts = 0;
            do {
                x = randFloat(100, CONFIG.WORLD_WIDTH - 100);
                y = randFloat(100, CONFIG.WORLD_HEIGHT - 100);
                attempts++;
            } while ((this.city.isBuilding(x, y, 10) || this.city.isWater(x, y)) && attempts < 50);
            if (attempts < 50) this.pickups.push(new Pickup(x, y, 'money'));
        }
        for (let i = 0; i < CONFIG.HEALTH_PICKUP_COUNT; i++) {
            let x, y, attempts = 0;
            do {
                x = randFloat(100, CONFIG.WORLD_WIDTH - 100);
                y = randFloat(100, CONFIG.WORLD_HEIGHT - 100);
                attempts++;
            } while ((this.city.isBuilding(x, y, 10) || this.city.isWater(x, y)) && attempts < 50);
            if (attempts < 50) this.pickups.push(new Pickup(x, y, 'health'));
        }
    }

    spawnPolice() {
        // Spawn police at edges
        for (let i = 0; i < 6; i++) {
            const edge = randInt(0, 3);
            let x, y;
            if (edge === 0) { x = randFloat(100, CONFIG.WORLD_WIDTH - 100); y = 100; }
            else if (edge === 1) { x = randFloat(100, CONFIG.WORLD_WIDTH - 100); y = CONFIG.WORLD_HEIGHT - 100; }
            else if (edge === 2) { x = 100; y = randFloat(100, CONFIG.WORLD_HEIGHT - 100); }
            else { x = CONFIG.WORLD_WIDTH - 100; y = randFloat(100, CONFIG.WORLD_HEIGHT - 100); }
            this.police.push(new Police(x, y));
        }

        // Spawn police cars
        for (let i = 0; i < 4; i++) {
            let x, y, attempts = 0;
            do {
                x = randFloat(100, CONFIG.WORLD_WIDTH - 100);
                y = randFloat(100, CONFIG.WORLD_HEIGHT - 100);
                attempts++;
            } while ((!this.city.isRoad(x, y) || this.city.isWater(x, y)) && attempts < 50);
            if (attempts < 50) {
                this.vehicles.push(new Vehicle(x, y, 'police'));
            }
        }
    }

    toggleVehicle() {
        if (this.player.inVehicle) {
            // Exit vehicle
            this.player.x = this.player.inVehicle.x + 30;
            this.player.y = this.player.inVehicle.y + 30;
            this.player.inVehicle.driver = null;
            this.player.inVehicle = null;
        } else {
            // Find nearest vehicle
            let nearest = null;
            let nearestDist = 50;
            for (const v of this.vehicles) {
                const d = dist(this.player, v);
                if (d < nearestDist && !v.driver) {
                    nearest = v;
                    nearestDist = d;
                }
            }
            if (nearest) {
                this.player.inVehicle = nearest;
                nearest.driver = this.player;
                // Stealing a car increases wanted level
                if (nearest.type !== 'taxi') {
                    this.addWanted(0.5);
                }
            }
        }
    }

    interact() {
        // Check for mission markers or pickups near player
        const pos = this.player.inVehicle || this.player;
        for (const p of this.pickups) {
            if (p.alive && dist(pos, p) < 30) {
                if (p.type === 'money') {
                    this.player.money += p.value;
                    this.showMoneyPopup('+$' + p.value);
                } else {
                    this.player.heal(p.value);
                }
                p.alive = false;
            }
        }
    }

    addWanted(amount) {
        this.wantedLevel = Math.min(5, this.wantedLevel + amount);
        this.wantedDecayTimer = CONFIG.WANTED_DECAY_TIME;
    }

    showMessage(text) {
        this.messageText = text;
        this.messageTimer = 180;
        const el = document.getElementById('mission-text');
        el.textContent = text;
        el.style.opacity = 1;
    }

    showMoneyPopup(text) {
        const el = document.getElementById('money-popup');
        el.textContent = text;
        el.style.opacity = 1;
        el.style.top = '45%';
        el.style.left = '52%';
        setTimeout(() => {
            el.style.opacity = 0;
            el.style.top = '35%';
        }, 800);
    }

    shoot() {
        const now = Date.now();
        if (now - this.player.lastShot < CONFIG.SHOOT_COOLDOWN) return;
        this.player.lastShot = now;
        this.player.shooting = true;
        setTimeout(() => { this.player.shooting = false; }, 200);

        const pos = this.player.inVehicle || this.player;
        const worldMouse = this.camera.screenToWorld(mouse.x, mouse.y);
        const a = angle(pos, worldMouse);

        this.bullets.push(new Bullet(pos.x, pos.y, a));
        this.addWanted(0.3);
    }

    update() {
        if (this.gameOver) {
            this.respawnTimer--;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return;
        }

        // Update mouse world position
        const worldMouse = this.camera.screenToWorld(mouse.x, mouse.y);
        mouse.worldX = worldMouse.x;
        mouse.worldY = worldMouse.y;

        // Shooting
        if (mouse.down) {
            this.shoot();
        }

        // Player
        if (this.player.inVehicle) {
            this.player.inVehicle.update(keys, this.city, keys[' ']);
            this.player.x = this.player.inVehicle.x;
            this.player.y = this.player.inVehicle.y;

            // Car hitting NPCs
            for (const npc of this.npcs) {
                if (npc.alive && dist(this.player.inVehicle, npc) < 25 && Math.abs(this.player.inVehicle.speed) > 2) {
                    npc.takeDamage(100);
                    this.addWanted(1);
                    this.player.inVehicle.speed *= 0.7;
                    this.explosions.push(new Explosion(npc.x, npc.y));
                }
            }

            // Car hitting police
            for (const cop of this.police) {
                if (cop.alive && dist(this.player.inVehicle, cop) < 25 && Math.abs(this.player.inVehicle.speed) > 2) {
                    cop.takeDamage(50);
                    this.addWanted(2);
                    this.player.inVehicle.speed *= 0.5;
                }
            }
        } else {
            this.player.update(keys, this.city);

            // Auto-pickup
            const pos = this.player;
            for (const p of this.pickups) {
                if (p.alive && dist(pos, p) < 25) {
                    if (p.type === 'money') {
                        this.player.money += p.value;
                        this.showMoneyPopup('+$' + p.value);
                    } else {
                        this.player.heal(p.value);
                    }
                    p.alive = false;
                }
            }
        }

        // NPCs
        for (const npc of this.npcs) {
            npc.update(this.city, this.player);
        }

        // Police
        for (const cop of this.police) {
            const bulletInfo = cop.update(this.player, Math.floor(this.wantedLevel), this.city);
            if (bulletInfo) {
                this.bullets.push(new Bullet(bulletInfo.x, bulletInfo.y, bulletInfo.angle, true));
            }
        }

        // Bullets
        for (const b of this.bullets) {
            b.update(this.city);

            if (!b.alive) continue;

            if (b.isPolice) {
                // Police bullets hit player
                const pos = this.player.inVehicle || this.player;
                if (dist(b, pos) < 15) {
                    this.player.takeDamage(CONFIG.BULLET_DAMAGE);
                    b.alive = false;
                    this.explosions.push(new Explosion(b.x, b.y));
                }
            } else {
                // Player bullets hit NPCs
                for (const npc of this.npcs) {
                    if (npc.alive && dist(b, npc) < CONFIG.NPC_SIZE + 3) {
                        if (npc.takeDamage(CONFIG.BULLET_DAMAGE)) {
                            this.player.money += 10;
                        }
                        b.alive = false;
                        this.explosions.push(new Explosion(b.x, b.y));
                        this.addWanted(0.5);
                        break;
                    }
                }
                // Player bullets hit police
                for (const cop of this.police) {
                    if (cop.alive && dist(b, cop) < 14) {
                        if (cop.takeDamage(CONFIG.BULLET_DAMAGE)) {
                            this.addWanted(2);
                        }
                        b.alive = false;
                        this.explosions.push(new Explosion(b.x, b.y));
                        break;
                    }
                }
            }
        }

        // Clean up
        this.bullets = this.bullets.filter(b => b.alive);
        this.explosions = this.explosions.filter(e => e.alive);

        // Explosions
        for (const e of this.explosions) e.update();

        // Pickups
        for (const p of this.pickups) p.update();

        // Respawn pickups
        if (Math.random() < 0.005) {
            let x, y, attempts = 0;
            do {
                x = randFloat(100, CONFIG.WORLD_WIDTH - 100);
                y = randFloat(100, CONFIG.WORLD_HEIGHT - 100);
                attempts++;
            } while ((this.city.isBuilding(x, y, 10) || this.city.isWater(x, y)) && attempts < 30);
            if (attempts < 30) {
                this.pickups.push(new Pickup(x, y, Math.random() < 0.7 ? 'money' : 'health'));
            }
        }

        // Wanted level decay
        if (this.wantedLevel > 0) {
            this.wantedTimer++;
            this.wantedDecayTimer -= 16;
            if (this.wantedDecayTimer <= 0) {
                this.wantedLevel = Math.max(0, this.wantedLevel - 0.01);
                if (this.wantedLevel < 0.1) this.wantedLevel = 0;
            }
        } else {
            this.wantedTimer = 0;
        }

        // Spawn more police when wanted
        if (Math.floor(this.wantedLevel) >= 2 && Math.random() < 0.01) {
            const pos = this.player.inVehicle || this.player;
            const a = Math.random() * Math.PI * 2;
            const d = 500;
            const px = pos.x + Math.cos(a) * d;
            const py = pos.y + Math.sin(a) * d;
            if (px > 10 && px < CONFIG.WORLD_WIDTH - 10 && py > 10 && py < CONFIG.WORLD_HEIGHT - 10) {
                this.police.push(new Police(px, py));
            }
        }

        // Message timer
        if (this.messageTimer > 0) {
            this.messageTimer--;
            if (this.messageTimer <= 0) {
                document.getElementById('mission-text').style.opacity = 0;
            }
        }

        // Missions
        const completed = this.missionSystem.checkCompletion(this);
        if (completed) {
            this.showMessage('Mission abgeschlossen: ' + completed.title + '\n+$' + completed.reward);
            setTimeout(() => {
                const next = this.missionSystem.autoStartNext();
                if (next) {
                    this.showMessage('Neue Mission: ' + next.title + '\n' + next.description);
                } else {
                    this.showMessage('Alle Missionen abgeschlossen! Freies Spiel!');
                }
            }, 3000);
        }

        // Check death
        if (this.player.health <= 0) {
            this.gameOver = true;
            this.respawnTimer = 180;
            this.showMessage('WASTED!\nRespawn in 3 Sekunden...');
            if (this.player.inVehicle) {
                this.player.inVehicle.driver = null;
                this.player.inVehicle = null;
            }
        }

        // Camera
        const target = this.player.inVehicle || this.player;
        this.camera.follow(target);
    }

    respawn() {
        this.gameOver = false;
        this.player.health = CONFIG.PLAYER_MAX_HEALTH;
        this.player.x = CONFIG.WORLD_WIDTH / 2;
        this.player.y = CONFIG.WORLD_HEIGHT / 2;
        this.player.money = Math.max(0, this.player.money - 500);
        this.wantedLevel = 0;
        this.wantedTimer = 0;
        this.showMessage('Krankenhaus - $500 Behandlungskosten');
    }

    draw() {
        // Resize canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.camera.w = canvas.width;
        this.camera.h = canvas.height;

        ctx.save();
        ctx.translate(-this.camera.x, -this.camera.y);

        // City
        this.city.draw(ctx, this.camera);

        // Pickups
        for (const p of this.pickups) {
            if (p.alive) p.draw(ctx);
        }

        // Vehicles
        for (const v of this.vehicles) v.draw(ctx);

        // NPCs
        for (const npc of this.npcs) npc.draw(ctx);

        // Police
        for (const cop of this.police) cop.draw(ctx);

        // Bullets
        for (const b of this.bullets) b.draw(ctx);

        // Explosions
        for (const e of this.explosions) e.draw(ctx);

        // Player
        this.player.draw(ctx);

        // Crosshair in world space
        if (!this.player.inVehicle) {
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(mouse.worldX, mouse.worldY, 12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mouse.worldX - 16, mouse.worldY);
            ctx.lineTo(mouse.worldX + 16, mouse.worldY);
            ctx.moveTo(mouse.worldX, mouse.worldY - 16);
            ctx.lineTo(mouse.worldX, mouse.worldY + 16);
            ctx.stroke();
        }

        ctx.restore();

        // UI
        this.drawUI();
        this.drawMinimap();
    }

    drawUI() {
        // Health
        const healthEl = document.getElementById('health-bar');
        const healthPct = this.player.health / CONFIG.PLAYER_MAX_HEALTH;
        const healthColor = healthPct > 0.5 ? '#00ff00' : healthPct > 0.25 ? '#ffcc00' : '#ff0000';
        healthEl.innerHTML = `<span style="color:${healthColor}">❤ ${Math.ceil(this.player.health)}</span>`;

        // Money
        document.getElementById('money').innerHTML = `<span style="color:#00cc00">$ ${this.player.money.toLocaleString()}</span>`;

        // Speed
        if (this.player.inVehicle) {
            const kmh = Math.abs(Math.round(this.player.inVehicle.speed * 20));
            document.getElementById('speed').innerHTML = `<span style="color:#aaa">${kmh} km/h</span>`;
        } else {
            document.getElementById('speed').innerHTML = '';
        }

        // Wanted stars
        const stars = Math.floor(this.wantedLevel);
        let starStr = '';
        for (let i = 0; i < 5; i++) {
            starStr += i < stars ? '★' : '☆';
        }
        const wantedEl = document.getElementById('wanted');
        wantedEl.style.color = stars > 0 ? '#ff0000' : '#555';
        wantedEl.textContent = starStr;

        // Mission info
        if (this.missionSystem.currentMission) {
            const m = this.missionSystem.currentMission;
            document.getElementById('speed').innerHTML += `<br><span style="color:#ffcc00;font-size:12px">📋 ${m.title}: ${m.description}</span>`;
        }
    }

    drawMinimap() {
        const mw = 160, mh = 160;
        const scale = mw / CONFIG.WORLD_WIDTH;
        minimapCtx.fillStyle = 'rgba(0,0,0,0.7)';
        minimapCtx.fillRect(0, 0, mw, mh);

        // Roads
        minimapCtx.fillStyle = '#444';
        for (const r of this.city.roads) {
            minimapCtx.fillRect(r.x * scale, r.y * scale, Math.max(1, r.w * scale), Math.max(1, r.h * scale));
        }

        // Water
        minimapCtx.fillStyle = '#1a4a7a';
        for (const w of this.city.waterAreas) {
            minimapCtx.fillRect(w.x * scale, w.y * scale, w.w * scale, w.h * scale);
        }

        // Buildings
        minimapCtx.fillStyle = '#666';
        for (const b of this.city.buildings) {
            minimapCtx.fillRect(b.x * scale, b.y * scale, Math.max(1, b.w * scale), Math.max(1, b.h * scale));
        }

        // Vehicles
        minimapCtx.fillStyle = '#aaa';
        for (const v of this.vehicles) {
            minimapCtx.fillRect(v.x * scale - 1, v.y * scale - 1, 2, 2);
        }

        // Police
        minimapCtx.fillStyle = '#0000ff';
        for (const p of this.police) {
            if (p.alive) minimapCtx.fillRect(p.x * scale - 1, p.y * scale - 1, 3, 3);
        }

        // Player
        const pos = this.player.inVehicle || this.player;
        minimapCtx.fillStyle = '#00ffff';
        minimapCtx.beginPath();
        minimapCtx.arc(pos.x * scale, pos.y * scale, 3, 0, Math.PI * 2);
        minimapCtx.fill();

        // Camera view rectangle
        minimapCtx.strokeStyle = 'rgba(255,255,255,0.3)';
        minimapCtx.lineWidth = 1;
        minimapCtx.strokeRect(this.camera.x * scale, this.camera.y * scale, this.camera.w * scale, this.camera.h * scale);
    }
}

// ===== GAME LOOP =====
function gameLoop() {
    if (game) {
        game.update();
        game.draw();
    }
    requestAnimationFrame(gameLoop);
}

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    game = new Game();
    canvas.style.cursor = 'crosshair';
}

// Start loop
gameLoop();
