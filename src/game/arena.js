import * as THREE from 'three';

export function createArena(scene) {
    const ARENA_SIZE = 80;

    // ─── Ground ───
    const groundGeo = new THREE.PlaneGeometry(ARENA_SIZE, ARENA_SIZE, 40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.3,
        roughness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid overlay
    const gridHelper = new THREE.GridHelper(ARENA_SIZE, 40, 0x222244, 0x111133);
    gridHelper.position.y = 0.01;
    gridHelper.material.opacity = 0.4;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // ─── Walls ───
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x2a1a3e,
        metalness: 0.5,
        roughness: 0.4,
        emissive: 0x110022,
        emissiveIntensity: 0.3,
    });

    const wallHeight = 6;
    const wallThickness = 2;
    const half = ARENA_SIZE / 2;

    const wallConfigs = [
        { w: ARENA_SIZE + wallThickness * 2, d: wallThickness, x: 0, z: -half - wallThickness / 2 },
        { w: ARENA_SIZE + wallThickness * 2, d: wallThickness, x: 0, z: half + wallThickness / 2 },
        { w: wallThickness, d: ARENA_SIZE, x: -half - wallThickness / 2, z: 0 },
        { w: wallThickness, d: ARENA_SIZE, x: half + wallThickness / 2, z: 0 },
    ];

    wallConfigs.forEach(cfg => {
        const geo = new THREE.BoxGeometry(cfg.w, wallHeight, cfg.d);
        const wall = new THREE.Mesh(geo, wallMat);
        wall.position.set(cfg.x, wallHeight / 2, cfg.z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData.isWall = true;
        scene.add(wall);
    });

    // ─── Neon border strips on walls ───
    const neonColors = [0x00ffff, 0xff00ff, 0x00ff44, 0xff4400];
    wallConfigs.forEach((cfg, i) => {
        const neonGeo = new THREE.BoxGeometry(
            cfg.w + 0.1,
            0.3,
            cfg.d + 0.1
        );
        const neonMat = new THREE.MeshStandardMaterial({
            color: neonColors[i],
            emissive: neonColors[i],
            emissiveIntensity: 2,
        });
        const neon = new THREE.Mesh(neonGeo, neonMat);
        neon.position.set(cfg.x, wallHeight - 0.5, cfg.z);
        scene.add(neon);
    });

    // ─── Cover Objects (Obstacles) ───
    const obstacleMat = new THREE.MeshStandardMaterial({
        color: 0x334455,
        metalness: 0.6,
        roughness: 0.3,
    });

    const obstacles = [
        // Center cross
        { x: 0, z: 0, w: 8, h: 3, d: 2 },
        { x: 0, z: 0, w: 2, h: 3, d: 8 },

        // Corner blocks
        { x: -20, z: -20, w: 5, h: 4, d: 5 },
        { x: 20, z: -20, w: 5, h: 4, d: 5 },
        { x: -20, z: 20, w: 5, h: 4, d: 5 },
        { x: 20, z: 20, w: 5, h: 4, d: 5 },

        // Side walls
        { x: -30, z: 0, w: 2, h: 3, d: 12 },
        { x: 30, z: 0, w: 2, h: 3, d: 12 },
        { x: 0, z: -30, w: 12, h: 3, d: 2 },
        { x: 0, z: 30, w: 12, h: 3, d: 2 },

        // Extra cover
        { x: -12, z: -12, w: 3, h: 2.5, d: 6 },
        { x: 12, z: 12, w: 3, h: 2.5, d: 6 },
        { x: 12, z: -12, w: 6, h: 2.5, d: 3 },
        { x: -12, z: 12, w: 6, h: 2.5, d: 3 },

        // Pillars
        { x: -8, z: -25, w: 2, h: 5, d: 2 },
        { x: 8, z: -25, w: 2, h: 5, d: 2 },
        { x: -8, z: 25, w: 2, h: 5, d: 2 },
        { x: 8, z: 25, w: 2, h: 5, d: 2 },
    ];

    obstacles.forEach(obs => {
        const geo = new THREE.BoxGeometry(obs.w, obs.h, obs.d);
        const mesh = new THREE.Mesh(geo, obstacleMat);
        mesh.position.set(obs.x, obs.h / 2, obs.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.isObstacle = true;
        mesh.userData.size = { w: obs.w, h: obs.h, d: obs.d };
        scene.add(mesh);
    });

    // ─── Decorative cylinders ───
    const cylMat = new THREE.MeshStandardMaterial({
        color: 0x004466,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x001122,
        emissiveIntensity: 0.5,
    });

    const cylinderPositions = [
        [-25, -25], [25, -25], [-25, 25], [25, 25],
    ];
    cylinderPositions.forEach(([x, z]) => {
        const geo = new THREE.CylinderGeometry(1.5, 1.5, 6, 16);
        const cyl = new THREE.Mesh(geo, cylMat);
        cyl.position.set(x, 3, z);
        cyl.castShadow = true;
        cyl.userData.isObstacle = true;
        cyl.userData.radius = 1.5;
        scene.add(cyl);
    });

    // ─── Skybox (simple color gradient via background) ───
    const skyGeo = new THREE.SphereGeometry(200, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
    });

    // Create gradient texture for sky
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#0a0020');
    gradient.addColorStop(0.3, '#0a0a2e');
    gradient.addColorStop(0.7, '#1a0a3e');
    gradient.addColorStop(1, '#0a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add stars
    ctx.fillStyle = 'white';
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 300;
        const size = Math.random() * 2;
        ctx.globalAlpha = Math.random() * 0.8 + 0.2;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;

    skyMat.map = new THREE.CanvasTexture(canvas);
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // ─── Ground glow rings ───
    const ringMat = new THREE.MeshStandardMaterial({
        color: 0x00aaff,
        emissive: 0x0044ff,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.3,
    });
    [10, 20, 30].forEach(radius => {
        const ringGeo = new THREE.RingGeometry(radius - 0.15, radius + 0.15, 64);
        const ring = new THREE.Mesh(ringGeo, ringMat.clone());
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        scene.add(ring);
    });

    return { ARENA_SIZE };
}
