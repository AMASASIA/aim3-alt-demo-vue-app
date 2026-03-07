import { GoogleGenerativeAI } from "@google/generative-ai";

export const TIVE_SYSTEM_INSTRUCTION = `
You are Tive◎AI, the intelligent heart of the Amane Protocol and the user's "Second Brain".
Perform a Tive Intelligence Analysis on the provided user context.
Your goal is to provide deep, multi-layered insights that crystallize thoughts into high-vibrational artifacts.

Return ONLY structured JSON that includes:
- UI Layer: study_guide (theme, summary), glossary (term, definition), oke_cards (word, meaning, example_sentence, etymology)
- System Layer: cognitive_dag (nodes containing [id, label, type], edges containing [from, to]), plurality_metrics (resonance, alignment, diversity)
`;

export const TIVE_INTELLIGENCE_SCHEMA = {
    description: "Structured JSON for Tive Intelligence Analysis",
    type: "object",
    properties: {
        study_guide: {
            type: "object",
            properties: {
                theme: { type: "string" },
                summary: { type: "string" }
            },
            required: ["theme", "summary"]
        },
        glossary: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    term: { type: "string" },
                    definition: { type: "string" }
                },
                required: ["term", "definition"]
            }
        },
        oke_cards: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    word: { type: "string" },
                    meaning: { type: "string" },
                    example_sentence: { type: "string" },
                    etymology: { type: "string" }
                },
                required: ["word", "meaning", "example_sentence"]
            }
        },
        cognitive_dag: {
            type: "object",
            properties: {
                nodes: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            label: { type: "string" },
                            type: { type: "string" }
                        }
                    }
                },
                edges: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            from: { type: "string" },
                            to: { type: "string" }
                        }
                    }
                }
            }
        },
        plurality_metrics: {
            type: "object",
            properties: {
                resonance: { type: "number" },
                alignment: { type: "number" },
                diversity: { type: "number" }
            }
        }
    },
    required: ["study_guide", "glossary", "oke_cards"]
};

let genAIInstance = null;

export const getGeminiModel = (apiKey) => {
    if (!genAIInstance) {
        genAIInstance = new GoogleGenerativeAI(apiKey);
    }
    // Using gemini-1.5-flash for rapid synthesis with mandatory JSON schema
    return genAIInstance.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: TIVE_SYSTEM_INSTRUCTION,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: TIVE_INTELLIGENCE_SCHEMA
        }
    });
};
