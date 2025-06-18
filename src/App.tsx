import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Login from "./Login";
import PatientLookup from "./PatientLookup";
import Services from "./Services";
import PatientDetails from "./PatientDetails";
import logo from "./images/logo.webp";

function TopNavbar() {
  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        <span className="navbar-item">Phone: (555) 123-4567</span>
        <span className="navbar-item">Email: contact@xyz.com</span>
      </div>
      <div className="navbar-right">
        <span className="navbar-item">Hours: Mon-Fri 9AM-5PM</span>
        <span className="navbar-item">Location: 123 Medical Center Dr</span>
      </div>
    </nav>
  );
}

function Sidebar({
  userType,
  onLogout,
}: {
  userType: string;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <div
        className="sidebar-trigger"
        onMouseEnter={() => setIsSidebarVisible(true)}
      />
      <aside
        className={`sidebar ${isSidebarVisible ? "visible" : ""}`}
        onMouseLeave={() => setIsSidebarVisible(false)}
      >
        <div className="sidebar-content">
          <div className="logo-container">
            <img src={logo} alt="XYZ Company Logo" className="logo" />
          </div>
          <h2>
            INTERPERSONAL <br></br>P S Y C H I A T R Y
          </h2>
          <div className="user-info">
            <span className="user-type">
              {userType === "Admin" ? "Administrator" : "User"}
            </span>
          </div>
          <nav>
            <ul>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/");
                  }}
                  className={location.pathname === "/" ? "active" : ""}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/patient-lookup");
                  }}
                  className={
                    location.pathname === "/patient-lookup" ? "active" : ""
                  }
                >
                  Patient Lookup
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/services");
                  }}
                  className={location.pathname === "/services" ? "active" : ""}
                >
                  Services
                </a>
              </li>
              {userType === "admin" && (
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation("/admin");
                    }}
                    className={location.pathname === "/admin" ? "active" : ""}
                  >
                    Admin Panel
                  </a>
                </li>
              )}
            </ul>
          </nav>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState("");

  const handleLogin = (type: string) => {
    setUserType(type);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType("");
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <TopNavbar />
      <Sidebar userType={userType} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <header>
                <h1>Welcome to INTERPERSONAL PSYCHIATRY</h1>
              </header>
            }
          />
          <Route path="/patient-lookup" element={<PatientLookup />} />
          <Route path="/services" element={<Services />} />
          <Route path="/patient/:patientId" element={<PatientDetails />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
