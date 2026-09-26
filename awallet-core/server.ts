import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { 
  http, 
  createPublicClient, 
  formatEther, 
  parseEther, 
  encodeFunctionData, 
  erc20Abi, 
  type Hex 
} from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";

dotenv.config();

const app = express();
app.use(express.json());

// CORS ヘッダー
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// コントラクト定数 (Base Sepolia)
const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const ESCROW_VAULT_ADDRESS = "0x8453A2A01492dCe883f3ed872659dc01ab8872f0" as const;

// Amane A2A Escrow ABI (主要関数)
const a2aEscrowAbi = [
  {
    type: "function",
    name: "depositAndLockEscrow",
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "workerAgent", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "releaseEscrowOnProof",
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "proofHash", type: "bytes32" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;

const apiKey = process.env.PIMLICO_API_KEY || "pim_LojtYE6oa6HKyVsFFmsBQm";
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

async function getSmartClient(privateKey: Hex) {
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

  return { account, smartAccountClient };
}

// 1. ヘルスチェック
app.get("/health", (req, res) => {
  res.json({ status: "OK", protocol: "Amane Protocol", model: "tive-ai", network: "Base Sepolia (84532)" });
});

// 2. スキル一覧 (skill.md 準拠)
app.get("/skills", (req, res) => {
  res.json({
    skills: [
      { name: "get_wallet_address", description: "AWallet のスマートアカウントアドレスを照会" },
      { name: "get_wallet_balance", description: "ETH / USDC 残高の取得" },
      { name: "execute_gasless_transaction", description: "Pimlico Paymaster によるガスレス UserOp 実行" },
      { name: "a2a_deposit_escrow", description: "A2A タスク報酬 USDC をエスクローへロック" },
      { name: "a2a_release_escrow", description: "成果物検証を以てエスクローを解除・支払い" }
    ]
  });
});

// 3. 残高照会
app.post("/balance", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    if (!address || !address.startsWith("0x")) {
      return res.status(400).json({ error: "有効な 0x アドレスが必要です。" });
    }

    const ethBalance = await publicClient.getBalance({ address });
    const usdcBalance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address]
    });

    res.json({
      address,
      ethBalance: formatEther(ethBalance),
      usdcBalance: (Number(usdcBalance) / 1e6).toFixed(2)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. ガスレストランザクション実行 (Automation)
app.post("/execute", async (req: Request, res: Response) => {
  try {
    const { to, data, valueEth } = req.body;
    const privateKey = process.env.PRIVATE_KEY as Hex;
    if (!privateKey) throw new Error("PRIVATE_KEY が未設定です。");

    const { account, smartAccountClient } = await getSmartClient(privateKey);
    const valueWei = valueEth ? parseEther(valueEth) : 0n;

    const txHash = await smartAccountClient.sendTransaction({
      to: to as `0x${string}`,
      data: (data || "0x") as `0x${string}`,
      value: valueWei,
    });

    res.json({
      status: "SUCCESS",
      smartAccountAddress: account.address,
      txHash,
      explorer: `https://sepolia.basescan.org/tx/${txHash}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. A2A エスクロー預託 (depositAndLockEscrow)
app.post("/a2a/deposit", async (req: Request, res: Response) => {
  try {
    const { taskId, workerAgent, amountUsdc } = req.body;
    const privateKey = process.env.PRIVATE_KEY as Hex;
    if (!privateKey) throw new Error("PRIVATE_KEY が未設定です。");

    const { smartAccountClient } = await getSmartClient(privateKey);
    const amountUnits = BigInt(Math.floor(Number(amountUsdc) * 1e6));

    const callData = encodeFunctionData({
      abi: a2aEscrowAbi,
      functionName: "depositAndLockEscrow",
      args: [taskId as `0x\({string}`, workerAgent as `0x\){string}`, amountUnits]
    });

    const txHash = await smartAccountClient.sendTransaction({
      to: ESCROW_VAULT_ADDRESS,
      data: callData,
      value: 0n,
    });

    res.json({
      status: "ESCROW_LOCKED",
      taskId,
      txHash,
      explorer: `https://sepolia.basescan.org/tx/${txHash}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[AWallet Core Service] 起動完了 (Port: ${PORT})`);
});
