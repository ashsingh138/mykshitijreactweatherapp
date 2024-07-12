import React from 'react'; 

const Profile = ({ currentUser, onClose }) => {
  return (
    <div className="profile-panel">
      <div className="profile-panel-content">
        <button className="close-button" onClick={onClose}>Close</button>
        <h3>Profile Details</h3>
        <p><strong>Name:</strong> {currentUser.name}</p>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Username:</strong> {currentUser.username}</p>
        <p><strong>Mobile:</strong> {currentUser.mobile}</p>
      </div>
    </div>
  );
};

export default Profile;
