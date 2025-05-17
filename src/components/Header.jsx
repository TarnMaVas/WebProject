import React from 'react';
import '../styles/Header.css';
import ProfileIcon from './ProfileIcon';

const Header = ({ setPage }) => {
  const goToHome = () => {
    setPage('main');
  };

  return (
    <header className="header">
      <h3 className="logo bold violet" onClick={goToHome}>
        <span className="green black">Snippet</span>Search
      </h3>

      <nav className="header-nav">
        <a className="header-link green bold" href="#" onClick={() => setPage('main')}>Home</a>
        <a className="header-link shadow" href="#" onClick={() => setPage('popular')}>Popular</a>
        <a className="header-link shadow" href="#" onClick={() => setPage('favorites')}>Favorites</a>
      </nav>

      <ProfileIcon setPage={setPage} />
    </header>
  );
};

export default Header;
