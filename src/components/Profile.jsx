import React from 'react';
import '../styles/Profile.css'; // optional: create if you want custom profile styles

const Profile = () => {
  return (
    <main className="main">
      <h1 className="white bold">My Profile</h1>
      <p className="light-gray">This is your profile page. You can view and update your account settings here.</p>

      <section className="profile-info">
        <h2 className="white">Account Info</h2>
        <ul className="light-gray">
          <li>Username: (coming soon)</li>
          <li>Email: (coming soon)</li>
          <li>Joined: (coming soon)</li>
        </ul>
      </section>
    </main>
  );
};

export default Profile;

