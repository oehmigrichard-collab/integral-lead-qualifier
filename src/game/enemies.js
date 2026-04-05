import * as THREE from 'three';

const ARENA_HALF = 38;
const ENEMY_NAMES = [
    'Blitz', 'Shadow', 'Viper', 'Titan', 'Nova', 'Razor', 'Storm', 'Phoenix',
    'Fury', 'Ghost', 'Hawk', 'Wolf', 'Raven', 'Bolt', 'Crusher', 'Spike',
    'Fang', 'Apex', 'Inferno', 'Chaos', 'Doom', 'Reaper', 'Striker', 'Tank'
];

const ENEMY_COLORS = [
    0xff0044, 0xff4400, 0xff8800, 0xcc00ff,
    0xff0088, 0xaa0000, 0xff6600, 0xff2200,
];

class Enemy {
    constructor(scene, pos, wave) {
        this.scene = scene;
        this.alive = true;
        this.name = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];
        this.position = pos.clone();
        this.velocity = new THREE.Vector3();
        this.color = ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)];

        // Scale stats with wave
        this.maxHealth = 60 + wave * 15;
        this.health = this.maxHealth;
        this.speed = 5 + Math.random() * 3 + wave * 0.5;
        this.damage = 12 + wave * 3;
        this.shootCooldown = 1.5 - Math.min(wave * 0.08, 0.8);
        this.shootTimer = Math.random() * this.shootCooldown;
        this.shootRange = 25 + wave * 2;

        // AI state
        this.aiState = 'chase'; // chase, strafe, retreat
        this.stateTimer = 0;
        this.strafeDir = Math.random() > 0.5 ? 1 : -1;
        this.radius = 0.7;

        // Create mesh
        this.mesh = this._createMesh();
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);

        // Health bar
        this.healthBarGroup = this._createHealthBar();
        scene.add(this.healthBarGroup);
    }

    _createMesh() {
        const group = new THREE.Group();

        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.5, 0.8, 8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: this.color,
            metalness: 0.5,
            roughness: 0.3,
            emissive: this.color,
            emissiveIntensity: 0.2,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        body.castShadow = true;
        group.add(body);

        // Eyes (menacing)
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
        [-0.18, 0.18].forEach(x => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(x, 1.5, -0.35);
            group.add(eye);

            const pupilGeo = new THREE.SphereGeometry(0.06, 8, 8);
            const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(x, 1.5, -0.42);
            group.add(pupil);
        });

        // Shoulder pads
        const shoulderGeo = new THREE.SphereGeometry(0.25, 8, 8);
        const shoulderMat = new THREE.MeshStandardMaterial({
            color: this.color,
            metalness: 0.7,
            roughness: 0.2,
        });
        [-0.6, 0.6].forEach(x => {
            const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
            shoulder.position.set(x, 1.3, 0);
            group.add(shoulder);
        });

        return group;
    }

    _createHealthBar() {
        const group = new THREE.Group();

        const bgGeo = new THREE.PlaneGeometry(1.2, 0.15);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 });
        const bg = new THREE.Mesh(bgGeo, bgMat);
        group.add(bg);

        const barGeo = new THREE.PlaneGeometry(1.1, 0.1);
        const barMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
        this.healthBarMesh = new THREE.Mesh(barGeo, barMat);
        group.add(this.healthBarMesh);

        return group;
    }

    takeDamage(amount, particles) {
        this.health -= amount;
        // Flash white
        this.mesh.traverse(child => {
            if (child.isMesh && child.material.emissive) {
                const origColor = child.material.emissive.clone();
                child.material.emissive.setHex(0xffffff);
                child.material.emissiveIntensity = 2;
                setTimeout(() => {
                    child.material.emissive.copy(origColor);
                    child.material.emissiveIntensity = 0.2;
                }, 80);
            }
        });

        if (this.health <= 0) {
            this.alive = false;
            particles.explode(this.position.clone().add(new THREE.Vector3(0, 1, 0)), this.color, 30, 5);
            this.scene.remove(this.mesh);
            this.scene.remove(this.healthBarGroup);
        }
    }

    update(delta, playerPos, projectiles, audio) {
        if (!this.alive) return;

        const toPlayer = new THREE.Vector3().subVectors(playerPos, this.position);
        const distToPlayer = toPlayer.length();
        toPlayer.normalize();

        // ─── AI State Machine ───
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
            const roll = Math.random();
            if (distToPlayer < 8) {
                this.aiState = roll < 0.4 ? 'retreat' : 'strafe';
            } else if (distToPlayer > this.shootRange) {
                this.aiState = 'chase';
            } else {
                this.aiState = roll < 0.5 ? 'strafe' : 'chase';
            }
            this.stateTimer = 1 + Math.random() * 2;
            this.strafeDir = Math.random() > 0.5 ? 1 : -1;
        }

        // ─── Movement ───
        const moveDir = new THREE.Vector3();

        switch (this.aiState) {
            case 'chase':
                moveDir.copy(toPlayer);
                break;
            case 'retreat':
                moveDir.copy(toPlayer).negate();
                break;
            case 'strafe':
                moveDir.set(-toPlayer.z * this.strafeDir, 0, toPlayer.x * this.strafeDir);
                // Slightly move towards player while strafing
                moveDir.add(toPlayer.clone().multiplyScalar(0.3));
                break;
        }

        moveDir.y = 0;
        moveDir.normalize();

        this.position.x += moveDir.x * this.speed * delta;
        this.position.z += moveDir.z * this.speed * delta;

        // Arena bounds
        this.position.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, this.position.x));
        this.position.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, this.position.z));

        // ─── Obstacle Collision ───
        this.scene.traverse(obj => {
            if (!obj.userData.isObstacle) return;
            if (obj.userData.radius) {
                const dx = this.position.x - obj.position.x;
                const dz = this.position.z - obj.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                const minDist = obj.userData.radius + this.radius;
                if (dist < minDist && dist > 0) {
                    this.position.x = obj.position.x + (dx / dist) * minDist;
                    this.position.z = obj.position.z + (dz / dist) * minDist;
                }
            } else if (obj.userData.size) {
                const s = obj.userData.size;
                const halfW = s.w / 2 + this.radius;
                const halfD = s.d / 2 + this.radius;
                const dx = this.position.x - obj.position.x;
                const dz = this.position.z - obj.position.z;
                if (Math.abs(dx) < halfW && Math.abs(dz) < halfD) {
                    const overlapX = halfW - Math.abs(dx);
                    const overlapZ = halfD - Math.abs(dz);
                    if (overlapX < overlapZ) {
                        this.position.x += Math.sign(dx) * overlapX;
                    } else {
                        this.position.z += Math.sign(dz) * overlapZ;
                    }
                }
            }
        });

        // ─── Shooting ───
        this.shootTimer -= delta;
        if (this.shootTimer <= 0 && distToPlayer < this.shootRange) {
            this.shootTimer = this.shootCooldown;

            const shootDir = toPlayer.clone();
            // Add some inaccuracy
            shootDir.x += (Math.random() - 0.5) * 0.2;
            shootDir.z += (Math.random() - 0.5) * 0.2;
            shootDir.normalize();

            const origin = this.position.clone();
            origin.y += 1.2;

            projectiles.spawn(origin, shootDir, 35, this.damage, 'enemy', this.color);
        }

        // ─── Look at player ───
        this.mesh.position.copy(this.position);
        this.mesh.lookAt(new THREE.Vector3(playerPos.x, this.position.y, playerPos.z));

        // ─── Health bar ───
        const hpPercent = this.health / this.maxHealth;
        this.healthBarMesh.scale.x = Math.max(0, hpPercent);
        this.healthBarMesh.position.x = -(1 - hpPercent) * 0.55;

        if (hpPercent < 0.3) {
            this.healthBarMesh.material.color.setHex(0xff0000);
        } else if (hpPercent < 0.6) {
            this.healthBarMesh.material.color.setHex(0xff8800);
        } else {
            this.healthBarMesh.material.color.setHex(0x00ff44);
        }

        this.healthBarGroup.position.set(this.position.x, 2.3, this.position.z);
        this.healthBarGroup.lookAt(
            this.healthBarGroup.position.x,
            this.healthBarGroup.position.y,
            this.healthBarGroup.position.z + 1
        );
        // Billboard: always face camera-ish
        this.healthBarGroup.quaternion.identity();
    }

    destroy() {
        this.scene.remove(this.mesh);
        this.scene.remove(this.healthBarGroup);
    }
}

export class EnemyManager {
    constructor(scene, projectiles, particles, player, audio) {
        this.scene = scene;
        this.projectiles = projectiles;
        this.particles = particles;
        this.player = player;
        this.audio = audio;
        this.enemies = [];
        this.onEnemyKilled = null;
    }

    reset() {
        this.enemies.forEach(e => e.destroy());
        this.enemies = [];
    }

    spawnWave(wave) {
        const count = 3 + wave * 2;
        for (let i = 0; i < count; i++) {
            // Spawn at random positions away from player
            let pos;
            do {
                pos = new THREE.Vector3(
                    (Math.random() - 0.5) * ARENA_HALF * 1.6,
                    0,
                    (Math.random() - 0.5) * ARENA_HALF * 1.6
                );
            } while (pos.distanceTo(this.player.position) < 15);

            const enemy = new Enemy(this.scene, pos, wave);
            this.enemies.push(enemy);
        }
    }

    update(delta) {
        this.enemies = this.enemies.filter(e => {
            if (!e.alive) {
                if (this.onEnemyKilled) this.onEnemyKilled(e);
                return false;
            }
            return true;
        });

        // Enemy-enemy collision
        for (let i = 0; i < this.enemies.length; i++) {
            for (let j = i + 1; j < this.enemies.length; j++) {
                const a = this.enemies[i];
                const b = this.enemies[j];
                const dx = a.position.x - b.position.x;
                const dz = a.position.z - b.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                const minDist = a.radius + b.radius + 0.3;

                if (dist < minDist && dist > 0) {
                    const nx = dx / dist;
                    const nz = dz / dist;
                    const overlap = (minDist - dist) / 2;
                    a.position.x += nx * overlap;
                    a.position.z += nz * overlap;
                    b.position.x -= nx * overlap;
                    b.position.z -= nz * overlap;
                }
            }
        }

        this.enemies.forEach(e => {
            e.update(delta, this.player.position, this.projectiles, this.audio);
        });
    }
}
