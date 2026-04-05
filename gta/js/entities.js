// ===== PLAYER =====
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.health = CONFIG.PLAYER_MAX_HEALTH;
        this.money = 0;
        this.inVehicle = null;
        this.shooting = false;
        this.lastShot = 0;
        this.sprinting = false;
    }

    update(keys, city) {
        if (this.inVehicle) return;

        const speed = this.sprinting ? CONFIG.PLAYER_SPRINT_SPEED : CONFIG.PLAYER_SPEED;
        let mx = 0, my = 0;

        if (keys['w'] || keys['arrowup']) my = -1;
        if (keys['s'] || keys['arrowdown']) my = 1;
        if (keys['a'] || keys['arrowleft']) mx = -1;
        if (keys['d'] || keys['arrowright']) mx = 1;

        if (mx !== 0 || my !== 0) {
            const len = Math.hypot(mx, my);
            mx /= len; my /= len;
            this.angle = Math.atan2(my, mx);
        }

        const newX = this.x + mx * speed;
        const newY = this.y + my * speed;

        if (!city.isBuilding(newX, newY, CONFIG.PLAYER_SIZE) &&
            !city.isWater(newX, newY) &&
            newX > 5 && newX < CONFIG.WORLD_WIDTH - 5 &&
            newY > 5 && newY < CONFIG.WORLD_HEIGHT - 5) {
            this.x = newX;
            this.y = newY;
        }
    }

    draw(ctx) {
        if (this.inVehicle) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Body
        ctx.fillStyle = CONFIG.PLAYER_COLOR;
        ctx.beginPath();
        ctx.arc(0, 0, CONFIG.PLAYER_SIZE, 0, Math.PI * 2);
        ctx.fill();

        // Direction indicator
        ctx.fillStyle = '#fff';
        ctx.fillRect(6, -2, 10, 4);

        ctx.restore();

        // Health bar above player
        const barW = 24;
        const healthPct = this.health / CONFIG.PLAYER_MAX_HEALTH;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barW / 2, this.y - 22, barW, 4);
        ctx.fillStyle = healthPct > 0.5 ? '#0f0' : healthPct > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(this.x - barW / 2, this.y - 22, barW * healthPct, 4);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
        }
    }

    heal(amount) {
        this.health = Math.min(CONFIG.PLAYER_MAX_HEALTH, this.health + amount);
    }
}

// ===== VEHICLE =====
class Vehicle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0;
        this.type = type || 'sedan';
        this.driver = null;
        this.health = 100;

        const types = {
            sedan: { w: 40, h: 20, color: this.randomCarColor(), maxSpeed: CONFIG.CAR_MAX_SPEED, accel: CONFIG.CAR_ACCEL },
            sports: { w: 42, h: 18, color: '#cc0000', maxSpeed: CONFIG.SPORTS_MAX_SPEED, accel: 0.12 },
            truck: { w: 55, h: 24, color: '#888888', maxSpeed: CONFIG.TRUCK_MAX_SPEED, accel: 0.05 },
            police: { w: 42, h: 20, color: '#000000', maxSpeed: CONFIG.POLICE_CAR_SPEED, accel: 0.1 },
            taxi: { w: 40, h: 20, color: '#cccc00', maxSpeed: CONFIG.CAR_MAX_SPEED, accel: CONFIG.CAR_ACCEL },
        };

        const t = types[this.type] || types.sedan;
        this.w = t.w;
        this.h = t.h;
        this.color = t.color;
        this.maxSpeed = t.maxSpeed;
        this.accel = t.accel;
        this.sirenPhase = 0;
    }

    randomCarColor() {
        const colors = ['#cc3333', '#3333cc', '#33cc33', '#cccc33', '#cc33cc', '#33cccc', '#ffffff', '#222222', '#cc6633', '#6633cc'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(keys, city, braking) {
        if (!this.driver) return;

        // Acceleration
        if (keys['w'] || keys['arrowup']) {
            this.speed = Math.min(this.maxSpeed, this.speed + this.accel);
        }
        if (keys['s'] || keys['arrowdown']) {
            this.speed = Math.max(-this.maxSpeed * 0.4, this.speed - this.accel);
        }

        // Braking
        if (braking) {
            if (this.speed > 0) this.speed = Math.max(0, this.speed - CONFIG.CAR_BRAKE);
            else if (this.speed < 0) this.speed = Math.min(0, this.speed + CONFIG.CAR_BRAKE);
        }

        // Steering
        if (Math.abs(this.speed) > 0.2) {
            const turnFactor = Math.min(1, Math.abs(this.speed) / 3);
            if (keys['a'] || keys['arrowleft']) this.angle -= CONFIG.CAR_TURN_SPEED * turnFactor * Math.sign(this.speed);
            if (keys['d'] || keys['arrowright']) this.angle += CONFIG.CAR_TURN_SPEED * turnFactor * Math.sign(this.speed);
        }

        // Friction
        if (!keys['w'] && !keys['arrowup'] && !keys['s'] && !keys['arrowdown']) {
            this.speed *= (1 - CONFIG.CAR_FRICTION);
            if (Math.abs(this.speed) < 0.05) this.speed = 0;
        }

        // Move
        const newX = this.x + Math.cos(this.angle) * this.speed;
        const newY = this.y + Math.sin(this.angle) * this.speed;

        // Collision with buildings
        if (!city.isBuilding(newX, newY, this.w / 2) &&
            !city.isWater(newX, newY) &&
            newX > 10 && newX < CONFIG.WORLD_WIDTH - 10 &&
            newY > 10 && newY < CONFIG.WORLD_HEIGHT - 10) {
            this.x = newX;
            this.y = newY;
        } else {
            this.speed *= -0.3;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(-this.w / 2 + 2, -this.h / 2 + 2, this.w, this.h);

        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // Windshield
        ctx.fillStyle = 'rgba(150, 200, 255, 0.5)';
        ctx.fillRect(this.w / 2 - 12, -this.h / 2 + 3, 8, this.h - 6);

        // Rear window
        ctx.fillRect(-this.w / 2 + 4, -this.h / 2 + 3, 6, this.h - 6);

        // Headlights
        ctx.fillStyle = '#ffffaa';
        ctx.fillRect(this.w / 2 - 2, -this.h / 2 + 2, 3, 4);
        ctx.fillRect(this.w / 2 - 2, this.h / 2 - 6, 3, 4);

        // Taillights
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(-this.w / 2 - 1, -this.h / 2 + 2, 3, 4);
        ctx.fillRect(-this.w / 2 - 1, this.h / 2 - 6, 3, 4);

        // Police siren
        if (this.type === 'police') {
            this.sirenPhase += 0.1;
            const on = Math.sin(this.sirenPhase) > 0;
            ctx.fillStyle = on ? '#ff0000' : '#0000ff';
            ctx.fillRect(-5, -this.h / 2, 4, 4);
            ctx.fillStyle = on ? '#0000ff' : '#ff0000';
            ctx.fillRect(1, -this.h / 2, 4, 4);
        }

        // Taxi sign
        if (this.type === 'taxi') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(-4, -this.h / 2 - 4, 8, 4);
            ctx.fillStyle = '#000';
            ctx.font = '4px monospace';
            ctx.fillText('TAXI', -4, -this.h / 2 - 1);
        }

        ctx.restore();
    }
}

// ===== NPC =====
class NPC {
    constructor(x, y, city) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = CONFIG.NPC_SPEED * randFloat(0.6, 1.2);
        this.health = 50;
        this.alive = true;
        this.color = `hsl(${randInt(0, 360)}, ${randInt(30, 70)}%, ${randInt(40, 70)}%)`;
        this.targetX = x;
        this.targetY = y;
        this.waitTimer = 0;
        this.fleeing = false;
        this.pickNewTarget(city);
    }

    pickNewTarget(city) {
        for (let i = 0; i < 20; i++) {
            const tx = this.x + randFloat(-300, 300);
            const ty = this.y + randFloat(-300, 300);
            if (tx > 20 && tx < CONFIG.WORLD_WIDTH - 20 &&
                ty > 20 && ty < CONFIG.WORLD_HEIGHT - 20 &&
                !city.isBuilding(tx, ty, 10) && !city.isWater(tx, ty)) {
                this.targetX = tx;
                this.targetY = ty;
                return;
            }
        }
    }

    update(city, player) {
        if (!this.alive) return;

        // Flee from nearby gunfire/player with wanted level
        const distToPlayer = dist(this, player);
        if (player.shooting && distToPlayer < 200) {
            this.fleeing = true;
            const a = angle(player, this);
            this.targetX = this.x + Math.cos(a) * 400;
            this.targetY = this.y + Math.sin(a) * 400;
        }

        if (this.waitTimer > 0) {
            this.waitTimer--;
            return;
        }

        const d = dist(this, { x: this.targetX, y: this.targetY });
        if (d < 10) {
            this.fleeing = false;
            this.waitTimer = randInt(30, 180);
            this.pickNewTarget(city);
            return;
        }

        this.angle = angle(this, { x: this.targetX, y: this.targetY });
        const spd = this.fleeing ? this.speed * 2 : this.speed;
        const newX = this.x + Math.cos(this.angle) * spd;
        const newY = this.y + Math.sin(this.angle) * spd;

        if (!city.isBuilding(newX, newY, CONFIG.NPC_SIZE) && !city.isWater(newX, newY) &&
            newX > 5 && newX < CONFIG.WORLD_WIDTH - 5 && newY > 5 && newY < CONFIG.WORLD_HEIGHT - 5) {
            this.x = newX;
            this.y = newY;
        } else {
            this.pickNewTarget(city);
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, CONFIG.NPC_SIZE, 0, Math.PI * 2);
        ctx.fill();

        // Direction
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(
            this.x + Math.cos(this.angle) * 5,
            this.y + Math.sin(this.angle) * 5,
            3, 0, Math.PI * 2
        );
        ctx.fill();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
            return true;
        }
        return false;
    }
}

// ===== POLICE =====
class Police {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = CONFIG.POLICE_SPEED;
        this.chasing = false;
        this.shootTimer = 0;
        this.health = 100;
        this.alive = true;
    }

    update(player, wantedLevel, city) {
        if (!this.alive) return;

        const d = dist(this, player.inVehicle || player);
        const target = player.inVehicle || player;

        if (wantedLevel > 0 && d < CONFIG.POLICE_CHASE_DIST * (1 + wantedLevel)) {
            this.chasing = true;
        }

        if (!this.chasing) return;

        if (wantedLevel <= 0) {
            this.chasing = false;
            return;
        }

        this.angle = angle(this, target);
        const spd = this.speed + wantedLevel * 0.3;
        const newX = this.x + Math.cos(this.angle) * spd;
        const newY = this.y + Math.sin(this.angle) * spd;

        if (!city.isBuilding(newX, newY, 10) && !city.isWater(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }

        // Shoot at high wanted levels
        if (wantedLevel >= 3 && d < 200) {
            this.shootTimer++;
            if (this.shootTimer > 60) {
                this.shootTimer = 0;
                return { x: this.x, y: this.y, angle: this.angle, isPolice: true };
            }
        }
        return null;
    }

    draw(ctx) {
        if (!this.alive) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Body
        ctx.fillStyle = '#000088';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Badge
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(6, -2, 8, 4);

        ctx.restore();
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
            return true;
        }
        return false;
    }
}

// ===== BULLET =====
class Bullet {
    constructor(x, y, angle, isPolice = false) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = CONFIG.BULLET_SPEED;
        this.alive = true;
        this.distance = 0;
        this.isPolice = isPolice;
    }

    update(city) {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.distance += this.speed;

        if (this.distance > CONFIG.BULLET_RANGE || city.isBuilding(this.x, this.y, 2)) {
            this.alive = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.isPolice ? '#ff4444' : '#ffff00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.strokeStyle = this.isPolice ? 'rgba(255,50,50,0.3)' : 'rgba(255,255,0,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.angle) * 10, this.y - Math.sin(this.angle) * 10);
        ctx.stroke();
    }
}

// ===== PICKUP =====
class Pickup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'money', 'health'
        this.alive = true;
        this.bobPhase = Math.random() * Math.PI * 2;
        this.value = type === 'money' ? randInt(50, 500) : 30;
    }

    update() {
        this.bobPhase += 0.05;
    }

    draw(ctx) {
        if (!this.alive) return;
        const bob = Math.sin(this.bobPhase) * 3;

        ctx.save();
        ctx.translate(this.x, this.y + bob);

        if (this.type === 'money') {
            ctx.fillStyle = '#00cc00';
            ctx.fillRect(-8, -8, 16, 16);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('$', 0, 5);
        } else {
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('+', 0, 5);
        }

        ctx.restore();
    }
}

// ===== EXPLOSION =====
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.maxRadius = 40;
        this.alpha = 1;
        this.alive = true;
    }

    update() {
        this.radius += 2;
        this.alpha -= 0.04;
        if (this.alpha <= 0) this.alive = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
