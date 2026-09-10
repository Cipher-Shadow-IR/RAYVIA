import { useEffect, useRef, useState, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import { getContractRead } from "../config/contract";
import { computeStats, toEth, toNum } from "../lib/crowdfunding";

export function useProject(id) {
  const { provider } = useWeb3();
  const [state, setState] = useState({ project: null, loading: true, error: null });
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
      setState({ project: null, loading: false, error: "Contract could not be initialised." });
      return undefined;
    }

    let alive = true;
    (async () => {
      try {
        const raw = await contract.getProject(id);
        const stats = computeStats(raw);
        const contributors = (raw.contributors || []).map((addr, i) => ({
          address: addr,
          amount: toEth(raw.amount[i]),
          refundClaimed: Boolean(raw.refundClaimed[i]),
        }));

        const project = {
          id,
          name: raw.projectName,
          description: raw.projectDescription,
          creatorName: raw.creatorName,
          projectLink: raw.projectLink,
          cid: raw.cid,
          creatorAddress: raw.creatorAddress,
          category: Number(raw.category),
          refundPolicy: Number(raw.refundPolicy),
          claimedAmount: Boolean(raw.claimedAmount),
          creationTime: toNum(raw.creationTime),
          totalContributors: contributors.length,
          ...stats,
          contributors,
        };

        if (alive && !cancelled.current) setState({ project, loading: false, error: null });
      } catch (err) {
        console.error("useProject", err);
        if (alive && !cancelled.current) {
          setState({
            project: null,
            loading: false,
            error: err?.reason || err?.message || "Failed to load this project.",
          });
        }
      }
    })();

    return () => {
      alive = false;
      cancelled.current = true;
    };
  }, [provider, id, refreshKey]);

  return { ...state, refresh };
}