import { useEffect, useRef, useState, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import { getContractRead } from "../config/contract";
import { computeStats, toEth } from "../lib/crowdfunding";

function enrich(meta, id) {
  return {
    id,
    name: meta.projectName,
    description: meta.projectDescription,
    creatorName: meta.creatorName,
    cid: meta.cid,
    category: Number(meta.category),
    fundingGoal: meta.fundingGoal,
    amountRaised: meta.amountRaised,
    totalContributors: meta.totalContributors.toNumber(),
    creationTime: meta.creationTime,
    duration: meta.duration,
    ...computeStats(meta),
  };
}

export function useProfile(address) {
  const { provider } = useWeb3();
  const [state, setState] = useState({
    created: [],
    funded: [],
    totalContributed: 0,
    loading: Boolean(address),
    error: null,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const cancelled = useRef(false);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    cancelled.current = false;
    if (!address) {
      setState((s) => ({ ...s, created: [], funded: [], totalContributed: 0, loading: false, error: null }));
      return undefined;
    }

    let contract;
    try {
      contract = getContractRead(provider);
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Contract could not be initialised." }));
      return undefined;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      try {
        const [createdIndexes, fundings] = await Promise.all([
          contract.getCreatorProjects(address),
          contract.getUserFundings(address),
        ]);

        // Created
        const createdIds = createdIndexes.length ? createdIndexes.map((x) => x.toNumber()) : [];
        const createdMetas = createdIds.length ? await contract.getProjectsDetail(createdIds) : [];
        const created = createdMetas.map((meta, i) => enrich(meta, createdIds[i]));

        // Funded
        const fundedIds = fundings.length ? fundings.map((f) => f.projectIndex.toNumber()) : [];
        const fundedMetas = fundedIds.length ? await contract.getProjectsDetail(fundedIds) : [];
        const funded = fundings.map((f, i) => ({
          ...enrich(fundedMetas[i], fundedIds[i]),
          contributed: toEth(f.totalAmount),
        }));
        const totalContributed = funded.reduce((acc, f) => acc + f.contributed, 0);

        if (!cancelled.current) {
          setState({ created, funded, totalContributed, loading: false, error: null });
        }
      } catch (err) {
        console.error("useProfile", err);
        if (!cancelled.current) {
          setState({
            created: [],
            funded: [],
            totalContributed: 0,
            loading: false,
            error: err?.reason || err?.message || "Failed to load profile.",
          });
        }
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, [provider, address, refreshKey]);

  return { ...state, refresh };
}