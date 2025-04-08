import React, { useState } from 'react';
import Select from 'react-select';
import '../styles/SearchBar.css';

const groupedOptions = [
  {
    label: "Languages",
    options: [
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
    ],
  },
  {
    label: "Source",
    options: [
      { value: "github", label: "GitHub" },
      { value: "stackoverflow", label: "StackOverflow" },
    ],
  },
];

const mockData = [
  {
    id: 1,
    title: "Comparetto",
    author: "CodeMaster",
    code: `function compareNumbers(a, b) {
  if (a > b) {
    return "a is greater";
  } else if (a < b) {
    return "b is greater";
  } else {
    return "a and b are equal";
  }
}`,
    tags: ["JavaScript", "GitHub"],
    likes: 120,
    dislikes: 5,
    comments: [
      { author: "User123", text: "This is a great example for beginners!" },
      { author: "CodeLover", text: "Nice explanation!" },
    ],
  },
  {
    id: 2,
    title: "String Reversal",
    author: "DevGuru",
    code: `function reverseString(str) {
  return str.split('').reverse().join('');
}`,
    tags: ["JavaScript", "StackOverflow"],
    likes: 95,
    dislikes: 2,
    comments: [
      { author: "CodeFan", text: "Very useful snippet!" },
    ],
  },
  {
    id: 3,
    title: "Factorial Function",
    author: "MathWhiz",
    code: `function factorial(n) {
  if (n === 0) return 1;
  return n * factorial(n - 1);
}`,
    tags: ["Python", "GitHub"],
    likes: 80,
    dislikes: 3,
    comments: [
      { author: "MathGeek", text: "Great for recursion practice!" },
    ],
  },
  {
    id: 4,
    title: "Bubble Sort Algorithm",
    author: "AlgoExpert",
    code: `function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    tags: ["Java", "StackOverflow"],
    likes: 150,
    dislikes: 10,
    comments: [
      { author: "SortingFan", text: "Classic sorting algorithm!" },
    ],
  },
];

const SearchBar = ({ onFilter }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const handleSearch = () => {
    const filteredResults = mockData.filter((item) => {
      const matchesText = item.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => item.tags.includes(tag.label));
      return matchesText && matchesTags;
    });

    onFilter(filteredResults);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-bar"
        placeholder="Search snippets..."
        onChange={(e) => setSearchText(e.target.value)}
      />

      <Select
        className="multi-select"
        classNamePrefix="react-select"
        options={groupedOptions}
        value={selectedTags}
        onChange={setSelectedTags}
        isMulti
        isSearchable
        placeholder="Filter by tags..."
      />
      <button className="search-btn" onClick={handleSearch}>
        Search
      </button>
    </div>
  );
};

export default SearchBar;