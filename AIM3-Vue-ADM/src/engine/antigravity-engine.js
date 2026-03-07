// src/engine/antigravity-engine.js

export const AntigravityEngine = {
    canvas: null,
    ctx: null,
    particles: [],
    aiState: {},
    energy: 0.5,
    glowState: 'stable',
    particleColor: '#00ffcc',
    targetColor: '#00ffcc',
    gravity: { x: 0, y: 0.05 },
    reactivity: 1.0,
    startTime: Date.now(),

    init(canvas) {
        if (canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());

            // Initialize more particles for "Premium" feel
            this.particles = Array.from({ length: 150 }, () => ({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2
            }));
        }
        console.log("Tive Antigravity Engine Initialized");
    },

    resize() {
        if (this.canvas) {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width || window.innerWidth;
            this.canvas.height = rect.height || window.innerHeight;
        }
    },

    loadAIState(ai) {
        console.log("Synchronizing Tive Intelligence with Physical Engine:", ai);
        this.aiState = ai;

        // Smooth Color Transition Target
        if (ai.color) this.targetColor = ai.color;

        // Gravity & Energy Dynamics
        this.gravity = ai.gravity || { x: 0, y: 0.05 };
        this.energy = ai.energyScore !== undefined ? ai.energyScore : 0.5;
        this.reactivity = ai.reactivity !== undefined ? ai.reactivity : 1.0;

        this.glowState = this.energy > 0.8 ? 'reactive' : 'stable';

        // Omotenashi (Hospitality) special effect
        if (ai.type === 'omotenashi') {
            console.log("[Engine] Entering Omotenashi State...");
            this.particles.forEach(p => {
                p.vx *= 0.2;
                p.vy *= 0.2;
                p.alpha = 0.8;
            });
        }
    },

    update() {
        if (!this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // --- 1. Organic Pulse (Heartbeat & Breath) ---
        const time = (Date.now() - this.startTime) * 0.001;
        const breath = Math.sin(time * 0.8) * 0.15 + 0.85; // Slow breathing
        const heartThump = Math.pow(Math.sin(time * 2.5), 20) * 0.2; // Heartbeat spike
        const globalScale = breath + heartThump;

        // Background: Deep Sacred Dark with a hint of warmth
        ctx.fillStyle = 'rgba(12, 8, 10, 0.18)';
        ctx.fillRect(0, 0, w, h);

        // Color Interpolation (Subtle shift to Sacred Rose if near focus)
        const isSacred = this.energy > 0.7;
        this.targetColor = isSacred ? '#FF8B8B' : (this.aiState.color || '#00ffcc');
        this.particleColor = this.targetColor;

        this.particles.forEach(p => {
            // --- 2. Floating "Life" Physics ---
            // Apply Neural Noise + Pulse Scaling
            p.vx += (this.gravity.x + Math.sin(time + p.x * 0.01) * 0.02) * this.reactivity * globalScale;
            p.vy += (this.gravity.y + Math.cos(time + p.y * 0.01) * 0.02) * this.reactivity * globalScale;

            // Fluid-like Friction
            p.vx *= 0.97;
            p.vy *= 0.97;

            p.x += p.vx;
            p.y += p.vy;

            // Bound warp
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            // --- 3. Render Organic "Soul" Droplet ---
            const size = (p.size + this.energy * 4) * globalScale;

            ctx.shadowBlur = this.energy * 20 * globalScale;
            ctx.shadowColor = this.particleColor;

            // Subtle Radial Gradient for "Warmth"
            const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
            radGrad.addColorStop(0, this.particleColor);
            radGrad.addColorStop(1, 'transparent');

            ctx.fillStyle = radGrad;
            ctx.globalAlpha = p.alpha * (isSacred ? 1.2 : 1.0);

            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
        });
    },

    triggerMintCelebration() {
        this.glowState = "reactive";
        this.targetColor = "#FFD700"; // Gold Flash
        this.energy = 1.0;

        this.particles.forEach(p => {
            const angle = Math.random() * Math.PI * 2;
            const force = 15 + Math.random() * 10;
            p.vx = Math.cos(angle) * force;
            p.vy = Math.sin(angle) * force;
            p.alpha = 1.0;
        });

        // Reset to normal after 2 seconds
        setTimeout(() => {
            this.targetColor = this.aiState.color || '#00ffcc';
            this.energy = this.aiState.energyScore || 0.5;
            this.glowState = "stable";
        }, 2000);
    },

    triggerResonance() {
        const roseGold = "#FF8B8B";
        this.targetColor = roseGold;
        this.energy = 0.9;
        this.reactivity = 2.0;

        // Speed up particles in a circular swirl
        this.particles.forEach(p => {
            const dx = p.x - this.canvas.width / 2;
            const dy = p.y - this.canvas.height / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            p.vx += -(dy / dist) * 2;
            p.vy += (dx / dist) * 2;
            p.alpha = 0.8;
        });

        setTimeout(() => {
            this.targetColor = this.aiState.color || '#00ffcc';
            this.energy = this.aiState.energyScore || 0.5;
            this.reactivity = this.aiState.reactivity || 1.0;
        }, 1500);
    },

    triggerTranquility() {
        const tranquilBlue = "#A5F3FC"; // Cyan 200/300
        this.targetColor = tranquilBlue;
        this.energy = 0.2;
        this.reactivity = 0.3;

        // Decelerate everything
        this.particles.forEach(p => {
            p.vx *= 0.1;
            p.vy *= 0.1;
            p.alpha = 1.0;
        });

        setTimeout(() => {
            this.targetColor = this.aiState.color || '#00ffcc';
            this.energy = this.aiState.energyScore || 0.5;
            this.reactivity = this.aiState.reactivity || 1.0;
        }, 2500);
    }
};

