// ===== CITY GENERATION =====
class City {
    constructor() {
        this.roads = [];
        this.buildings = [];
        this.sidewalks = [];
        this.parks = [];
        this.waterAreas = [];
        this.generate();
    }

    generate() {
        const W = CONFIG.WORLD_WIDTH;
        const H = CONFIG.WORLD_HEIGHT;
        const BS = CONFIG.BLOCK_SIZE;
        const roadW = 60;
        const sidewalkW = 15;

        // Create grid roads
        for (let x = BS; x < W; x += BS) {
            this.roads.push({ x: x - roadW / 2, y: 0, w: roadW, h: H });
            this.sidewalks.push({ x: x - roadW / 2 - sidewalkW, y: 0, w: sidewalkW, h: H });
            this.sidewalks.push({ x: x + roadW / 2, y: 0, w: sidewalkW, h: H });
        }
        for (let y = BS; y < H; y += BS) {
            this.roads.push({ x: 0, y: y - roadW / 2, w: W, h: roadW });
            this.sidewalks.push({ x: 0, y: y - roadW / 2 - sidewalkW, w: W, h: sidewalkW });
            this.sidewalks.push({ x: 0, y: y + roadW / 2, w: W, h: sidewalkW });
        }

        // Add a river
        this.waterAreas.push({ x: W * 0.7, y: 0, w: 120, h: H });

        // Generate buildings in each block
        const margin = roadW / 2 + sidewalkW + 5;
        for (let bx = 0; bx < W / BS; bx++) {
            for (let by = 0; by < H / BS; by++) {
                const blockX = bx * BS + margin;
                const blockY = by * BS + margin;
                const blockW = BS - margin * 2;
                const blockH = BS - margin * 2;

                if (blockW <= 0 || blockH <= 0) continue;

                // Check if in water
                const centerX = blockX + blockW / 2;
                if (centerX > W * 0.7 - 20 && centerX < W * 0.7 + 140) continue;

                // Some blocks are parks
                if (Math.random() < 0.15) {
                    this.parks.push({ x: blockX, y: blockY, w: blockW, h: blockH, trees: this.generateTrees(blockX, blockY, blockW, blockH) });
                    continue;
                }

                // Fill block with buildings
                this.fillBlockWithBuildings(blockX, blockY, blockW, blockH);
            }
        }
    }

    fillBlockWithBuildings(bx, by, bw, bh) {
        const minSize = 40;
        const maxSize = 120;
        let attempts = 0;

        while (attempts < 15) {
            const w = randInt(minSize, Math.min(maxSize, bw - 10));
            const h = randInt(minSize, Math.min(maxSize, bh - 10));
            const x = randInt(bx, bx + bw - w);
            const y = randInt(by, by + bh - h);

            const building = { x, y, w, h, color: randColor(CONFIG.BUILDING_COLORS), height: randInt(2, 8) };

            let overlaps = false;
            for (const b of this.buildings) {
                if (rectOverlap({ x: x - 5, y: y - 5, w: w + 10, h: h + 10 }, b)) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                this.buildings.push(building);
            }
            attempts++;
        }
    }

    generateTrees(px, py, pw, ph) {
        const trees = [];
        const count = randInt(5, 15);
        for (let i = 0; i < count; i++) {
            trees.push({
                x: px + randFloat(10, pw - 10),
                y: py + randFloat(10, ph - 10),
                r: randFloat(8, 18),
                shade: `rgb(${randInt(20, 50)}, ${randInt(100, 160)}, ${randInt(20, 50)})`
            });
        }
        return trees;
    }

    isRoad(x, y) {
        for (const r of this.roads) {
            if (pointInRect(x, y, r)) return true;
        }
        return false;
    }

    isBuilding(x, y, padding = 0) {
        for (const b of this.buildings) {
            if (x >= b.x - padding && x <= b.x + b.w + padding &&
                y >= b.y - padding && y <= b.y + b.h + padding) return true;
        }
        return false;
    }

    isWater(x, y) {
        for (const w of this.waterAreas) {
            if (pointInRect(x, y, w)) return true;
        }
        return false;
    }

    draw(ctx, cam) {
        // Background grass
        ctx.fillStyle = CONFIG.GRASS_COLOR;
        ctx.fillRect(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);

        // Water
        ctx.fillStyle = CONFIG.WATER_COLOR;
        for (const w of this.waterAreas) {
            ctx.fillRect(w.x, w.y, w.w, w.h);
            // Water shimmer
            ctx.fillStyle = 'rgba(100, 180, 255, 0.1)';
            for (let wy = w.y; wy < w.y + w.h; wy += 20) {
                const offset = Math.sin(Date.now() / 1000 + wy * 0.1) * 5;
                ctx.fillRect(w.x + offset, wy, w.w, 2);
            }
            ctx.fillStyle = CONFIG.WATER_COLOR;
        }

        // Roads
        ctx.fillStyle = CONFIG.ROAD_COLOR;
        for (const r of this.roads) {
            if (this.inView(r, cam)) ctx.fillRect(r.x, r.y, r.w, r.h);
        }

        // Road markings (dashed center lines)
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 20]);
        for (const r of this.roads) {
            if (!this.inView(r, cam)) continue;
            ctx.beginPath();
            if (r.w > r.h) {
                ctx.moveTo(r.x, r.y + r.h / 2);
                ctx.lineTo(r.x + r.w, r.y + r.h / 2);
            } else {
                ctx.moveTo(r.x + r.w / 2, r.y);
                ctx.lineTo(r.x + r.w / 2, r.y + r.h);
            }
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Sidewalks
        ctx.fillStyle = CONFIG.SIDEWALK_COLOR;
        for (const s of this.sidewalks) {
            if (this.inView(s, cam)) ctx.fillRect(s.x, s.y, s.w, s.h);
        }

        // Parks
        for (const p of this.parks) {
            if (!this.inView(p, cam)) continue;
            ctx.fillStyle = '#2d6b1e';
            ctx.fillRect(p.x, p.y, p.w, p.h);
            for (const t of p.trees) {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.arc(t.x + 3, t.y + 3, t.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = t.shade;
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Buildings
        for (const b of this.buildings) {
            if (!this.inView(b, cam)) continue;
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(b.x + 4, b.y + 4, b.w, b.h);
            // Building
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.w, b.h);
            // Roof line
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(b.x, b.y, b.w, 4);
            ctx.fillRect(b.x, b.y, 4, b.h);
            // Windows
            ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
            const winSize = 6;
            const winGap = 16;
            for (let wx = b.x + 10; wx < b.x + b.w - 10; wx += winGap) {
                for (let wy = b.y + 10; wy < b.y + b.h - 10; wy += winGap) {
                    ctx.fillRect(wx, wy, winSize, winSize);
                }
            }
        }
    }

    inView(r, cam) {
        return r.x + r.w > cam.x - 50 && r.x < cam.x + cam.w + 50 &&
               r.y + r.h > cam.y - 50 && r.y < cam.y + cam.h + 50;
    }
}
