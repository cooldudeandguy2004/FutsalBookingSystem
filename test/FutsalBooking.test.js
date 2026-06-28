const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FutsalBookingNFT Contract Automation Suite", function () {
  let FutsalBooking, futsalBooking;
  let owner, renter1, renter2;
  const targetTimestamp = 1850000000; // Future Unix timestamp
  const oneEtherInWei = ethers.parseEther("1.0");

  beforeEach(async function () {
    // Simulate multiple network accounts (Requirement B3)
    [owner, renter1, renter2] = await ethers.getSigners();

    // Deploy a fresh contract instance before each test execution block
    FutsalBooking = await ethers.getContractFactory("FutsalBookingNFT");
    futsalBooking = await FutsalBooking.deploy();
  });

  describe("1. Deployment Setup Verification", function () {
    it("Should successfully assign the deploying account as the owner", async function () {
      expect(await futsalBooking.owner()).to.equal(owner.address);
    });
  });

  describe("2. Administrative Functions (addCourt)", function () {
    it("Should allow the owner to register a new pitch slot", async function () {
      await expect(futsalBooking.connect(owner).addCourt("Pitch Alpha", oneEtherInWei))
        .to.emit(futsalBooking, "CourtAdded")
        .withArgs(1, "Pitch Alpha", oneEtherInWei);

      expect(await futsalBooking.courtCounter()).to.equal(1);
    });

    it("Should strictly block unauthorized accounts from adding courts", async function () {
      await expect(
        futsalBooking.connect(renter1).addCourt("Hacker Pitch", oneEtherInWei)
      ).to.be.revertedWithCustomError(futsalBooking, "OwnableUnauthorizedAccount");
    });
  });

  describe("3. Core Booking Engine & Token Economy (bookCourt)", function () {
    beforeEach(async function () {
      // Set up a standard baseline court for active testing routes
      await futsalBooking.connect(owner).addCourt("Standard Court 1", oneEtherInWei);
    });

    it("Should allow a renter to book a slot and successfully mint an NFT pass", async function () {
      // Happy path transaction check
      await expect(
        futsalBooking.connect(renter1).bookCourt(1, { value: oneEtherInWei })
      )
        .to.emit(futsalBooking, "BookingConfirmed")
        .withArgs(1, 1, renter1.address);

      // Verify token ownership properties (Requirement B1)
      expect(await futsalBooking.balanceOf(renter1.address)).to.equal(1);
      expect(await futsalBooking.ownerOf(1)).to.equal(renter1.address);
    });

    it("Should strictly revert if the sent payment value does not match court rate", async function () {
      const wrongPayment = ethers.parseEther("0.5");
      await expect(
        futsalBooking.connect(renter1).bookCourt(1, { value: wrongPayment })
      ).to.be.revertedWith("Error: Incorrect payment sent.");
    });

    it("Should prevent double-booking collisions for the exact same timeline slot", async function () {
      // First booking execution (Success)
      await futsalBooking.connect(renter1).bookCourt(1, { value: oneEtherInWei });

      // Second booking attempt on the same court by a different account (Must safely fail)
      await expect(
        futsalBooking.connect(renter2).bookCourt(1, { value: oneEtherInWei })
      ).to.be.revertedWith("Error: This court is already reserved.");
    });
  });
});