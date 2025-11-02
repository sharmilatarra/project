import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSearch } from "@fortawesome/free-solid-svg-icons";

let platformLogos = {
  leetcode: "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png",
  codeforces: "https://sta.codeforces.com/s/86931/images/codeforces-logo-with-telegram.png",
  codechef: "https://s3.amazonaws.com/codechef_shared/sites/all/themes/abessive/logo.png",
  hackerrank: "https://upload.wikimedia.org/wikipedia/commons/6/65/HackerRank_logo.png",
};

let platforms = ["leetcode", "codeforces", "codechef", "hackerrank"];

const quotes = [
  "Code is like humor. When you have to explain it, it’s bad.",
  "First, solve the problem. Then, write the code.",
  "Experience is the name everyone gives to their mistakes.",
  "In order to be irreplaceable, one must always be different.",
  "Simplicity is the soul of efficiency.",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(false);
  const [user, setUser] = useState({
    username: "User",
    email: "user@example.com",
    profileImage: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  });
  const [platformStats, setPlatformStats] = useState({});
  const [dailyStatus, setDailyStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState({ name: "", logo: "" });

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const toggleSideNav = () => setSideOpen(!sideOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setPlatformStats({});
    navigate("/login");
  };

  const loadUserData = () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        username: payload.username || "User",
        email: payload.email || "user@example.com",
        profileImage:
          payload.profileImage ||
          "https://cdn-icons-png.flaticon.com/512/847/847969.png",
      });
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const handleAddPlatform = () => {
    if (!newPlatform.name || !newPlatform.logo) {
      alert("Please enter both platform name and logo URL!");
      return;
    }

    const updatedPlatforms = [...platforms, newPlatform.name.toLowerCase()];
    platformLogos[newPlatform.name.toLowerCase()] = newPlatform.logo;

    localStorage.setItem("customPlatforms", JSON.stringify(updatedPlatforms));
    localStorage.setItem("customPlatformLogos", JSON.stringify(platformLogos));

    alert(`${newPlatform.name} added successfully!`);
    setShowAddForm(false);
    setNewPlatform({ name: "", logo: "" });
    window.location.reload();
  };

  useEffect(() => {
    loadUserData();

    // Load today's status
    const todayKey = `dailyStatus-${new Date().toDateString()}`;
    const savedStatus = JSON.parse(localStorage.getItem(todayKey)) || {};
    setDailyStatus(savedStatus);

    // Load custom platforms from localStorage
    const savedPlatforms = JSON.parse(localStorage.getItem("customPlatforms"));
    const savedLogos = JSON.parse(localStorage.getItem("customPlatformLogos"));
    if (savedPlatforms) {
      platforms = [...new Set([...platforms, ...savedPlatforms])];
    }
    if (savedLogos) {
      platformLogos = { ...platformLogos, ...savedLogos };
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchStats = async () => {
      const newStats = {};
      for (let platform of platforms) {
        try {
          const res = await fetch(`http://localhost:3030/${platform}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            newStats[platform] = {
              username: data.username || "Not set",
              totalSolved: data.totalSolved != null ? data.totalSolved : 0,
            };
          } else {
            newStats[platform] = { username: "Not set", totalSolved: 0 };
          }
        } catch {
          newStats[platform] = { username: "Not set", totalSolved: 0 };
        }
      }
      setPlatformStats(newStats);
    };

    fetchStats();
  }, [navigate]);

  const allDone = platforms.every((p) => dailyStatus[p]);
  const filteredPlatforms = platforms.filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* 🔝 Top Navbar */}
      <nav className="top-nav">
        <div className="nav-left">
          <div className="hamburger" onClick={toggleSideNav}>
            <div></div><div></div><div></div>
          </div>
          <div className="logo">
            <img src="14.png" alt="Logo" />
          </div>
        </div>

        <div className="nav-right">
          <FontAwesomeIcon
            icon={faBell}
            className="daily-bell"
            onClick={() => navigate("/daily-activity")}
            style={{
              cursor: "pointer",
              fontSize: "18px",
              color: allDone ? "#00ff7f" : "#0ca50cff",
            }}
          />

          <div
            className="user-profile"
            onClick={() => navigate("/profilechange")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={user.profileImage}
              alt="User"
              className="profile-img"
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #00ff80",
                boxShadow: "0 0 4px rgba(0,255,128,0.3)",
              }}
            />

            <div className="user-info">
              <span className="username">{user.username.toUpperCase()}</span>
              <p className="user-email">{user.email}</p>
            </div>
          </div>

          <button className="logout-btn small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* 📂 Sidebar */}
      <div className={`side-nav ${sideOpen ? "open" : ""}`}>
        <ul>
          <li onClick={() => navigate("/")}>← Dashboard</li>
          {platforms.map((p) => (
            <li key={p} onClick={() => navigate(`/${p}`)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </li>
          ))}
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </div>

      {/* 🌟 Main Section */}
      <div className={`dashboard-main ${sideOpen ? "shifted" : ""}`}>
        <h1 className="welcome-text">Hello, {user.username.toUpperCase()} 👋</h1>

        <div className="search-center">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <p className="quote-text">
          <i>{randomQuote}</i>
        </p>

        <div className="platform-grid">
          {filteredPlatforms.map((platform) => {
            const stats =
              platformStats[platform] || { username: "Not set", totalSolved: 0 };
            return (
              <div
                key={platform}
                className="platform-card"
                onClick={() => navigate(`/${platform}`)}
              >
                <h2>
                  <img
                    src={platformLogos[platform]}
                    alt={platform}
                    className="platform-logo-small"
                  />
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </h2>
                <p>Username: {stats.username}</p>
                <p>Total Solved: {stats.totalSolved}</p>
              </div>
            );
          })}

          <div
            className="platform-card add-card"
            onClick={() => setShowAddForm(true)}
          >
            <h2>➕ Add Platform</h2>
          </div>
        </div>
      </div>

      {/* 🧩 Add Platform Popup */}
      {showAddForm && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Add New Platform</h3>
            <input
              type="text"
              placeholder="Enter Platform Name (e.g. GFG)"
              value={newPlatform.name}
              onChange={(e) =>
                setNewPlatform({ ...newPlatform, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Enter Logo Image URL"
              value={newPlatform.logo}
              onChange={(e) =>
                setNewPlatform({ ...newPlatform, logo: e.target.value })
              }
            />
            <div className="popup-buttons">
              <button onClick={handleAddPlatform}>Add</button>
              <button onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
