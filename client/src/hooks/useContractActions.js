import { useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import { getContractWrite } from "../config/contract";

export function useContractActions() {
  const { signer, account } = useWeb3();

  const requireSigner = useCallback(() => {
    if (!signer || !account) {
      throw new Error("Connect your wallet to continue.");
    }
    return getContractWrite(signer);
  }, [signer, account]);

  const fundProject = useCallback(
    async (projectId, amountEth, onTxHash) => {
      const contract = requireSigner();
      const tx = await contract.fundProject(projectId, { value: weiFromEth(amountEth) });
      if (onTxHash) onTxHash(tx.hash);
      const receipt = await tx.wait();
      return receipt;
    },
    [requireSigner]
  );

  const createProject = useCallback(
    async (params, onTxHash) => {
      const contract = requireSigner();
      const tx = await contract.createNewProject(
        params.name,
        params.description,
        params.creatorName,
        params.projectLink || "",
        params.goalEth,
        params.durationMinutes,
        params.category, // explicit enum integer
        params.refundPolicy, // explicit enum integer
        params.cid
      );
      if (onTxHash) onTxHash(tx.hash);
      const receipt = await tx.wait();
      return receipt;
    },
    [requireSigner]
  );

  const claimFund = useCallback(
    async (projectId, onTxHash) => {
      const contract = requireSigner();
      const tx = await contract.claimFund(projectId);
      if (onTxHash) onTxHash(tx.hash);
      const receipt = await tx.wait();
      return receipt;
    },
    [requireSigner]
  );

  const claimRefund = useCallback(
    async (projectId, onTxHash) => {
      const contract = requireSigner();
      const tx = await contract.claimRefund(projectId);
      if (onTxHash) onTxHash(tx.hash);
      const receipt = await tx.wait();
      return receipt;
    },
    [requireSigner]
  );

  return { fundProject, createProject, claimFund, claimRefund };
}

export function weiFromEth(value) {
  const n = String(Number(value));
  if (!/^\d+(\.\d+)?$/.test(n)) throw new Error("Invalid ETH amount.");
  const [whole, frac = ""] = n.split(".");
  return `${whole}${frac.padEnd(18, "0")}`;
}