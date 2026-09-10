# FLX Crowdfund — Agent & Engineering Guidelines

This document outlines the architecture, security invariants, testing procedures, and development rules for agents and maintainers working on the **FLX Crowdfund DApp** codebase.

---

## 1. Core Architecture Overview

```text
  React Frontend (Vite + Tailwind CSS + GSAP + Ethers v5)
              │
              ├── EIP-1193 MetaMask Wallet Connector
              ├── Public IPFS Gateway Resolver (https://ipfs.io/ipfs/<CID>)
              └── Dynamic Parameter Routes (/project/:id)
              │
              ▼
  Hardhat Pipeline & Hardened Solidity Contract (crowdfunding.sol)
              │
              ├── OpenZeppelin ReentrancyGuard (nonReentrant)
              ├── Authoritative O(1) Mappings (projectContributions, refundClaimedMap)
              ├── Checks-Effects-Interactions & Safe .call{value: ...}("")
              └── Indexed Events (ProjectCreated, ContributionMade, FundsClaimed, RefundClaimed)
```

---

## 2. Smart Contract Invariants & Rules

1. **Reentrancy Protection**: All functions executing ETH transfers (`claimFund`, `claimRefund`) MUST inherit OpenZeppelin `ReentrancyGuard` and use the `nonReentrant` modifier.
2. **Safe Ether Transfer**: Never use `.transfer()` or `.send()` due to the 2,300 gas limit restriction. Use low-level `.call{value: amount}("")` with explicit boolean checks.
3. **Checks-Effects-Interactions**: Mutate contract state (`claimedAmount = true`, `refundClaimedMap = true`) BEFORE executing external `.call` operations.
4. **O(1) Financial Accounting**: Always read and update contribution balances via `mapping(uint256 => mapping(address => uint256))` and `mapping(uint256 => mapping(address => bool))`. Do NOT perform linear array scanning for accounting or access control checks.
5. **Input Validation**: `createNewProject` must enforce non-empty `name`, `desc`, `cid`, positive `fundingGoal`, positive `duration`, and valid enum bounds.

---

## 3. Frontend Invariants & Rules

1. **No Secret Tokens in Bundles**: Never embed privileged IPFS or Web3Storage secret API keys into client React code. Use client-side CID computation and public IPFS gateway formatting (`https://ipfs.io/ipfs/<CID>`).
2. **Explicit Integer Enum Equality**: Do NOT use truthiness (`if (policy)`) for Solidity enums. Always check integer values explicitly (`policy === 0` for Refundable, `policy === 1` for Non-Refundable).
3. **Immutable State Updates**: Never mutate React state objects in-place (`formInput[name] = value`). Use spread operations or updater callbacks (`setFormInput(prev => ({ ...prev, [name]: value }))`).
4. **EIP-1193 Event Listeners**: Always handle `accountsChanged` and `chainChanged` on `window.ethereum` with proper cleanup logic on component unmount.

---

## 4. Verification & Tooling Workflow

- **Compile Smart Contract**: `npx hardhat compile`
- **Export ABI to Frontend**: `node scripts/exportAbi.js` (writes into `client/src/config`)
- **Execute Automated Test Suite**: `npx hardhat test`
- **Run Frontend Dev Server**: `cd client && npm run dev`
- **Build Production Frontend Bundle**: `cd client && npm run build`
