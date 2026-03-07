// src/engine/ai.js
export async function askGemini(prompt, key) {
    if (!key) {
        console.error("Gemini API Key is missing");
        return {};
    }

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json",
                    }
                })
            }
        );

        if (!res.ok) {
            throw new Error(`Gemini API Error: ${res.statusText}`);
        }

        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        return JSON.parse(text); // Return the parsed JSON directly
    } catch (e) {
        console.error("askGemini Error:", e);
        return {};
    }
}
