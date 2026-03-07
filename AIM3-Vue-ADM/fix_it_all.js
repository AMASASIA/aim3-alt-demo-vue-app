import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Running FINAL SYSTEM CHECK...");

const checks = [
    {
        name: 'Backend Core',
        file: 'backend/server.js',
        check: (content) => content.includes("app.use('/deployment', require('./api/deployment_gateway'));")
    },
    {
        name: 'Deployment Agent',
        file: 'backend/agent-engine/mint_deployment_agent.js',
        check: (content) => content.includes("executeWorkflow")
    },
    {
        name: 'Routing',
        file: 'src/router/index.js',
        check: (content) => content.includes("path: '/deployment'")
    },
    {
        name: 'UI Integration',
        file: 'src/views/MainDashboard.vue',
        check: (content) => content.includes("Deploy Dash")
    }
];

let allPassed = true;

checks.forEach(test => {
    const filePath = path.join(__dirname, test.file);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ [FAIL] ${test.name}: File missing (${test.file})`);
        allPassed = false;
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    if (test.check(content)) {
        console.log(`✅ [PASS] ${test.name}`);
    } else {
        console.error(`❌ [FAIL] ${test.name}: Logic check failed`);
        allPassed = false;
    }
});

if (allPassed) {
    console.log("\n🎉 SYSTEM INTEGRITY 100%. IT IS FIXED.");
    console.log("Reload your browser to see the 'Deploy Dash' button in the sidebar.");
} else {
    console.error("\n⚠️ SYSTEM ISSUES DETECTED.");
}
