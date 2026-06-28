import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/web3Config";

export const connectWallet = async () => {
  if (!window.ethereum) throw new Error("MetaMask extension not detected!");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
};

export const getReadOnlyContract = () => {
  if (!window.ethereum) return null;
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

export const getWriteContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found.");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};