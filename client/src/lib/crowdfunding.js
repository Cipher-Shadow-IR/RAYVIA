// Contract model helpers.
// IMPORTANT: Solidity enums are compared as explicit integers only (never truthiness).

export const CATEGORIES = [
  { id: 0, label: "Design & Tech", tone: "purple" },
  { id: 1, label: "Film", tone: "blue" },
  { id: 2, label: "Arts", tone: "cyan" },
  { id: 3, label: "Games", tone: "electric" },
];

export function categoryInfo(id) {
  return CATEGORIES.find((c) => c.id === Number(id)) || CATEGORIES[0];
}

export function categoryLabel(id) {
  return categoryInfo(id).label;
}

export const REFUNDABLE = 0;
export const NON_REFUNDABLE = 1;

export function policyLabel(id) {
  return Number(id) === NON_REFUNDABLE ? "Non-Refundable" : "Refundable";
}

export function policyHue(id) {
  return Number(id) === NON_REFUNDABLE ? "navy" : "aurora";
}

// Normalise an ethers value (BigNumber) into an ETH decimal number.
export function toEth(value) {
  let raw = value;
  if (raw && typeof raw.toString === "function") raw = raw.toString();
  const s = String(raw ?? "0");
  const padded = s.padStart(19, "0");
  const whole = padded.slice(0, -18) || "0";
  const frac = padded.slice(-18);
  return parseFloat(`${whole}.${frac}`) || 0;
}

// Normalise an ethers BigNumber (or plain number) into a JS number.
export function toNum(value) {
  if (value !== null && value !== undefined && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value ?? 0);
}

// Computes display-ready statistics for a project metadata object.
// Expects raw BigNumber values for fundingGoal / amountRaised and
// numbers (or BigNumbers) for creationTime / duration.
export function computeStats(project) {
  const goal = toEth(project.fundingGoal);
  const raised = toEth(project.amountRaised);
  const contributors = toNum(project.totalContributors ?? 0);
  const created = toNum(project.creationTime);
  const duration = toNum(project.duration);
  const deadline = created + duration;
  const now = Math.floor(Date.now() / 1000);

  const expired = now > deadline;
  const goalMet = raised >= goal;
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const secondsLeft = Math.max(0, deadline - now);

  return { goal, raised, contributors, deadline, expired, goalMet, percent, secondsLeft };
}

export function timeLeftLabel(secondsLeft) {
  const d = Math.floor(secondsLeft / 86400);
  const h = Math.floor((secondsLeft % 86400) / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${Math.max(1, m)}m left`;
}

export function formatTimestamp(seconds) {
  return new Date(seconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function truncateAddress(address) {
  if (!address) return "";
  const a = String(address);
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function fmtEth(value) {
  const n = Number(value) || 0;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} ETH`;
}

export function fmtEthCompact(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M ETH`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k ETH`;
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function ipfsUrl(cid) {
  if (!cid) return "";
  const c = String(cid).trim();
  if (/^https?:\/\//i.test(c)) return c;
  if (/^ipfs:\/\//i.test(c)) return c;
  return `https://ipfs.io/ipfs/${c}`;
}

export function extractCid(input) {
  if (!input) return "";
  const trimmed = String(input).trim();
  if (/^https?:\/\//i.test(trimmed)) {
    const match = trimmed.match(/ipfs\/([^/?#]+)/i);
    return match ? match[1] : "";
  }
  if (/^ipfs:\/\//i.test(trimmed)) {
    return trimmed.replace(/^ipfs:\/\//i, "").split("/")[0];
  }
  if (/^[a-zA-Z0-9]{46,59}$/.test(trimmed)) return trimmed;
  return "";
}

export function isValidCid(cid) {
  const c = String(cid || "").trim();
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(c) || /^b[a-zA-Z2-7]{58}$/.test(c);
}