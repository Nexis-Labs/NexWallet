import { Network } from "core/types";

export const NEXIS: Network[] = [
  // Mainnet
  {
    chainId: 2371,
    type: "mainnet",
    rpcUrls: ["https://evm-devnet.nexis.network"],
    chainTag: "nexis",
    name: "Nexis",
    nativeCurrency: {
      symbol: "NZT",
      name: "Nexis",
      decimals: 18,
    },
    ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    explorerUrls: ["https://evm-devnet.nexscan.io"],
    explorerApiUrl: "https://evm-devnet.nexscan.io/api",
    faucetUrls: [],
    infoUrl: "https://nexis.network",
  },
  {
    chainId: 1001,
    type: "mainnet",
    rpcUrls: ["https://zkevm-testnet.nexis.network"],
    chainTag: "zk-nexis", //detonation: tag determines the icon path
    name: "Nexis",
    nativeCurrency: {
      symbol: "NZT",
      name: "Nexis",
      decimals: 18,
    },
    ensRegistry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    explorerUrls: ["https://zkevm-testnet.nexscan.io"],
    explorerApiUrl: "https://zkevm-testnet.nexscan.io/api",
    faucetUrls: [],
    infoUrl: "https://nexis.network",
  },
];
