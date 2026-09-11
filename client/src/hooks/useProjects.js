import { useEffect, useRef, useState, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import { getContractRead } from "../config/contract";
import { computeStats, getChainNow } from "../lib/crowdfunding";

export function useProjects() {
  const { provider } = useWeb3();
  const [state, setState] = useState({ projects: [], loading: true, error: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const cancelled = useRef(false);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    cancelled.current = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    let contract;
    try {
      contract = getContractRead(provider);
    } catch {
      setState({ projects: [], loading: false, error: "Contract could not be initialised." });
      return undefined;
    }

    (async () => {
      try {
        const metas = await contract.getAllProjectsDetail();
        const now = await getChainNow(provider);
        if (!metas.length) {
          if (!cancelled.current) setState({ projects: [], loading: false, error: null });
          return;
        }
        const projects = metas.map((m, id) => ({
          id,
          name: m.projectName,
          description: m.projectDescription,
          creatorName: m.creatorName,
          cid: m.cid,
          category: Number(m.category),
          fundingGoal: m.fundingGoal,
          amountRaised: m.amountRaised,
          totalContributors: m.totalContributors.toNumber(),
          creationTime: m.creationTime,
          duration: m.duration,
          ...computeStats(m, now),
        }));
        if (!cancelled.current) setState({ projects, loading: false, error: null });
      } catch (err) {
        console.error("useProjects", err);
        if (!cancelled.current) {
          setState({
            projects: [],
            loading: false,
            error: err?.reason || err?.message || "Failed to load projects.",
          });
        }
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, [provider, refreshKey]);

  return { ...state, refresh };
}