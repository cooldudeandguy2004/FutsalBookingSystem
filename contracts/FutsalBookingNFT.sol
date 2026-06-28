// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FutsalBookingNFT
 * @dev A decentralised futsal court booking system where each confirmed booking
 *      is represented as a unique ERC-721 NFT (token symbol: FUTPASS).
 *
 * Security patterns used:
 *  - Ownable: Restricts administrative functions (addCourt, withdrawFunds) to the deployer only.
 *  - ReentrancyGuard: Prevents reentrancy attacks on functions that transfer ETH (bookCourt, withdrawFunds).
 *  - Input validation via require(): Enforces correct payment amounts and valid court state before any state change.
 */
contract FutsalBookingNFT is ERC721, Ownable, ReentrancyGuard {

    uint256 public courtCounter;
    uint256 public bookingCounter;

    struct Court {
        uint256 id;
        string name;
        uint256 pricePerHour; 
        bool isActive;
    }

    mapping(uint256 => Court) public courts;
    mapping(uint256 => bool) public isCourtBooked;

    event CourtAdded(uint256 indexed courtId, string name, uint256 pricePerHour);
    event BookingConfirmed(uint256 indexed bookingId, uint256 indexed courtId, address renter);

    /**
     * @dev Initialises the ERC-721 token with name "Futsal Booking Pass" and symbol "FUTPASS".
     *      Sets the deploying address as the contract owner via Ownable.
     */
    constructor() ERC721("Futsal Booking Pass", "FUTPASS") Ownable(msg.sender) {
        courtCounter = 0;
        bookingCounter = 0;
    }

    /**
     * @notice Registers a new futsal court on-chain. Restricted to the contract owner.
     * @dev Increments courtCounter and stores the Court struct in the courts mapping.
     *      Security: onlyOwner modifier prevents unauthorized court registration.
     * @param _name The display name of the court (must be non-empty).
     * @param _pricePerHour The booking price in wei (must be greater than zero).
     */
    function addCourt(string calldata _name, uint256 _pricePerHour) external onlyOwner {
        require(bytes(_name).length > 0, "Error: Name required.");
        require(_pricePerHour > 0, "Error: Rate must be greater than zero.");

        courtCounter++;
        courts[courtCounter] = Court(courtCounter, _name, _pricePerHour, true);

        emit CourtAdded(courtCounter, _name, _pricePerHour);
    }

    /**
     * @notice Books a futsal court and mints an NFT pass to the caller's wallet.
     * @dev The caller must send exactly the court's pricePerHour in ETH.
     *      Security: nonReentrant modifier prevents reentrancy attacks during ETH handling.
     *      Security: isCourtBooked check prevents double-booking the same court.
     * @param _courtId The on-chain ID of the court to book (must be active and not already booked).
     */
    function bookCourt(uint256 _courtId) external payable nonReentrant {
        Court memory court = courts[_courtId];
        require(court.isActive, "Error: Selected court is unavailable.");
        require(!isCourtBooked[_courtId], "Error: This court is already reserved.");
        require(msg.value == court.pricePerHour, "Error: Incorrect payment sent.");

        bookingCounter++;
        isCourtBooked[_courtId] = true; // Mark court as occupied to block double-bookings

        // Mint a unique NFT pass to the renter as proof of booking
        _safeMint(msg.sender, bookingCounter);

        emit BookingConfirmed(bookingCounter, _courtId, msg.sender);
    }

    /**
     * @notice Withdraws all accumulated ETH revenue to the owner's wallet.
     * @dev Security: onlyOwner restricts withdrawal to the contract deployer.
     *      Security: nonReentrant prevents reentrancy attacks during ETH transfer.
     *      Uses low-level call() for ETH transfer as recommended by Solidity best practices.
     */
    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 revenueBalance = address(this).balance;
        require(revenueBalance > 0, "Error: Balance is zero.");
        (bool success, ) = payable(owner()).call{value: revenueBalance}("");
        require(success, "Withdrawal failed.");
    }
}
