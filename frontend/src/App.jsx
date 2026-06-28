import React, { useState, useEffect } from "react";
import { connectWallet, getReadOnlyContract, getWriteContract } from "./utils/web3Service";
import { ethers } from "ethers";

export default function App() {
  const [account, setAccount] = useState("");
  const [renterName, setRenterName] = useState("");
  const [activeCourtsList, setActiveCourtsList] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  // --- Admin Panel States ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [inputCourtName, setInputCourtName] = useState("Court Name");
  const [inputCourtRate, setInputCourtRate] = useState("0.001"); // Defaulting to your target low rate
  const [adminTxLoading, setAdminTxLoading] = useState(false);

  useEffect(() => {
    if (account) {
      fetchLiveBlockchainInventory();
    }
  }, [account]);

  const handleWalletConnection = async () => {
    try {
      const userAddress = await connectWallet();
      setAccount(userAddress);
    } catch (error) {
      alert(error.message);
    }
  };

  const fetchLiveBlockchainInventory = async () => {
    try {
      const contract = getReadOnlyContract();
      if (!contract) return;

      const totalCounter = await contract.courtCounter();
      const count = Number(totalCounter);
      
      console.log(`Smart contract reports a total of ${count} courts created.`);

      const tempCourts = [];
      for (let i = 1; i <= count; i++) {
        try {
          const courtData = await contract.courts(i);
          if (courtData.isActive) {
            const priceInEther = ethers.formatEther(courtData.pricePerHour);

            tempCourts.push({
              id: Number(courtData.id),
              name: courtData.name,
              priceEth: priceInEther,
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
      setActiveCourtsList(tempCourts);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleAdminInitialize = async (e) => {
    e.preventDefault();
    setAdminTxLoading(true);
    try {
      const contract = await getWriteContract();

      // ✅ FIX: Correctly parse the admin input fields
      const rateInWei = ethers.parseEther(inputCourtRate); 

      console.log(`Registering ${inputCourtName} on-chain at ${inputCourtRate} ETH...`);
      
      // ✅ FIX: Correctly call the addCourt function
      const txResponse = await contract.addCourt(inputCourtName, rateInWei);
      await txResponse.wait();

      alert("Court registered successfully!");
      
      // Reset form fields
      setInputCourtName("Court Name");
      setInputCourtRate("0.001");
      
      fetchLiveBlockchainInventory();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to register court.");
    } finally {
      setAdminTxLoading(false);
    }
  };

  const handleBookingTransaction = async (courtId, courtPrice) => {
    if (!renterName.trim()) {
      alert("Please enter a renter name for the ticketing record!");
      return;
    }

    setTxLoading(true);
    try {
      const contract = await getWriteContract();
      
      // ✅ Dynamic Fix: Automatically matches the exact dynamic price the court was initialized with
      const paymentInWei = ethers.parseEther(courtPrice); 

      console.log(`Minting Pass for Court ID ${courtId} paying ${courtPrice} ETH...`);
      
      const txResponse = await contract.bookCourt(courtId, {
        value: paymentInWei,
        gasLimit: 150000
      });

      const receipt = await txResponse.wait();
      alert(`🎉 Booking Successful for ${renterName}!\nTicket Pass NFT Minted.\nBlock Hash: ${receipt.hash}`);
      fetchLiveBlockchainInventory();
    } catch (error) {
      console.error(error);
      alert("Transaction Reverted: Check initialization sync.");
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#121212", color: "#e0e0e0", minHeight: "100vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        
        {/* Admin Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ visibility: "hidden" }}>Spacer</div>
          <div style={{ backgroundColor: "#1e1e1e", padding: "10px", borderRadius: "8px", border: "1px solid #333" }}>
            {!isAdminMode ? (
              <>
                <input type="password" placeholder="Admin Key" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} style={{ padding: "6px", backgroundColor: "#2d2d2d", color: "#fff", border: "1px solid #444", marginRight: "10px", borderRadius: "4px" }} />
                <button onClick={() => adminPassword === "admin123" ? setIsAdminMode(true) : alert("Wrong key")} style={{ padding: "6px 12px", backgroundColor: "#ffc107", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Admin Login</button>
              </>
            ) : (
                <button onClick={() => { setIsAdminMode(false); setAdminPassword(""); }} style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>Exit Admin</button>
            )}
          </div>
        </div>

        <h1>{isAdminMode ? "⚡ Futsal Admin Dashboard" : "🏟️ Futsal Booking System"}</h1>
        <hr style={{ borderColor: "#333", margin: "20px 0" }} />

        {!account ? (
          <button onClick={handleWalletConnection} style={{ padding: "12px 24px", fontSize: "16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Connect MetaMask</button>
        ) : (
          <div style={{ backgroundColor: "#1e1e1e", padding: "12px", borderRadius: "8px", border: "1px solid #28a745", display: "inline-block", marginBottom: "20px" }}>
            <span style={{ color: "#28a745", fontWeight: "bold" }}> Connected Wallet:</span> <code>{account}</code>
          </div>
        )}

        {account && (
          <div>
            {isAdminMode ? (
              <div style={{ backgroundColor: "#1e1e1e", border: "1px solid #ffc107", borderRadius: "10px", padding: "24px", maxWidth: "450px", margin: "0 auto", textAlign: "left" }}>
                <h3 style={{ color: "#ffc107", textAlign: "center", margin: "0 0 15px 0" }}>Register Venue Assets</h3>
                <form onSubmit={handleAdminInitialize}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px" }}>Court Name:</label>
                    <input type="text" value={inputCourtName} onChange={(e) => setInputCourtName(e.target.value)} style={{ width: "100%", padding: "8px", backgroundColor: "#2d2d2d", color: "#fff", border: "1px solid #444", borderRadius: "4px" }} required />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "4px" }}>Rate (Sepolia ETH):</label>
                    <input type="text" value={inputCourtRate} onChange={(e) => setInputCourtRate(e.target.value)} style={{ width: "100%", padding: "8px", backgroundColor: "#2d2d2d", color: "#fff", border: "1px solid #444", borderRadius: "4px" }} required />
                  </div>
                  <button type="submit" disabled={adminTxLoading} style={{ width: "100%", padding: "10px", backgroundColor: "#ffc107", fontWeight: "bold", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    {adminTxLoading ? "Publishing..." : "Add Court to Registry"}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div style={{ backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "10px", display: "inline-block", border: "1px solid #333", marginBottom: "35px", width: "100%", maxWidth: "400px" }}>
                  <div style={{ textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "6px", color: "#bbb", fontWeight: "bold" }}>Enter Renter Full Name:</label>
                    <input type="text" placeholder="e.g., Ammar" value={renterName} onChange={(e) => setRenterName(e.target.value)} style={{ width: "95%", padding: "10px", backgroundColor: "#2d2d2d", color: "#fff", border: "1px solid #444", borderRadius: "6px", fontSize: "16px" }} />
                  </div>
                </div>

                <h3 style={{ textAlign: "left", marginBottom: "15px" }}>Available Courts</h3>
                {(!activeCourtsList || activeCourtsList.length === 0) ? (
                  <p style={{ color: "#aaa", fontStyle: "italic" }}>⚠️ No active courts detected on this contract deploy. Login to the Admin Panel to register assets fresh!</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                    {activeCourtsList.map((court) => (
                      <div key={court.id} style={{ backgroundColor: "#1e1e1e", border: "1px solid #28a745", padding: "20px", borderRadius: "10px", textAlign: "left" }}>
                        <h3>{court.name}</h3>
                        <p style={{ color: "#aaa" }}>On-Chain ID Pointer: <strong style={{ color: "#ffc107" }}>{court.id}</strong></p>
                        {/* ✅ FIX: Corrected court.price to court.priceEth */}
                        <p style={{ margin: "10px 0" }}>Price: <strong style={{ color: "#3b82f6" }}>{court.priceEth} ETH</strong></p>
                        <div style={{ margin: "12px 0", padding: "6px", borderRadius: "4px", fontWeight: "bold", textAlign: "center", backgroundColor: "rgba(40,167,69,0.12)", color: "#28a745" }}>
                        </div>

                        <button
                          /* ✅ FIX: Corrected court.price to court.priceEth */
                          onClick={() => handleBookingTransaction(court.id, court.priceEth)}
                          disabled={txLoading}
                          style={{ width: "100%", padding: "10px", border: "none", borderRadius: "4px", fontWeight: "bold", color: "#fff", backgroundColor: "#28a745", cursor: "pointer" }}
                        >
                          {txLoading ? "Minting Pass..." : "Book & Mint Pass"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}