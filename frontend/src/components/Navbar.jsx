import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem("userData"));

  const handleLogOut = () => {
    sessionStorage.removeItem("userData");
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigate("/")}>
        <img src="/Main.jpeg" alt="BloodLink" />
        <span>DonorHub</span>
      </div>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
       
        <li>
          <Link to="/why-donate">Why Donate</Link>
        </li>
        <li>
          <Link to="/blood-drives">Blood Drives</Link>
        </li>
      </ul>

      {userData ? (
        <div
          className={styles.profile}
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <img src="./people.png" alt="Profile" />
          {profileOpen && (
            <div className={styles.profileDropdown}>
              <div onClick={() => navigate("/profile")}>My Profile</div>
              <div onClick={() => navigate("/donor-calls")}>Donor Calls</div>
              <div onClick={handleLogOut}>Log Out</div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.authButtons}>
          <Link to="/signup" className={styles.signup}>
            Sign Up
          </Link>
          <Link to="/login" className={styles.login}>
            Log In
          </Link>
        </div>
      )}

      <button
        className={styles.menuButton}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        {menuOpen ? (
          <FaTimes color="#d43217" size={24} />
        ) : (
          <FaBars size={24} />
        )}
      </button>
    </nav>
  );
};

export default Navbar;
