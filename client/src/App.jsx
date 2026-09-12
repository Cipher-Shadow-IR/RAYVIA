import { Route, Routes, Navigate } from "react-router-dom";
import { useMemo } from "react";
import Layout from "./components/Layout";
import PageFade from "./components/PageFade";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import ProjectDetail from "./pages/ProjectDetail";
import CreateProject from "./pages/CreateProject";
import Profile from "./pages/Profile";
import { NotFound } from "./pages/NotFound";
import { useWeb3 } from "./context/Web3Context";
import { NETWORK_NAME } from "./config/contract";

export default function App() {
  const { account, chainId, expectedChainId } = useWeb3();

  const resolvedNetwork = useMemo(() => {
    if (!account) return "NETWORK DISCONNECTED";
    if (Number(expectedChainId) === 11155111) return "ETHEREUM SEPOLIA";
    if (chainId === 31337) return "HARDHAT LOCAL";
    if (Number(chainId) === Number(expectedChainId)) return NETWORK_NAME;
    return `CHAIN ${chainId || "UNKNOWN"}`;
  }, [account, chainId, expectedChainId]);

  return (
    <Layout networkName={resolvedNetwork}>
      <PageFade>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/project/:id" element={<ProjectDetail />} />

          <Route path="/start-project" element={<CreateProject />} />
          <Route path="/create_project" element={<CreateProject />} />
          <Route path="/create" element={<Navigate to="/start-project" replace />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:address" element={<Profile />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageFade>
    </Layout>
  );
}