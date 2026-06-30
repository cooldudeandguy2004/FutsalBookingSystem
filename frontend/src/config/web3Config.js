// 1. Paste your new address here:
export const CONTRACT_ADDRESS = "0x5E7cadFaE21Cb75F249C91506452ED260aB42dFD";

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