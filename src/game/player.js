import * as THREE from 'three';

const ARENA_HALF = 38;
const PLAYER_RADIUS = 0.8;
const MOVE_SPEED = 14;
const SPRINT_SPEED = 20;
const DODGE_SPEED = 30;
const DODGE_DURATION = 0.25;
const DODGE_COOLDOWN = 1.5;
const SHOOT_COOLDOWN = 0.4;
const RELOAD_TIME = 1.5;
const MOUSE_SENSITIVITY = 0.002;

export class Player {
    constructor(scene, camera, projectiles, particles, audio) {
        this.scene = scene;
        this.camera = camera;
        this.projectiles = projectiles;
        this.particles = particles;
        this.audio = audio;

        // Stats
        this.maxHealth = 100;
        this.health = 100;
        this.maxAmmo = 3;
        this.ammo = 3;
        this.maxSuperCharge = 100;
        this.superCharge = 0;

        // State
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3();
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.shootTimer = 0;
        this.reloadTimer = 0;
        this.isReloading = false;
        this.dodgeTimer = 0;
        this.dodgeCooldown = 0;
        this.dodgeDir = new THREE.Vector3();
        this.isDodging = false;
        this.healthRegen = 0;
        this.healthRegenDelay = 3;
        this.timeSinceDamage = 0;

        // Callbacks
        this.onDamage = null;
        this.onDeath = null;

        // Input
        this.keys = {};
        this.mouseDown = false;

        // Create player model (visible from above)
        this.mesh = this._createPlayerMesh();
        scene.add(this.mesh);

        // Weapon flash
        this.muzzleFlash = this._createMuzzleFlash();
        this.camera.add(this.muzzleFlash);
        scene.add(this.camera);

        this._setupInput();
    }

    _createPlayerMesh() {
        const group = new THREE.Group();

        // Body
        const bodyGeo = new THREE.CapsuleGeometry(0.5, 1, 8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x00aaff,
            metalness: 0.4,
            roughness: 0.3,
            emissive: 0x0044aa,
            emissiveIntensity: 0.3,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1;
        body.castShadow = true;
        group.add(body);

        // Visor
        const visorGeo = new THREE.SphereGeometry(0.35, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const visorMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 1,
            metalness: 0.9,
            roughness: 0.1,
        });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.7, -0.2);
        group.add(visor);

        return group;
    }

    _createMuzzleFlash() {
        const flashGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const flashMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0,
        });
        const flash = new THREE.Mesh(flashGeo, flashMat);
        flash.position.set(0.3, -0.3, -1);
        return flash;
    }

    _setupInput() {
        document.addEventListener('keydown', e => {
            this.keys[e.code] = true;
        });
        document.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });
        document.addEventListener('mousedown', e => {
            if (e.button === 0) this.mouseDown = true;
        });
        document.addEventListener('mouseup', e => {
            if (e.button === 0) this.mouseDown = false;
        });
        document.addEventListener('mousemove', e => {
            if (!document.pointerLockElement) return;
            this.euler.y -= e.movementX * MOUSE_SENSITIVITY;
            this.euler.x -= e.movementY * MOUSE_SENSITIVITY;
            this.euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        });
    }

    reset() {
        this.health = this.maxHealth;
        this.ammo = this.maxAmmo;
        this.superCharge = 0;
        this.position.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
        this.euler.set(0, 0, 0);
        this.camera.quaternion.setFromEuler(this.euler);
        this.shootTimer = 0;
        this.reloadTimer = 0;
        this.isReloading = false;
        this.dodgeTimer = 0;
        this.dodgeCooldown = 0;
        this.isDodging = false;
        this.timeSinceDamage = 10;
    }

    shoot() {
        if (this.ammo <= 0 || this.shootTimer > 0 || this.isReloading) return;

        this.ammo--;
        this.shootTimer = SHOOT_COOLDOWN;

        // Direction from camera
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyQuaternion(this.camera.quaternion);

        const origin = this.position.clone();
        origin.y += 1.5;

        this.projectiles.spawn(origin, dir, 60, 25, 'player', 0x00ccff);
        this.audio.playShoot();

        // Muzzle flash
        this.muzzleFlash.material.opacity = 1;
        setTimeout(() => this.muzzleFlash.material.opacity = 0, 50);

        // Auto reload
        if (this.ammo <= 0) {
            this.isReloading = true;
            this.reloadTimer = RELOAD_TIME;
        }
    }

    useSuper() {
        if (this.superCharge < this.maxSuperCharge) return;
        this.superCharge = 0;

        // Super: Explosive ring
        const origin = this.position.clone();
        origin.y += 1;

        // Spawn projectiles in all directions
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const dir = new THREE.Vector3(Math.cos(angle), 0.1, Math.sin(angle));
            this.projectiles.spawn(origin.clone(), dir, 40, 40, 'player', 0xffdd00);
        }

        // Big explosion particles
        this.particles.explode(origin, 0xffdd00, 50, 8);
        this.audio.playExplosion();
    }

    takeDamage(amount) {
        if (this.isDodging) return;
        this.health -= amount;
        this.timeSinceDamage = 0;
        if (this.onDamage) this.onDamage();
        if (this.health <= 0) {
            this.health = 0;
            this.particles.explode(this.position.clone().add(new THREE.Vector3(0, 1, 0)), 0x00aaff, 40, 6);
            if (this.onDeath) this.onDeath();
        }
    }

    update(delta, enemies) {
        // ─── Shooting ───
        this.shootTimer = Math.max(0, this.shootTimer - delta);

        if (this.isReloading) {
            this.reloadTimer -= delta;
            if (this.reloadTimer <= 0) {
                this.ammo = this.maxAmmo;
                this.isReloading = false;
            }
        }

        if (this.mouseDown) {
            this.shoot();
        }

        if (this.keys['KeyQ']) {
            this.useSuper();
            this.keys['KeyQ'] = false;
        }

        // Manual reload
        if (this.keys['KeyR'] && this.ammo < this.maxAmmo && !this.isReloading) {
            this.isReloading = true;
            this.reloadTimer = RELOAD_TIME;
        }

        // ─── Dodge ───
        this.dodgeCooldown = Math.max(0, this.dodgeCooldown - delta);

        if (this.isDodging) {
            this.dodgeTimer -= delta;
            if (this.dodgeTimer <= 0) {
                this.isDodging = false;
            }
        }

        if (this.keys['Space'] && !this.isDodging && this.dodgeCooldown <= 0) {
            this.isDodging = true;
            this.dodgeTimer = DODGE_DURATION;
            this.dodgeCooldown = DODGE_COOLDOWN;

            // Dodge in movement direction or forward
            this.dodgeDir.set(0, 0, 0);
            if (this.keys['KeyW']) this.dodgeDir.z -= 1;
            if (this.keys['KeyS']) this.dodgeDir.z += 1;
            if (this.keys['KeyA']) this.dodgeDir.x -= 1;
            if (this.keys['KeyD']) this.dodgeDir.x += 1;
            if (this.dodgeDir.length() === 0) this.dodgeDir.z = -1;
            this.dodgeDir.normalize();
            this.dodgeDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

            // Dodge particles
            this.particles.trail(this.position.clone().add(new THREE.Vector3(0, 0.5, 0)), 0x00ccff, 10);
        }

        // ─── Movement ───
        if (!this.isDodging) {
            const inputDir = new THREE.Vector3();
            if (this.keys['KeyW']) inputDir.z -= 1;
            if (this.keys['KeyS']) inputDir.z += 1;
            if (this.keys['KeyA']) inputDir.x -= 1;
            if (this.keys['KeyD']) inputDir.x += 1;
            inputDir.normalize();

            // Rotate direction by camera yaw
            inputDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

            const speed = this.keys['ShiftLeft'] ? SPRINT_SPEED : MOVE_SPEED;
            this.velocity.x = inputDir.x * speed;
            this.velocity.z = inputDir.z * speed;
        } else {
            this.velocity.x = this.dodgeDir.x * DODGE_SPEED;
            this.velocity.z = this.dodgeDir.z * DODGE_SPEED;
        }

        // Apply velocity
        this.position.x += this.velocity.x * delta;
        this.position.z += this.velocity.z * delta;

        // Arena bounds
        this.position.x = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, this.position.x));
        this.position.z = Math.max(-ARENA_HALF, Math.min(ARENA_HALF, this.position.z));

        // Obstacle collision
        this._collideWithObstacles();

        // Update camera
        this.camera.position.set(
            this.position.x,
            this.position.y + 1.8,
            this.position.z
        );

        // Update player mesh
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.euler.y;

        // ─── Health Regen ───
        this.timeSinceDamage += delta;
        if (this.timeSinceDamage > this.healthRegenDelay && this.health < this.maxHealth) {
            this.health = Math.min(this.maxHealth, this.health + 10 * delta);
        }
    }

    _collideWithObstacles() {
        this.scene.traverse(obj => {
            if (!obj.userData.isObstacle || !obj.geometry) return;

            if (obj.userData.radius) {
                // Cylinder collision
                const dx = this.position.x - obj.position.x;
                const dz = this.position.z - obj.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                const minDist = obj.userData.radius + PLAYER_RADIUS;

                if (dist < minDist && dist > 0) {
                    const nx = dx / dist;
                    const nz = dz / dist;
                    this.position.x = obj.position.x + nx * minDist;
                    this.position.z = obj.position.z + nz * minDist;
                }
            } else if (obj.userData.size) {
                // Box collision
                const s = obj.userData.size;
                const halfW = s.w / 2 + PLAYER_RADIUS;
                const halfD = s.d / 2 + PLAYER_RADIUS;

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
    }
}
