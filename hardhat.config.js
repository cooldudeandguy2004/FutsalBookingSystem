require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/8xXEPdO0SNO8FXcexXo3a";
const PRIVATE_KEY = "0x5adb1850964c41ee23d033d2f752422e982f9a642ca83513b59ab9fff73cd915";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "cancun"
    }
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    noColors: false
  }
};