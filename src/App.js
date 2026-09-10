import "./style.css";
import NavbarComponent from "./components/NavbarComponent";
import HomeComponent from "./components/HomeComponent";
import FooterComponent from "./components/FooterComponent";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import CreateProjectComponent from "./components/CreateProjectComponent";
import ConnectWallet from "./components/ConnectWallet";
import DiscoverComponent from "./components/DiscoverComponent";
import ProjectComponent from "./components/ProjectComponent";
import ProfileComponent from "./components/ProfileComponent";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CROWDFUNDING_ABI } from "./config/contracts";
import { connectWallet, ensureSupportedNetwork } from "./utils/wallet";

function getNetworkLabel(chainId) {
  if (Number(chainId) === 31337) return "HARDHAT LOCAL";
  if (Number(chainId) === 11155111) return "ETHEREUM SEPOLIA";
  return chainId ? `CHAIN ${chainId}` : "";
}

function App() {
  const [myContract, setMyContract] = useState(null);
  const [address, setAddress] = useState("");
  const [networkLabel, setNetworkLabel] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const initWeb3 = useCallback(async (userAccount) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = userAccount || (await signer.getAddress());
      const network = await provider.getNetwork();
      setAddress(account);
      setNetworkLabel(getNetworkLabel(network.chainId));

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, signer);
      setMyContract(contract);
      setErrorMessage("");
    } catch (err) {
      console.error("Contract initialization error:", err);
      setErrorMessage("Failed to connect to smart contract at address: " + CONTRACT_ADDRESS);
    }
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage("");
    try {
      const userAccount = await connectWallet();
      await initWeb3(userAccount);
    } catch (err) {
      console.error("Wallet connection error:", err);
      const msg = err?.reason || err?.message || "Failed to connect wallet.";
      setErrorMessage(msg);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAddress("");
          setMyContract(null);
        } else {
          initWeb3(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Auto-connect if already authorized
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          ensureSupportedNetwork().then(() => initWeb3(accounts[0])).catch(console.error);
        }
      });

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [initWeb3]);

  const checkConnected = (component) => {
    return !myContract ? (
      <ConnectWallet
        connectMetamask={handleConnect}
        isConnecting={isConnecting}
        errorMessage={errorMessage}
      />
    ) : (
      component
    );
  };

  return (
    <div className="app">
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <NavbarComponent
          address={address}
          connectMetamask={handleConnect}
          networkLabel={networkLabel}
        />
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route
              path="/"
              element={checkConnected(<HomeComponent contract={myContract} />)}
            />
            <Route
              path="/discover"
              element={checkConnected(
                <DiscoverComponent contract={myContract} />
              )}
            />
            {/* Canonical Route */}
            <Route
              path="/start-project"
              element={checkConnected(
                <CreateProjectComponent contract={myContract} userAddress={address} />
              )}
            />
            {/* Legacy Route Alias */}
            <Route
              path="/create_project"
              element={<Navigate to="/start-project" replace />}
            />
            <Route
              path="/profile"
              element={checkConnected(
                <ProfileComponent contract={myContract} userAddress={address} />
              )}
            />
            <Route
              path="/profile/:userAddr"
              element={checkConnected(
                <ProfileComponent contract={myContract} userAddress={address} />
              )}
            />
            <Route
              path="/project"
              element={checkConnected(
                <ProjectComponent contract={myContract} userAddress={address} />
              )}
            />
            <Route
              path="/project/:id"
              element={checkConnected(
                <ProjectComponent contract={myContract} userAddress={address} />
              )}
            />
          </Routes>
        </main>
        <FooterComponent networkLabel={networkLabel} />
      </BrowserRouter>
    </div>
  );
}

export default App;
