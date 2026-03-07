/**
 * AI Advocacy Engine
 * Handles AI intervention logic, neutral proposals, and mediation generation.
 * Currently configured to use a backend proxy or direct API calls depending on env.
 */

// Placeholder for direct OpenAI/Gemini Logic if client-side extraction is desired.
// Ideally, this calls the backend Agent Endpoint we created earlier (/agent) to keep keys secure.

export async function getAIResponse(userMessage, context = []) {
    try {
        // Use our local backend Agent Engine which manages the LLM keys (Gemini)
        const res = await fetch("/agent", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: userMessage,
                sessionId: 'advocacy-session',
                context: context
            })
        });

        if (!res.ok) throw new Error("Agent Engine unreachable");

        const data = await res.json();

        // Return structured advocacy response
        // In a real scenario, the backend would return specific "advocacy" flags
        return {
            reply: data.response || "I'm listening and observing the consensus.",
            flagged: data.meta?.type === 'COMPLEX' || userMessage.includes('conflict'), // Example heuristic
            interventionType: userMessage.includes('conflict') ? 'MEDIATION' : 'OBSERVATION'
        };

    } catch (error) {
        console.error("AI Advocacy Error:", error);
        return {
            reply: "Advocacy System Offline. Proceeding with caution.",
            flagged: false
        };
    }
}
