const hre = require("hardhat");

async function main() {
  const Crowdfunding = await hre.ethers.getContractFactory("crowdfunding");
  const contract = await Crowdfunding.deploy();

  await contract.deployed();

  console.log(`Crowdfunding contract deployed to: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});