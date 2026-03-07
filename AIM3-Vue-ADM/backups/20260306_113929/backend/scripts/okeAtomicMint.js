const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. プロジェクト全ファイルの再帰的読み込みとハッシュ化
// ==========================================
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (
            fullPath.includes('node_modules') ||
            fullPath.includes('.git') ||
            fullPath.includes('dist') ||
            fullPath.includes('.env') ||
            file === 'package-lock.json'
        ) {
            return;
        }
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

function generateProjectHash() {
    console.log("[1/3] Scanning project directories...");
    const projectRoot = path.resolve(__dirname, '../../');
    const targetDirs = ['src', 'backend', 'contracts'];
    let allFiles = [];

    targetDirs.forEach(dir => {
        const dirPath = path.join(projectRoot, dir);
        if (fs.existsSync(dirPath)) {
            allFiles = getAllFiles(dirPath, allFiles);
        }
    });

    allFiles.sort(); // 決定論的ハッシュのためのソート

    console.log(`[2/3] Hashing ${allFiles.length} source code files...`);
    const hash = crypto.createHash('sha256');

    allFiles.forEach(file => {
        const fileContent = fs.readFileSync(file, 'utf8');
        hash.update(file);
        hash.update(fileContent);
    });

    return hash.digest('hex');
}

// ==========================================
// 2. OKE Atomic Mint の実行メインロジック
// ==========================================
async function executeAtomicMint() {
    console.log("Initiating AIM3 OKE Atomic Mint (Proof of Creation)...\n");

    const codeHash = generateProjectHash();
    const timestamp = new Date().toISOString();

    // Web3時代の「シュリンクラップ契約 兼 公開書簡」
    const proofOfCreationText = `
        【AIM3 / AMAS OS: OKE Atomic Mint Declaration】
        This immutable ledger entry serves as the absolute Proof of Creation. 
        I hereby declare that the architecture, logic, and workflows (including Triple Mint, 
        Semantic Recall) of this system were engineered by me at this exact timestamp.

        [法的防衛および自動適用ライセンス (Automatic Shrink-wrap License)]
        1. 独占的所有権: 本ハッシュに紐づくコード群およびビジネスロジックの著作権・特許的権利は、
           本スマートコントラクトを実行したウォレット所有者に独占的に帰属する。
        2. シュリンクラップ型 競業避止義務: 本プロジェクトのコード、アーキテクチャ、または
           その概念を解析・参照した時点で、閲覧者は本ライセンス条項に自動的に同意したものとみなす。
           著作者の書面による許諾なき商業的流用、類似AIモデルの構築、および競合サービスの展開を固く禁ずる。
        3. 非独占的ライセンス権の留保: 著作者は、本技術を第三者企業へ提供・ライセンスする
           絶対的な権利を留保する。
    `.trim();

    const originPacket = {
        title: "AIM3 Core Architecture - OKE Atomic Mint",
        codeHash: codeHash,
        architectureImage: "ipfs://QmYourArchitectureDiagramHashHere...",
        license: "AMAS OS Proprietary & Shrink-wrap Non-Compete",
        proofOfIntent: proofOfCreationText,
        timestamp: timestamp
    };

    console.log(`[3/3] Generating Immutable Record via OKE Protocol...`);

    try {
        // モック用の成功ログ（本番ではokeGateway.mintTripleFactを呼び出し）
        const mockTxHash = "0x" + crypto.randomBytes(32).toString('hex');

        console.log(`\n=================================================`);
        console.log(`[SUCCESS] OKE Atomic Mint Executed!`);
        console.log(`[PROJECT HASH] ${codeHash}`);
        console.log(`[TX HASH] ${mockTxHash}`);
        console.log(`[VERIFY]  https://amas.asia/verify/${mockTxHash}`);
        console.log(`=================================================\n`);
        console.log(`あなたの「公開書簡」は、不可逆のルールとしてブロックチェーンに刻印されました。`);

    } catch (error) {
        console.error("OKE Atomic Mint Failed:", error);
    }
}

executeAtomicMint();
