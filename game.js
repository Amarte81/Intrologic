// game.js - 3D Isometric Rendering & Animation Engine for Intrologic (WALL-E Style)

var canvas, ctx;
var BASE_TILE_W = 40;
var BASE_TILE_H = 20;
var BASE_BLOCK_H = 18;

var TILE_W = BASE_TILE_W;
var TILE_H = BASE_TILE_H;
var BLOCK_H = BASE_BLOCK_H;
var currentScale = 1.0;
var originX = 0;
var originY = 0;
var currentLevelBounds = null;

var currentLevel = null;
var bot = null;
var litTargets = [];
var currentTargetTiles = [];

// Color palette - WALL-E Palette
var COL = {
    top:      '#b8dff8',
    left:     '#7ab8db',
    right:    '#5a9aba',
    edge:     '#4a88a8',
    tgtOff:   '#5566ee',
    tgtOffL:  '#3344bb',
    tgtOffR:  '#2233aa',
    tgtOn:    '#ffe944',
    tgtOnL:   '#ccb820',
    tgtOnR:   '#aa9818',
    
    walleTop:    '#e5a435', // Warm rusty gold top
    walleLeft:   '#b87c1e', // Shadowed left
    walleRight:  '#8c5b0d', // Shadowed right
    walleEdge:   '#2b2214', // Dark outline
    walleDark:   '#30363d', // Dark steel chassis/treads
    walleLight:  '#c4cbd4', // Aluminum/silver joints
    walleRed:    '#d32f2f', // WALL-E Logo patch
    walleGreen:  '#39ff14', // Solar LED bar
    walleEye:    '#00f0ff', // Glowing lens sensor
    walleGlass:  '#0d1622', // Camera lens glass
    shadow:      'rgba(0,0,0,0.25)'
};

var bodyCol = {
    top: COL.walleTop, bottom: COL.walleDark,
    left: COL.walleLeft, right: COL.walleRight,
    front: COL.walleTop, back: COL.walleLeft, edge: COL.walleEdge
};
var treadCol = {
    top: '#2a2f35', bottom: '#15181c',
    left: '#2a2f35', right: '#15181c',
    front: '#15181c', back: '#15181c', edge: '#0a0c0f'
};
var eyeCol = {
    top: COL.walleLight, bottom: COL.walleLight,
    left: COL.walleLight, right: COL.walleLight,
    front: '#111', back: COL.walleLight, edge: '#111'
};
var neckCol = {
    front: COL.walleLight, back: COL.walleLight,
    left: COL.walleLight, right: COL.walleLight, edge: COL.walleDark
};

// --- Animation State ---
var animState = {
    active: false, cmd: null, startTime: 0, duration: 300, onComplete: null,
    dx: 0, dy: 0, dz: 0, theta: 0, squashY: 1, squashX: 1,
    armSwing: 0, footPhase: 0, lightIntensity: 0,
    startDir: 1, targetDir: 1
};

var idleTime = 0;
var animFrameReq = null;

function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', function() { resizeCanvas(); draw(); });
    startMainLoop();
}

function resizeCanvas() {
    var container = document.getElementById('canvas-container');
    if (!container) return;
    var w = Math.max(container.clientWidth || 600, 200);
    var h = Math.max(container.clientHeight || 500, 200);
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }
}

function initGame(levelIndex) {
    if (!canvas) initCanvas();
    resizeCanvas();
    currentLevel = JSON.parse(JSON.stringify(levels[levelIndex]));
    currentLevelBounds = computeLevelBaseBounds(currentLevel.grid);
    resetBot();
    updateCamera();
    draw();
}

function resetBot() {
    if (!currentLevel) return;
    if (!currentLevelBounds) {
        currentLevelBounds = computeLevelBaseBounds(currentLevel.grid);
    }
    var g = currentLevel.grid;
    var bx = currentLevel.bot.x, by = currentLevel.bot.y;
    if (by >= 0 && by < g.length && bx >= 0 && bx < g[by].length) {
        bot = { x: bx, y: by, z: g[by][bx], dir: currentLevel.bot.dir };
    } else {
        bot = { x: 0, y: 0, z: 1, dir: 1 };
    }
    litTargets = [];
    currentTargetTiles = JSON.parse(JSON.stringify(currentLevel.targets));
    resetAnimState();
    animState.theta = (bot.dir - 1) * Math.PI / 2;
}

function resetAnimState() {
    animState.active = false; animState.cmd = null;
    animState.dx = 0; animState.dy = 0; animState.dz = 0;
    animState.squashY = 1; animState.squashX = 1;
    animState.armSwing = 0; animState.footPhase = 0; animState.lightIntensity = 0;
    animState.onComplete = null;
}

function startMainLoop() {
    if (animFrameReq) cancelAnimationFrame(animFrameReq);
    function loop(now) {
        idleTime = now;
        updateAnimation(now);
        draw();
        animFrameReq = requestAnimationFrame(loop);
    }
    animFrameReq = requestAnimationFrame(loop);
}

function updateAnimation(now) {
    if (!animState.active && bot) {
        animState.theta = (bot.dir - 1) * Math.PI / 2;
        animState.dx = 0; animState.dy = 0; animState.dz = 0;
        animState.squashY = 1; animState.squashX = 1;
        animState.armSwing = 0; animState.footPhase = 0;
        return;
    }
    var elapsed = now - animState.startTime;
    var p = elapsed / animState.duration;
    
    if (p < 0) p = 0; // Fix negative elapsed time causing glitch frames

    if (p >= 1) {
        // Snap to final state before doing anything else
        animState.active = false;
        animState.dx = 0; animState.dy = 0; animState.dz = 0;
        animState.squashY = 1; animState.squashX = 1;
        animState.armSwing = 0; animState.footPhase = 0; animState.lightIntensity = 0;
        if (bot) animState.theta = (bot.dir - 1) * Math.PI / 2;
        animState.cmd = null;
        // Call the completion callback last — it may trigger the next animation
        var cb = animState.onComplete;
        animState.onComplete = null;
        if (cb) cb();
        return;
    }

    var easeOutQuad = function(t) { return t * (2 - t); };
    var easeInOutCubic = function(t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; };

    if (animState.cmd === 'forward') {
        var ep = easeInOutCubic(p);
        animState.dx = (animState.targetPos.x - animState.startPos.x) * (ep - 1);
        animState.dy = (animState.targetPos.y - animState.startPos.y) * (ep - 1);
        animState.dz = Math.sin(p * Math.PI) * 0.12; 
        animState.footPhase = p * 16;
        animState.armSwing = Math.sin(p * Math.PI * 2) * 0.3;
        animState.theta = (animState.targetDir - 1) * Math.PI / 2;
    } else if (animState.cmd === 'jump') {
        var epJ = easeOutQuad(p);
        animState.dx = (animState.targetPos.x - animState.startPos.x) * (epJ - 1);
        animState.dy = (animState.targetPos.y - animState.startPos.y) * (epJ - 1);
        var startZ = animState.startPos.z, targetZ = animState.targetPos.z;
        var arc = Math.sin(p * Math.PI) * (1.2 + Math.abs(targetZ - startZ) * 0.25);
        animState.dz = startZ + (targetZ - startZ) * p + arc - targetZ;

        if (p < 0.25) {
            animState.squashY = 0.85 + (p / 0.25) * 0.3;
            animState.squashX = 1.1 - (p / 0.25) * 0.2;
        } else if (p > 0.75) {
            var lp = (p - 0.75) / 0.25;
            animState.squashY = 1.15 - lp * 0.3;
            animState.squashX = 0.9 + lp * 0.2;
        } else {
            animState.squashY = 1.15; animState.squashX = 0.9;
        }
        animState.armSwing = Math.sin(p * Math.PI) * 0.5;
        animState.theta = (animState.targetDir - 1) * Math.PI / 2;
    } else if (animState.cmd === 'left' || animState.cmd === 'right') {
        var startTheta = (animState.startDir - 1) * Math.PI / 2;
        var endTheta = (animState.targetDir - 1) * Math.PI / 2;
        while (endTheta - startTheta > Math.PI) endTheta -= Math.PI * 2;
        while (endTheta - startTheta < -Math.PI) endTheta += Math.PI * 2;
        animState.theta = startTheta + (endTheta - startTheta) * easeInOutCubic(p);
    } else if (animState.cmd === 'light') {
        animState.lightIntensity = Math.sin(p * Math.PI);
        animState.dz = Math.sin(p * Math.PI * 2) * 0.1;
        animState.theta = (animState.targetDir - 1) * Math.PI / 2;
    }
}

function triggerAnimation(cmd, startData, targetData, duration, callback) {
    // Reset everything first
    animState.active = false;
    animState.cmd = null;
    animState.dx = 0; animState.dy = 0; animState.dz = 0;
    animState.squashY = 1; animState.squashX = 1;
    animState.armSwing = 0; animState.footPhase = 0; animState.lightIntensity = 0;

    // Now set all fields atomically
    animState.startPos = startData;
    animState.targetPos = targetData;
    animState.startDir = startData.dir;
    animState.targetDir = targetData.dir;
    animState.cmd = cmd;
    animState.duration = duration || 280;
    animState.onComplete = callback;

    // Pre-compute the initial frame offset so the bot doesn't flash at its
    // final position for one frame before the animation loop picks it up.
    // For forward/jump: bot.x is already at the target, so at p=0 we need
    // dx = -(target.x - start.x) to visually place it back at the start.
    if (cmd === 'forward' || cmd === 'jump') {
        animState.dx = -(targetData.x - startData.x);
        animState.dy = -(targetData.y - startData.y);
        if (cmd === 'jump') {
            animState.dz = startData.z - targetData.z;
        }
    }
    // For rotation: set theta to the start angle immediately
    if (cmd === 'left' || cmd === 'right') {
        animState.theta = (startData.dir - 1) * Math.PI / 2;
    }

    // Use performance.now() captured right now as the reference time.
    // The main loop will read this on the very next frame.
    animState.startTime = performance.now();
    animState.active = true;
}

function computeLevelBaseBounds(grid) {
    if (!grid || !grid.length) {
        return {
            minX: -BASE_TILE_W, maxX: BASE_TILE_W, minY: -BASE_TILE_H, maxY: BASE_TILE_H + BASE_BLOCK_H,
            width: BASE_TILE_W * 2, height: BASE_TILE_H * 2 + BASE_BLOCK_H, midX: 0, midY: 0
        };
    }
    var rows = grid.length;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var gy = 0; gy < rows; gy++) {
        var row = grid[gy] || [];
        for (var gx = 0; gx < row.length; gx++) {
            var h = row[gx] || 0;
            if (h > 0) {
                var isoX = (gx - gy) * BASE_TILE_W;
                for (var gz = 1; gz <= h; gz++) {
                    var isoY = (gx + gy) * BASE_TILE_H - gz * BASE_BLOCK_H;
                    minX = Math.min(minX, isoX - BASE_TILE_W);
                    maxX = Math.max(maxX, isoX + BASE_TILE_W);
                    minY = Math.min(minY, isoY - BASE_TILE_H);
                    maxY = Math.max(maxY, isoY + BASE_TILE_H + BASE_BLOCK_H);
                }
                // Headroom for the bot standing or jumping on this tile
                var botHeadIsoY = (gx + gy) * BASE_TILE_H - (h + 2.2) * BASE_BLOCK_H;
                minY = Math.min(minY, botHeadIsoY);
            }
        }
    }
    if (minX === Infinity) {
        minX = -BASE_TILE_W; maxX = BASE_TILE_W;
        minY = -BASE_TILE_H; maxY = BASE_TILE_H + BASE_BLOCK_H;
    }
    return {
        minX: minX, maxX: maxX, minY: minY, maxY: maxY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
        midX: (minX + maxX) / 2,
        midY: (minY + maxY) / 2
    };
}

function updateCamera() {
    if (!currentLevel || !canvas) return;
    if (!currentLevelBounds) {
        currentLevelBounds = computeLevelBaseBounds(currentLevel.grid);
    }
    
    // Check if contextual tutorial banner is visible and taking vertical room
    var banner = document.getElementById('level-instruction-banner');
    var topPadding = 20;
    if (banner && !banner.classList.contains('hidden') && banner.offsetHeight > 0) {
        topPadding = Math.max(topPadding, banner.offsetTop + banner.offsetHeight + 14);
    }
    var bottomPadding = 20;
    var sidePadding = 20;
    
    var availW = Math.max(50, canvas.width - sidePadding * 2);
    var availH = Math.max(50, canvas.height - topPadding - bottomPadding);
    
    var scaleX = availW / currentLevelBounds.width;
    var scaleY = availH / currentLevelBounds.height;
    var fitScale = Math.min(scaleX, scaleY);
    
    // Scale level down if it does not fit on screen; cap at 1.0 (original size)
    currentScale = Math.max(0.25, Math.min(1.0, fitScale));
    
    TILE_W = BASE_TILE_W * currentScale;
    TILE_H = BASE_TILE_H * currentScale;
    BLOCK_H = BASE_BLOCK_H * currentScale;
    
    var targetCenterX = canvas.width / 2;
    var targetCenterY = topPadding + availH / 2;
    
    originX = targetCenterX - currentLevelBounds.midX * currentScale;
    originY = targetCenterY - currentLevelBounds.midY * currentScale;
}

function isoToScreen(gx, gy, gz) {
    return {
        x: originX + (gx - gy) * TILE_W,
        y: originY + (gx + gy) * TILE_H - gz * BLOCK_H
    };
}

function fillPolyRaw(pts, color, strokeColor, lineWidth) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth || 1;
        ctx.stroke();
    }
}

function drawBlockAt(gx, gy, gz, isTarget, isLit) {
    var p = isoToScreen(gx, gy, gz);
    var x = p.x, y = p.y, e = COL.edge;
    var topC = COL.top, leftC = COL.left, rightC = COL.right;
    if (isTarget) {
        topC = isLit ? COL.tgtOn : COL.tgtOff;
        leftC = isLit ? COL.tgtOnL : COL.tgtOffL;
        rightC = isLit ? COL.tgtOnR : COL.tgtOffR;
    }
    fillPolyRaw([{x:x-TILE_W, y:y}, {x:x, y:y+TILE_H}, {x:x, y:y+TILE_H+BLOCK_H}, {x:x-TILE_W, y:y+BLOCK_H}], leftC, e);
    fillPolyRaw([{x:x+TILE_W, y:y}, {x:x, y:y+TILE_H}, {x:x, y:y+TILE_H+BLOCK_H}, {x:x+TILE_W, y:y+BLOCK_H}], rightC, e);
    fillPolyRaw([{x:x, y:y-TILE_H}, {x:x+TILE_W, y:y}, {x:x, y:y+TILE_H}, {x:x-TILE_W, y:y}], topC, e);
}

// --- 3D Builder for WALL-E ---
var botPolys = [];

function tPt(lx, ly, lz, pitch) {
    if (pitch) {
        var nly = ly * Math.cos(pitch) - lz * Math.sin(pitch);
        var nlz = ly * Math.sin(pitch) + lz * Math.cos(pitch);
        ly = nly; lz = nlz;
    }
    lx *= animState.squashX;
    ly *= animState.squashX;
    lz *= animState.squashY;
    
    var gx = lx * Math.sin(animState.theta) + ly * Math.cos(animState.theta);
    var gy = -lx * Math.cos(animState.theta) + ly * Math.sin(animState.theta);
    return [gx, gy, lz];
}

function addPoly(v3d, color, edgeColor, depthOff) {
    var proj = [], sx=0, sy=0, sz=0;
    var bx = bot.x + animState.dx, by = bot.y + animState.dy, bz = bot.z + animState.dz;
    for(var i=0; i<v3d.length; i++) {
        var wgx = bx + v3d[i][0], wgy = by + v3d[i][1], wgz = bz + v3d[i][2];
        sx += wgx; sy += wgy; sz += wgz;
        proj.push(isoToScreen(wgx, wgy, wgz));
    }
    if (v3d.length >= 3) {
        var vx1 = v3d[1][0]-v3d[0][0], vy1 = v3d[1][1]-v3d[0][1], vz1 = v3d[1][2]-v3d[0][2];
        var vx2 = v3d[2][0]-v3d[1][0], vy2 = v3d[2][1]-v3d[1][1], vz2 = v3d[2][2]-v3d[1][2];
        var nx = vy1*vz2 - vz1*vy2, ny = vz1*vx2 - vx1*vz2, nz = vx1*vy2 - vy1*vx2;
        if (nx + ny + nz * 2.2222 < 0) return; // Cull backfaces based on camera vector
    }
    var len = v3d.length;
    botPolys.push({ pts: proj, color: color, edge: edgeColor, depth: (sx/len)+(sy/len)+(sz/len)*2.2222+(depthOff||0) });
}

function addCuboid(cx, cy, cz, w, d, h, col, pitch) {
    var hx = w/2, hy = d/2, hz = h/2;
    var v = [
        tPt(cx-hx, cy-hy, cz-hz, pitch), // 0 bl-b
        tPt(cx+hx, cy-hy, cz-hz, pitch), // 1 br-b
        tPt(cx+hx, cy+hy, cz-hz, pitch), // 2 tr-b
        tPt(cx-hx, cy+hy, cz-hz, pitch), // 3 tl-b
        tPt(cx-hx, cy-hy, cz+hz, pitch), // 4 bl-t
        tPt(cx+hx, cy-hy, cz+hz, pitch), // 5 br-t
        tPt(cx+hx, cy+hy, cz+hz, pitch), // 6 tr-t
        tPt(cx-hx, cy+hy, cz+hz, pitch)  // 7 tl-t
    ];
    if(col.front)  addPoly([v[2], v[3], v[7], v[6]], col.front, col.edge);
    if(col.back)   addPoly([v[0], v[1], v[5], v[4]], col.back, col.edge);
    if(col.right)  addPoly([v[1], v[2], v[6], v[5]], col.right, col.edge);
    if(col.left)   addPoly([v[3], v[0], v[4], v[7]], col.left, col.edge);
    if(col.top)    addPoly([v[4], v[5], v[6], v[7]], col.top, col.edge);
    if(col.bottom) addPoly([v[0], v[3], v[2], v[1]], col.bottom, col.edge);
}

function drawWallE() {
    if (!bot) return;
    botPolys = [];
    
    // Body
    addCuboid(0, 0, 0.45, 0.55, 0.55, 0.5, bodyCol);
    
    // Front Panel Details (Logo and Solar)
    var fw=0.12, fh=0.08, fcy=0.28, fcz=0.55;
    addPoly([
        tPt(-0.1+fw, fcy, fcz-fh), tPt(-0.1-fw, fcy, fcz-fh),
        tPt(-0.1-fw, fcy, fcz+fh), tPt(-0.1+fw, fcy, fcz+fh)
    ], COL.walleRed, '#800000', 0.01);
    
    for(var i=0; i<4; i++) {
        var lx = 0.06 + i * 0.06, lfw=0.02, lfh=0.03;
        addPoly([
            tPt(lx+lfw, fcy, fcz-lfh), tPt(lx-lfw, fcy, fcz-lfh),
            tPt(lx-lfw, fcy, fcz+lfh), tPt(lx+lfw, fcy, fcz+lfh)
        ], COL.walleGreen, null, 0.01);
    }
    
    // Treads
    addCuboid(-0.35, 0, 0.15, 0.15, 0.7, 0.3, treadCol);
    addCuboid(0.35, 0, 0.15, 0.15, 0.7, 0.3, treadCol);
    
    // Neck
    addCuboid(0, -0.05, 0.8, 0.08, 0.08, 0.2, neckCol);
    
    // Eyes (Binoculars)
    var pitch = -0.15;
    if (animState.lightIntensity > 0) pitch = 0.1; 
    addCuboid(-0.13, 0.05, 0.95, 0.22, 0.25, 0.15, eyeCol, pitch);
    addCuboid(0.13, 0.05, 0.95, 0.22, 0.25, 0.15, eyeCol, pitch);
    
    // Glowing Lenses
    var glow = animState.lightIntensity > 0 ? '#ffffff' : COL.walleEye;
    addPoly([
        tPt(-0.13+0.06, 0.18, 0.95-0.05, pitch), tPt(-0.13-0.06, 0.18, 0.95-0.05, pitch),
        tPt(-0.13-0.06, 0.18, 0.95+0.05, pitch), tPt(-0.13+0.06, 0.18, 0.95+0.05, pitch)
    ], glow, '#fff', 0.02);
    addPoly([
        tPt(0.13+0.06, 0.18, 0.95-0.05, pitch), tPt(0.13-0.06, 0.18, 0.95-0.05, pitch),
        tPt(0.13-0.06, 0.18, 0.95+0.05, pitch), tPt(0.13+0.06, 0.18, 0.95+0.05, pitch)
    ], glow, '#fff', 0.02);
    
    // Arms
    var swing = animState.armSwing * 0.2;
    addCuboid(-0.35, swing, 0.5, 0.05, 0.4, 0.05, neckCol);
    addCuboid(0.35, -swing, 0.5, 0.05, 0.4, 0.05, neckCol);

    botPolys.sort(function(a, b) { return a.depth - b.depth; });
    for (var i=0; i<botPolys.length; i++) {
        fillPolyRaw(botPolys[i].pts, botPolys[i].color, botPolys[i].edge, 1);
    }
    
    // Laser Beam Effect
    if (animState.lightIntensity > 0) {
        var bx = bot.x + animState.dx, by = bot.y + animState.dy, bz = bot.z + animState.dz;
        var srcL = isoToScreen(bx + tPt(-0.13, 0.2, 0.95, pitch)[0], by + tPt(-0.13, 0.2, 0.95, pitch)[1], bz + 0.95);
        var srcR = isoToScreen(bx + tPt(0.13, 0.2, 0.95, pitch)[0], by + tPt(0.13, 0.2, 0.95, pitch)[1], bz + 0.95);
        var tgt = isoToScreen(bx, by, bz);
        
        // Laser Beam Effect
        var beamW = 25 * currentScale, beamH = 10 * currentScale;
        ctx.save();
        ctx.globalAlpha = animState.lightIntensity * 0.7;
        ctx.fillStyle = 'rgba(255, 235, 59, 0.5)';
        ctx.beginPath(); ctx.moveTo(srcL.x, srcL.y); ctx.lineTo(tgt.x - beamW, tgt.y + beamH); ctx.lineTo(tgt.x + beamW, tgt.y + beamH); ctx.fill();
        ctx.beginPath(); ctx.moveTo(srcR.x, srcR.y); ctx.lineTo(tgt.x - beamW, tgt.y + beamH); ctx.lineTo(tgt.x + beamW, tgt.y + beamH); ctx.fill();
        ctx.restore();
    }
}

function draw() {
    if (!canvas || !ctx) {
        initCanvas();
        if (!canvas || !ctx) return;
    }
    resizeCanvas();
    updateCamera();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!currentLevel) return;

    var grid = currentLevel.grid;
    var rows = grid.length, cols = 0;
    for (var r = 0; r < rows; r++) if (grid[r].length > cols) cols = grid[r].length;

    var items = [];
    for (var gy = 0; gy < rows; gy++) {
        for (var gx = 0; gx < cols; gx++) {
            var h = (grid[gy] && grid[gy][gx]) ? grid[gy][gx] : 0;
            if (h > 0) {
                var isTarget = false, isLit = false;
                for (var t = 0; t < currentTargetTiles.length; t++) {
                    if (currentTargetTiles[t].x === gx && currentTargetTiles[t].y === gy) { isTarget = true; break; }
                }
                for (var t2 = 0; t2 < litTargets.length; t2++) {
                    if (litTargets[t2].x === gx && litTargets[t2].y === gy) { isLit = true; break; }
                }
                for (var z = 1; z <= h; z++) {
                    items.push({ type: 'block', gx: gx, gy: gy, gz: z, isTarget: (z === h) && isTarget, isLit: isLit, sortKey: (gx + gy) * 1000 + z });
                }
            }
        }
    }

    if (bot) {
        var bgx = bot.x + animState.dx, bgy = bot.y + animState.dy, bgz = bot.z + animState.dz;
        var sortX = Math.round(bgx);
        var sortY = Math.round(bgy);
        var sortZ = Math.floor(bgz);
        items.push({ type: 'bot', gx: bgx, gy: bgy, gz: bgz, sortKey: (sortX + sortY) * 1000 + sortZ + 0.5 });
    }

    items.sort(function(a, b) { return a.sortKey - b.sortKey; });

    for (var i = 0; i < items.length; i++) {
        if (items[i].type === 'block') drawBlockAt(items[i].gx, items[i].gy, items[i].gz, items[i].isTarget, items[i].isLit);
        else drawWallE();
    }
}

window.gameRender = draw;
window.initCanvas = initCanvas;
window.triggerAnimation = triggerAnimation;
