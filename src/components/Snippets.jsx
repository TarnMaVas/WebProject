import React from 'react';
import '../styles/Snippets.css'; // optional: for future customization

const Snippets = () => {
  return (
    <main className="main">
      <h1 className="white bold">My Snippets</h1>
      <p className="light-gray">Here you’ll find all the code snippets you've created, saved, or interacted with.</p>

      <section className="snippets-placeholder">
        <p className="gray">No snippets yet. This page will display your content once implemented.</p>
      </section>
    </main>
  );
};

export default Snippets;
