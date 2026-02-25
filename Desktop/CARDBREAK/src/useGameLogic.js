
import { useState, useCallback, useRef, useEffect } from "react";

/**
 * AntigravityMirrorLayer
 * The "Shadow Layer" that monitors the grid without touching the sacred vessel.
 */
class AntigravityMirrorLayer {
    constructor(targetArtifacts) {
        this.grid = Array(5).fill(null).map(() => Array(5).fill(null));
        this.targetArtifacts = targetArtifacts;
    }

    updateGrid(placedCards) {
        // Reset grid
        this.grid = Array(5).fill(null).map(() => Array(5).fill(null));
        // Mirror the physical state to the shadow state
        placedCards.forEach(card => {
            if (card.x >= 0 && card.x < 5 && card.y >= 0 && card.y < 5) {
                // In this AICE implementation, 'card.meaning' contains the semantic text
                this.grid[card.x][card.y] = card.meaning || card.id;
            }
        });
    }

    checkVerticalBreakthrough(onBreak) {
        for (let col = 0; col < 5; col++) {
            for (let rowStart = 0; rowStart <= 2; rowStart++) {
                const cell1 = this.grid[col][rowStart];
                const cell2 = this.grid[col][rowStart + 1];
                const cell3 = this.grid[col][rowStart + 2];

                if (cell1 && cell2 && cell3) {
                    const currentStack = [cell1, cell2, cell3].map(t => String(t));
                    const isMatched = this.targetArtifacts.every(target =>
                        currentStack.some(scanned => scanned.includes(target))
                    );

                    if (isMatched) {
                        onBreak(col, rowStart);
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

export function useGameLogic() {
    const gridSize = 5;
    const cellSize = 60;

    const [level, setLevel] = useState(1);
    const [mold, setMold] = useState(generateMold(3, 1));
    const [placed, setPlaced] = useState([]);
    const [active, setActive] = useState({ px: 150, py: 500 });
    const [zen, setZen] = useState(false);
    const [hoverCell, setHoverCell] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 30, y: 30 });
    const [score, setScore] = useState(0);

    // Antigravity States
    const [isBreakthrough, setIsBreakthrough] = useState(false);
    const mirrorRef = useRef(new AntigravityMirrorLayer([
        "Implement a Scoring and Progression System",
        "Create Card Interaction Logic",
        "Add Game Levels"
    ]));

    const g_anti = useRef(-0.35);
    const currentMeaningRef = useRef("");

    // Map level pieces to specific meanings for the breakthrough
    const pieceMeanings = [
        "Implement a Scoring and Progression System",
        "Create Card Interaction Logic",
        "Add Game Levels",
        "OKE Atomic IP Protection",
        "Amane Protocol Layer",
        "SBT Identity Crystallization",
        "Regenerative Leadership",
        "Vision Commerce Architecture"
    ];

    useEffect(() => {
        // Background Mirror Service
        const observer = setInterval(() => {
            mirrorRef.current.updateGrid(placed);
            const breakthrough = mirrorRef.current.checkVerticalBreakthrough((col, row) => {
                if (!isBreakthrough) {
                    setIsBreakthrough(true);
                    playAntigravityResonance();
                    console.log(`[AICE] Vertical Breakthrough @ Col ${col}`);
                }
            });
        }, 1000);
        return () => clearInterval(observer);
    }, [placed, isBreakthrough]);

    function spawnCard() {
        // Generate a meaning for the next card to be spawned
        currentMeaningRef.current = pieceMeanings[Math.floor(Math.random() * pieceMeanings.length)];
        return { px: 150, py: 500 };
    }

    function generateMold(count, diff) {
        const shape = [{ x: 2, y: 2 }];
        while (shape.length < count) {
            const base = diff < 4 ? shape[shape.length - 1] : shape[Math.floor(Math.random() * shape.length)];
            const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
            const d = dirs[Math.floor(Math.random() * dirs.length)];
            const nx = base.x + d.x;
            const ny = base.y + d.y;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !shape.find(c => c.x === nx && c.y === ny)) {
                shape.push({ x: nx, y: ny });
            }
        }
        return shape;
    }

    const startDrag = (e, container) => {
        const rect = container.getBoundingClientRect();
        const localX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const localY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        setDragOffset({ x: localX - active.px, y: localY - active.py });
    };

    const moveCard = (e, container) => {
        const rect = container.getBoundingClientRect();
        const localX = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const localY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        let targetPx = localX - dragOffset.x;
        let targetPy = localY - dragOffset.y;

        // Antigravity drift
        const drift = Math.sin(Date.now() / 200) * 1.5;
        setActive({ px: targetPx + drift, py: targetPy + drift * g_anti.current });

        const boardLeft = (rect.width - 300) / 2;
        const boardTop = 180;
        const gx = Math.round((targetPx + 30 - boardLeft - 30) / cellSize);
        const gy = Math.round((targetPy + 30 - boardTop - 30) / cellSize);

        const isTarget = mold.find(m => m.x === gx && m.y === gy);
        const isPlaced = placed.find(p => p.x === gx && p.y === gy);
        if (isTarget && !isPlaced) setHoverCell({ x: gx, y: gy });
        else setHoverCell(null);
    };

    const placeCard = (e, container) => {
        const rect = container.getBoundingClientRect();
        const localX = (e.clientX || (e.changedTouches && e.changedTouches[0].clientX)) - rect.left;
        const localY = (e.clientY || (e.changedTouches && e.changedTouches[0].clientY)) - rect.top;

        const boardLeft = (rect.width - 300) / 2;
        const boardTop = 180;
        const gx = Math.round((localX - dragOffset.x + 30 - boardLeft - 30) / cellSize);
        const gy = Math.round((localY - dragOffset.y + 30 - boardTop - 30) / cellSize);

        const hit = mold.find(m => m.x === gx && m.y === gy);
        const already = placed.find(p => p.x === gx && p.y === gy);

        setHoverCell(null);

        if (hit && !already) {
            const snapX = gx * cellSize + boardLeft;
            const snapY = gy * cellSize + boardTop;
            const newPlaced = [...placed, { x: gx, y: gy, meaning: currentMeaningRef.current }];
            setPlaced(newPlaced);
            setScore(s => s + 100);
            setActive({ px: snapX, py: snapY });

            playResonance();

            setTimeout(() => setActive(spawnCard()), 100);

            if (newPlaced.length === mold.length) {
                setZen(true);
                setTimeout(() => nextLevel(), 1500);
            }
        } else {
            setActive(spawnCard());
        }
    };

    function nextLevel() {
        const next = level + 1;
        setLevel(next);
        setMold(generateMold(3 + Math.floor(next / 2) * 2, Math.min(10, next)));
        setPlaced([]);
        setActive(spawnCard());
        setZen(false);
        setIsBreakthrough(false); // Reset breakthrough on next phase
    }

    async function playResonance() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            const ctx = new Ctx();
            if (ctx.state === 'suspended') await ctx.resume();
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.frequency.value = 432;
            g.gain.setValueAtTime(0.04, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.1);
        } catch (e) { }
    }

    async function playAntigravityResonance() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            const ctx = new Ctx();
            if (ctx.state === 'suspended') await ctx.resume();
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            // Resonance at 2637.02 Hz
            osc.frequency.setValueAtTime(2637.02, ctx.currentTime);
            g.gain.setValueAtTime(0.06, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.connect(g); g.connect(ctx.destination);
            osc.start(); osc.stop(ctx.currentTime + 0.8);
        } catch (e) { }
    }

    return {
        mold, placedCards: placed, activeCard: active,
        startDrag, moveCard, placeCard,
        level, zen, cellSize, hoverCell, score,
        isBreakthrough // To trigger the shadow effect in UI
    };
}
