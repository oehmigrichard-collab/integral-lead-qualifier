// ===== GTA 3D - Complete Game Engine =====
// Uses Three.js r128 (global THREE)

// --- GLOBALS ---
let scene, camera, renderer, clock;
let game = null;

// --- UTILS ---
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function randF(a, b) { return Math.random() * (b - a) + a; }
function randI(a, b) { return Math.floor(randF(a, b + 1)); }
function dist2(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
function ang2(a, b) { return Math.atan2(b.x - a.x, b.z - a.z); }

// --- CONSTANTS ---
const W = 3000; // world size
const BLOCK = 300; // city block size
const ROAD_W = 40;
const SIDE_W = 8;

// ===================== CITY =====================
class City {
    constructor() {
        this.group = new THREE.Group();
        this.buildings = [];
        this.buildCity();
    }

    buildCity() {
        // Ground
        const groundGeo = new THREE.PlaneGeometry(W, W);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a5a1a, roughness: 0.9 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.group.add(ground);

        // Roads (horizontal and vertical)
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.6, metalness: 0.1 });
        const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x666670, roughness: 0.8 });
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xcccc44 });
        const whiteLine = new THREE.MeshBasicMaterial({ color: 0xffffff });

        for (let i = BLOCK; i < W; i += BLOCK) {
            // Vertical roads
            const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, W), roadMat);
            vRoad.rotation.x = -Math.PI / 2;
            vRoad.position.set(i - W / 2, 0.05, 0);
            vRoad.receiveShadow = true;
            this.group.add(vRoad);

            // Sidewalks
            const sw1 = new THREE.Mesh(new THREE.PlaneGeometry(SIDE_W, W), sidewalkMat);
            sw1.rotation.x = -Math.PI / 2;
            sw1.position.set(i - W / 2 - ROAD_W / 2 - SIDE_W / 2, 0.08, 0);
            this.group.add(sw1);
            const sw2 = new THREE.Mesh(new THREE.PlaneGeometry(SIDE_W, W), sidewalkMat);
            sw2.rotation.x = -Math.PI / 2;
            sw2.position.set(i - W / 2 + ROAD_W / 2 + SIDE_W / 2, 0.08, 0);
            this.group.add(sw2);

            // Center line dashes
            for (let d = -W / 2; d < W / 2; d += 15) {
                const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 6), lineMat);
                dash.rotation.x = -Math.PI / 2;
                dash.position.set(i - W / 2, 0.07, d);
                this.group.add(dash);
            }

            // Horizontal roads
            const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(W, ROAD_W), roadMat);
            hRoad.rotation.x = -Math.PI / 2;
            hRoad.position.set(0, 0.05, i - W / 2);
            hRoad.receiveShadow = true;
            this.group.add(hRoad);

            const sw3 = new THREE.Mesh(new THREE.PlaneGeometry(W, SIDE_W), sidewalkMat);
            sw3.rotation.x = -Math.PI / 2;
            sw3.position.set(0, 0.08, i - W / 2 - ROAD_W / 2 - SIDE_W / 2);
            this.group.add(sw3);
            const sw4 = new THREE.Mesh(new THREE.PlaneGeometry(W, SIDE_W), sidewalkMat);
            sw4.rotation.x = -Math.PI / 2;
            sw4.position.set(0, 0.08, i - W / 2 + ROAD_W / 2 + SIDE_W / 2);
            this.group.add(sw4);

            for (let d = -W / 2; d < W / 2; d += 15) {
                const dash = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.8), lineMat);
                dash.rotation.x = -Math.PI / 2;
                dash.position.set(d, 0.07, i - W / 2);
                this.group.add(dash);
            }
        }

        // Wet road reflections (transparent planes on roads)
        const wetMat = new THREE.MeshStandardMaterial({
            color: 0x334455, roughness: 0.1, metalness: 0.8,
            transparent: true, opacity: 0.15
        });
        for (let i = BLOCK; i < W; i += BLOCK) {
            const wetV = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W - 4, W), wetMat);
            wetV.rotation.x = -Math.PI / 2;
            wetV.position.set(i - W / 2, 0.06, 0);
            this.group.add(wetV);
            const wetH = new THREE.Mesh(new THREE.PlaneGeometry(W, ROAD_W - 4), wetMat);
            wetH.rotation.x = -Math.PI / 2;
            wetH.position.set(0, 0.06, i - W / 2);
            this.group.add(wetH);
        }

        // Buildings in each block
        const margin = ROAD_W / 2 + SIDE_W + 5;
        for (let bx = 0; bx < W / BLOCK; bx++) {
            for (let bz = 0; bz < W / BLOCK; bz++) {
                const cx = bx * BLOCK + BLOCK / 2 - W / 2;
                const cz = bz * BLOCK + BLOCK / 2 - W / 2;
                const bw = BLOCK - margin * 2;

                // River zone - skip
                if (bx === Math.floor(W / BLOCK * 0.7)) continue;

                // Park (15% chance)
                if (Math.random() < 0.15) {
                    this.addPark(cx, cz, bw);
                    continue;
                }

                this.addBuildingsToBlock(cx, cz, bw);
            }
        }

        // River
        const riverGeo = new THREE.PlaneGeometry(100, W);
        const riverMat = new THREE.MeshStandardMaterial({
            color: 0x1a4a7a, roughness: 0.1, metalness: 0.6,
            transparent: true, opacity: 0.85
        });
        const river = new THREE.Mesh(riverGeo, riverMat);
        river.rotation.x = -Math.PI / 2;
        river.position.set(W * 0.2, 0.03, 0);
        this.group.add(river);

        // Traffic lights at intersections
        this.addTrafficLights();

        // Street lamps
        this.addStreetLamps();
    }

    addBuildingsToBlock(cx, cz, blockW) {
        const colors = [0x887766, 0x665544, 0x556677, 0x998877, 0x776655, 0x445566, 0x8a7a6a, 0x6a5a4a, 0xaa9988, 0x554433];
        let attempts = 0;
        const placed = [];

        while (attempts < 12) {
            const w = randF(25, Math.min(90, blockW * 0.7));
            const d = randF(25, Math.min(90, blockW * 0.7));
            const h = randF(15, 80);
            const x = cx + randF(-blockW / 2 + w / 2, blockW / 2 - w / 2);
            const z = cz + randF(-blockW / 2 + d / 2, blockW / 2 - d / 2);

            let overlap = false;
            for (const p of placed) {
                if (Math.abs(x - p.x) < (w + p.w) / 2 + 5 && Math.abs(z - p.z) < (d + p.d) / 2 + 5) {
                    overlap = true; break;
                }
            }

            if (!overlap) {
                const color = colors[randI(0, colors.length - 1)];
                const bldg = this.createBuilding(x, z, w, d, h, color);
                this.group.add(bldg);
                placed.push({ x, z, w, d, h });
                this.buildings.push({ x, z, w: w + 4, d: d + 4, h });
            }
            attempts++;
        }
    }

    createBuilding(x, z, w, d, h, color) {
        const g = new THREE.Group();

        // Main body
        const bodyGeo = new THREE.BoxGeometry(w, h, d);
        const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.1 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(x, h / 2, z);
        body.castShadow = true;
        body.receiveShadow = true;
        g.add(body);

        // Windows
        const winMat = new THREE.MeshStandardMaterial({
            color: 0xddeeff, roughness: 0.1, metalness: 0.5,
            emissive: 0x334455, emissiveIntensity: 0.3
        });
        const winLitMat = new THREE.MeshStandardMaterial({
            color: 0xffffcc, emissive: 0xffcc66, emissiveIntensity: 0.6, roughness: 0.3
        });
        const winSize = 3;
        const winGap = 8;

        // Front and back windows
        for (let wy = 6; wy < h - 4; wy += winGap) {
            for (let wx = -w / 2 + 6; wx < w / 2 - 4; wx += winGap) {
                const mat = Math.random() < 0.6 ? winLitMat : winMat;
                const win = new THREE.Mesh(new THREE.PlaneGeometry(winSize, winSize), mat);
                win.position.set(x + wx, wy, z + d / 2 + 0.1);
                g.add(win);
                const win2 = new THREE.Mesh(new THREE.PlaneGeometry(winSize, winSize), mat);
                win2.position.set(x + wx, wy, z - d / 2 - 0.1);
                win2.rotation.y = Math.PI;
                g.add(win2);
            }
        }
        // Side windows
        for (let wy = 6; wy < h - 4; wy += winGap) {
            for (let wz = -d / 2 + 6; wz < d / 2 - 4; wz += winGap) {
                const mat = Math.random() < 0.6 ? winLitMat : winMat;
                const win = new THREE.Mesh(new THREE.PlaneGeometry(winSize, winSize), mat);
                win.position.set(x + w / 2 + 0.1, wy, z + wz);
                win.rotation.y = Math.PI / 2;
                g.add(win);
                const win2 = new THREE.Mesh(new THREE.PlaneGeometry(winSize, winSize), mat);
                win2.position.set(x - w / 2 - 0.1, wy, z + wz);
                win2.rotation.y = -Math.PI / 2;
                g.add(win2);
            }
        }

        // Roof detail
        if (h > 30 && Math.random() < 0.5) {
            const roofBox = new THREE.Mesh(
                new THREE.BoxGeometry(w * 0.3, 4, d * 0.3),
                new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 })
            );
            roofBox.position.set(x, h + 2, z);
            roofBox.castShadow = true;
            g.add(roofBox);
        }

        return g;
    }

    addPark(cx, cz, size) {
        // Green ground
        const parkGeo = new THREE.PlaneGeometry(size, size);
        const parkMat = new THREE.MeshStandardMaterial({ color: 0x2d7a1e, roughness: 0.9 });
        const park = new THREE.Mesh(parkGeo, parkMat);
        park.rotation.x = -Math.PI / 2;
        park.position.set(cx, 0.1, cz);
        park.receiveShadow = true;
        this.group.add(park);

        // Trees
        for (let i = 0; i < randI(5, 12); i++) {
            const tx = cx + randF(-size / 2 + 8, size / 2 - 8);
            const tz = cz + randF(-size / 2 + 8, size / 2 - 8);
            this.addTree(tx, tz);
        }
    }

    addTree(x, z) {
        const g = new THREE.Group();
        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.8, 1.2, 8, 6),
            new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.9 })
        );
        trunk.position.set(x, 4, z);
        trunk.castShadow = true;
        g.add(trunk);

        // Canopy (use cone for variety)
        const canopyH = randF(8, 14);
        const canopyR = randF(4, 8);
        const canopyColor = new THREE.Color().setHSL(0.28 + Math.random() * 0.08, 0.6, 0.25 + Math.random() * 0.15);
        if (Math.random() < 0.5) {
            const canopy = new THREE.Mesh(
                new THREE.SphereGeometry(canopyR, 8, 6),
                new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.8 })
            );
            canopy.position.set(x, 8 + canopyR * 0.6, z);
            canopy.castShadow = true;
            g.add(canopy);
        } else {
            const canopy = new THREE.Mesh(
                new THREE.ConeGeometry(canopyR, canopyH, 8),
                new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.8 })
            );
            canopy.position.set(x, 8 + canopyH / 2, z);
            canopy.castShadow = true;
            g.add(canopy);
        }
        this.group.add(g);
    }

    addTrafficLights() {
        const tlMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
        for (let i = BLOCK; i < W; i += BLOCK) {
            for (let j = BLOCK; j < W; j += BLOCK) {
                const ix = i - W / 2;
                const iz = j - W / 2;
                // One traffic light per intersection corner
                const offsets = [
                    { x: ROAD_W / 2 + 3, z: ROAD_W / 2 + 3 },
                    { x: -ROAD_W / 2 - 3, z: -ROAD_W / 2 - 3 },
                ];
                for (const o of offsets) {
                    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 6), tlMat);
                    pole.position.set(ix + o.x, 5, iz + o.z);
                    pole.castShadow = true;
                    this.group.add(pole);

                    // Light housing
                    const housing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3, 1.2), tlMat);
                    housing.position.set(ix + o.x, 11, iz + o.z);
                    this.group.add(housing);

                    // Red light
                    const red = new THREE.Mesh(
                        new THREE.SphereGeometry(0.4, 8, 8),
                        new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 })
                    );
                    red.position.set(ix + o.x, 11.8, iz + o.z + 0.7);
                    this.group.add(red);

                    // Green light
                    const green = new THREE.Mesh(
                        new THREE.SphereGeometry(0.4, 8, 8),
                        new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 })
                    );
                    green.position.set(ix + o.x, 10.2, iz + o.z + 0.7);
                    this.group.add(green);
                }
            }
        }
    }

    addStreetLamps() {
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.3 });
        for (let i = BLOCK; i < W; i += BLOCK) {
            for (let d = -W / 2 + 40; d < W / 2; d += 80) {
                const ix = i - W / 2;
                // Along vertical roads
                const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 12, 6), poleMat);
                pole1.position.set(ix + ROAD_W / 2 + 2, 6, d);
                this.group.add(pole1);
                const bulb1 = new THREE.Mesh(
                    new THREE.SphereGeometry(0.6, 6, 6),
                    new THREE.MeshStandardMaterial({ color: 0xffeecc, emissive: 0xffcc66, emissiveIntensity: 1.0 })
                );
                bulb1.position.set(ix + ROAD_W / 2 + 2, 12.5, d);
                this.group.add(bulb1);
            }
        }
    }

    isBuilding(x, z, pad = 0) {
        for (const b of this.buildings) {
            if (x > b.x - b.w / 2 - pad && x < b.x + b.w / 2 + pad &&
                z > b.z - b.d / 2 - pad && z < b.z + b.d / 2 + pad) return true;
        }
        return false;
    }

    isRoad(x, z) {
        for (let i = BLOCK; i < W; i += BLOCK) {
            const ri = i - W / 2;
            if (Math.abs(x - ri) < ROAD_W / 2) return true;
            if (Math.abs(z - ri) < ROAD_W / 2) return true;
        }
        return false;
    }
}

// ===================== VEHICLE =====================
class Vehicle3D {
    constructor(x, z, type) {
        this.type = type || 'sedan';
        this.speed = 0;
        this.angle = Math.random() * Math.PI * 2;
        this.driver = null;
        this.health = 100;

        const specs = {
            sedan:  { w: 4.5, h: 2.2, d: 10, color: this.randColor(), maxSpd: 1.2, accel: 0.015, roofH: 1.6 },
            sports: { w: 4.2, h: 1.8, d: 10.5, color: 0xcc0000, maxSpd: 1.8, accel: 0.025, roofH: 1.2 },
            truck:  { w: 5.5, h: 3.5, d: 14, color: 0x777777, maxSpd: 0.8, accel: 0.008, roofH: 2.8 },
            taxi:   { w: 4.5, h: 2.2, d: 10, color: 0xddcc00, maxSpd: 1.2, accel: 0.015, roofH: 1.6 },
            police: { w: 4.5, h: 2.2, d: 10, color: 0x111133, maxSpd: 1.5, accel: 0.02, roofH: 1.6 },
        };
        const s = specs[this.type] || specs.sedan;
        this.maxSpd = s.maxSpd;
        this.accel = s.accel;
        this.w = s.w;
        this.d = s.d;

        // Build mesh
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);
        this.mesh.rotation.y = this.angle;

        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(s.w, s.h, s.d),
            new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.3, metalness: 0.6 })
        );
        body.position.y = s.h / 2 + 0.8;
        body.castShadow = true;
        this.mesh.add(body);

        // Roof
        const roofW = s.w * 0.85;
        const roofD = s.d * 0.4;
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(roofW, s.roofH, roofD),
            new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.3, metalness: 0.6 })
        );
        roof.position.y = s.h + 0.8 + s.roofH / 2;
        roof.position.z = -s.d * 0.05;
        roof.castShadow = true;
        this.mesh.add(roof);

        // Windshield
        const windshield = new THREE.Mesh(
            new THREE.PlaneGeometry(roofW - 0.4, s.roofH - 0.2),
            new THREE.MeshStandardMaterial({ color: 0x88bbdd, roughness: 0.05, metalness: 0.8, transparent: true, opacity: 0.6 })
        );
        windshield.position.set(0, s.h + 0.8 + s.roofH / 2, -s.d * 0.05 + roofD / 2 + 0.05);
        this.mesh.add(windshield);

        // Rear window
        const rearWin = windshield.clone();
        rearWin.position.z = -s.d * 0.05 - roofD / 2 - 0.05;
        rearWin.rotation.y = Math.PI;
        this.mesh.add(rearWin);

        // Headlights
        const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffaa, emissiveIntensity: 0.8 });
        for (const side of [-1, 1]) {
            const hl = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), hlMat);
            hl.position.set(side * (s.w / 2 - 0.5), s.h / 2 + 0.8, s.d / 2 - 0.1);
            this.mesh.add(hl);
        }

        // Taillights
        const tlMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.6 });
        for (const side of [-1, 1]) {
            const tl = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), tlMat);
            tl.position.set(side * (s.w / 2 - 0.5), s.h / 2 + 0.8, -s.d / 2 + 0.1);
            this.mesh.add(tl);
        }

        // Wheels
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
        const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 12);
        for (const sx of [-1, 1]) {
            for (const sz of [-1, 1]) {
                const wheel = new THREE.Mesh(wheelGeo, wheelMat);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(sx * (s.w / 2 + 0.1), 0.7, sz * (s.d / 2 - 1.5));
                this.mesh.add(wheel);
            }
        }

        // Police siren
        if (this.type === 'police') {
            this.sirenR = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.5, 0.6),
                new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 })
            );
            this.sirenR.position.set(-0.8, s.h + 0.8 + s.roofH + 0.3, 0);
            this.mesh.add(this.sirenR);
            this.sirenB = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.5, 0.6),
                new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x0000ff, emissiveIntensity: 1 })
            );
            this.sirenB.position.set(0.8, s.h + 0.8 + s.roofH + 0.3, 0);
            this.mesh.add(this.sirenB);
            this.sirenPhase = 0;
        }

        // Taxi sign
        if (this.type === 'taxi') {
            const sign = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.8, 1),
                new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffaa, emissiveIntensity: 0.5 })
            );
            sign.position.set(0, s.h + 0.8 + s.roofH + 0.5, 0);
            this.mesh.add(sign);
        }
    }

    randColor() {
        const c = [0xcc3333, 0x3333cc, 0x33cc33, 0xcccc33, 0xffffff, 0x111111, 0xcc6633, 0x33cccc, 0x666666, 0x993333];
        return c[randI(0, c.length - 1)];
    }

    get x() { return this.mesh.position.x; }
    set x(v) { this.mesh.position.x = v; }
    get z() { return this.mesh.position.z; }
    set z(v) { this.mesh.position.z = v; }

    update(keys, city, dt) {
        if (!this.driver) return;

        if (keys['w'] || keys['arrowup']) this.speed = Math.min(this.maxSpd, this.speed + this.accel);
        if (keys['s'] || keys['arrowdown']) this.speed = Math.max(-this.maxSpd * 0.4, this.speed - this.accel);
        if (keys[' ']) {
            this.speed *= 0.92;
            if (Math.abs(this.speed) < 0.01) this.speed = 0;
        }

        if (Math.abs(this.speed) > 0.05) {
            const turnRate = 0.025 * Math.min(1, Math.abs(this.speed) / 0.5);
            if (keys['a'] || keys['arrowleft']) this.angle += turnRate * Math.sign(this.speed);
            if (keys['d'] || keys['arrowright']) this.angle -= turnRate * Math.sign(this.speed);
        }

        if (!keys['w'] && !keys['arrowup'] && !keys['s'] && !keys['arrowdown']) {
            this.speed *= 0.985;
            if (Math.abs(this.speed) < 0.005) this.speed = 0;
        }

        const nx = this.x + Math.sin(this.angle) * this.speed;
        const nz = this.z + Math.cos(this.angle) * this.speed;

        if (!city.isBuilding(nx, nz, this.w) &&
            nx > -W / 2 + 5 && nx < W / 2 - 5 && nz > -W / 2 + 5 && nz < W / 2 - 5) {
            this.x = nx;
            this.z = nz;
        } else {
            this.speed *= -0.3;
        }

        this.mesh.rotation.y = this.angle;

        // Siren flash
        if (this.type === 'police' && this.sirenR) {
            this.sirenPhase += 0.15;
            const on = Math.sin(this.sirenPhase) > 0;
            this.sirenR.material.emissiveIntensity = on ? 2 : 0.2;
            this.sirenB.material.emissiveIntensity = on ? 0.2 : 2;
        }
    }
}

// ===================== PLAYER =====================
class Player3D {
    constructor(x, z) {
        this.health = 100;
        this.money = 0;
        this.inVehicle = null;
        this.shooting = false;
        this.lastShot = 0;
        this.sprinting = false;
        this.angle = 0;

        // Character mesh - person shape
        this.mesh = new THREE.Group();

        // Body (torso)
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 2.5, 1),
            new THREE.MeshStandardMaterial({ color: 0x2244aa, roughness: 0.6 }) // Blue suit
        );
        torso.position.y = 4;
        torso.castShadow = true;
        this.mesh.add(torso);

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xddaa88, roughness: 0.7 })
        );
        head.position.y = 5.8;
        head.castShadow = true;
        this.mesh.add(head);

        // Hair
        const hair = new THREE.Mesh(
            new THREE.SphereGeometry(0.55, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
            new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.9 })
        );
        hair.position.y = 6.0;
        this.mesh.add(hair);

        // Legs
        for (const side of [-0.4, 0.4]) {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(0.7, 2.5, 0.8),
                new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 }) // Dark pants
            );
            leg.position.set(side, 1.5, 0);
            leg.castShadow = true;
            this.mesh.add(leg);
        }

        // Arms
        for (const side of [-1.2, 1.2]) {
            const arm = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 2, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x2244aa, roughness: 0.6 })
            );
            arm.position.set(side, 4, 0);
            arm.castShadow = true;
            this.mesh.add(arm);
        }

        this.mesh.position.set(x, 0, z);
    }

    get x() { return this.mesh.position.x; }
    set x(v) { this.mesh.position.x = v; }
    get z() { return this.mesh.position.z; }
    set z(v) { this.mesh.position.z = v; }

    update(keys, city, dt) {
        if (this.inVehicle) {
            this.mesh.visible = false;
            return;
        }
        this.mesh.visible = true;

        const spd = this.sprinting ? 0.6 : 0.35;
        let mx = 0, mz = 0;
        if (keys['w'] || keys['arrowup']) mz = 1;
        if (keys['s'] || keys['arrowdown']) mz = -1;
        if (keys['a'] || keys['arrowleft']) mx = 1;
        if (keys['d'] || keys['arrowright']) mx = -1;

        if (mx !== 0 || mz !== 0) {
            // Move relative to camera angle
            const camAngle = game ? game.camAngleH : 0;
            const forward = new THREE.Vector3(
                Math.sin(camAngle) * mz + Math.sin(camAngle + Math.PI / 2) * mx,
                0,
                Math.cos(camAngle) * mz + Math.cos(camAngle + Math.PI / 2) * mx
            ).normalize().multiplyScalar(spd);

            const nx = this.x + forward.x;
            const nz = this.z + forward.z;

            if (!city.isBuilding(nx, nz, 2) &&
                nx > -W / 2 + 5 && nx < W / 2 - 5 && nz > -W / 2 + 5 && nz < W / 2 - 5) {
                this.x = nx;
                this.z = nz;
                this.angle = Math.atan2(forward.x, forward.z);
                this.mesh.rotation.y = this.angle;
            }
        }
    }

    takeDamage(n) { this.health = Math.max(0, this.health - n); }
    heal(n) { this.health = Math.min(100, this.health + n); }
}

// ===================== NPC =====================
class NPC3D {
    constructor(x, z) {
        this.alive = true;
        this.health = 50;
        this.speed = randF(0.1, 0.2);
        this.angle = Math.random() * Math.PI * 2;
        this.targetX = x;
        this.targetZ = z;
        this.waitTimer = 0;
        this.fleeing = false;

        // Simple person mesh
        this.mesh = new THREE.Group();
        const bodyColor = new THREE.Color().setHSL(Math.random(), 0.5, 0.4);
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 2.5, 0.8),
            new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7 })
        );
        body.position.y = 3;
        body.castShadow = true;
        this.mesh.add(body);

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0xddaa88, roughness: 0.7 })
        );
        head.position.y = 4.8;
        this.mesh.add(head);

        // Legs
        for (const s of [-0.3, 0.3]) {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 2, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.7 })
            );
            leg.position.set(s, 1, 0);
            this.mesh.add(leg);
        }

        this.mesh.position.set(x, 0, z);
    }

    get x() { return this.mesh.position.x; }
    set x(v) { this.mesh.position.x = v; }
    get z() { return this.mesh.position.z; }
    set z(v) { this.mesh.position.z = v; }

    pickTarget(city) {
        for (let i = 0; i < 20; i++) {
            const tx = this.x + randF(-200, 200);
            const tz = this.z + randF(-200, 200);
            if (!city.isBuilding(tx, tz, 5) && Math.abs(tx) < W / 2 - 10 && Math.abs(tz) < W / 2 - 10) {
                this.targetX = tx;
                this.targetZ = tz;
                return;
            }
        }
    }

    update(city, player, dt) {
        if (!this.alive) { this.mesh.visible = false; return; }

        // Flee from shooting
        const pp = player.inVehicle || player;
        if (player.shooting && dist2(this, pp) < 80) {
            this.fleeing = true;
            const a = ang2(pp, this);
            this.targetX = this.x + Math.sin(a) * 200;
            this.targetZ = this.z + Math.cos(a) * 200;
        }

        if (this.waitTimer > 0) { this.waitTimer -= dt; return; }

        const d = dist2(this, { x: this.targetX, z: this.targetZ });
        if (d < 3) {
            this.fleeing = false;
            this.waitTimer = randF(1, 5);
            this.pickTarget(city);
            return;
        }

        const a = ang2(this, { x: this.targetX, z: this.targetZ });
        const spd = this.fleeing ? this.speed * 3 : this.speed;
        const nx = this.x + Math.sin(a) * spd;
        const nz = this.z + Math.cos(a) * spd;

        if (!city.isBuilding(nx, nz, 2) && Math.abs(nx) < W / 2 - 5 && Math.abs(nz) < W / 2 - 5) {
            this.x = nx;
            this.z = nz;
            this.mesh.rotation.y = a;
        } else {
            this.pickTarget(city);
        }
    }

    takeDamage(n) {
        this.health -= n;
        if (this.health <= 0) { this.alive = false; return true; }
        return false;
    }
}

// ===================== POLICE =====================
class Police3D extends NPC3D {
    constructor(x, z) {
        super(x, z);
        this.health = 100;
        this.chasing = false;
        this.shootTimer = 0;

        // Recolor to police blue
        this.mesh.children[0].material = new THREE.MeshStandardMaterial({ color: 0x000066, roughness: 0.5 });
        // Add hat
        const hat = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.6, 0.4, 8),
            new THREE.MeshStandardMaterial({ color: 0x000044, roughness: 0.5 })
        );
        hat.position.y = 5.3;
        this.mesh.add(hat);
    }

    update(player, wantedLevel, city, dt) {
        if (!this.alive) { this.mesh.visible = false; return null; }

        const target = player.inVehicle || player;
        const d = dist2(this, target);

        if (wantedLevel > 0 && d < 200 * (1 + wantedLevel)) this.chasing = true;
        if (wantedLevel <= 0) this.chasing = false;

        if (!this.chasing) {
            // Idle patrol
            super.update(city, player, dt);
            return null;
        }

        const a = ang2(this, target);
        const spd = 0.4 + wantedLevel * 0.08;
        const nx = this.x + Math.sin(a) * spd;
        const nz = this.z + Math.cos(a) * spd;
        if (!city.isBuilding(nx, nz, 2)) {
            this.x = nx;
            this.z = nz;
            this.mesh.rotation.y = a;
        }

        // Shoot at 3+ stars
        if (wantedLevel >= 3 && d < 80) {
            this.shootTimer += dt;
            if (this.shootTimer > 1.5) {
                this.shootTimer = 0;
                return { x: this.x, z: this.z, angle: a, isPolice: true };
            }
        }
        return null;
    }
}

// ===================== BULLET =====================
class Bullet3D {
    constructor(x, z, angle, isPolice = false) {
        this.angle = angle;
        this.speed = 3;
        this.alive = true;
        this.dist = 0;
        this.isPolice = isPolice;

        const color = isPolice ? 0xff4444 : 0xffff00;
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 6, 6),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2 })
        );
        this.mesh.position.set(x, 4, z);
    }

    get x() { return this.mesh.position.x; }
    get z() { return this.mesh.position.z; }

    update(city) {
        this.mesh.position.x += Math.sin(this.angle) * this.speed;
        this.mesh.position.z += Math.cos(this.angle) * this.speed;
        this.dist += this.speed;
        if (this.dist > 200 || city.isBuilding(this.x, this.z, 1)) this.alive = false;
    }
}

// ===================== PICKUP =====================
class Pickup3D {
    constructor(x, z, type) {
        this.type = type;
        this.alive = true;
        this.value = type === 'money' ? randI(50, 500) : 30;
        this.phase = Math.random() * Math.PI * 2;

        const color = type === 'money' ? 0x00cc00 : 0xff3333;
        const geo = type === 'money' ? new THREE.BoxGeometry(1.5, 1.5, 1.5) : new THREE.SphereGeometry(1, 8, 8);
        this.mesh = new THREE.Mesh(geo,
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 })
        );
        this.mesh.position.set(x, 2, z);
        this.mesh.castShadow = true;
    }

    get x() { return this.mesh.position.x; }
    get z() { return this.mesh.position.z; }

    update(dt) {
        this.phase += dt * 2;
        this.mesh.position.y = 2 + Math.sin(this.phase) * 0.5;
        this.mesh.rotation.y += dt;
    }
}

// ===================== EXPLOSION =====================
class Explosion3D {
    constructor(x, y, z) {
        this.alive = true;
        this.life = 1;
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(1, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 2, transparent: true })
        );
        this.mesh.position.set(x, y, z);
    }

    update(dt) {
        this.life -= dt * 2;
        const s = (1 - this.life) * 5 + 1;
        this.mesh.scale.set(s, s, s);
        this.mesh.material.opacity = Math.max(0, this.life);
        if (this.life <= 0) this.alive = false;
    }
}

// ===================== MISSION SYSTEM =====================
class MissionSystem3D {
    constructor() {
        this.missions = [
            { id: 'money', title: 'Geldsammler', desc: 'Sammle $2000', type: 'money', target: 2000, reward: 1000, done: false },
            { id: 'speed', title: 'Speed Demon', desc: 'Vollgas im Sportwagen!', type: 'speed', target: 1.5, reward: 1500, done: false },
            { id: 'taxi', title: 'Taxifahrer', desc: 'Finde und fahre ein Taxi', type: 'taxi', reward: 800, done: false },
            { id: 'wanted', title: 'Überlebender', desc: '3 Sterne Fahndung überleben', type: 'wanted', target: 3, reward: 3000, done: false },
            { id: 'explore', title: 'Entdecker', desc: 'Besuche alle 4 Ecken', type: 'explore', reward: 2000, done: false,
              corners: { tl: false, tr: false, bl: false, br: false } },
        ];
        this.current = null;
        this.autoStart();
    }

    autoStart() {
        this.current = this.missions.find(m => !m.done) || null;
    }

    check(game) {
        const m = this.current;
        if (!m || m.done) return null;
        let done = false;

        switch (m.type) {
            case 'money': done = game.player.money >= m.target; break;
            case 'speed': done = game.player.inVehicle && Math.abs(game.player.inVehicle.speed) >= m.target; break;
            case 'taxi': done = game.player.inVehicle && game.player.inVehicle.type === 'taxi'; break;
            case 'wanted': done = game.wantedLevel >= m.target && game.wantedTimer > 5; break;
            case 'explore':
                const p = game.player.inVehicle || game.player;
                const edge = W / 2 - 200;
                if (p.x < -edge && p.z < -edge) m.corners.tl = true;
                if (p.x > edge && p.z < -edge) m.corners.tr = true;
                if (p.x < -edge && p.z > edge) m.corners.bl = true;
                if (p.x > edge && p.z > edge) m.corners.br = true;
                done = m.corners.tl && m.corners.tr && m.corners.bl && m.corners.br;
                break;
        }

        if (done) {
            m.done = true;
            game.player.money += m.reward;
            this.current = null;
            setTimeout(() => this.autoStart(), 3000);
            return m;
        }
        return null;
    }
}

// ===================== MAIN GAME =====================
class Game3D {
    constructor() {
        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.FogExp2(0x9db8c7, 0.0008);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        document.body.appendChild(renderer.domElement);

        // Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 2000);
        this.camDist = 30;
        this.camHeight = 18;
        this.camAngleH = 0;
        this.camAngleV = 0.3;
        this.camMode = 0; // 0=close, 1=far, 2=top

        // Clock
        clock = new THREE.Clock();

        // Lighting - GTA5 style warm sunset
        const ambLight = new THREE.AmbientLight(0x667788, 0.6);
        scene.add(ambLight);

        const sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
        sunLight.position.set(300, 400, 200);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.left = -500;
        sunLight.shadow.camera.right = 500;
        sunLight.shadow.camera.top = 500;
        sunLight.shadow.camera.bottom = -500;
        sunLight.shadow.camera.far = 1200;
        sunLight.shadow.bias = -0.001;
        scene.add(sunLight);
        this.sunLight = sunLight;

        // Hemisphere light for sky color
        const hemiLight = new THREE.HemisphereLight(0x88aacc, 0x444422, 0.4);
        scene.add(hemiLight);

        // City
        this.city = new City();
        scene.add(this.city.group);

        // Player
        this.player = new Player3D(0, 0);
        scene.add(this.player.mesh);

        // Vehicles
        this.vehicles = [];
        this.spawnVehicles();

        // NPCs
        this.npcs = [];
        this.spawnNPCs();

        // Police
        this.police = [];
        this.spawnPolice();

        // Bullets, pickups, explosions
        this.bullets = [];
        this.pickups = [];
        this.explosions = [];
        this.spawnPickups();

        // Missions
        this.missions = new MissionSystem3D();

        // Game state
        this.wantedLevel = 0;
        this.wantedTimer = 0;
        this.wantedDecay = 0;
        this.gameOver = false;
        this.respawnTimer = 0;
        this.msgTimer = 0;

        // Input
        this.keys = {};
        this.mouseDown = false;
        this.setupInput();

        // Minimap
        this.minimapCtx = document.getElementById('minimap').getContext('2d');

        // Show HUD
        document.getElementById('hud').style.display = 'block';
        this.showMsg('Willkommen in GTA 3D!\nWASD = Bewegen | F = Auto | Maus = Umsehen');

        // Update mission display
        this.updateMissionDisplay();
    }

    spawnVehicles() {
        const types = ['sedan', 'sedan', 'sedan', 'sports', 'truck', 'taxi', 'sedan', 'sports', 'sedan', 'taxi'];
        for (let i = 0; i < 35; i++) {
            let x, z, att = 0;
            do {
                x = randF(-W / 2 + 50, W / 2 - 50);
                z = randF(-W / 2 + 50, W / 2 - 50);
                att++;
            } while (!this.city.isRoad(x, z) && att < 40);
            if (att < 40) {
                const v = new Vehicle3D(x, z, types[i % types.length]);
                this.vehicles.push(v);
                scene.add(v.mesh);
            }
        }
        // Police cars
        for (let i = 0; i < 5; i++) {
            let x, z, att = 0;
            do { x = randF(-W / 2 + 50, W / 2 - 50); z = randF(-W / 2 + 50, W / 2 - 50); att++; }
            while (!this.city.isRoad(x, z) && att < 40);
            if (att < 40) {
                const v = new Vehicle3D(x, z, 'police');
                this.vehicles.push(v);
                scene.add(v.mesh);
            }
        }
    }

    spawnNPCs() {
        for (let i = 0; i < 50; i++) {
            let x, z, att = 0;
            do { x = randF(-W / 2 + 50, W / 2 - 50); z = randF(-W / 2 + 50, W / 2 - 50); att++; }
            while (this.city.isBuilding(x, z, 5) && att < 40);
            if (att < 40) {
                const npc = new NPC3D(x, z);
                npc.pickTarget(this.city);
                this.npcs.push(npc);
                scene.add(npc.mesh);
            }
        }
    }

    spawnPolice() {
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const r = W / 2 - 100;
            const cop = new Police3D(Math.sin(a) * r, Math.cos(a) * r);
            cop.pickTarget(this.city);
            this.police.push(cop);
            scene.add(cop.mesh);
        }
    }

    spawnPickups() {
        for (let i = 0; i < 20; i++) {
            let x, z, att = 0;
            do { x = randF(-W / 2 + 50, W / 2 - 50); z = randF(-W / 2 + 50, W / 2 - 50); att++; }
            while (this.city.isBuilding(x, z, 5) && att < 30);
            if (att < 30) {
                const p = new Pickup3D(x, z, Math.random() < 0.7 ? 'money' : 'health');
                this.pickups.push(p);
                scene.add(p.mesh);
            }
        }
    }

    setupInput() {
        window.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'f') this.toggleVehicle();
            if (e.key.toLowerCase() === 'r') this.toggleCam();
            if (e.key.toLowerCase() === 'shift') this.player.sprinting = true;
        });
        window.addEventListener('keyup', e => {
            this.keys[e.key.toLowerCase()] = false;
            if (e.key.toLowerCase() === 'shift') this.player.sprinting = false;
        });
        window.addEventListener('mousedown', () => { this.mouseDown = true; this.requestPointerLock(); });
        window.addEventListener('mouseup', () => { this.mouseDown = false; });
        window.addEventListener('mousemove', e => {
            if (document.pointerLockElement) {
                this.camAngleH -= e.movementX * 0.003;
                this.camAngleV = clamp(this.camAngleV - e.movementY * 0.002, -0.2, 1.2);
            }
        });
        window.addEventListener('contextmenu', e => e.preventDefault());
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    requestPointerLock() {
        if (!document.pointerLockElement) {
            renderer.domElement.requestPointerLock();
        }
    }

    toggleCam() {
        this.camMode = (this.camMode + 1) % 3;
        if (this.camMode === 0) { this.camDist = 30; this.camHeight = 18; }
        else if (this.camMode === 1) { this.camDist = 60; this.camHeight = 35; }
        else { this.camDist = 15; this.camHeight = 80; }
    }

    toggleVehicle() {
        if (this.player.inVehicle) {
            this.player.x = this.player.inVehicle.x + 8;
            this.player.z = this.player.inVehicle.z + 8;
            this.player.inVehicle.driver = null;
            this.player.inVehicle = null;
            this.player.mesh.visible = true;
        } else {
            let best = null, bestD = 20;
            for (const v of this.vehicles) {
                if (v.driver) continue;
                const d = dist2(this.player, v);
                if (d < bestD) { best = v; bestD = d; }
            }
            if (best) {
                this.player.inVehicle = best;
                best.driver = this.player;
                this.player.mesh.visible = false;
                if (best.type !== 'taxi') this.addWanted(0.5);
            }
        }
    }

    addWanted(n) {
        this.wantedLevel = Math.min(5, this.wantedLevel + n);
        this.wantedDecay = 10;
    }

    showMsg(text) {
        this.msgTimer = 4;
        const el = document.getElementById('center-msg');
        el.textContent = text;
        el.style.opacity = 1;
    }

    updateMissionDisplay() {
        const el = document.getElementById('mission-display');
        if (this.missions.current) {
            el.textContent = '📋 ' + this.missions.current.title + ': ' + this.missions.current.desc;
        } else {
            el.textContent = 'Freies Spiel - Erkunde die Stadt!';
        }
    }

    shoot() {
        const now = performance.now();
        if (now - this.player.lastShot < 200) return;
        this.player.lastShot = now;
        this.player.shooting = true;
        setTimeout(() => { this.player.shooting = false; }, 200);

        const pos = this.player.inVehicle || this.player;
        const a = this.player.inVehicle ? this.player.inVehicle.angle : this.camAngleH;
        const b = new Bullet3D(pos.x, pos.z, a);
        this.bullets.push(b);
        scene.add(b.mesh);
        this.addWanted(0.3);
    }

    update() {
        const dt = Math.min(clock.getDelta(), 0.05);

        if (this.gameOver) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) this.respawn();
            this.updateCamera(dt);
            return;
        }

        // Shooting
        if (this.mouseDown && document.pointerLockElement) this.shoot();

        // Player update
        if (this.player.inVehicle) {
            this.player.inVehicle.update(this.keys, this.city, dt);
            this.player.x = this.player.inVehicle.x;
            this.player.z = this.player.inVehicle.z;

            // Hit NPCs with car
            for (const npc of this.npcs) {
                if (npc.alive && dist2(this.player.inVehicle, npc) < 6 && Math.abs(this.player.inVehicle.speed) > 0.3) {
                    npc.takeDamage(100);
                    this.addWanted(1);
                    this.player.inVehicle.speed *= 0.7;
                    const ex = new Explosion3D(npc.x, 3, npc.z);
                    this.explosions.push(ex);
                    scene.add(ex.mesh);
                }
            }
            // Hit police
            for (const cop of this.police) {
                if (cop.alive && dist2(this.player.inVehicle, cop) < 6 && Math.abs(this.player.inVehicle.speed) > 0.3) {
                    cop.takeDamage(50);
                    this.addWanted(2);
                    this.player.inVehicle.speed *= 0.5;
                }
            }
        } else {
            this.player.update(this.keys, this.city, dt);
        }

        // NPCs
        for (const npc of this.npcs) npc.update(this.city, this.player, dt);

        // Police
        for (const cop of this.police) {
            const shot = cop.update(this.player, Math.floor(this.wantedLevel), this.city, dt);
            if (shot) {
                const b = new Bullet3D(shot.x, shot.z, shot.angle, true);
                this.bullets.push(b);
                scene.add(b.mesh);
            }
        }

        // Bullets
        for (const b of this.bullets) {
            b.update(this.city);
            if (!b.alive) continue;

            if (b.isPolice) {
                const pos = this.player.inVehicle || this.player;
                if (dist2(b, pos) < 5) {
                    this.player.takeDamage(20);
                    b.alive = false;
                    const ex = new Explosion3D(b.x, 4, b.z);
                    this.explosions.push(ex);
                    scene.add(ex.mesh);
                }
            } else {
                for (const npc of this.npcs) {
                    if (npc.alive && dist2(b, npc) < 4) {
                        if (npc.takeDamage(25)) this.player.money += 10;
                        b.alive = false;
                        this.addWanted(0.5);
                        const ex = new Explosion3D(b.x, 4, b.z);
                        this.explosions.push(ex);
                        scene.add(ex.mesh);
                        break;
                    }
                }
                for (const cop of this.police) {
                    if (cop.alive && dist2(b, cop) < 4) {
                        if (cop.takeDamage(25)) this.addWanted(2);
                        b.alive = false;
                        const ex = new Explosion3D(b.x, 4, b.z);
                        this.explosions.push(ex);
                        scene.add(ex.mesh);
                        break;
                    }
                }
            }
        }

        // Cleanup dead bullets
        this.bullets = this.bullets.filter(b => {
            if (!b.alive) { scene.remove(b.mesh); return false; }
            return true;
        });

        // Explosions
        for (const e of this.explosions) e.update(dt);
        this.explosions = this.explosions.filter(e => {
            if (!e.alive) { scene.remove(e.mesh); return false; }
            return true;
        });

        // Pickups
        const pp = this.player.inVehicle || this.player;
        for (const p of this.pickups) {
            if (!p.alive) continue;
            p.update(dt);
            if (dist2(pp, p) < 8) {
                if (p.type === 'money') {
                    this.player.money += p.value;
                    this.showMsg('+$' + p.value);
                } else {
                    this.player.heal(p.value);
                }
                p.alive = false;
                scene.remove(p.mesh);
            }
        }

        // Respawn pickups
        if (Math.random() < 0.003 * dt * 60) {
            let x, z, att = 0;
            do { x = randF(-W / 2 + 50, W / 2 - 50); z = randF(-W / 2 + 50, W / 2 - 50); att++; }
            while (this.city.isBuilding(x, z, 5) && att < 20);
            if (att < 20) {
                const p = new Pickup3D(x, z, Math.random() < 0.7 ? 'money' : 'health');
                this.pickups.push(p);
                scene.add(p.mesh);
            }
        }

        // Wanted decay
        if (this.wantedLevel > 0) {
            this.wantedTimer += dt;
            this.wantedDecay -= dt;
            if (this.wantedDecay <= 0) {
                this.wantedLevel = Math.max(0, this.wantedLevel - 0.005);
                if (this.wantedLevel < 0.1) this.wantedLevel = 0;
            }
        } else {
            this.wantedTimer = 0;
        }

        // Spawn more police at high wanted
        if (Math.floor(this.wantedLevel) >= 2 && Math.random() < 0.005 * dt * 60) {
            const a = Math.random() * Math.PI * 2;
            const px = pp.x + Math.sin(a) * 250;
            const pz = pp.z + Math.cos(a) * 250;
            if (Math.abs(px) < W / 2 - 10 && Math.abs(pz) < W / 2 - 10) {
                const cop = new Police3D(px, pz);
                cop.chasing = true;
                this.police.push(cop);
                scene.add(cop.mesh);
            }
        }

        // Message timer
        if (this.msgTimer > 0) {
            this.msgTimer -= dt;
            if (this.msgTimer <= 0) {
                document.getElementById('center-msg').style.opacity = 0;
            }
        }

        // Missions
        const completed = this.missions.check(this);
        if (completed) {
            this.showMsg('Mission erledigt: ' + completed.title + '\n+$' + completed.reward);
            setTimeout(() => this.updateMissionDisplay(), 3000);
        }

        // Death
        if (this.player.health <= 0) {
            this.gameOver = true;
            this.respawnTimer = 3;
            this.showMsg('WASTED!');
            if (this.player.inVehicle) {
                this.player.inVehicle.driver = null;
                this.player.inVehicle = null;
                this.player.mesh.visible = true;
            }
        }

        // Camera
        this.updateCamera(dt);

        // Move sun shadow with player
        this.sunLight.position.set(pp.x + 300, 400, pp.z + 200);
        this.sunLight.target.position.set(pp.x, 0, pp.z);
        this.sunLight.target.updateMatrixWorld();

        // UI
        this.updateUI();
        this.drawMinimap();
    }

    respawn() {
        this.gameOver = false;
        this.player.health = 100;
        this.player.x = 0;
        this.player.z = 0;
        this.player.mesh.visible = true;
        this.player.money = Math.max(0, this.player.money - 500);
        this.wantedLevel = 0;
        this.showMsg('Krankenhaus - $500 Kosten');
    }

    updateCamera(dt) {
        const target = this.player.inVehicle || this.player;
        const tx = target.x || target.mesh.position.x;
        const tz = target.z || target.mesh.position.z;

        let dist = this.camDist;
        let height = this.camHeight;

        // If in vehicle, camera behind car
        if (this.player.inVehicle && this.camMode !== 2) {
            const carAngle = this.player.inVehicle.angle;
            // Slowly match camera to car direction
            this.camAngleH = lerp(this.camAngleH, carAngle + Math.PI, 0.05);
        }

        const cx = tx - Math.sin(this.camAngleH) * dist;
        const cy = height + Math.sin(this.camAngleV) * dist * 0.5;
        const cz = tz - Math.cos(this.camAngleH) * dist;

        camera.position.set(
            lerp(camera.position.x, cx, 0.08),
            lerp(camera.position.y, cy, 0.08),
            lerp(camera.position.z, cz, 0.08)
        );
        camera.lookAt(tx, 5, tz);
    }

    updateUI() {
        const hp = this.player.health;
        document.getElementById('health-text').textContent = '❤ ' + Math.ceil(hp);
        document.getElementById('health-fill').style.width = hp + '%';
        document.getElementById('health-fill').style.background = hp > 50 ? '#0f0' : hp > 25 ? '#ff0' : '#f00';

        document.getElementById('money-display').textContent = '$ ' + this.player.money.toLocaleString();

        const stars = Math.floor(this.wantedLevel);
        let str = '';
        for (let i = 0; i < 5; i++) str += i < stars ? '★' : '☆';
        const wd = document.getElementById('wanted-display');
        wd.textContent = str;
        wd.style.color = stars > 0 ? '#ff0000' : '#555';

        const sd = document.getElementById('speed-display');
        if (this.player.inVehicle) {
            sd.style.display = 'block';
            sd.textContent = Math.round(Math.abs(this.player.inVehicle.speed) * 120) + ' km/h';
        } else {
            sd.style.display = 'none';
        }
    }

    drawMinimap() {
        const ctx = this.minimapCtx;
        const mw = 170, mh = 170;
        const scale = mw / W;

        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, mw, mh);

        // Roads
        ctx.fillStyle = '#333';
        for (let i = BLOCK; i < W; i += BLOCK) {
            const ri = (i - W / 2 + W / 2) * scale;
            ctx.fillRect(ri - 2, 0, 4, mh);
            ctx.fillRect(0, ri - 2, mw, 4);
        }

        // Player
        const pp = this.player.inVehicle || this.player;
        const px = (pp.x + W / 2) * scale;
        const pz = (pp.z + W / 2) * scale;
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(px, pz, 4, 0, Math.PI * 2);
        ctx.fill();

        // Police
        ctx.fillStyle = '#0000ff';
        for (const c of this.police) {
            if (!c.alive) continue;
            ctx.fillRect((c.x + W / 2) * scale - 1, (c.z + W / 2) * scale - 1, 3, 3);
        }

        // Vehicles
        ctx.fillStyle = '#888';
        for (const v of this.vehicles) {
            ctx.fillRect((v.x + W / 2) * scale - 1, (v.z + W / 2) * scale - 1, 2, 2);
        }
    }

    render() {
        renderer.render(scene, camera);
    }
}

// ===================== GAME LOOP =====================
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    game = new Game3D();
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (game) {
        game.update();
        game.render();
    }
}
