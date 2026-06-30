const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment process for FutsalBookingNFT...");

  const FutsalBookingNFT = await ethers.getContractFactory("FutsalBookingNFT");

  const contract = await FutsalBookingNFT.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("====================================================");
  console.log("🎉 SUCCESS: Smart Contract Deployed Successfully!");
  console.log(`📡 Target Network: ${hre.network.name}`);
  console.log(`📌 Deployed Contract Address: ${contractAddress}`);
  console.log("====================================================");
  console.log("Next Step: Copy this address into your frontend src/config/contract.js file.");
}

// Executing the deployment mechanism tracker safely
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment crashed with error:", error);
    process.exit(1);
  });