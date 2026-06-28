# ⚽ Futsal Booking System

A decentralised futsal court booking platform built on the Ethereum blockchain. Court reservations are issued as **ERC-721 NFT passes** (`FUTPASS`), guaranteeing tamper-proof ownership and preventing double-bookings on-chain.

---

## 📁 Project Structure

```
FutsalBookingSystem/
├── contracts/
│   └── FutsalBookingNFT.sol      # Main smart contract (ERC-721 + Ownable + ReentrancyGuard)
├── scripts/
│   └── deploy.js                 # Hardhat deployment script
├── test/
│   └── FutsalBooking.test.js     # Automated test suite (Chai + Hardhat)
├── ignition/                     # Hardhat Ignition modules
├── frontend/                     # React + Vite web interface
│   └── src/
│       ├── App.jsx               # Main application component
│       ├── config/
│       │   └── web3Config.js     # Contract address & ABI (update after deploy)
│       └── ...
├── hardhat.config.js             # Hardhat + Sepolia network config
└── package.json
```

---

## ✅ Prerequisites

Make sure you have the following installed before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18 or later | https://nodejs.org |
| npm | comes with Node.js | – |
| MetaMask | Browser extension | https://metamask.io |
| Git | any | https://git-scm.com |

> **MetaMask Setup**: Add the **Sepolia Test Network** to MetaMask and fund your wallet with Sepolia ETH from a faucet (e.g. https://sepoliafaucet.com).

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/cooldudeandguy2004/FutsalBookingSystem.git
cd FutsalBookingSystem
```

### 2. Install Root Dependencies (Hardhat / Smart Contracts)

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 🔨 Smart Contract — Compile, Test & Deploy

All commands below should be run from the **root** of the project (`FutsalBookingSystem/`).

### Compile the Smart Contract

```bash
npx hardhat compile
```

### Run Automated Tests (Local Hardhat Network)

```bash
npx hardhat test
```

With gas usage report:

```bash
REPORT_GAS=true npx hardhat test
```

Expected output — all tests should pass:

```
FutsalBookingNFT Contract Automation Suite
  1. Deployment Setup Verification
    ✔ Should successfully assign the deploying account as the owner
  2. Administrative Functions (addCourt)
    ✔ Should allow the owner to register a new pitch slot
    ✔ Should strictly block unauthorized accounts from adding courts
  3. Core Booking Engine & Token Economy (bookCourt)
    ✔ Should allow a renter to book a slot and successfully mint an NFT pass
    ✔ Should strictly revert if the sent payment value does not match court rate
    ✔ Should prevent double-booking collisions for the exact same timeline slot
```

### Deploy to Sepolia Testnet

> ⚠️ **Important**: Before deploying, open `hardhat.config.js` and replace `SEPOLIA_RPC_URL` and `PRIVATE_KEY` with your own credentials. **Never commit real private keys to GitHub.**

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

After a successful deploy, copy the printed contract address and paste it into `frontend/src/config/web3Config.js`:

```js
// frontend/src/config/web3Config.js
export const CONTRACT_ADDRESS = "0xYourNewDeployedAddressHere";
```

---

## 🌐 Frontend — Run the Web App

Navigate into the `frontend/` folder and start the development server:

```bash
cd frontend
npm run dev
```

Open your browser at **http://localhost:5173** (or the port shown in the terminal).

### Using the App

1. **Connect MetaMask** — Click "Connect Wallet" and approve the connection in MetaMask.
2. **Switch to Sepolia** — MetaMask will prompt you to switch networks if needed.
3. **Book a Court (Renter)** — Browse available courts, select one, and confirm payment via MetaMask.
4. **Admin Panel (Owner only)** — The wallet that deployed the contract can add new courts and withdraw funds.

---

## 🧪 Testing Checklist for Group Members

Use this checklist to verify the system end-to-end:

- [ ] `npm install` completes without errors (root)
- [ ] `cd frontend && npm install` completes without errors
- [ ] `npx hardhat compile` — no compilation errors
- [ ] `npx hardhat test` — all tests pass ✅
- [ ] Frontend dev server starts at `http://localhost:5173`
- [ ] MetaMask connects to the app successfully
- [ ] Courts are loaded from the deployed contract
- [ ] Booking a court mints an NFT (check transaction on [Sepolia Etherscan](https://sepolia.etherscan.io))
- [ ] Double-booking the same court is correctly rejected

---

## 📜 Smart Contract Overview

**Contract:** `FutsalBookingNFT` (`FUTPASS` token)  
**Network:** Ethereum Sepolia Testnet  
**Deployed Address:** `0xB46Da448184cf0A2F9d4AD385d5E9f5b1914D69F`

| Function | Access | Description |
|----------|--------|-------------|
| `addCourt(name, pricePerHour)` | Owner only | Register a new futsal court |
| `bookCourt(courtId)` | Anyone | Book a court (exact ETH required), mints NFT |
| `withdrawFunds()` | Owner only | Withdraw all ETH revenue to owner wallet |
| `courts(id)` | View | Get court details by ID |
| `isCourtBooked(id)` | View | Check if a court is currently booked |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.24, OpenZeppelin (ERC-721, Ownable, ReentrancyGuard) |
| Blockchain Dev | Hardhat, Hardhat Toolbox, Hardhat Gas Reporter |
| Testnet | Ethereum Sepolia |
| Frontend | React 19, Vite, ethers.js v6 |
| Wallet | MetaMask |

---

## 🛠️ Common Issues & Fixes

**`Error: Incorrect payment sent`**  
→ Make sure you send exactly the court's listed price in ETH. No more, no less.

**`Error: This court is already reserved`**  
→ That court is taken. Choose a different court.

**MetaMask not detected**  
→ Install the MetaMask browser extension and refresh the page.

**Frontend can't read contract data**  
→ Check that `CONTRACT_ADDRESS` in `frontend/src/config/web3Config.js` matches the latest deployed address on Sepolia.

**`OwnableUnauthorizedAccount` error**  
→ You are trying to use an owner-only function (e.g. `addCourt`) from a non-owner wallet.

---

## 👥 Group Members

> *Muhammad Ammar Muqriz bin Mohd Rizal*
> *Wafiy*
> *Omar Naim*
> *Adam Imtiyaz*

---

*Built as part of a blockchain development assignment.*
