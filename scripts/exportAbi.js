const fs = require("fs");
const path = require("path");

function exportAbi() {
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contract/crowdfunding.sol/crowdfunding.json"
  );
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found. Please compile contract first.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  const jsonOutputDir = path.join(__dirname, "../client/src/config");
  if (!fs.existsSync(jsonOutputDir)) {
    fs.mkdirSync(jsonOutputDir, { recursive: true });
  }

  const jsonOutputPath = path.join(jsonOutputDir, "crowdfundingAbi.json");
  fs.writeFileSync(jsonOutputPath, JSON.stringify(abi, null, 2));

  const jsOutputPath = path.join(__dirname, "../client/src/config/abi.js");
  const jsContent = `// AUTO-GENERATED FILE FROM HARDHAT ARTIFACT - DO NOT EDIT MANUALLY
export const abi = ${JSON.stringify(abi, null, 2)};
`;
  fs.writeFileSync(jsOutputPath, jsContent);

  console.log("Successfully exported ABI to client/src/config/crowdfundingAbi.json and abi.js");
}

exportAbi();
