/**
 * AIM3 Search Engine — Frontend Service Layer
 * =============================================
 * 
 * Unified client for the AIM3 Search Engine Python backend.
 * Used by both Discovery and Invisible Finance features.
 * 
 * Security: All calls use POST with JSON body. No sensitive data in URLs.
 * Lightweight: Lazy initialization, no external dependencies, graceful fallback.
 */

const AIM3_API_BASE = import.meta.env.VITE_AIM3_SEARCH_URL || 'http://localhost:8000';

/**
 * AIM3 Serendipity-Contextual Search
 * Called from: DiscoveryPanel → NotebookView.handleExtractInsights
 * 
 * @param {Object} params
 * @param {string} params.queryText - Search query
 * @param {string} params.userId - Current user ID
 * @param {number} params.intentLevel - Intent strength (0.0-1.0)
 * @param {string} params.environment - Context ('deep_work', 'walking', etc.)
 * @param {number} params.soulPoints - SOUL reliability score
 * @param {number} [params.serendipityFactor=0.15] - Noise coefficient
 * @param {number} [params.topK=5] - Number of results
 * @returns {Promise<Object>} Search results with AIM3 scoring
 */
export async function aim3Search({
    queryText,
    userId = 'anonymous',
    intentLevel = 0.7,
    environment = 'deep_work',
    soulPoints = 1000,
    serendipityFactor = 0.15,
    topK = 5
}) {
    try {
        const response = await fetch(`${AIM3_API_BASE}/aim3/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query_text: queryText,
                current_context: {
                    user_id: userId,
                    intent_level: intentLevel,
                    environment: environment,
                    soul_points: soulPoints
                },
                serendipity_factor: serendipityFactor,
                top_k: topK
            })
        });

        if (!response.ok) {
            throw new Error(`AIM3 Search failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.warn('[AIM3 Search] Backend unavailable, using local fallback:', error.message);
        return null; // Caller should fallback to mock
    }
}

/**
 * Index an artifact into the AIM3 search engine
 * Called from: Invisible Finance memory ingest, Notebook save-diary
 * 
 * @param {Object} params
 * @param {string} params.content - Text content to index
 * @param {string} params.userId - Owner user ID
 * @param {string[]} [params.tags] - Concept tags
 * @param {string} [params.artifactType] - Type identifier
 * @param {number} [params.intentLevel] - Creator's intent level
 * @param {number} [params.soulPoints] - SOUL score
 * @returns {Promise<Object|null>} Index result or null on failure
 */
export async function aim3Index({
    content,
    userId = 'anonymous',
    tags = [],
    artifactType = 'notebook_entry',
    intentLevel = 0.7,
    soulPoints = 1000,
    environment = 'deep_work'
}) {
    try {
        const response = await fetch(`${AIM3_API_BASE}/aim3/index`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,
                context: {
                    user_id: userId,
                    intent_level: intentLevel,
                    environment: environment,
                    soul_points: soulPoints
                },
                tags,
                artifact_type: artifactType
            })
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        // Silent fail — indexing is non-critical
        console.warn('[AIM3 Index] Skipped:', error.message);
        return null;
    }
}

/**
 * Health check for AIM3 engine availability
 * @returns {Promise<boolean>}
 */
export async function aim3HealthCheck() {
    try {
        const response = await fetch(`${AIM3_API_BASE}/aim3/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000) // 2s timeout
        });
        return response.ok;
    } catch {
        return false;
    }
}

export default {
    aim3Search,
    aim3Index,
    aim3HealthCheck
};
