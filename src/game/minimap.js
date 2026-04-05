const canvas = document.getElementById('minimap-canvas');
const ctx = canvas.getContext('2d');
const SIZE = 150;
const ARENA = 80;
const SCALE = SIZE / ARENA;

export function updateMinimap(player, enemies) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Background
    ctx.fillStyle = 'rgba(10, 10, 30, 0.8)';
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Grid
    ctx.strokeStyle = 'rgba(50, 50, 100, 0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
        const pos = (i / 4) * SIZE;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(SIZE, pos);
        ctx.stroke();
    }

    // Enemies
    enemies.forEach(e => {
        if (!e.alive) return;
        const ex = (e.position.x / ARENA + 0.5) * SIZE;
        const ez = (e.position.z / ARENA + 0.5) * SIZE;

        ctx.fillStyle = '#' + e.color.toString(16).padStart(6, '0');
        ctx.beginPath();
        ctx.arc(ex, ez, 3, 0, Math.PI * 2);
        ctx.fill();

        // Red glow
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(ex, ez, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Player
    const px = (player.position.x / ARENA + 0.5) * SIZE;
    const pz = (player.position.z / ARENA + 0.5) * SIZE;

    // Player direction indicator
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
    ctx.lineWidth = 1.5;
    const dirLen = 12;
    const angle = -player.euler.y - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(px, pz);
    ctx.lineTo(px + Math.cos(angle) * dirLen, pz - Math.sin(angle) * dirLen);
    ctx.stroke();

    // Player dot
    ctx.fillStyle = '#00ccff';
    ctx.beginPath();
    ctx.arc(px, pz, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(px, pz, 7, 0, Math.PI * 2);
    ctx.fill();
}
