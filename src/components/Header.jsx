import React from 'react';
import '../styles/Header.css';
import ProfileIcon from './ProfileIcon';

const Header = () => {
  return (
    <header className="header">
      <h3 className="logo bold violet">
        <span className="green black">Snippet</span>Search
      </h3>

      <nav className="header-nav">
        <a className="header-link green bold" href="#">Home</a>
        <a className="header-link shadow" href="#">Popular</a>
        <a className="header-link shadow" href="#">Favorites</a>
      </nav>

      <ProfileIcon />
    </header>
  );
};

export default Header;