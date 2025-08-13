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
import Footer from "./components/Footer";

function TopNavbar({
  userType,
  onLogout,
}: {
  userType: string;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = userType !== "";

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className={`top-navbar ${isAuthenticated ? "authenticated" : ""}`}>
      <div className="navbar-center">
        <img src={logo} alt="Company Logo" className="top-navbar-logo" />
        <div className="navbar-title">INTERPERSONAL PSYCHIATRY</div>
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <div className="navbar-navigation">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/");
                }}
                className={`nav-link ${
                  location.pathname === "/" ? "active" : ""
                }`}
              >
                Home
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/patient-lookup");
                }}
                className={`nav-link ${
                  location.pathname === "/patient-lookup" ? "active" : ""
                }`}
              >
                Patient Lookup
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/services");
                }}
                className={`nav-link ${
                  location.pathname === "/services" ? "active" : ""
                }`}
              >
                Services
              </a>
              {userType === "Admin" && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/admin");
                  }}
                  className={`nav-link ${
                    location.pathname === "/admin" ? "active" : ""
                  }`}
                >
                  Admin Panel
                </a>
              )}
            </div>

            <div className="navbar-contact">
              <span className="navbar-item">Email: contact@xyz.com</span>
              <span className="navbar-item">Phone: (555) 123-4567</span>
            </div>
            <div className="navbar-contact">
              <span className="navbar-item">Hours: Mon-Fri 9AM-5PM</span>
              <span className="navbar-item">
                Location: 123 Medical Center Dr
              </span>
            </div>
            <div className="navbar-user-info">
              <span className="user-type">
                {userType === "Admin" ? "Administrator" : "User"}
              </span>
              <button onClick={onLogout} className="logout-button">
                Logout
              </button>
            </div>
          </>
        ) : null}
      </div>
    </nav>
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

  return (
    <div className="app-container">
      {isAuthenticated ? (
        <>
          <TopNavbar userType={userType} onLogout={handleLogout} />
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
        </>
      ) : (
        <>
          <TopNavbar userType="" onLogout={() => {}} />
          <Login onLogin={handleLogin} />
        </>
      )}
      <Footer />
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
