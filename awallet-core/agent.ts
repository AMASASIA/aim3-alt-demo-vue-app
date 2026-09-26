import "dotenv/config";
import { http, createPublicClient, formatEther, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";

async function main() {
  console.log("=== Amane Protocol Liaison Model (tive-ai) スキルエンジン起動 ===");

  const apiKey = process.env.PIMLICO_API_KEY;
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;

  if (!apiKey || !privateKey) {
    throw new Error(".env に PIMLICO_API_KEY または PRIVATE_KEY が設定されていません。");
  }

  const pimlicoRpcUrl = `https://api.pimlico.io/v2/84532/rpc?apikey=${apiKey}`;

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  const pimlicoClient = createPimlicoClient({
    chain: baseSepolia,
    transport: http(pimlicoRpcUrl),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  const signer = privateKeyToAccount(privateKey);

  const account = await toSimpleSmartAccount({
    client: publicClient,
    owner: signer,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  const smartAccountClient = createSmartAccountClient({
    account,
    chain: baseSepolia,
    bundlerTransport: http(pimlicoRpcUrl),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  // スキル定義 (skill.md 準拠)
  const skills = [
    {
      name: "get_wallet_address",
      description: "AWallet のスマートアカウントアドレスを照会します。",
    },
    {
      name: "get_wallet_balance",
      description: "指定アドレスの ETH 残高を取得します。",
    },
    {
      name: "execute_gasless_transaction",
      description: "Pimlico Paymaster によるガスレスでトランザクションを実行します。",
    },
  ];

  console.log(`\n登録スキル数: ${skills.length}`);
  skills.forEach((s) => console.log(` - [\({s.name}]:\){s.description}`));

  // --- スキル実行 1: アドレス取得 ---
  console.log("\n--- Automation テスト 1: get_wallet_address ---");
  console.log("出力:", {
    protocol: "Amane Protocol",
    model: "tive-ai",
    smartAccountAddress: account.address,
    network: "Base Sepolia (84532)",
  });

  // --- スキル実行 2: 残高取得 ---
  console.log("\n--- Automation テスト 2: get_wallet_balance ---");
  const balance = await publicClient.getBalance({ address: account.address });
  console.log("出力:", {
    address: account.address,
    balanceEth: formatEther(balance),
  });

  // --- スキル実行 3: ガスレストランザクション ---
  console.log("\n--- Automation テスト 3: execute_gasless_transaction ---");
  const txHash = await smartAccountClient.sendTransaction({
    to: "0x0000000000000000000000000000000000000000",
    data: "0x",
    value: 0n,
  });

  console.log("出力:", {
    status: "SUCCESS",
    smartAccountAddress: account.address,
    transactionHash: txHash,
    basescanUrl: `https://sepolia.basescan.org/tx/${txHash}`,
  });

  console.log("\n=== 全スキルの実行が完了しました ===");
}

main().catch(console.error);
