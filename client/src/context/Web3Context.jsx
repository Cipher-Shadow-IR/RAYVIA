import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getFallbackProvider,
  getWalletProvider,
  chainLabel,
  CHAIN_ID,
} from "../config/contract";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(getFallbackProvider);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const resetToReadOnly = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setProvider(getFallbackProvider());
  }, []);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return undefined;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        resetToReadOnly();
        return;
      }
      setAccount(accounts[0]);
    };

    const handleChainChanged = (hexChainId) => {
      setChainId(parseInt(hexChainId, 16));
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
  }, [resetToReadOnly]);

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
    } catch (err) {
      if (err && err.code === 4001) {
        setError("Connection request was rejected.");
      } else {
        setError((err && err.message) || "Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    resetToReadOnly();
    setError(null);
  }, [resetToReadOnly]);

  const signer = useMemo(() => {
    if (!account || !provider?.getSigner) return null;
    return provider.getSigner(account);
  }, [account, provider]);

  const value = useMemo(
    () => ({
      account,
      chainId,
      provider,
      signer,
      error,
      connect,
      disconnect,
      isConnecting,
      hasWallet: typeof window !== "undefined" && Boolean(window.ethereum),
      isConnected: Boolean(account),
      networkLabel: chainLabel(chainId ?? CHAIN_ID),
    }),
    [account, chainId, provider, signer, error, connect, disconnect, isConnecting]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within <Web3Provider>");
  return ctx;
}