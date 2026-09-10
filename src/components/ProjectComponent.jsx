import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import PaymentModal from "./PaymentModal";
import dummyPic from "../assets/pg1.jpg";
import { getIpfsUrl } from "../utils/ipfs";

export default function ProjectComponent(props) {
  const { id } = useParams();
  const index = id ? parseInt(id, 10) : 0;

  const [modalShow, setModalShow] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    amountRaised: "0",
    fundingGoal: "0",
    cid: "",
    creatorName: "",
    creatorAddress: "",
    projectDescription: "",
    projectName: "",
    totalContributors: 0,
    creationTime: 0,
    duration: 0,
    refundPolicy: 0,
    category: 0,
  });
  const [isOver, setIsOver] = useState(false);
  const [timerString, setTimerString] = useState("Loading...");
  const [contributors, setContributors] = useState([]);
  const [userContribution, setUserContribution] = useState("0");

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState("");

  const getProjectDetails = useCallback(async () => {
    if (!props.contract) return;
    try {
      const res = await props.contract.getProject(index);
      setProjectDetails({
        amountRaised: ethers.utils.formatEther(res.amountRaised),
        fundingGoal: ethers.utils.formatEther(res.fundingGoal),
        cid: res.cid,
        creatorName: res.creatorName || "Anonymous Creator",
        creatorAddress: res.creatorAddress || "",
        projectDescription: res.projectDescription,
        projectName: res.projectName,
        totalContributors: res.totalContributors ? res.totalContributors.toNumber() : 0,
        creationTime: res.creationTime ? res.creationTime.toNumber() : 0,
        duration: res.duration ? res.duration.toNumber() : 0,
        refundPolicy: res.refundPolicy !== undefined ? Number(res.refundPolicy) : 0,
        category: res.category !== undefined ? Number(res.category) : 0,
      });

      // Get user's own contribution
      if (props.userAddress) {
        const myContrib = await props.contract.getContribution(index, props.userAddress);
        setUserContribution(ethers.utils.formatEther(myContrib));
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    }
  }, [props.contract, index, props.userAddress]);

  useEffect(() => {
    getProjectDetails();
  }, [getProjectDetails]);

  // Anchor-based monotonic blockchain countdown timer hook
  useEffect(() => {
    if (
      !projectDetails.creationTime ||
      !projectDetails.duration ||
      !props.contract?.provider
    ) {
      return;
    }

    const provider = props.contract.provider;
    let cancelled = false;
    let timeoutId = null;

    let anchorBlockchainTime = 0;
    let anchorPerformanceTime = 0;
    let lastFetchedBlock = -1;

    const renderCountdown = () => {
      if (cancelled || !anchorBlockchainTime) return;

      const elapsedSeconds = Math.floor(
        (performance.now() - anchorPerformanceTime) / 1000
      );

      const currentBlockchainTime = anchorBlockchainTime + elapsedSeconds;
      const endTime = projectDetails.creationTime + projectDetails.duration;
      const remainingTime = endTime - currentBlockchainTime;

      if (remainingTime <= 0) {
        setTimerString("0d 0h 0m 0s");
        setIsOver(true);
        timeoutId = null;
        return;
      }

      setIsOver(false);
      const days = Math.floor(remainingTime / (60 * 60 * 24));
      const hours = Math.floor(
        (remainingTime % (60 * 60 * 24)) / (60 * 60)
      );
      const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
      const seconds = Math.floor(remainingTime % 60);

      setTimerString(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      timeoutId = setTimeout(renderCountdown, 1000);
    };

    const syncWithBlock = async (blockNumber) => {
      try {
        const block =
          typeof blockNumber === "number"
            ? await provider.getBlock(blockNumber)
            : await provider.getBlock("latest");

        if (cancelled || !block) return;
        if (block.number < lastFetchedBlock) return;
        lastFetchedBlock = block.number;

        anchorBlockchainTime = block.timestamp;
        anchorPerformanceTime = performance.now();

        if (timeoutId) clearTimeout(timeoutId);
        renderCountdown();
      } catch (error) {
        console.error("Failed to sync countdown with blockchain:", error);
      }
    };

    const handleBlock = (blockNumber) => syncWithBlock(blockNumber);
    provider.on("block", handleBlock);
    syncWithBlock();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (provider.removeListener) provider.removeListener("block", handleBlock);
    };
  }, [projectDetails.creationTime, projectDetails.duration, props.contract]);

  const onClaimFund = async () => {
    if (!props.contract) return;
    setIsClaiming(true);
    setClaimStatus("Claiming raised funds...");
    try {
      const tx = await props.contract.claimFund(index);
      await tx.wait();
      setClaimStatus("Funds successfully claimed!");
      getProjectDetails();
    } catch (err) {
      console.error("Claim funds error:", err);
      const reason = err?.reason || err?.message || "Failed to claim funds.";
      setClaimStatus("Error: " + reason);
    } finally {
      setIsClaiming(false);
    }
  };

  const onClaimRefund = async () => {
    if (!props.contract) return;
    setIsClaiming(true);
    setClaimStatus("Claiming refund...");
    try {
      const tx = await props.contract.claimRefund(index);
      await tx.wait();
      setClaimStatus("Refund successfully claimed!");
      getProjectDetails();
    } catch (err) {
      console.error("Claim refund error:", err);
      const reason = err?.reason || err?.message || "Failed to claim refund.";
      setClaimStatus("Error: " + reason);
    } finally {
      setIsClaiming(false);
    }
  };

  const raisedNum = parseFloat(projectDetails.amountRaised || "0");
  const goalNum = parseFloat(projectDetails.fundingGoal || "0");
  const percentNum = goalNum > 0 ? (raisedNum / goalNum) * 100 : 0;
  const percentFormatted = percentNum.toFixed(0);
  const isGoalReached = raisedNum >= goalNum;

  const isCreator =
    props.userAddress &&
    projectDetails.creatorAddress &&
    props.userAddress.toLowerCase() === projectDetails.creatorAddress.toLowerCase();

  const getCategoryName = (catVal) => {
    const categories = ["Design & Tech", "Film", "Arts", "Games"];
    return categories[catVal] || "Design & Tech";
  };

  const creatorShort = projectDetails.creatorAddress
    ? `${projectDetails.creatorAddress.slice(0, 6)}...${projectDetails.creatorAddress.slice(-4)}`
    : "";

  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="container-max">
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            gap: "var(--gutter)",
            alignItems: "start",
          }}
        >
          {/* Left Column (7 cols): Main Image & Gallery */}
          <div style={{ gridColumn: "span 7" }} className="project-detail-left">
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: "0.75rem",
                overflow: "hidden",
                border: "1px solid var(--color-outline)",
                background: "var(--bg-surface-container)",
                marginBottom: "16px",
              }}
            >
              <img
                src={getIpfsUrl(projectDetails.cid) || dummyPic}
                alt={projectDetails.projectName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = dummyPic;
                }}
              />
            </div>
          </div>

          {/* Right Column (5 cols): Funding & Actions Panel */}
          <div style={{ gridColumn: "span 5" }} className="project-detail-right">
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Category & Title */}
              <div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                  <span className="status-pill status-pill-primary">
                    {getCategoryName(projectDetails.category)}
                  </span>
                  <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                    {projectDetails.refundPolicy === 0 ? "REFUNDABLE" : "NON-REFUNDABLE"}
                  </span>
                </div>
                <h1 className="font-display-lg" style={{ fontSize: "36px", color: "var(--color-primary)", marginBottom: "12px", lineHeight: "1.2" }}>
                  {projectDetails.projectName}
                </h1>
                <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
                  {projectDetails.projectDescription}
                </p>
              </div>

              {/* Creator Section (No fake verification checkmark) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  borderTop: "1px solid var(--color-outline)",
                  borderBottom: "1px solid var(--color-outline)",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "var(--color-secondary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {projectDetails.creatorName ? projectDetails.creatorName.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", display: "block" }}>
                    ON-CHAIN CREATOR
                  </span>
                  <span className="font-body-md" style={{ fontWeight: "600", color: "var(--color-primary)" }}>
                    {projectDetails.creatorName}{" "}
                    <span className="font-code-md" style={{ fontSize: "12px", opacity: 0.7 }}>
                      ({creatorShort})
                    </span>
                  </span>
                </div>
              </div>

              {/* Funding Box */}
              <div
                style={{
                  background: "var(--bg-surface-container-low)",
                  border: "1px solid var(--color-outline)",
                  borderRadius: "1rem",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <span className="font-display-lg" style={{ fontSize: "32px", color: "var(--color-primary)", display: "block", lineHeight: "1" }}>
                      {projectDetails.amountRaised} ETH
                    </span>
                    <span className="font-body-sm" style={{ color: "var(--color-on-surface-variant)", marginTop: "4px", display: "block" }}>
                      raised of {projectDetails.fundingGoal} ETH goal
                    </span>
                  </div>
                  <span className="font-headline-sm" style={{ color: "var(--color-secondary)" }}>
                    {percentFormatted}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "var(--bg-surface-container-high)",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="progress-gradient"
                    style={{
                      width: `${Math.min(100, percentNum)}%`,
                      height: "100%",
                      borderRadius: "9999px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-outline)" }}>
                    <span className="font-headline-sm" style={{ color: "var(--color-primary)", display: "block" }}>
                      {projectDetails.totalContributors}
                    </span>
                    <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                      BACKERS
                    </span>
                  </div>
                  <div style={{ background: "var(--bg-surface)", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-outline)" }}>
                    <span className="font-headline-sm" style={{ color: "var(--color-primary)", display: "block", fontSize: "18px" }}>
                      {timerString}
                    </span>
                    <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                      {isOver ? "FUNDING ENDED" : "TIME REMAINING"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {!isOver ? (
                    <button
                      className="btn-rayvia-primary"
                      style={{ width: "100%", padding: "16px" }}
                      onClick={() => setModalShow(true)}
                    >
                      BACK THIS PROJECT
                    </button>
                  ) : isCreator && isGoalReached ? (
                    <button
                      className="btn-rayvia-primary"
                      style={{ width: "100%", padding: "16px", background: "var(--color-secondary)" }}
                      onClick={onClaimFund}
                      disabled={isClaiming}
                    >
                      {isClaiming ? "CLAIMING..." : "CLAIM RAISED FUNDS"}
                    </button>
                  ) : !isGoalReached && projectDetails.refundPolicy === 0 && parseFloat(userContribution) > 0 ? (
                    <button
                      className="btn-rayvia-primary"
                      style={{ width: "100%", padding: "16px", background: "var(--color-secondary)" }}
                      onClick={onClaimRefund}
                      disabled={isClaiming}
                    >
                      {isClaiming ? "CLAIMING REFUND..." : `CLAIM REFUND (${userContribution} ETH)`}
                    </button>
                  ) : (
                    <div
                      style={{
                        padding: "14px",
                        textAlign: "center",
                        background: "var(--bg-surface-container-high)",
                        borderRadius: "8px",
                        color: "var(--color-on-surface-variant)",
                      }}
                      className="font-label-caps"
                    >
                      {isGoalReached ? "FUNDING COMPLETED" : "PROJECT ENDED"}
                    </div>
                  )}

                  {claimStatus && (
                    <div className="font-body-sm" style={{ textAlign: "center", color: claimStatus.startsWith("Error") ? "var(--color-error)" : "var(--color-success)" }}>
                      {claimStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <PaymentModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        contract={props.contract}
        index={index}
        getProjectDetails={getProjectDetails}
      />
    </div>
  );
}
