import * as THREE from 'three';

const ARENA_HALF = 39;

class Projectile {
    constructor(scene, origin, direction, speed, damage, owner, color) {
        this.scene = scene;
        this.alive = true;
        this.speed = speed;
        this.damage = damage;
        this.owner = owner; // 'player' or 'enemy'
        this.direction = direction.clone().normalize();
        this.position = origin.clone();
        this.lifetime = 3;
        this.radius = 0.2;

        // Mesh: glowing sphere with trail
        const geo = new THREE.SphereGeometry(0.15, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
        });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);

        // Glow
        const glowGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
        });
        this.glow = new THREE.Mesh(glowGeo, glowMat);
        this.mesh.add(this.glow);

        // Point light
        this.light = new THREE.PointLight(color, 3, 8);
        this.mesh.add(this.light);

        this.color = color;
    }

    update(delta) {
        if (!this.alive) return;

        this.lifetime -= delta;
        if (this.lifetime <= 0) {
            this.destroy();
            return;
        }

        this.position.add(this.direction.clone().multiplyScalar(this.speed * delta));
        this.mesh.position.copy(this.position);

        // Out of bounds
        if (Math.abs(this.position.x) > ARENA_HALF ||
            Math.abs(this.position.z) > ARENA_HALF ||
            this.position.y < -1 || this.position.y > 20) {
            this.destroy();
        }
    }

    destroy() {
        this.alive = false;
        this.scene.remove(this.mesh);
    }
}

export class ProjectileManager {
    constructor(scene, particles) {
        this.scene = scene;
        this.particles = particles;
        this.projectiles = [];
    }

    spawn(origin, direction, speed, damage, owner, color) {
        const proj = new Projectile(this.scene, origin, direction, speed, damage, owner, color);
        this.projectiles.push(proj);
    }

    update(delta, player, enemies) {
        this.projectiles = this.projectiles.filter(p => {
            if (!p.alive) return false;

            p.update(delta);
            if (!p.alive) return false;

            // ─── Collision with obstacles ───
            let hitObstacle = false;
            this.scene.traverse(obj => {
                if (hitObstacle || !obj.userData.isObstacle) return;
                if (obj.userData.radius) {
                    const dx = p.position.x - obj.position.x;
                    const dz = p.position.z - obj.position.z;
                    if (Math.sqrt(dx * dx + dz * dz) < obj.userData.radius + p.radius) {
                        if (p.position.y < obj.position.y + 3) {
                            hitObstacle = true;
                        }
                    }
                } else if (obj.userData.size) {
                    const s = obj.userData.size;
                    if (Math.abs(p.position.x - obj.position.x) < s.w / 2 + p.radius &&
                        Math.abs(p.position.z - obj.position.z) < s.d / 2 + p.radius &&
                        p.position.y < obj.position.y + s.h / 2) {
                        hitObstacle = true;
                    }
                }
            });

            if (hitObstacle) {
                this.particles.impact(p.position.clone(), p.color, 8);
                p.destroy();
                return false;
            }

            // ─── Hit player ───
            if (p.owner === 'enemy') {
                const dx = p.position.x - player.position.x;
                const dy = p.position.y - (player.position.y + 1);
                const dz = p.position.z - player.position.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < 1.0) {
                    player.takeDamage(p.damage);
                    this.particles.impact(p.position.clone(), p.color, 12);
                    p.destroy();
                    return false;
                }
            }

            // ─── Hit enemies ───
            if (p.owner === 'player') {
                for (const enemy of enemies) {
                    if (!enemy.alive) continue;
                    const dx = p.position.x - enemy.position.x;
                    const dy = p.position.y - (enemy.position.y + 1);
                    const dz = p.position.z - enemy.position.z;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 1.0) {
                        enemy.takeDamage(p.damage, this.particles);
                        this.particles.impact(p.position.clone(), p.color, 12);

                        // Damage numbers
                        this.particles.damageNumber(p.position.clone(), p.damage);

                        p.destroy();
                        return false;
                    }
                }
            }

            return true;
        });
    }
}
