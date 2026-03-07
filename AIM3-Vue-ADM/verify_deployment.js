import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Verifying Deployment Dashboard Workflow...");

try {
    const files = [
        'backend/opal-bridge/opal_workflow_deployment.json',
        'backend/agent-engine/mint_deployment_agent.js',
        'backend/api/deployment_gateway.js',
        'src/components/DeploymentDashboard.vue'
    ];

    let missing = false;
    files.forEach(f => {
        if (!fs.existsSync(path.join(__dirname, f))) {
            console.error(`❌ Missing: ${f}`);
            missing = true;
        } else {
            console.log(`✅ Found: ${f}`);
        }
    });

    if (missing) {
        throw new Error("Missing critical artifacts.");
    }

    console.log("\nDeployment System Ready!");
    console.log("Access: http://localhost:5173/deployment");

} catch (e) {
    console.error(e.message);
}
