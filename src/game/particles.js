import * as THREE from 'three';

class Particle {
    constructor(scene, pos, color, velocity, size, lifetime) {
        this.alive = true;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.velocity = velocity;
        this.gravity = -9.8;

        const geo = new THREE.SphereGeometry(size, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1,
        });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.copy(pos);
        scene.add(this.mesh);
        this.scene = scene;
    }

    update(delta) {
        if (!this.alive) return;

        this.lifetime -= delta;
        if (this.lifetime <= 0) {
            this.alive = false;
            this.scene.remove(this.mesh);
            return;
        }

        this.velocity.y += this.gravity * delta;
        this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));

        // Fade out
        const t = this.lifetime / this.maxLifetime;
        this.mesh.material.opacity = t;

        // Scale down
        const s = t * 0.8 + 0.2;
        this.mesh.scale.set(s, s, s);

        // Floor collision
        if (this.mesh.position.y < 0.05) {
            this.mesh.position.y = 0.05;
            this.velocity.y = Math.abs(this.velocity.y) * 0.3;
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;
        }
    }
}

class DamageNumber {
    constructor(scene, pos, damage) {
        this.alive = true;
        this.lifetime = 1;

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#ffdd00';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.strokeText(Math.round(damage).toString(), 64, 48);
        ctx.fillText(Math.round(damage).toString(), 64, 48);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        this.sprite = new THREE.Sprite(mat);
        this.sprite.position.copy(pos);
        this.sprite.position.y += 1;
        this.sprite.scale.set(1.5, 0.75, 1);
        scene.add(this.sprite);
        this.scene = scene;
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            3 + Math.random() * 2,
            (Math.random() - 0.5) * 2
        );
    }

    update(delta) {
        if (!this.alive) return;

        this.lifetime -= delta;
        if (this.lifetime <= 0) {
            this.alive = false;
            this.scene.remove(this.sprite);
            return;
        }

        this.velocity.y -= 5 * delta;
        this.sprite.position.add(this.velocity.clone().multiplyScalar(delta));
        this.sprite.material.opacity = this.lifetime;
    }
}

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.damageNumbers = [];
    }

    explode(pos, color, count, spread) {
        for (let i = 0; i < count; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * spread * 2,
                Math.random() * spread * 1.5,
                (Math.random() - 0.5) * spread * 2
            );
            const size = 0.05 + Math.random() * 0.15;
            const lifetime = 0.5 + Math.random() * 1;
            const p = new Particle(this.scene, pos.clone(), color, velocity, size, lifetime);
            this.particles.push(p);
        }
    }

    impact(pos, color, count) {
        for (let i = 0; i < count; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 3,
                (Math.random() - 0.5) * 4
            );
            const size = 0.03 + Math.random() * 0.08;
            const lifetime = 0.3 + Math.random() * 0.5;
            const p = new Particle(this.scene, pos.clone(), color, velocity, size, lifetime);
            this.particles.push(p);
        }
    }

    trail(pos, color, count) {
        for (let i = 0; i < count; i++) {
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            const size = 0.04 + Math.random() * 0.1;
            const lifetime = 0.2 + Math.random() * 0.4;
            const p = new Particle(this.scene, pos.clone(), color, velocity, size, lifetime);
            this.particles.push(p);
        }
    }

    damageNumber(pos, damage) {
        const dn = new DamageNumber(this.scene, pos, damage);
        this.damageNumbers.push(dn);
    }

    update(delta) {
        this.particles = this.particles.filter(p => {
            p.update(delta);
            return p.alive;
        });

        this.damageNumbers = this.damageNumbers.filter(dn => {
            dn.update(delta);
            return dn.alive;
        });
    }
}
