// levels.js
// Intrologic - All 20 Levels
//
// Direction mapping: 0=North(-y), 1=East(+x), 2=South(+y), 3=West(-x)
// Grid[y][x] = height of block. 0 = empty space.
// "targets" = blue tiles that must be lit.
// Bot starts at bot.x, bot.y facing bot.dir.

const levels = [
    // =============================
    // BASICS (8 levels)
    // =============================

    // 1-1: Simple straight line, 3 tiles. Bot on right end, target on left end.
    // Solution: F, F, Light (3 commands)
    {
        id: "1-1", group: 1, title: "Basics 1-1",
        grid: [
            [1, 1, 1]
        ],
        bot: { x: 2, y: 0, dir: 3 },
        targets: [{ x: 0, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-2: U-shape path, 3x3 with missing center column.
    // Bot at top-right, target at bottom-left.
    // Solution: F,F,R,F,F,R,F,F,Light (9 commands)
    {
        id: "1-2", group: 1, title: "Basics 1-2",
        grid: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1]
        ],
        bot: { x: 2, y: 0, dir: 3 },
        targets: [{ x: 0, y: 2 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-3: 2x2 spiral staircase. Heights: 1,2,3,4 going clockwise.
    // Bot at bottom-left (h=1), target at top (h=3).
    // Solution: Jump,R,Jump,R,Jump,Light (6 commands)
    {
        id: "1-3", group: 1, title: "Basics 1-3",
        grid: [
            [3, 2],
            [2, 1]
        ],
        bot: { x: 1, y: 1, dir: 0 },
        targets: [{ x: 0, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-4: Staircase going up then down: 1,2,3,2,1
    // Bot at top (h=3), target at bottom-left (h=1).
    // Solution: Jump(down),R,Jump(down),R,Jump(down),Jump(down),R,Jump(up),Light (or similar)
    {
        id: "1-4", group: 1, title: "Basics 1-4",
        grid: [
            [1, 2, 3],
            [0, 0, 2],
            [0, 0, 1]
        ],
        bot: { x: 2, y: 0, dir: 2 },
        targets: [{ x: 0, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-5: 3x3 grid, stepped heights. Two yellow targets visible.
    // Bot in center, targets at corners.
    // Solution uses Forward, Jump, Light, Turn commands (12 commands)
    {
        id: "1-5", group: 1, title: "Basics 1-5",
        grid: [
            [2, 1, 2],
            [1, 1, 1],
            [2, 1, 2]
        ],
        bot: { x: 1, y: 1, dir: 0 },
        targets: [{ x: 0, y: 0 }, { x: 2, y: 0 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-6: Pyramid-like structure, 3x3 with center at h=3, ring at h=2, edges at h=1.
    // Bot at top center (h=3). Two targets on lower ring.
    // Solution: 12 commands with Jump, Turn, Light
    {
        id: "1-6", group: 1, title: "Basics 1-6",
        grid: [
            [1, 1, 1],
            [1, 2, 1],
            [1, 1, 1]
        ],
        bot: { x: 1, y: 0, dir: 2 },
        targets: [{ x: 1, y: 2 }, { x: 0, y: 1 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-7: 3x2 flat grid, all h=1. Multiple targets (4 yellow tiles).
    // Bot at top-left corner.
    // Solution: F,R,Jump,Light,Jump,Left,Jump,Light,Jump,Left,Light (various turns + lights)
    {
        id: "1-7", group: 1, title: "Basics 1-7",
        grid: [
            [1, 1, 1],
            [1, 1, 1]
        ],
        bot: { x: 0, y: 0, dir: 1 },
        targets: [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // 1-8: L-shape with varied heights (staircase + flat). 
    // Bot at top. Target at end of L.
    // Solution: 12 commands mix of Jump, Turn, Forward, Light
    {
        id: "1-8", group: 1, title: "Basics 1-8",
        grid: [
            [2, 2, 2],
            [0, 1, 1],
            [0, 1, 0]
        ],
        bot: { x: 0, y: 0, dir: 1 },
        targets: [{ x: 1, y: 2 }],
        mainLimit: 12, p1Limit: 0, p2Limit: 0
    },

    // =============================
    // PROCEDURES (6 levels)
    // =============================

    // 2-1: L-shape, 4 tiles right + 4 tiles down.
    // Bot at back-left. 3 targets along the path.
    // MAIN: P1, P1, P1.  P1: F, F, F, Light, R
    {
        id: "2-1", group: 2, title: "Procedures 2-1",
        grid: [
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 1]
        ],
        bot: { x: 0, y: 0, dir: 1 },
        targets: [{ x: 3, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 0 }],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 2-2: Large diagonal staircase pattern, 5x5 going NE to SW.
    // Bot at bottom-right. Target at top-left.
    // MAIN: P1,R,P1,R,P1,R,P1,R,P1,R,P1,Light
    // P1: F, Left, F
    {
        id: "2-2", group: 2, title: "Procedures 2-2",
        grid: [
            [1, 1, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 1, 1, 0],
            [0, 0, 0, 1, 1]
        ],
        bot: { x: 4, y: 3, dir: 3 },
        targets: [{ x: 0, y: 0 }],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 2-3: 4x4 square ring. Bot on top edge. 
    // Targets on each side of the ring.
    // MAIN: P1,Left,Left,Right,P1,...  P1: F,F,F,Light
    {
        id: "2-3", group: 2, title: "Procedures 2-3",
        grid: [
            [1, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [1, 1, 1, 1]
        ],
        bot: { x: 1, y: 0, dir: 1 },
        targets: [{ x: 3, y: 0 }, { x: 3, y: 3 }, { x: 0, y: 3 }, { x: 0, y: 0 }],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 2-4: 5x5 grid, all tiles present, all height 1. Bot in center. 
    // 8 targets (all yellow tiles around perimeter).
    // Uses P1 and P2.
    // MAIN: P1,R,F,P1,R,F,Left,P1,F,Left,P1
    // P1: P2,P2,P2,P2.  P2: F, Light
    {
        id: "2-4", group: 2, title: "Procedures 2-4",
        grid: [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ],
        bot: { x: 2, y: 2, dir: 0 },
        targets: [
            { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 },
            { x: 0, y: 2 }, { x: 4, y: 2 },
            { x: 0, y: 4 }, { x: 2, y: 4 }, { x: 4, y: 4 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    },

    // 2-5: Cross/plus shape. 5x5 with only center row, center column filled.
    // Bot at center. Targets at each arm end.
    // Uses P1 and P2.
    // MAIN: P1,P1,P1.  P1: P2,Left,Jump,Right.  P2: Light,F,F,Light,F,F
    {
        id: "2-5", group: 2, title: "Procedures 2-5",
        grid: [
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0],
            [1, 1, 1, 1, 1],
            [0, 0, 1, 0, 0],
            [0, 0, 1, 0, 0]
        ],
        bot: { x: 2, y: 2, dir: 0 },
        targets: [
            { x: 0, y: 2 }, { x: 4, y: 2 },
            { x: 2, y: 0 }, { x: 2, y: 4 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    },

    // 2-6: Cross/diamond shape, 5x5 with varied tiles. Bot at center.
    // Many targets on all branches.
    // MAIN: P1,Left,P1,Left,P1,Left,P1,Left  
    // P1: P2,P2,P2,P2.  P2: Light, F, R
    {
        id: "2-6", group: 2, title: "Procedures 2-6",
        grid: [
            [0, 1, 1, 1, 0],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [0, 1, 1, 1, 0]
        ],
        bot: { x: 2, y: 2, dir: 0 },
        targets: [
            { x: 1, y: 0 }, { x: 3, y: 0 },
            { x: 0, y: 1 }, { x: 4, y: 1 },
            { x: 0, y: 3 }, { x: 4, y: 3 },
            { x: 1, y: 4 }, { x: 3, y: 4 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    },

    // =============================
    // LOOPS (6 levels)
    // =============================

    // 3-1: Long straight row, 8 tiles. All are targets.
    // Bot at right end.
    // MAIN: P1.  P1: F, Light, P1 (recursive loop)
    {
        id: "3-1", group: 3, title: "Loops 3-1",
        grid: [
            [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        bot: { x: 7, y: 0, dir: 3 },
        targets: [
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
            { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
            { x: 6, y: 0 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 3-2: Staircase, 4 steps going up.
    // Each step is h=1,2,3,4. All targets.
    // MAIN: P1.  P1: Jump, Light, P1
    {
        id: "3-2", group: 3, title: "Loops 3-2",
        grid: [
            [1, 2, 3, 4]
        ],
        bot: { x: 0, y: 0, dir: 1 },
        targets: [
            { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 3-3: 5x5 grid with height 2 blocks forming a diamond/checkerboard. Targets on elevated tiles.
    // Bot at right edge.
    // MAIN: P1.  P1: F,Light,Left,F,Jump,Light,P1
    {
        id: "3-3", group: 3, title: "Loops 3-3",
        grid: [
            [1, 2, 1, 2, 1],
            [2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1],
            [2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1]
        ],
        bot: { x: 4, y: 0, dir: 2 },
        targets: [
            { x: 1, y: 0 }, { x: 3, y: 0 },
            { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 4, y: 1 },
            { x: 1, y: 2 }, { x: 3, y: 2 },
            { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 },
            { x: 1, y: 4 }, { x: 3, y: 4 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 3-4: 5x5 checkerboard, all h=1. Targets on every other tile.
    // Bot at top-right. 
    // MAIN: P1.  P1: Light, F, Left, F, Light, R, F, P1
    {
        id: "3-4", group: 3, title: "Loops 3-4",
        grid: [
            [1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0],
            [1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0],
            [1, 0, 1, 0, 1]
        ],
        bot: { x: 4, y: 0, dir: 2 },
        targets: [
            { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 },
            { x: 1, y: 1 }, { x: 3, y: 1 },
            { x: 0, y: 2 }, { x: 2, y: 2 }, { x: 4, y: 2 },
            { x: 1, y: 3 }, { x: 3, y: 3 },
            { x: 0, y: 4 }, { x: 2, y: 4 }, { x: 4, y: 4 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 0
    },

    // 3-5: 5x5 with elevated center (pyramid shape).
    // Ring of h=1, ring of h=2, center h=3.
    // Bot at top-left corner.
    // Uses P1 and P2.
    {
        id: "3-5", group: 3, title: "Loops 3-5",
        grid: [
            [1, 1, 1, 1, 1],
            [1, 2, 2, 2, 1],
            [1, 2, 3, 2, 1],
            [1, 2, 2, 2, 1],
            [1, 1, 1, 1, 1]
        ],
        bot: { x: 0, y: 0, dir: 1 },
        targets: [
            { x: 0, y: 4 }, { x: 4, y: 4 },
            { x: 4, y: 0 }, { x: 0, y: 0 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    },

    // 3-6: Diamond/cross shape with varied heights.
    // Bot at center. Targets at the 4 tips of the diamond.
    // Uses P1 and P2.
    {
        id: "3-6", group: 3, title: "Loops 3-6",
        grid: [
            [0, 0, 1, 0, 0],
            [0, 1, 2, 1, 0],
            [1, 2, 1, 2, 1],
            [0, 1, 2, 1, 0],
            [0, 0, 1, 0, 0]
        ],
        bot: { x: 2, y: 2, dir: 0 },
        targets: [
            { x: 2, y: 0 }, { x: 4, y: 2 },
            { x: 2, y: 4 }, { x: 0, y: 2 }
        ],
        mainLimit: 12, p1Limit: 8, p2Limit: 8
    }
];
