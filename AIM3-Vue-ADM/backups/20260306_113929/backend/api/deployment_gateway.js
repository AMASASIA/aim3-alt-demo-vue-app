const express = require('express');
const router = express.Router();
const MintDeploymentAgent = require('../agent-engine/mint_deployment_agent');
const fs = require('fs');
const path = require('path');

// Load workflow definition
const WORKFLOW_DEF = JSON.parse(fs.readFileSync(path.join(__dirname, '../opal-bridge/opal_workflow_deployment.json')));

router.post('/generate-dashboard', async (req, res) => {
    try {
        const { atomicFacts, labels } = req.body;
        console.log(`[Deployment Gateway] Triggered Dashboard Generation for ${atomicFacts?.projectName}`);

        // Initialize MINT Agent specialized for Deployment Media
        const agent = new MintDeploymentAgent(process.env.GEMINI_API_KEY);

        // Execute workflow with correct signature
        const inputData = { atomicFacts, labels };
        const result = await agent.executeWorkflow(inputData, WORKFLOW_DEF);

        // Result structural check
        // executeWorkflow returns { context, trace }

        res.json({
            status: 'success',
            trace: result.trace,
            output: {
                heroImage: result.context.hero_image_url,
                videoUrl: result.context.showcase_video_url,
                projectContext: result.context.project_context,
                html: result.context.dashboard_html
            }
        });

    } catch (error) {
        console.error('[Deployment Gateway] Error:', error);
        res.status(500).json({ error: 'Deployment Generation Failed', details: error.message });
    }
});

module.exports = router;
