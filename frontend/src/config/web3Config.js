// 1. Paste your new address here:
export const CONTRACT_ADDRESS = "0xB46Da448184cf0A2F9d4AD385d5E9f5b1914D69F";

// 2. Paste the simplified contract functions (ABI) here:
export const CONTRACT_ABI = [
  "function courtCounter() view returns (uint256)",
  "function bookingCounter() view returns (uint256)",
  "function courts(uint256) view returns (uint256 id, string name, uint256 pricePerHour, bool isActive)",
  "function isCourtBooked(uint256) view returns (bool)",
  "function addCourt(string name, uint256 pricePerHour) external",
  "function bookCourt(uint256 courtId) external payable",
  "function withdrawFunds() external"
];