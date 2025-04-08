import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Results from "./Results";
import "../styles/Main.css";
import upArrowIcon from "../icons/up-arrow-icon.svg";


const Main = () => {
  const [filteredResults, setFilteredResults] = useState([]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="main">
      <SearchBar onFilter={setFilteredResults} />
      <Results results={filteredResults} />
      <button className="back-to-top-btn" onClick={scrollToTop}>
        <img src={upArrowIcon} alt="Back to Top" className="back-to-top-icon" />
      </button>
    </main>
  );
};

export default Main;
