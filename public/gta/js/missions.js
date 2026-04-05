// ===== MISSION SYSTEM =====
class MissionSystem {
    constructor() {
        this.missions = [
            {
                id: 'collect_money',
                title: 'Geldsammler',
                description: 'Sammle $2000',
                target: 2000,
                type: 'collect_money',
                reward: 1000,
                active: false,
                completed: false,
            },
            {
                id: 'speed_demon',
                title: 'Speed Demon',
                description: 'Erreiche Höchstgeschwindigkeit in einem Sportwagen',
                target: 8,
                type: 'reach_speed',
                reward: 1500,
                active: false,
                completed: false,
            },
            {
                id: 'taxi_driver',
                title: 'Taxifahrer',
                description: 'Finde und fahre ein Taxi',
                type: 'drive_taxi',
                reward: 800,
                active: false,
                completed: false,
            },
            {
                id: 'survivor',
                title: 'Überlebender',
                description: 'Überlebe 3 Sterne Fahndungslevel',
                target: 3,
                type: 'survive_wanted',
                reward: 3000,
                active: false,
                completed: false,
            },
            {
                id: 'explorer',
                title: 'Entdecker',
                description: 'Besuche alle 4 Ecken der Stadt',
                type: 'visit_corners',
                reward: 2000,
                active: false,
                completed: false,
                corners: { tl: false, tr: false, bl: false, br: false },
            },
        ];
        this.currentMission = null;
        this.missionMarkers = [];
        this.completedCount = 0;
    }

    startMission(id) {
        const m = this.missions.find(m => m.id === id);
        if (m && !m.completed) {
            m.active = true;
            this.currentMission = m;
            return m;
        }
        return null;
    }

    getNextAvailable() {
        return this.missions.find(m => !m.completed && !m.active);
    }

    autoStartNext() {
        if (this.currentMission && !this.currentMission.completed) return;
        const next = this.getNextAvailable();
        if (next) {
            this.startMission(next.id);
            return next;
        }
        return null;
    }

    checkCompletion(game) {
        const m = this.currentMission;
        if (!m || m.completed) return null;

        let completed = false;

        switch (m.type) {
            case 'collect_money':
                if (game.player.money >= m.target) completed = true;
                break;
            case 'reach_speed':
                if (game.player.inVehicle && Math.abs(game.player.inVehicle.speed) >= m.target) completed = true;
                break;
            case 'drive_taxi':
                if (game.player.inVehicle && game.player.inVehicle.type === 'taxi') completed = true;
                break;
            case 'survive_wanted':
                if (game.wantedLevel >= m.target && game.wantedTimer > 300) completed = true;
                break;
            case 'visit_corners':
                const p = game.player.inVehicle || game.player;
                const margin = 300;
                if (p.x < margin && p.y < margin) m.corners.tl = true;
                if (p.x > CONFIG.WORLD_WIDTH - margin && p.y < margin) m.corners.tr = true;
                if (p.x < margin && p.y > CONFIG.WORLD_HEIGHT - margin) m.corners.bl = true;
                if (p.x > CONFIG.WORLD_WIDTH - margin && p.y > CONFIG.WORLD_HEIGHT - margin) m.corners.br = true;
                if (m.corners.tl && m.corners.tr && m.corners.bl && m.corners.br) completed = true;
                break;
        }

        if (completed) {
            m.completed = true;
            m.active = false;
            this.completedCount++;
            game.player.money += m.reward;
            this.currentMission = null;
            return m;
        }
        return null;
    }
}

// ===== MISSION MARKER =====
class MissionMarker {
    constructor(x, y, label) {
        this.x = x;
        this.y = y;
        this.label = label;
        this.phase = 0;
    }

    draw(ctx) {
        this.phase += 0.05;
        const scale = 1 + Math.sin(this.phase) * 0.2;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);

        // Arrow pointing down
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(-10, -45);
        ctx.lineTo(10, -45);
        ctx.closePath();
        ctx.fill();

        // Circle
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.label, 0, -50);

        ctx.restore();
    }
}
