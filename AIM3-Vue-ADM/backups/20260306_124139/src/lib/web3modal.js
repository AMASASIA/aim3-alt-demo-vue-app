
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'

// 1. Get projectId
// Note: In a real app, you should get a projectId from https://cloud.walletconnect.com
// For now we use a public example ID, but this should be changed for production
const projectId = 'afbd967e85c866d9c656096350334812'

// 2. Set chains
const mainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
}

const base = {
    chainId: 8453,
    name: 'Base',
    currency: 'ETH',
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://mainnet.base.org'
}

const baseSepolia = {
    chainId: 84532,
    name: 'Base Sepolia',
    currency: 'ETH',
    explorerUrl: 'https://sepolia.basescan.org',
    rpcUrl: 'https://sepolia.base.org'
}

// 3. Create your application's metadata
const metadata = {
    name: 'ANTIGRAVITY / AIM3',
    description: 'AI-Native P2P & Atomic Mint Platform',
    url: 'https://your-vercel-app-url.vercel.app', // Replace with your actual domain
    icons: ['https://avatars.mywebsite.com/']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
    /*Required*/
    metadata,

    /*Optional*/
    enableEIP6963: true, // true by default
    enableInjected: true, // true by default
    enableCoinbase: true, // true by default
    rpcUrl: '...' // used for the Coinbase SDK
    // defaultChainId: 1 // used for the Coinbase SDK
})

// 5. Create Web3Modal instance
const modal = createWeb3Modal({
    ethersConfig,
    chains: [mainnet, base, baseSepolia],
    projectId,
    enableAnalytics: true // Optional - defaults to your Cloud configuration
})

export { modal }
