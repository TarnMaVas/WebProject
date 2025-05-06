import React, { useState, useEffect } from 'react';
import '../styles/ProfileIcon.css';
import AuthPopup from './AuthPopup';
import { logoutUser, subscribeToAuthChanges } from '../firebase/auth';

const ProfileIcon = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const toggleAuthPopup = () => {
    if (user) {
      setShowDropdown(!showDropdown);
    } else {
      setIsAuthOpen(!isAuthOpen);
    }
  };

  const handleAuthSuccess = (user) => {
    setUser(user);
  };

  const handleLogout = async () => {
    await logoutUser();
    setShowDropdown(false);
  };

  return (
    <div className="profile-container">
      <div 
        className="profile-icon-wrapper"
        onClick={toggleAuthPopup}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="profile-icon"
          xmlSpace="preserve"
        >
          <path
            d="M16 31C7.729 31 1 24.271 1 16S7.729 1 16 1s15 6.729 15 15-6.729 15-15 15zm0-28C8.832 3 3 8.832 3 16s5.832 13 13 13 13-5.832 13-13S23.168 3 16 3z"
            fill="#15cd2e"
          />
          <circle cx="16" cy="15.133" r="4.267" fill="#15cd2e" />
          <path
            d="M16 30c2.401 0 4.66-.606 6.635-1.671-.425-3.229-3.18-5.82-6.635-5.82s-6.21 2.591-6.635 5.82A13.935 13.935 0 0 0 16 30z"
            fill="#15cd2e"
          />
        </svg>
      </div>

      {showDropdown && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <p className="username">{user?.displayName || 'User'}</p>
            <p className="email">{user?.email}</p>
          </div>
          <div className="dropdown-options">
            <button className="dropdown-option">My Profile</button>
            <button className="dropdown-option">My Snippets</button>
            <button className="dropdown-option" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}

      <AuthPopup 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default ProfileIcon;