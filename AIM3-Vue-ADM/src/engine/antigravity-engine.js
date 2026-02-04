// src/engine/antigravity-engine.js

export const AntigravityEngine = {
    canvas: null,
    ctx: null,
    particles: [],
    aiState: {},
    energy: 0.5,
    glowState: 'stable',
    particleColor: 'white',
    gravity: { x: 0, y: 1 },
    reactivity: 1.0,

    init(canvas) {
        if (canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());

            // Initialize particles
            this.particles = Array.from({ length: 100 }, () => ({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: 0,
                vy: 0
            }));

            // Start loop if needed, or rely on external loop calling update()
            // Here we just setup state
        }
        console.log("Antigravity Engine Initialized");
    },

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    },

    loadAIState(ai) {
        console.log("Loading AI State into Engine:", ai);
        this.aiState = ai;

        // Color Control
        if (ai.color === "bright") this.particleColor = "#FFFF00"; // Yellow
        if (ai.color === "calm") this.particleColor = "#00FFFF"; // Cyan
        if (ai.color === "danger") this.particleColor = "#FF0000"; // Red

        // Manual override if color is hex or other string
        if (ai.color && ai.color.startsWith('#')) this.particleColor = ai.color;

        // Gravity Direction
        this.gravity = ai.gravity || { x: 0, y: 1 };

        // Energy Level (GlowFrame linkage)
        this.energy = ai.energyScore !== undefined ? ai.energyScore : 0.5;

        // Reactivity
        this.reactivity = ai.reactivity !== undefined ? ai.reactivity : 1.0;

        if (this.energy > 0.8) this.glowState = 'reactive';
        else this.glowState = 'stable';
    },

    update() {
        if (!this.ctx) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear with trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);

        this.particles.forEach(p => {
            p.vx += this.gravity.x * 0.02 * this.reactivity;
            p.vy += this.gravity.y * 0.02 * this.reactivity;

            // Friction
            p.vx *= 0.99;
            p.vy *= 0.99;

            p.x += p.vx;
            p.y += p.vy;

            // Screen Loop
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.fillStyle = this.particleColor;
            ctx.beginPath();
            // Size based on energy
            ctx.arc(p.x, p.y, 2 + this.energy * 3, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    triggerMintCelebration() {
        console.log("💥 ANTIGRAVITY CELEBRATION TRIGGERED 💥");
        this.glowState = "reactive";
        this.particleColor = "#FFD700"; // Gold
        this.energy = 1.0;

        this.particles.forEach(p => {
            // Explosion from center
            const dx = p.x - (this.canvas ? this.canvas.width / 2 : 0);
            const dy = p.y - (this.canvas ? this.canvas.height / 2 : 0);
            const angle = Math.atan2(dy, dx);
            const force = 10 + Math.random() * 20;

            p.vx = Math.cos(angle) * force;
            p.vy = Math.sin(angle) * force;
        });
    }
};
