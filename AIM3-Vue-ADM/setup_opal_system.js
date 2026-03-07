import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting OPAL x Antigravity System Setup...");

try {
    // 1. Verify Dependencies (Check backend folder specifically)
    console.log("📦 Checking backend dependencies...");
    const backendPkgPath = path.join(__dirname, 'backend/package.json');
    if (fs.existsSync(backendPkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(backendPkgPath, 'utf8'));
        if (!pkg.dependencies || !pkg.dependencies['@google/generative-ai']) {
            console.log("Adding @google/generative-ai to backend...");
            execSync('npm install @google/generative-ai', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit', shell: true });
        }
    }

    // 2. Verify Output Files
    const files = [
        'backend/opal-bridge/opal_workflow_real.json',
        'backend/agent-engine/mint_topology.js',
        'backend/api/opal_gateway.js',
        'backend/opal-bridge/architecture.md',
        'src/components/OkePage.vue'
    ];

    let missing = false;
    files.forEach(f => {
        if (!fs.existsSync(path.join(__dirname, f))) {
            console.error(`❌ Critical Artifact Missing: ${f}`);
            missing = true;
        } else {
            console.log(`✅ Verified: ${f}`);
        }
    });

    if (missing) {
        throw new Error("Some artifacts were not generated correctly.");
    }

    console.log("\n🎉 System Ready!");
    console.log("1. Backend: Ensure `node backend/server.js` is running.");
    console.log("2. Frontend: Ensure `npm run dev` is running.");
    console.log("3. Access OKE Page: http://localhost:5173/oke");

} catch (error) {
    console.error("\n❌ Setup Failed:", error.message);
}
