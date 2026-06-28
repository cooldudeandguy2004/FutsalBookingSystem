# Test Report — FutsalBookingNFT

**Contract:** `FutsalBookingNFT`
**Test File:** `test/FutsalBooking.test.js`
**Test Framework:** Hardhat + Chai
**Network:** Local Hardhat Network (in-memory)
**Solidity Version:** 0.8.24 (Optimiser: enabled, 200 runs)
**Result: 6 passing / 0 failing**

---

## Test Case Table

| # | Test Suite | Test Description | Expected Outcome | Actual Result | Status |
|---|------------|-----------------|-----------------|---------------|--------|
| 1 | 1. Deployment Setup Verification | Should successfully assign the deploying account as the owner | `owner()` returns the deployer's address | `owner()` matched deployer address | Pass |
| 2 | 2. Administrative Functions (addCourt) | Should allow the owner to register a new pitch slot | Emits `CourtAdded(1, "Pitch Alpha", 1 ETH)` and `courtCounter` increments to 1 | Event emitted correctly; counter = 1 | Pass |
| 3 | 2. Administrative Functions (addCourt) | Should strictly block unauthorized accounts from adding courts | Reverts with `OwnableUnauthorizedAccount` | Transaction reverted as expected | Pass |
| 4 | 3. Core Booking Engine and Token Economy (bookCourt) | Should allow a renter to book a slot and successfully mint an NFT pass | Emits `BookingConfirmed(1, 1, renter1)`, renter holds NFT token #1 | Event emitted; balanceOf(renter1) = 1, ownerOf(1) = renter1 | Pass |
| 5 | 3. Core Booking Engine and Token Economy (bookCourt) | Should strictly revert if the sent payment value does not match court rate | Reverts with "Error: Incorrect payment sent." | Transaction reverted with correct message | Pass |
| 6 | 3. Core Booking Engine and Token Economy (bookCourt) | Should prevent double-booking collisions for the exact same court | Second booking attempt reverts with "Error: This court is already reserved." | Transaction reverted as expected | Pass |

---

## Gas Consumption Table

Generated via: `npx hardhat test` with `REPORT_GAS=true`
Block gas limit: 60,000,000 | EVM target: cancun | Solidity: 0.8.24

### Method Gas Usage

| Contract | Method | Min Gas | Max Gas | Avg Gas | # Calls |
|----------|--------|---------|---------|---------|---------|
| FutsalBookingNFT | addCourt | 138,645 | 138,705 | 138,681 | 5 |
| FutsalBookingNFT | bookCourt | - | - | 126,952 | 3 |

### Deployment Gas

| Contract | Avg Deployment Gas | % of Block Limit |
|----------|--------------------|-----------------|
| FutsalBookingNFT | 1,632,350 | 2.7% |

Note: Execution gas does not include intrinsic gas overhead.
