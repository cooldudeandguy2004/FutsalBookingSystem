// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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

    constructor() ERC721("Futsal Booking Pass", "FUTPASS") Ownable(msg.sender) {
        courtCounter = 0;
        bookingCounter = 0;
    }

    function addCourt(string calldata _name, uint256 _pricePerHour) external onlyOwner {
        require(bytes(_name).length > 0, "Error: Name required.");
        require(_pricePerHour > 0, "Error: Rate must be greater than zero.");

        courtCounter++;
        courts[courtCounter] = Court(courtCounter, _name, _pricePerHour, true);

        emit CourtAdded(courtCounter, _name, _pricePerHour);
    }

    function bookCourt(uint256 _courtId) external payable nonReentrant {
        Court memory court = courts[_courtId];
        require(court.isActive, "Error: Selected court is unavailable.");
        require(!isCourtBooked[_courtId], "Error: This court is already reserved.");
        require(msg.value == court.pricePerHour, "Error: Incorrect payment sent.");

        bookingCounter++;
        isCourtBooked[_courtId] = true; // Mark court as occupied globally

        _safeMint(msg.sender, bookingCounter);

        emit BookingConfirmed(bookingCounter, _courtId, msg.sender);
    }

    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 revenueBalance = address(this).balance;
        require(revenueBalance > 0, "Error: Balance is zero.");
        (bool success, ) = payable(owner()).call{value: revenueBalance}("");
        require(success, "Withdrawal failed.");
    }
}