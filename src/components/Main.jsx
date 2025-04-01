import React, { useState } from "react";
import SearchBar from "./SearchBar";
import Select from "react-select";
import Results from "./Results";
import "../styles/Main.css";

const groupedOptions = [
  {
    label: "Languages",
    options: [
      { value: "js", label: "JavaScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
    ],
  },
  {
    label: "Source",
    options: [
      { value: "github", label: "GitHub" },
      { value: "stack", label: "StackOverflow" },
    ],
  },
];

const Main = () => {

  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <main className="main">
      <SearchBar />
      <Select
        className="multi-select"
        classNamePrefix="react-select"
        options={groupedOptions}
        value={selectedOption}
        onChange={setSelectedOption}
        isMulti
        isSearchable
        placeholder="Select options..."
      />
      <Results />
    </main>
  );
};

export default Main;
