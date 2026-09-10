import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import { ethers } from "ethers";

export default function ProfileComponent(props) {
  const { userAddr } = useParams();
  const targetAddress = userAddr || props.userAddress || "";

  const [activeTab, setActiveTab] = useState("created");
  const [createdProjects, setCreatedProjects] = useState([]);
  const [userFundings, setUserFundings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isSelf =
    props.userAddress &&
    targetAddress &&
    props.userAddress.toLowerCase() === targetAddress.toLowerCase();

  const fetchProfileData = useCallback(async () => {
    if (!props.contract || !targetAddress) return;
    setIsLoading(true);
    try {
      // Get all projects created by this user
      const resCreated = await props.contract.getCreatorProjects(targetAddress);
      const tmpCreated = [];
      for (let i = 0; i < resCreated.length; i++) {
        const p = resCreated[i];
        tmpCreated.push({
          amountRaised: ethers.BigNumber.from(p.amountRaised),
          fundingGoal: ethers.BigNumber.from(p.fundingGoal),
          cid: p.cid,
          creatorName: p.creatorName,
          creatorAddress: p.creatorAddress,
          projectDescription: p.projectDescription,
          projectName: p.projectName,
          totalContributors: Number(p.totalContributors),
          category: Number(p.category),
          index: i,
        });
      }
      setCreatedProjects(tmpCreated);

      // Get user fundings
      const resFunded = await props.contract.getUserFundings(targetAddress);
      const tmpFunded = [];
      for (let i = 0; i < resFunded.length; i++) {
        const p = resFunded[i];
        tmpFunded.push({
          amountRaised: ethers.BigNumber.from(p.amountRaised),
          fundingGoal: ethers.BigNumber.from(p.fundingGoal),
          cid: p.cid,
          creatorName: p.creatorName,
          creatorAddress: p.creatorAddress,
          projectDescription: p.projectDescription,
          projectName: p.projectName,
          totalContributors: Number(p.totalContributors),
          category: Number(p.category),
          index: i,
        });
      }
      setUserFundings(tmpFunded);
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [props.contract, targetAddress]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Compute stats
  const totalRaisedWei = createdProjects.reduce(
    (acc, p) => acc.add(p.amountRaised),
    ethers.BigNumber.from(0)
  );
  const totalRaisedEth = parseFloat(
    ethers.utils.formatEther(totalRaisedWei)
  ).toFixed(3);

  const totalBackedWei = userFundings.reduce(
    (acc, p) => acc.add(p.amountRaised),
    ethers.BigNumber.from(0)
  );
  const totalBackedEth = parseFloat(
    ethers.utils.formatEther(totalBackedWei)
  ).toFixed(3);

  // Address display helpers
  const addrShort = targetAddress
    ? `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`
    : "";

  // Avatar: first char of truncated address
  const avatarChar = targetAddress ? targetAddress.slice(2, 3).toUpperCase() : "?";

  return (
    <div style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="container-max" style={{ display: "flex", flexDirection: "column", gap: "var(--stack-md)" }}>

        {/* Profile Header — matches Stitch design */}
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "24px",
            borderBottom: "1px solid var(--color-outline)",
            paddingBottom: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Avatar — wallet-derived, not developer identity */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "12px",
                background: "var(--bg-surface-container-highest)",
                border: "1px solid var(--color-outline)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "800",
                fontFamily: "var(--font-display)",
                color: "var(--color-on-surface-variant)",
                flexShrink: 0,
              }}
            >
              {avatarChar}
            </div>

            <div>
              {/* Display wallet address as profile identifier, NOT developer name */}
              <h1
                className="font-headline-md"
                style={{ color: "var(--color-primary)", marginBottom: "6px" }}
              >
                {addrShort || "Unknown Address"}
              </h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span className="font-code-md" style={{ color: "var(--color-on-surface-variant)" }}>
                  {targetAddress}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                <span className="font-label-caps" style={{ color: "#10b981" }}>
                  TESTNET ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile (self) — decorative, no real edit feature exists */}
          {isSelf && (
            <button
              className="btn-rayvia-outline"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() => {/* no-op: profile editing not implemented in v1 */}}
              title="Profile editing coming soon"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                edit
              </span>
              Edit Profile
            </button>
          )}
        </section>

        {/* 4-Stat Grid — matches Stitch design exactly */}
        <section
          className="profile-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0",
            background: "var(--bg-surface-container-low)",
            border: "1px solid var(--color-outline)",
            borderRadius: "1rem",
            overflow: "hidden",
          }}
        >
          {[
            { value: createdProjects.length, label: "PROJECTS CREATED" },
            { value: `${totalRaisedEth} ETH`, label: "TOTAL RAISED" },
            { value: userFundings.length, label: "PROJECTS BACKED" },
            { value: `${totalBackedEth} ETH`, label: "TOTAL BACKED" },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              style={{
                padding: "28px 24px",
                borderLeft: idx > 0 ? "1px solid var(--color-outline)" : "none",
                textAlign: "center",
              }}
            >
              <span
                className="font-display-lg"
                style={{
                  fontSize: "clamp(20px, 3vw, 32px)",
                  color: "var(--color-primary)",
                  display: "block",
                  marginBottom: "6px",
                  lineHeight: "1",
                }}
              >
                {stat.value}
              </span>
              <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* Tabbed Project Lists */}
        <section>
          <div
            style={{
              display: "flex",
              gap: "0",
              borderBottom: "1px solid var(--color-outline)",
              marginBottom: "32px",
            }}
          >
            {[
              { id: "created", label: `CREATED (${createdProjects.length})` },
              { id: "backed", label: `BACKED (${userFundings.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="font-label-caps"
                style={{
                  padding: "14px 24px",
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid var(--color-primary)"
                      : "2px solid transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--color-primary)"
                      : "var(--color-on-surface-variant)",
                  background: "none",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "64px",
                color: "var(--color-on-surface-variant)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "40px", display: "block", marginBottom: "12px", opacity: 0.4 }}
              >
                sync
              </span>
              Loading profile data from blockchain...
            </div>
          ) : activeTab === "created" ? (
            createdProjects.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "var(--gutter)",
                }}
              >
                {createdProjects.map((p) => (
                  <ProjectCard key={p.index} project={p} aspect="16/9" spanCols={12} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "80px 20px",
                  border: "1px dashed var(--color-outline)",
                  borderRadius: "1rem",
                  background: "var(--bg-surface-container-low)",
                  textAlign: "center",
                  gap: "12px",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "48px", color: "var(--color-on-surface-variant)", opacity: 0.5 }}
                >
                  auto_awesome
                </span>
                <h3 className="font-headline-sm" style={{ color: "var(--color-primary)" }}>
                  Nothing here yet. Great ideas need a first step.
                </h3>
                <p
                  className="font-body-md"
                  style={{ color: "var(--color-on-surface-variant)", maxWidth: "400px" }}
                >
                  You haven't launched any projects yet. Start building the future of the
                  decentralized web today.
                </p>
                <Link to="/start-project" className="btn-rayvia-primary" style={{ marginTop: "8px" }}>
                  Start a Project
                </Link>
              </div>
            )
          ) : userFundings.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "var(--gutter)",
              }}
            >
              {userFundings.map((p) => (
                <ProjectCard key={p.index} project={p} aspect="16/9" spanCols={12} />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 20px",
                border: "1px dashed var(--color-outline)",
                borderRadius: "1rem",
                background: "var(--bg-surface-container-low)",
                textAlign: "center",
                gap: "12px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "48px", color: "var(--color-on-surface-variant)", opacity: 0.5 }}
              >
                search_off
              </span>
              <h3 className="font-headline-sm" style={{ color: "var(--color-primary)" }}>
                No backed projects yet.
              </h3>
              <p
                className="font-body-md"
                style={{ color: "var(--color-on-surface-variant)", maxWidth: "400px" }}
              >
                Find projects worth supporting in the Discover section.
              </p>
              <Link to="/discover" className="btn-rayvia-primary" style={{ marginTop: "8px" }}>
                Explore Projects
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
