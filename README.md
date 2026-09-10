# RAYVIA — Web3 Crowdfunding Platform

RAYVIA is a production-quality, security-hardened decentralized crowdfunding platform built on Ethereum and React. It enables creators to raise funds for ambitious creative and technical projects transparently on-chain with automated refund policies and real-time funding metrics.

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   React Frontend                       │
│  - EIP-1193 MetaMask Wallet Integration                │
│  - Public IPFS Gateway Resolver (https://ipfs.io/ipfs) │
│  - Dynamic URL Routing (/project/:id, /profile/:addr) │
└───────────────────────────┬────────────────────────────┘
                            │ (Ethers.js v5)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Crowdfunding Smart Contract              │
│  - OpenZeppelin ReentrancyGuard                        │
│  - Checks-Effects-Interactions Pattern                 │
│  - Safe Ether Call Transfers                           │
│  - O(1) Mapping-based Financial Accounting             │
│  - Indexed State Transition Events                     │
└────────────────────────────────────────────────────────┘
```

---

## Tech Stack

- **Smart Contract**: Solidity `^0.8.20`, OpenZeppelin Contracts `4.9.3`, Hardhat
- **Frontend**: React 18, Vite, Tailwind CSS 4, GSAP (ScrollTrigger), Ethers.js v5, React Router v6
- **Network**: Ethereum Sepolia Testnet (`0xaa36a7` / `11155111`), local Hardhat node
- **Storage**: IPFS Gateway Resolution (`https://ipfs.io/ipfs/<CID>`)

---

## Local Development & Setup

### Prerequisites

- Node.js `v18+` or `v22+`
- npm `v9+` or `v10+`
- MetaMask browser extension

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   cd "Crowdfunding DApp"
   ```

2. Install backend (Hardhat) dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

4. Compile smart contracts and export the ABI to the frontend:
   ```bash
   npm run compile
   npm run export-abi
   ```

5. Run the frontend development server:
   ```bash
   cd client
   npm run dev
   ```
   The app is served at `http://localhost:3000`.

### Pointing the frontend at a network

Copy `client/.env.example` to `client/.env` and set:
- `VITE_CONTRACT_ADDRESS` — the deployed contract address
- `VITE_CHAIN_ID` — `31337` (local Hardhat) or `11155111` (Sepolia)
- `VITE_RPC_URL` — read-only RPC used when no wallet is connected

For local development, start a Hardhat node, deploy, and re-export:

```bash
npx hardhat node               # terminal 1
npx hardhat run scripts/deploy.js --network localhost   # terminal 2
```

---

## Smart Contract

Located at `contract/crowdfunding.sol`.

### Key Functions

- `createNewProject(string _name, string _desc, string _creatorName, string _projectLink, uint256 _fundingGoal, uint256 _duration, Category _category, RefundPolicy _refundPolicy, string _cid)`
  Creates a project with input validation and emits `ProjectCreated`.
- `fundProject(uint256 _index)`
  Contributes ETH during active duration and updates $O(1)$ mapping accounting. Emits `ContributionMade`.
- `claimFund(uint256 _index)`
  Protected by `nonReentrant`. Enables project owner to claim raised ETH post-expiration if goal is met (or Non-Refundable policy). Emits `FundsClaimed`.
- `claimRefund(uint256 _index)`
  Protected by `nonReentrant`. Enables contributors to claim full ETH refund if a Refundable project fails to reach its goal by expiration. Emits `RefundClaimed`.

---

## Supported Network

- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: `11155111` (`0xaa36a7` in hex)
- **Currency**: Sepolia ETH
- **RPC URL**: `https://ethereum-sepolia.publicnode.com`
- **Block Explorer**: `https://sepolia.etherscan.io`

---

## Testing & Verification

Run the automated smart-contract unit test suite:

```bash
npm run hardhat:test
```

Build the production frontend bundle:

```bash
cd client
npm run build
```

---

## Environment Variables

Place optional configuration in a `.env` file at root:

```env
REACT_APP_CONTRACT_ADDRESS=0x2b468416961ee8e9ee64074bD5F06dd509de1c3b
SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
PRIVATE_KEY=your_private_key_for_deployment_only
```

*Note: Never commit private keys or secrets to version control.*

---

## Known Limitations

- Production mainnet deployments with high financial value require an independent, third-party smart-contract security audit.
- Decentralized storage pinning relies on public IPFS gateways or dedicated pinning services (e.g. Pinata / Infura IPFS).
