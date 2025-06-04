import { useState } from "react";
import "./App.css";
import Login from "./Login";
import PatientLookup from "./PatientLookup";

function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState("");
  const [currentPage, setCurrentPage] = useState("home");

  const handleLogin = (type: string) => {
    setUserType(type);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType("");
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderMainContent = () => {
    switch (currentPage) {
      case "patient-lookup":
        return <PatientLookup />;
      default:
        return (
          <header>
            <h1>Welcome to XYZ Company</h1>
          </header>
        );
    }
  };

  return (
    <div className="app-container">
      <div
        className="sidebar-trigger"
        onMouseEnter={() => setIsSidebarVisible(true)}
      />
      <aside
        className={`sidebar ${isSidebarVisible ? "visible" : ""}`}
        onMouseLeave={() => setIsSidebarVisible(false)}
      >
        <div className="sidebar-content">
          <h2>XYZ Company</h2>
          <div className="user-info">
            <span className="user-type">
              {userType === "Admin" ? "Administrator" : "User"}
            </span>
          </div>
          <nav>
            <ul>
              <li>
                <a href="#home" onClick={() => handleNavigation("home")}>
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#patient-lookup"
                  onClick={() => handleNavigation("patient-lookup")}
                >
                  Patient Lookup
                </a>
              </li>
              <li>
                <a href="#about" onClick={() => handleNavigation("about")}>
                  About
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={() => handleNavigation("services")}
                >
                  Services
                </a>
              </li>
              <li>
                <a href="#contact" onClick={() => handleNavigation("contact")}>
                  Contact
                </a>
              </li>
              {userType === "admin" && (
                <li>
                  <a href="#admin" onClick={() => handleNavigation("admin")}>
                    Admin Panel
                  </a>
                </li>
              )}
            </ul>
          </nav>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">{renderMainContent()}</main>
    </div>
  );
}

export default App;
