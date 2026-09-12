import { ethers } from "ethers";
import { abi } from "./abi";

export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || "").trim();

export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 11155111);

export const RPC_URL =
  import.meta.env.VITE_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

export const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME || "Sepolia";

export const EXPLORER_URL =
  import.meta.env.VITE_EXPLORER_URL || "https://sepolia.etherscan.io";

export const KNOWN_CHAINS = {
  31337: "Local Hardhat",
  11155111: "Sepolia",
};

export const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export const hasContractConfig = Boolean(CONTRACT_ADDRESS);

export const getFallbackProvider = () =>
  new ethers.providers.JsonRpcProvider(RPC_URL);

export const getWalletProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum, "any");
  }
  return null;
};

export const getContractRead = (provider) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract not configured. Set VITE_CONTRACT_ADDRESS.");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
};

export const getContractWrite = (signer) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract not configured. Set VITE_CONTRACT_ADDRESS.");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
};

export const chainLabel = (id) => KNOWN_CHAINS[id] || `Chain ${id}`;