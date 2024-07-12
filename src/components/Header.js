import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onSearch, currentUser, onLogout, setIsProfileOpen }) => {
  const [location, setLocation] = useState('');

  const handleInputChange = (e) => {
    setLocation(e.target.value);
  };

  const handleSearchClick = () => {
    onSearch(location);
  };

  return (
    <header>
      <nav>
        <h1>Weather App</h1>
        <div>
          <input
            type="text"
            value={location}
            onChange={handleInputChange}
            placeholder="Enter location"
          />
          <button onClick={handleSearchClick}>Search</button>
        </div>
        <div>
          {currentUser ? (
            <>
              <span>Welcome, {currentUser.username}</span>
              <button onClick={onLogout}>Logout</button>
              <button onClick={() => setIsProfileOpen(true)}>Profile</button>  
            </>
          ) : (
            <>
              <Link to="/signin">Sign In</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
