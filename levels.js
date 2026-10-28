// levels.js
// Intrologic - All 20 Levels
//
// Direction mapping: 0=North(-y, Up-Right), 1=East(+x, Down-Right), 2=South(+y, Down-Left), 3=West(-x, Up-Left)
// Grid[y][x] = height of block. 0 = empty space.
// "targets" = blue tiles that must be lit.
// Bot starts at bot.x, bot.y facing bot.dir.

const levels = [
    // =============================
    // BASICS (8 levels)
    // =============================

    // 1-1: Simple straight line, 3 tiles.
    // Solution: F, F, Light
    {
        id: "1-1", group: 1, title: "Basics 1-1",
        instruction: "Benvenuto! Programma il robot inserendo i comandi in MAIN. Usa Avanti (↑) e Lampadina (💡) per raggiungere e accendere la piastrella azzurra!",
        grid: [
            [1, 1, 1]
        ],
        bot: { x: 0, y: 0, dir: 1 },
        targets: [{ x: 2, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-2: U-shape path, 3x3.
    // Solution: F, F, Left, F, F, Left, F, F, Light
    {
        id: "1-2", group: 1, title: "Basics 1-2",
        instruction: "Nuovi comandi: usa Ruota a Sinistra (↺) e Ruota a Destra (↻) per cambiare direzione lungo il percorso a U.",
        grid: [
            [1, 0, 1],
            [1, 0, 1],
            [1, 1, 1]
        ],
        bot: { x: 0, y: 0, dir: 2 },
        targets: [{ x: 2, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-3: 2x2 spiral staircase. Heights: 1, 2, 3, 4 going clockwise.
    // Solution: Jump, Right, Jump, Right, Jump, Light
    {
        id: "1-3", group: 1, title: "Basics 1-3",
        instruction: "Nuovo comando Salto (molla): permette al robot di salire di un gradino (+1) o di scendere (-1)!",
        grid: [
            [3, 4],
            [2, 1]
        ],
        bot: { x: 1, y: 1, dir: 3 },
        targets: [{ x: 1, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-4: Ridges and trench before 3-high wall.
    // Solution: Left, Jump, Jump, Jump, Jump, Right, F, F, Light
    {
        id: "1-4", group: 1, title: "Basics 1-4",
        instruction: "Combina salti e rotazioni per superare rilievi e trincee fino all'obiettivo finale.",
        grid: [
            [3, 3, 3],
            [2, 2, 2],
            [1, 1, 1],
            [2, 2, 2],
            [1, 1, 1]
        ],
        bot: { x: 0, y: 4, dir: 1 },
        targets: [{ x: 2, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-5: 3x3 stepped platform with 3 targets.
    // Solution: Light, Jump, F, Left, F, Light, Jump, Left, F, F, Light
    {
        id: "1-5", group: 1, title: "Basics 1-5",
        grid: [
            [2, 2, 3],
            [2, 1, 1],
            [1, 1, 1]
        ],
        bot: { x: 2, y: 0, dir: 3 },
        targets: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 2, y: 2 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-6: Multi-tiered L-staircase with 2 targets.
    // Solution: Jump, Left, F, Jump, Light, Left, F, F, Right, Jump, F, Light
    {
        id: "1-6", group: 1, title: "Basics 1-6",
        grid: [
            [4, 0, 0, 0],
            [4, 0, 0, 0],
            [3, 3, 3, 1],
            [1, 1, 2, 1],
            [1, 1, 2, 0]
        ],
        bot: { x: 1, y: 4, dir: 1 },
        targets: [{ x: 2, y: 2 }, { x: 0, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-7: 3x2 stepped cluster with 4 targets.
    // Solution: F, Left, Jump, Light, Jump, Light, Left, Jump, Light, Left, Jump, Light
    {
        id: "1-7", group: 1, title: "Basics 1-7",
        grid: [
            [1, 3, 2],
            [1, 2, 1]
        ],
        bot: { x: 0, y: 0, dir: 2 },
        targets: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 0 }, { x: 1, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-8: Stepped structure with 3 targets.
    // Solution: Jump, Jump, Right, F, Left, Jump, Light, Left, F, Light, Jump, Light
    {
        id: "1-8", group: 1, title: "Basics 1-8",
        grid: [
            [3, 2, 2],
            [1, 3, 3],
            [1, 2, 1],
            [1, 1, 1]
        ],
        bot: { x: 1, y: 3, dir: 0 },
        targets: [{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // =============================
    // PROCEDURES (6 levels)
    // =============================

    // 2-1: U-shape, 4x4 perimeter on 3 sides.
    // MAIN: P1, P1, P1.  P1: F, F, F, Light, Right
    {
        id: "2-1", group: 2, title: "Procedures 2-1",
        instruction: "Benvenuto nelle Procedure! Inserisci comandi ripetitivi in PROC 1 e usa il comando P1 in MAIN per richiamarli.",
        grid: [
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [1, 1, 1, 1]
        ],
        bot: { x: 0, y: 0, dir: 1 },
        targets: [{ x: 3, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 3 }],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 2-2: 5x5 diagonal zig-zag.
    // MAIN: P1, Right, P1, Right, P1, Right, P1, Light
    // P1: F, Left, F
    {
        id: "2-2", group: 2, title: "Procedures 2-2",
        grid: [
            [0, 0, 0, 0, 1],
            [0, 0, 0, 1, 1],
            [0, 0, 1, 1, 0],
            [0, 1, 1, 0, 0],
            [1, 1, 0, 0, 0]
        ],
        bot: { x: 0, y: 4, dir: 1 },
        targets: [{ x: 4, y: 0 }],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 2-3: 4x3 stepped terraces (h=1, 2, 3).
    // MAIN: P1, Left, Jump, Left, P1, Right, Jump, Right, P1
    // P1: F, F, F, Light
    {
        id: "2-3", group: 2, title: "Procedures 2-3",
        grid: [
            [3, 3, 3, 3],
            [2, 2, 2, 2],
            [1, 1, 1, 1]
        ],
        bot: { x: 0, y: 2, dir: 1 },
        targets: [{ x: 3, y: 2 }, { x: 0, y: 1 }, { x: 3, y: 0 }],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 2-4: 5x5 S-shaped parallel bars, 12 targets.
    // MAIN: P1, Right, F, F, Right, P1, Left, F, F, Left, P1
    // P1: P2, P2, P2, P2.  P2: F, Light
    {
        id: "2-4", group: 2, title: "Procedures 2-4",
        instruction: "Ora hai due procedure (P1 e P2). Puoi richiamare P2 anche dall'interno di P1 per combinare le routine!",
        grid: [
            [2, 2, 2, 2, 2],
            [0, 0, 0, 0, 2],
            [2, 2, 2, 2, 2],
            [2, 0, 0, 0, 2],
            [2, 2, 2, 2, 2]
        ],
        bot: { x: 0, y: 0, dir: 1 },
        targets: [
            { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
            { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 },
            { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    },

    // 2-5: 5x3 alternating stepped bars, 9 targets.
    // MAIN: P1, P1, P1
    // P1: P2, Left, Jump, Left, P2, Right, Jump, Right
    // P2: Light, F, Light, F, Light, Jump, F, F
    {
        id: "2-5", group: 2, title: "Procedures 2-5",
        grid: [
            [1, 1, 2, 2, 2],
            [2, 2, 2, 1, 1],
            [1, 1, 2, 2, 2]
        ],
        bot: { x: 4, y: 0, dir: 3 },
        targets: [
            { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
            { x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    },

    // 2-6: Four 2x2 elevated islands around a central cross, 16 targets.
    // MAIN: P1, Left, P1, Left, P1, Left, P1, Left
    // P1: P2, P2, P2, P2, F, Jump, Jump, F
    // P2: Light, F, Left
    {
        id: "2-6", group: 2, title: "Procedures 2-6",
        grid: [
            [2, 2, 1, 2, 2],
            [2, 2, 1, 2, 2],
            [1, 1, 1, 1, 1],
            [2, 2, 1, 2, 2],
            [2, 2, 1, 2, 2]
        ],
        bot: { x: 4, y: 0, dir: 3 },
        targets: [
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 },
            { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 1 },
            { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 4 }, { x: 1, y: 4 },
            { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    },

    // =============================
    // LOOPS (6 levels)
    // =============================

    // 3-1: Straight ridge of 7 tiles, 6 targets.
    // MAIN: P1.  P1: F, Light, P1
    {
        id: "3-1", group: 3, title: "Loops 3-1",
        instruction: "Benvenuto nei Loop! Se inserisci il comando P1 alla fine di PROC 1, creerai un ciclo ricorsivo continuo che ripete l'azione!",
        grid: [
            [1, 1, 1, 1, 1, 1, 1],
            [2, 2, 2, 2, 2, 2, 2],
            [1, 1, 1, 1, 1, 1, 1]
        ],
        bot: { x: 0, y: 1, dir: 1 },
        targets: [
            { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
            { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 3-2: Up-and-down staircase ridge of 7 tiles, 6 targets.
    // MAIN: P1.  P1: Jump, Light, P1
    {
        id: "3-2", group: 3, title: "Loops 3-2",
        grid: [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 2, 3, 4, 3, 1, 2],
            [1, 1, 1, 1, 1, 1, 1]
        ],
        bot: { x: 0, y: 1, dir: 1 },
        targets: [
            { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
            { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 3-3: 5x5 ring with recessed midpoints, 8 targets.
    // MAIN: P1.  P1: F, Light, Left, F, Jump, Light, Jump, P1
    {
        id: "3-3", group: 3, title: "Loops 3-3",
        grid: [
            [3, 3, 2, 3, 3],
            [3, 1, 1, 1, 3],
            [2, 1, 1, 1, 2],
            [3, 1, 1, 1, 3],
            [3, 3, 2, 3, 3]
        ],
        bot: { x: 1, y: 0, dir: 3 },
        targets: [
            { x: 0, y: 0 }, { x: 0, y: 2 }, { x: 0, y: 4 }, { x: 2, y: 4 },
            { x: 4, y: 4 }, { x: 4, y: 2 }, { x: 4, y: 0 }, { x: 2, y: 0 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 3-4: 5x5 diagonal zig-zag with 5 targets.
    // MAIN: P1.  P1: Light, F, Left, F, Light, Right, F, P1
    {
        id: "3-4", group: 3, title: "Loops 3-4",
        grid: [
            [0, 0, 0, 0, 2],
            [0, 0, 0, 2, 2],
            [0, 0, 2, 2, 0],
            [0, 2, 2, 0, 0],
            [2, 2, 0, 0, 0]
        ],
        bot: { x: 0, y: 4, dir: 1 },
        targets: [
            { x: 0, y: 4 }, { x: 1, y: 3 }, { x: 2, y: 2 },
            { x: 3, y: 1 }, { x: 4, y: 0 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 3-5: 5x5 ring with elevated corners, 16 targets.
    // MAIN: P1
    // P1: Light, Jump, Light, F, Light, F, Light, P2
    // P2: Jump, Left, P1
    {
        id: "3-5", group: 3, title: "Loops 3-5",
        grid: [
            [3, 2, 2, 2, 3],
            [2, 1, 1, 1, 2],
            [2, 1, 1, 1, 2],
            [2, 1, 1, 1, 2],
            [3, 2, 2, 2, 3]
        ],
        bot: { x: 0, y: 4, dir: 1 },
        targets: [
            { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 },
            { x: 4, y: 4 }, { x: 4, y: 3 }, { x: 4, y: 2 }, { x: 4, y: 1 },
            { x: 4, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 0 },
            { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    },

    // 3-6: 5x5 stepped cross/ring, 8 targets.
    // MAIN: P1
    // P1: Light, Jump, Left, F, Light, Right, Jump, P2
    // P2: Right, F, Left, Jump, Jump, Left, P1
    {
        id: "3-6", group: 3, title: "Loops 3-6",
        grid: [
            [1, 2, 1, 2, 1],
            [2, 2, 1, 2, 2],
            [1, 1, 2, 1, 1],
            [2, 2, 1, 2, 2],
            [1, 2, 1, 2, 1]
        ],
        bot: { x: 0, y: 4, dir: 1 },
        targets: [
            { x: 0, y: 4 }, { x: 1, y: 3 },
            { x: 4, y: 4 }, { x: 3, y: 3 },
            { x: 4, y: 0 }, { x: 3, y: 1 },
            { x: 0, y: 0 }, { x: 1, y: 1 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    }
];
