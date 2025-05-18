import React from 'react';
import '../styles/Header.css';
import ProfileIcon from './ProfileIcon';
import { Link, useLocation } from 'react-router-dom';

const Header = ({}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <header className="header">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h3 className="logo bold violet">
          <span className="green black">Snippet</span>Search
        </h3>
      </Link>

      <nav className="header-nav">
        <Link 
          className={`header-link ${currentPath === '/' ? 'green bold' : 'shadow'}`}
          to="/"
        >
          Home
        </Link>
        <Link 
          className={`header-link ${currentPath === '/popular' ? 'green bold' : 'shadow'}`}
          to="/popular"
        >
          Popular
        </Link>
        <Link 
          className={`header-link ${currentPath === '/favorites' ? 'green bold' : 'shadow'}`}
          to="/favorites"
        >
          Favorites
        </Link>
      </nav>

      <ProfileIcon/>
    </header>
  );
};

export default Header;
