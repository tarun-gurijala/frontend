import React from "react";
import "../App.css";

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-section footer-left">
        <span>Contact: info@interpersonal.com</span>
      </div>
      <div className="footer-section footer-center">
        <span>&copy; {new Date().getFullYear()} Interpersonal Psychiatry</span>
      </div>
      <div className="footer-section footer-right">
        <span>Empowering wellness, one patient at a time.</span>
      </div>
    </div>
  </footer>
);

export default Footer;
