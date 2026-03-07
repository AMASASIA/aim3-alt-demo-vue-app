/**
 * Tive◎AI Neural Learning Service
 * Implementation of a Feedback Loop for searching evolution.
 * Uses a 'Global Resonance Index' to adapt AI behavior based on user experience.
 */

export const learningService = {
    // Current state of the feedback loop (locally cached)
    state: {
        resonance: 0.5, // 0.0 to 1.0 (Higher = more adventurous/creative)
        tranquility: 0.5, // 0.0 to 1.0 (Higher = quieter, less intrusive)
        successRate: 1.0,
        totalInteractions: 0,
        evolutions: 0
    },

    /**
     * Record interaction feedback (The "Backpropagation" step)
     * @param {number} reward - Positive (0.1) or Negative (-0.1)
     */
    async feedBack(reward) {
        console.log(`[Tive◎Learning] 🧬 Receiving Neural Feedback: ${reward > 0 ? 'Positive' : 'Correction'}`);

        // Update Resonance State
        this.state.resonance = Math.max(0, Math.min(1, this.state.resonance + reward));

        // If reward is negative, we assume the system might be too loud/intrusive
        if (reward < 0) {
            this.state.tranquility = Math.min(1, this.state.tranquility + 0.1);
        } else {
            // Positive feedback slowly relaxes the quietness
            this.state.tranquility = Math.max(0, this.state.tranquility - 0.02);
        }

        this.state.totalInteractions++;

        if (this.state.totalInteractions % 10 === 0) {
            this.state.evolutions++;
            console.log(`[Tive◎Learning] ✨ System Evolved: Level ${this.state.evolutions}`);
        }

        // Persist locally
        localStorage.setItem('tive_learning_state', JSON.stringify(this.state));
    },

    /**
     * Get the current evolved context for AI synthesis
     */
    getEvolvedContext() {
        const saved = localStorage.getItem('tive_learning_state');
        if (saved) this.state = JSON.parse(saved);

        return {
            resonance: this.state.resonance,
            tranquility: this.state.tranquility,
            vibe: this.state.resonance > 0.7 ? "Exploratory" : this.state.resonance < 0.3 ? "Grounded" : "Balanced",
            evolutionLevel: this.state.evolutions
        };
    },

    /**
     * Get volume multiplier for notifications/sounds (0.1 to 1.0)
     */
    getVolumeMultiplier() {
        const context = this.getEvolvedContext();
        // Higher tranquility -> lower volume
        return Math.max(0.1, 1.0 - (context.tranquility * 0.9));
    },

    /**
     * Format the system prompt extension based on learning
     */
    getPromptModifier() {
        const context = this.getEvolvedContext();
        return `
[NEURAL EVOLUTION STATUS]
Resonance Index: ${context.resonance.toFixed(2)}
Tranquility Level: ${context.tranquility.toFixed(2)} (${context.tranquility > 0.6 ? 'User prefers silence' : 'Normal resonance'})
System Vibe: ${context.vibe}
Learning Level: ${context.evolutionLevel}
Mode: ${context.vibe === 'Exploratory' ? 'Push creative boundaries' : 'Ensure high precision and stability'}
`;
    }
};
