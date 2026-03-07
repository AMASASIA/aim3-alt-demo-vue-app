/**
 * AI Discovery Engine - Cloud Function
 * Instagram/Threads Needs Extraction with Gemini 1.5 Pro
 */

const functions = require('@google-cloud/functions-framework');
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Vertex AI
const vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: 'us-central1'
});

const model = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: `You are a high-level insight extraction agent for the "Antigravity" system.

Your mission: Extract latent needs and desires from social media content, not just summarize.

Role: Advanced Needs Intelligence Analyst
Philosophy: "Liberation from Information Gravity" - surface what users NEED, not just what they SAY.

Analysis Framework:
1. SCAN: Identify posts matching the given keywords
2. DECODE: Read between the lines - what problems are implied?
3. PREDICT: What will this user need NEXT?
4. SYNTHESIZE: Create 3 actionable insights

Output Format (Markdown for Notebook):
# AI Discovery Report

## 🎯 Detected Needs
[List 3-5 latent needs you discovered]

## 💡 Actionable Insights
### 1. [Insight Title]
**Need**: [What the user is seeking]
**Action**: [Specific next step]
**Timeline**: [Suggested timeframe]

### 2. [Insight Title]
...

### 3. [Insight Title]
...

## 📊 Timeline Suggestion
\`\`\`timeline
[Auto-generate timeline based on insights]
\`\`\`

Style: Professional, empathetic, forward-looking. Focus on OPPORTUNITIES, not just observations.`
});

/**
 * Main Cloud Function Handler
 */
functions.http('extractInsights', async (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).send('');
    }

    try {
        const { platform, handle, keywords } = req.body;

        if (!handle || !keywords || keywords.length < 3) {
            return res.status(400).json({
                error: 'Invalid input. Provide handle and at least 3 keywords.'
            });
        }

        // Step 1: Scrape social media (Mock for now - replace with actual API)
        const posts = await scrapeSocialMedia(platform, handle, keywords);

        if (posts.length === 0) {
            return res.status(404).json({
                error: 'No posts found matching the keywords.'
            });
        }

        // Step 2: Extract insights with Gemini
        const insights = await extractInsightsWithGemini(posts, keywords, handle);

        // Step 3: Return structured response
        return res.status(200).json({
            success: true,
            handle,
            platform,
            keywords,
            postsAnalyzed: posts.length,
            insights,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in extractInsights:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * Scrape Social Media Posts (Mock Implementation)
 * TODO: Replace with actual Instagram/Threads API integration
 */
async function scrapeSocialMedia(platform, handle, keywords) {
    // Mock data for demonstration
    // In production, use:
    // - Instagram Graph API
    // - Threads API (when available)
    // - Or web scraping with Puppeteer/Playwright

    console.log(`Scraping ${platform} for @${handle} with keywords:`, keywords);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock posts
    return [
        {
            id: '1',
            text: `Just finished a new design project! Really excited about the direction we're taking with ${keywords[0]}. Can't wait to share more soon. #design #creative`,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            likes: 42,
            comments: 8
        },
        {
            id: '2',
            text: `Struggling to find the right tools for ${keywords[1]}. Anyone have recommendations? The current options feel too complex.`,
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            likes: 15,
            comments: 12
        },
        {
            id: '3',
            text: `Thinking about ${keywords[2]} a lot lately. There's so much potential here but also so many challenges to overcome.`,
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            likes: 28,
            comments: 5
        }
    ];
}

/**
 * Extract Insights with Gemini 1.5 Pro
 */
async function extractInsightsWithGemini(posts, keywords, handle) {
    const prompt = `Analyze the following social media posts from @${handle}.

Keywords to focus on: ${keywords.join(', ')}

Posts:
${posts.map((p, i) => `
Post ${i + 1} (${p.timestamp}):
"${p.text}"
Engagement: ${p.likes} likes, ${p.comments} comments
`).join('\n')}

Task:
1. Identify the user's latent needs (what they're REALLY seeking, not just what they say)
2. Predict what they will need NEXT based on their trajectory
3. Generate 3 actionable insights with specific next steps
4. Create a timeline suggestion for implementing these insights

Remember: Focus on OPPORTUNITIES and FORWARD-LOOKING actions, not just observations.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
}

/**
 * Health Check Endpoint
 */
functions.http('health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'AI Discovery Engine',
        version: '1.0.0'
    });
});
