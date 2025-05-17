import React, { useState } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Profile from './components/Profile';
import Snippets from './components/Snippets';

const App = () => {
  const [page, setPage] = useState('main');

  return (
    <>
      <Header setPage={setPage} />
      {page === 'main' && <Main />}
      {page === 'profile' && <Profile />}
      {page === 'snippets' && <Snippets />}
    </>
  );
};

export default App;
