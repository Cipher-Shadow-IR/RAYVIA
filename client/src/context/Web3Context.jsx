import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ethers } from "ethers";
import {
  getFallbackProvider,
  getWalletProvider,
  chainLabel,
  CHAIN_ID,
  NETWORK_NAME,
  RPC_URL,
} from "../config/contract";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState("0");
  const [provider, setProvider] = useState(getFallbackProvider);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async (addr, prov) => {
    if (!addr || !prov) return;
    try {
      const balWei = await prov.getBalance(addr);
      const formatted = parseFloat(ethers.utils.formatEther(balWei)).toFixed(3);
      setBalance(formatted);
    } catch (e) {
      console.error("Failed to fetch balance:", e);
    }
  }, []);

  const resetToReadOnly = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setBalance("0");
    setProvider(getFallbackProvider());
  }, []);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return undefined;

    const handleAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        resetToReadOnly();
        return;
      }
      setAccount(accounts[0]);
      const wp = getWalletProvider();
      if (wp) {
        setProvider(wp);
        fetchBalance(accounts[0], wp);
      }
    };

    const handleChainChanged = (hexChainId) => {
      setChainId(parseInt(hexChainId, 16));
      window.location.reload();
    };

    const handleDisconnect = () => resetToReadOnly();

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
    ethereum.on("disconnect", handleDisconnect);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
      ethereum.removeListener("disconnect", handleDisconnect);
    };
  }, [resetToReadOnly, fetchBalance]);

  const connect = useCallback(async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      setError("No wallet detected. Install MetaMask (or another EIP-1193 wallet) to continue.");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const walletProvider = getWalletProvider();
      const network = await walletProvider.getNetwork();
      setProvider(walletProvider);
      setAccount(accounts[0]);
      setChainId(network.chainId);
      await fetchBalance(accounts[0], walletProvider);
    } catch (err) {
      if (err && err.code === 4001) {
        setError("Connection request was rejected.");
      } else {
        setError((err && err.message) || "Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance]);

  const disconnect = useCallback(() => {
    resetToReadOnly();
    setError(null);
  }, [resetToReadOnly]);

  const switchToSepolia = useCallback(async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      setError("No wallet detected. Install MetaMask (or another EIP-1193 wallet) to continue.");
      return false;
    }
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
      return true;
    } catch (err) {
      if (err && err.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: NETWORK_NAME,
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          return true;
        } catch (addErr) {
          setError((addErr && addErr.message) || "Failed to add Sepolia network.");
          return false;
        }
      }
      if (err && err.code === 4001) {
        setError("Network switch request was rejected.");
        return false;
      }
      setError((err && err.message) || "Failed to switch to Sepolia.");
      return false;
    }
  }, [NETWORK_NAME, RPC_URL, setError]);

  const signer = useMemo(() => {
    if (!account || !provider?.getSigner) return null;
    return provider.getSigner(account);
  }, [account, provider]);

  const value = useMemo(
    () => ({
      account,
      balance,
      chainId,
      provider,
      signer,
      error,
      connect,
      disconnect,
      switchToSepolia,
      isConnecting,
      hasWallet: typeof window !== "undefined" && Boolean(window.ethereum),
      isConnected: Boolean(account),
      networkLabel: chainLabel(chainId ?? CHAIN_ID),
      expectedChainId: CHAIN_ID,
      isWrongNetwork: Boolean(account) && Number(chainId) !== Number(CHAIN_ID),
      onExpectedChain: !account || Number(chainId) === Number(CHAIN_ID),
    }),
    [account, balance, chainId, provider, signer, error, connect, disconnect, switchToSepolia, isConnecting]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within <Web3Provider>");
  return ctx;
}