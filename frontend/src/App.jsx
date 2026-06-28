import React, { useState, useEffect, useCallback } from "react";
import { connectWallet, getReadOnlyContract, getWriteContract } from "./utils/web3Service";
import { ethers } from "ethers";

// --- Status Banner Component ---
function StatusBanner({ banner, onClose }) {
  if (!banner) return null;

  const styles = {
    success: { border: "#28a745", bg: "rgba(40,167,69,0.12)",  icon: "✅", label: "Success" },
    error:   { border: "#dc3545", bg: "rgba(220,53,69,0.12)",  icon: "❌", label: "Error"   },
    warning: { border: "#ffc107", bg: "rgba(255,193,7,0.12)",  icon: "⚠️", label: "Warning" },
    pending: { border: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "⏳", label: "Pending" },
  };

  const s = styles[banner.type] || styles.success;

  return (
    <div style={{
      position: "fixed",
      top: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      minWidth: "320px",
      maxWidth: "560px",
      width: "90vw",
      backgroundColor: "#1e1e1e",
      border: `1px solid ${s.border}`,
      borderLeft: `5px solid ${s.border}`,
      borderRadius: "10px",
      padding: "16px 20px",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      background: `linear-gradient(135deg, ${s.bg}, #1e1e1e)`,
      animation: "slideDown 0.3s ease",
    }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>{s.icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: "bold", color: s.border, marginBottom: "4px", fontSize: "14px" }}>
          {s.label}
        </div>
        <div style={{ color: "#e0e0e0", fontSize: "14px", wordBreak: "break-word", lineHeight: "1.5", whiteSpace: "pre-line" }}>
          {banner.message}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "20px", padding: "0", flexShrink: 0, lineHeight: 1 }}
        aria-label="Close notification"
      >
        x
      </button>
    </div>
  );
}

export default function App() {
  const [account, setAccount] = useState("");
  const [renterName, setRenterName] = useState("");
  const [activeCourtsList, setActiveCourtsList] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  // --- Admin Panel States ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [inputCourtName, setInputCourtName] = useState("Court Name");
  const [inputCourtRate, setInputCourtRate] = useState("0.001");
  const [adminTxLoading, setAdminTxLoading] = useState(false);

  // --- Status Banner State ---
  const [banner, setBanner] = useState(null);

  const showBanner = useCallback((type, message) => {
    setBanner({ type, message });
  }, []);

  const closeBanner = useCallback(() => setBanner(null), []);

  // Auto-dismiss after 6s; keep pending banners until replaced
  useEffect(() => {
    if (!banner || banner.type === "pending") return;
    const timer = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(timer);
  }, [banner]);

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
      showBanner("error", error.message || "Failed to connect wallet.");
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
    showBanner("pending", "Waiting for MetaMask confirmation...");
    try {
      const contract = await getWriteContract();
      const rateInWei = ethers.parseEther(inputCourtRate);

      showBanner("pending", "Transaction submitted -- waiting for block confirmation...");
      const txResponse = await contract.addCourt(inputCourtName, rateInWei);
      await txResponse.wait();

      showBanner("success", `Court "${inputCourtName}" registered successfully on-chain!`);
      setInputCourtName("Court Name");
      setInputCourtRate("0.001");
      fetchLiveBlockchainInventory();
    } catch (error) {
      console.error(error);
      showBanner("error", error.reason || error.message || "Failed to register court.");
    } finally {
      setAdminTxLoading(false);
    }
  };

  const handleBookingTransaction = async (courtId, courtPrice) => {
    if (!renterName.trim()) {
      showBanner("warning", "Please enter a renter name before booking.");
      return;
    }

    setTxLoading(true);
    showBanner("pending", "Waiting for MetaMask confirmation...");
    try {
      const contract = await getWriteContract();
      const paymentInWei = ethers.parseEther(courtPrice);

      showBanner("pending", "Transaction submitted -- minting your NFT pass...");
      const txResponse = await contract.bookCourt(courtId, {
        value: paymentInWei,
        gasLimit: 150000,
      });

      const receipt = await txResponse.wait();
      showBanner(
        "success",
        `Booking confirmed for ${renterName}! NFT pass minted.\nTx: ${receipt.hash.slice(0, 22)}...`
      );
      fetchLiveBlockchainInventory();
    } catch (error) {
      console.error(error);
      showBanner("error", error.reason || "Transaction reverted. Check payment amount or court availability.");
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", backgroundColor: "#121212", color: "#e0e0e0", minHeight: "100vh" }}>

      {/* Global Status Banner */}
      <StatusBanner banner={banner} onClose={closeBanner} />

      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>

        {/* Admin Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ visibility: "hidden" }}>Spacer</div>
          <div style={{ backgroundColor: "#1e1e1e", padding: "10px", borderRadius: "8px", border: "1px solid #333" }}>
            {!isAdminMode ? (
              <>
                <input
                  type="password"
                  placeholder="Admin Key"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  style={{ padding: "6px", backgroundColor: "#2d2d2d", color: "#fff", border: "1px solid #444", marginRight: "10px", borderRadius: "4px" }}
                />
                <button
                  onClick={() => {
                    if (adminPassword === "admin123") {
                      setIsAdminMode(true);
                    } else {
                      showBanner("error", "Wrong admin key. Access denied.");
                    }
                  }}
                  style={{ padding: "6px 12px", backgroundColor: "#ffc107", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Admin Login
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsAdminMode(false); setAdminPassword(""); }}
                style={{ padding: "6px 12px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}
              >
                Exit Admin
              </button>
            )}
          </div>
        </div>

        <h1>{isAdminMode ? "Admin Dashboard" : "Futsal Booking System"}</h1>
        <hr style={{ borderColor: "#333", margin: "20px 0" }} />

        {!account ? (
          <button
            onClick={handleWalletConnection}
            style={{ padding: "12px 24px", fontSize: "16px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            Connect MetaMask
          </button>
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
                    <input
                      type="text"
                      value={inputCourtName}
                      onChange={(e) => setInputCourtName(e.target.value)}
                      style={{ width: "100%", padding: "8px", backgroundColor: "#2d2d2d", color: "#fff", border: "1px solid #444", borderRadius: "4px" }}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "4px" }}>Rate (Sepolia ETH):</label>
                    <input
                      type="text"
                      value={inputCourtRate}
                      onChange={(e) => setInputCourtRate(e.target.value)}
                      style={{ width: "100%", padding: "8px", backgroundColor: "#2d2d2d", color: "#fff", border: "1px solid #444", borderRadius: "4px" }}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={adminTxLoading}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#ffc107", fontWeight: "bold", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    {adminTxLoading ? "Publishing..." : "Add Court to Registry"}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div style={{ backgroundColor: "#1e1e1e", padding: "20px", borderRadius: "10px", display: "inline-block", border: "1px solid #333", marginBottom: "35px", width: "100%", maxWidth: "400px" }}>
                  <div style={{ textAlign: "left" }}>
                    <label style={{ display: "block", marginBottom: "6px", color: "#bbb", fontWeight: "bold" }}>Enter Renter Full Name:</label>
                    <input
                      type="text"
                      placeholder="e.g., Ammar"
                      value={renterName}
                      onChange={(e) => setRenterName(e.target.value)}
                      style={{ width: "95%", padding: "10px", backgroundColor: "#2d2d2d", color: "#fff", border: "1px solid #444", borderRadius: "6px", fontSize: "16px" }}
                    />
                  </div>
                </div>

                <h3 style={{ textAlign: "left", marginBottom: "15px" }}>Available Courts</h3>
                {(!activeCourtsList || activeCourtsList.length === 0) ? (
                  <p style={{ color: "#aaa", fontStyle: "italic" }}>No active courts detected. Login to the Admin Panel to register courts.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                    {activeCourtsList.map((court) => (
                      <div key={court.id} style={{ backgroundColor: "#1e1e1e", border: "1px solid #28a745", padding: "20px", borderRadius: "10px", textAlign: "left" }}>
                        <h3>{court.name}</h3>
                        <p style={{ color: "#aaa" }}>On-Chain ID: <strong style={{ color: "#ffc107" }}>{court.id}</strong></p>
                        <p style={{ margin: "10px 0" }}>Price: <strong style={{ color: "#3b82f6" }}>{court.priceEth} ETH</strong></p>
                        <button
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
