import "dotenv/config";
import { http, createPublicClient } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";

async function main() {
  console.log("=== AWallet (Amane Protocol / tive-ai) 起動 ===");

  const apiKey = process.env.PIMLICO_API_KEY;
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;

  if (!apiKey || !privateKey) {
    throw new Error(".env の設定が見つかりません。");
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

  console.log(`Smart Account Address: ${account.address}`);

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

  console.log("UserOperation を送信中 (Automation 実行)...");

  const txHash = await smartAccountClient.sendTransaction({
    to: "0x0000000000000000000000000000000000000000",
    data: "0x",
    value: 0n,
  });

  console.log("=== 実行成功 ===");
  console.log(`Transaction Hash: ${txHash}`);
  console.log(`Basescan 確認 URL: https://sepolia.basescan.org/tx/${txHash}`);
}

main().catch(console.error);
