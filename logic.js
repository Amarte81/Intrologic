// logic.js - Game logic and UI controller

var programs = { main: [], p1: [], p2: [] };
var callStack = [];
var executionTimeout = null;
var runMode = 'idle'; // 'idle', 'play', 'step'
var isAnimating = false;
var currentLevelIndex = 0;
var animationSpeed = 300;
var activeRoutine = 'main';

var CMD_TITLE = {
    'forward': 'Avanza di un blocco',
    'left': 'Ruota a sinistra di 90°',
    'right': 'Ruota a destra di 90°',
    'jump': 'Salta su o giù di un blocco',
    'light': 'Accendi la lampadina (su un blocco blu)',
    'p1': 'Esegui Procedura 1 (P1)',
    'p2': 'Esegui Procedura 2 (P2)'
};

// SVG icons for commands (no external dependencies)
var CMD_SVG = {
    'forward': '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(-90 12 12)"/></svg>',
    'left': '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
    'right': '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M11.5 8c2.65 0 5.05.99 6.9 2.6L22 7v9h-9l3.62-3.62C15.23 11.22 13.46 10.5 11.5 10.5c-3.54 0-6.55 2.31-7.6 5.5L1.53 15.22C2.92 11.03 6.85 8 11.5 8z"/></svg>',
    'jump': '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2C9.24 2 7 4.24 7 7c0 1.1.45 2.1 1.17 2.83L12 22l3.83-12.17A4.97 4.97 0 0017 7c0-2.76-2.24-5-5-5zm0 7.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>',
    'light': '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>',
    'p1': 'P1',
    'p2': 'P2'
};

var CMD_SLOT_CLASS = {
    'forward': 'slot-forward',
    'left': 'slot-left',
    'right': 'slot-right',
    'jump': 'slot-jump',
    'light': 'slot-light',
    'p1': 'slot-p1',
    'p2': 'slot-p2'
};

// --- INIT UI ---
function initUI() {
    // Generate level buttons
    for (var i = 0; i < levels.length; i++) {
        (function(idx) {
            var lvl = levels[idx];
            var btn = document.createElement('button');
            btn.className = 'lvl-btn';
            btn.textContent = lvl.id.split('-')[1];
            btn.onclick = function() { loadLevel(idx); };
            var group = document.getElementById('lvl-group-' + lvl.group);
            if (group) group.appendChild(btn);
        })(i);
    }

    document.getElementById('btn-levels').onclick = function() {
        document.getElementById('level-modal').classList.remove('hidden');
    };
    document.getElementById('close-modal').onclick = function() {
        document.getElementById('level-modal').classList.add('hidden');
    };
    document.getElementById('btn-next-level').onclick = function() {
        document.getElementById('win-modal').classList.add('hidden');
        if (currentLevelIndex + 1 < levels.length) {
            loadLevel(currentLevelIndex + 1);
        }
    };
    var replayBtn = document.getElementById('btn-replay-level');
    if (replayBtn) {
        replayBtn.onclick = function() {
            document.getElementById('win-modal').classList.add('hidden');
            stopExecution();
        };
    }

    document.getElementById('btn-play').onclick = togglePlay;
    document.getElementById('btn-step').onclick = stepExecution;
    document.getElementById('btn-stop').onclick = stopExecution;
    document.getElementById('btn-clear').onclick = clearPrograms;

    setupRoutineSlots();
}

function setupRoutineSlots() {
    var mainR = document.querySelector('.main-routine');
    var p1R = document.querySelector('.proc1-routine');
    var p2R = document.querySelector('.proc2-routine');
    if (mainR) mainR.onclick = function() { activeRoutine = 'main'; };
    if (p1R) p1R.onclick = function() { activeRoutine = 'p1'; };
    if (p2R) p2R.onclick = function() { activeRoutine = 'p2'; };

    var btns = document.querySelectorAll('.command-btn');
    for (var i = 0; i < btns.length; i++) {
        (function(btn) {
            btn.onclick = function(e) {
                e.stopPropagation();
                addCommandToRoutine(activeRoutine, btn.getAttribute('data-cmd'));
            };
        })(btns[i]);
    }
}

function addCommandToRoutine(routine, cmd) {
    if (runMode !== 'idle') return;
    var limitKey = routine === 'main' ? 'mainLimit' : routine + 'Limit';
    var limit = currentLevel[limitKey];
    if (programs[routine].length < limit) {
        programs[routine].push(cmd);
        renderRoutine(routine);
    }
}

function removeCommand(routine, index) {
    if (runMode !== 'idle') return;
    programs[routine].splice(index, 1);
    renderRoutine(routine);
}

function clearPrograms() {
    if (runMode !== 'idle') stopExecution();
    programs = { main: [], p1: [], p2: [] };
    renderRoutine('main');
    renderRoutine('p1');
    renderRoutine('p2');
}

function renderRoutine(routine) {
    var container = document.getElementById('slots-' + routine);
    if (!container) return;
    container.innerHTML = '';
    var limitKey = routine === 'main' ? 'mainLimit' : routine + 'Limit';
    var limit = currentLevel[limitKey];

    var countEl = document.getElementById(routine + '-count');
    if (countEl) countEl.textContent = programs[routine].length + '/' + limit;

    for (var i = 0; i < limit; i++) {
        (function(idx) {
            var slot = document.createElement('div');
            slot.className = 'slot';
            if (idx < programs[routine].length) {
                var cmd = programs[routine][idx];
                slot.classList.add(CMD_SLOT_CLASS[cmd] || '');
                slot.innerHTML = CMD_SVG[cmd] || cmd;
                slot.title = CMD_TITLE[cmd] || '';
                slot.onclick = function(e) {
                    e.stopPropagation();
                    removeCommand(routine, idx);
                };
            } else {
                slot.title = 'Clicca su un comando a sinistra per inserirlo qui';
                slot.onclick = function(e) {
                    e.stopPropagation();
                    activeRoutine = routine;
                };
            }
            container.appendChild(slot);
        })(i);
    }
}

function loadLevel(index) {
    document.getElementById('level-modal').classList.add('hidden');
    stopExecution();
    currentLevelIndex = index;
    var lvl = levels[index];
    document.getElementById('level-title').textContent = lvl.title;

    document.getElementById('proc1-container').style.display = lvl.p1Limit > 0 ? 'block' : 'none';
    document.getElementById('proc2-container').style.display = lvl.p2Limit > 0 ? 'block' : 'none';

    var p1Btn = document.querySelector('.cmd-p1');
    var p2Btn = document.querySelector('.cmd-p2');
    if (p1Btn) p1Btn.style.display = lvl.p1Limit > 0 ? 'flex' : 'none';
    if (p2Btn) p2Btn.style.display = lvl.p2Limit > 0 ? 'flex' : 'none';

    var allBtns = document.querySelectorAll('.lvl-btn');
    for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('active');
    if (allBtns[index]) allBtns[index].classList.add('active');

    initGame(index);
    clearPrograms();
    activeRoutine = 'main';
}

// --- EXECUTION WITH ANIMATIONS ---

function togglePlay() {
    if (runMode === 'idle' || runMode === 'step') {
        runMode = 'play';
        document.getElementById('btn-play').disabled = true;
        document.getElementById('btn-step').disabled = true;
        document.getElementById('btn-stop').disabled = false;
        
        if (callStack.length === 0) {
            resetBot();
            callStack = [{ routine: 'main', index: 0 }];
            executeNextCommand(false);
        } else {
            executeNextCommand(false);
        }
    }
}

function stepExecution() {
    if (isAnimating) return;
    
    if (runMode === 'idle') {
        runMode = 'step';
        document.getElementById('btn-play').disabled = false;
        document.getElementById('btn-step').disabled = false;
        document.getElementById('btn-stop').disabled = false;
        
        resetBot();
        callStack = [{ routine: 'main', index: 0 }];
        executeNextCommand(false);
    } else if (runMode === 'step') {
        executeNextCommand(false);
    }
}

function stopExecution() {
    runMode = 'idle';
    isAnimating = false;
    if (executionTimeout) clearTimeout(executionTimeout);
    executionTimeout = null;
    // Kill any in-flight animation callback to prevent ghost actions
    if (typeof animState !== 'undefined') {
        animState.active = false;
        animState.onComplete = null;
    }
    document.getElementById('btn-play').disabled = false;
    document.getElementById('btn-step').disabled = false;
    document.getElementById('btn-stop').disabled = true;

    var slots = document.querySelectorAll('.slot');
    for (var i = 0; i < slots.length; i++) slots[i].classList.remove('active');

    resetBot();
}

function highlightCommand(routine, index) {
    var slots = document.querySelectorAll('.slot');
    for (var i = 0; i < slots.length; i++) slots[i].classList.remove('active');
    var container = document.getElementById('slots-' + routine);
    if (container && container.children[index]) {
        container.children[index].classList.add('active');
    }
}

function executeNextCommand(isInternal) {
    if (runMode === 'idle') return;

    if (callStack.length === 0) {
        if (!checkWinCondition()) {
            showFailModal();
        }
        return;
    }

    var ctx = callStack[callStack.length - 1];
    var routineCode = programs[ctx.routine];

    if (ctx.index >= routineCode.length) {
        callStack.pop();
        executeNextCommand(true); // always auto-pop without waiting for click
        return;
    }

    var cmd = routineCode[ctx.index];
    highlightCommand(ctx.routine, ctx.index);
    
    if (cmd === 'p1' || cmd === 'p2') {
        ctx.index++;
        if (callStack.length > 500) {
            alert("Stack overflow! (Ciclo infinito troppo profondo)");
            stopExecution();
            return;
        }
        callStack.push({ routine: cmd, index: 0 });
        executionTimeout = setTimeout(function() { executeNextCommand(true); }, 50); // Auto-enter without click
        return;
    }

    // Physical action
    ctx.index++;
    isAnimating = true;
    performActionAnimated(cmd, function() {
        isAnimating = false;
        if (runMode === 'idle') return;
        if (checkWinCondition()) return;
        
        if (runMode === 'play') {
            executeNextCommand(false);
        }
    });
}

function performActionAnimated(cmd, onDone) {
    var dxArr = [0, 1, 0, -1]; // N, E, S, W
    var dyArr = [-1, 0, 1, 0];

    var startPos = { x: bot.x, y: bot.y, z: bot.z, dir: bot.dir };
    var targetPos = { x: bot.x, y: bot.y, z: bot.z, dir: bot.dir };

    if (cmd === 'forward') {
        var nx = bot.x + dxArr[bot.dir];
        var ny = bot.y + dyArr[bot.dir];
        if (isValidMove(nx, ny, bot.z)) {
            targetPos.x = nx;
            targetPos.y = ny;
            bot.x = nx;
            bot.y = ny;
        }
    } else if (cmd === 'left') {
        bot.dir = (bot.dir + 3) % 4;
        targetPos.dir = bot.dir;
    } else if (cmd === 'right') {
        bot.dir = (bot.dir + 1) % 4;
        targetPos.dir = bot.dir;
    } else if (cmd === 'jump') {
        var jnx = bot.x + dxArr[bot.dir];
        var jny = bot.y + dyArr[bot.dir];
        if (isInsideGrid(jnx, jny)) {
            var nh = currentLevel.grid[jny][jnx];
            if (nh > 0 && (nh === bot.z + 1 || nh < bot.z)) {
                targetPos.x = jnx;
                targetPos.y = jny;
                targetPos.z = nh;
                bot.x = jnx;
                bot.y = jny;
                bot.z = nh;
            }
        }
    } else if (cmd === 'light') {
        var onTarget = false;
        for (var t = 0; t < currentTargetTiles.length; t++) {
            if (currentTargetTiles[t].x === bot.x && currentTargetTiles[t].y === bot.y) {
                onTarget = true;
                break;
            }
        }
        if (onTarget) {
            var litIdx = -1;
            for (var l = 0; l < litTargets.length; l++) {
                if (litTargets[l].x === bot.x && litTargets[l].y === bot.y) {
                    litIdx = l;
                    break;
                }
            }
            if (litIdx >= 0) {
                litTargets.splice(litIdx, 1);
            } else {
                litTargets.push({ x: bot.x, y: bot.y });
            }
        }
    }

    var duration = cmd === 'jump' ? 340 : (cmd === 'forward' ? 260 : 200);
    if (window.triggerAnimation) {
        window.triggerAnimation(cmd, startPos, targetPos, duration, onDone);
    } else {
        setTimeout(onDone, duration);
    }
}

function isInsideGrid(x, y) {
    if (!currentLevel || !currentLevel.grid) return false;
    return y >= 0 && y < currentLevel.grid.length && x >= 0 && x < currentLevel.grid[y].length;
}

function isValidMove(nx, ny, currentZ) {
    if (!isInsideGrid(nx, ny)) return false;
    var targetZ = currentLevel.grid[ny][nx];
    return targetZ > 0 && targetZ === currentZ;
}

function checkWinCondition() {
    if (litTargets.length === currentTargetTiles.length && currentTargetTiles.length > 0) {
        document.getElementById('win-modal').classList.remove('hidden');
        runMode = 'idle';
        if (executionTimeout) clearTimeout(executionTimeout);
        return true;
    }
    return false;
}

function showFailModal() {
    runMode = 'idle';
    document.getElementById('fail-modal').classList.remove('hidden');
    
    function retryHandler(e) {
        // Prevent default only for click so we don't accidentally click other UI elements
        if (e.type === 'click' && e.target.id !== 'btn-retry-level') e.preventDefault();
        document.removeEventListener('keydown', retryHandler);
        document.removeEventListener('click', retryHandler);
        document.getElementById('fail-modal').classList.add('hidden');
        stopExecution();
    }
    
    setTimeout(function() {
        document.addEventListener('keydown', retryHandler);
        document.addEventListener('click', retryHandler);
    }, 100);
}

// Start app
window.onload = function() {
    initCanvas();
    initUI();
    loadLevel(0);
};
