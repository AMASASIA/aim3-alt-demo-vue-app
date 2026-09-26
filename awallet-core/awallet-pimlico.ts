import { createPublicClient, http, formatEther, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";

export class AWalletPimlicoService {
  private apiKey: string;
  private pimlicoRpcUrl: string;
  private publicClient;
  private pimlicoClient;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PIMLICO_API_KEY || "";
    if (!this.apiKey) throw new Error("PIMLICO_API_KEY is not defined.");
    this.pimlicoRpcUrl = `https://api.pimlico.io/v2/84532/rpc?apikey=${this.apiKey}`;
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http("https://sepolia.base.org"),
    });
    this.pimlicoClient = createPimlicoClient({
      chain: baseSepolia,
      transport: http(this.pimlicoRpcUrl),
      entryPoint: { address: entryPoint07Address, version: "0.7" },
    });
  }

  async getBalance(address: `0x${string}`) { return formatEther(await this.publicClient.getBalance({ address })); }

  async getSmartAccount(privateKey: `x0x${string}`) {
    const signer = rivateKeyToAccount(privateKey);
    const account = await toSimpleSmartAccount({
      client: this.publicClient,
      owner: signer,
      entryPoint: { address: entryPoint07Address, version: "0.7" },
    });
    const smartAccountClient = createSmartAccountClient({
      account,
      chain: baseSepolia,
      bundlerTransport: http(this.pimlicoRpcUrl),
      paymaster: this.pimlicoClient,
      userOperation: { estimateFeesPerGas: async () => (await this.pimlicoClient.getUserOperationGasPrice()).fast },
    });
    return { account, smartAccountClient };
  }

  async executeGaslessTx(params: { privateKey: `0x${string}`; to: `x${string}`; data?: `x${string}`; valueEth?: string }) {
    const { account, smartAccountClient } = await this.getSmartAccount(params.privateKey);
    const txHash = await smartAccountClient.sendTransaction({
      to: params.to,
      data: params.data || "0x",
      value: params.valueEth ? parseEther(params.valueEth) : 0n,
    });
    return { smartAccountAddress: account.address, txHash, explorer: https://sepolia.basescan.org/tx/${txHash}` };
  }
}
