const hre = require("hardhat");

const EXPLORER_URLS = {
  11155111: "https://sepolia.etherscan.io",
  1: "https://etherscan.io",
};

function getExplorerUrl(chainId, address) {
  const base = EXPLORER_URLS[chainId] || "https://etherscan.io";
  return `${base}/address/${address}`;
}

async function main() {
  const sepolia = hre.network.name === "sepolia";

  if (sepolia && !process.env.SEPOLIA_RPC_URL) {
    throw new Error(
      "SEPOLIA_RPC_URL is not set. Add it to the root .env (see .env.example)."
    );
  }

  if (sepolia && !process.env.PRIVATE_KEY) {
    throw new Error(
      "PRIVATE_KEY is not set. Add it to the root .env (see .env.example). Never commit this file."
    );
  }

  if (sepolia) {
    const { chainId } = await hre.ethers.provider.getNetwork();
    if (Number(chainId) !== 11155111) {
      throw new Error(
        `Refusing to deploy: connected chainId is ${chainId}, expected 11155111 (Sepolia).`
      );
    }
  }

  const Crowdfunding = await hre.ethers.getContractFactory("crowdfunding");
  const contract = await Crowdfunding.deploy();

  await contract.deployed();

  const { chainId } = await hre.ethers.provider.getNetwork();

  console.log("==============================================");
  console.log("RAYVIA - Crowdfunding deployed");
  console.log("----------------------------------------------");
  console.log(`Contract address: ${contract.address}`);
  console.log(`Network:          ${hre.network.name}`);
  console.log(`Chain ID:         ${chainId}`);
  console.log(`Explorer URL:     ${getExplorerUrl(chainId, contract.address)}`);
  console.log("==============================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});