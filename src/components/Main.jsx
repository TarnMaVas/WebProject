import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import Results from "./Results";
import "../styles/Main.css";
import { subscribeToAuthChanges } from "../firebase/auth";
import { useSnippetInteractions } from "../hooks/useSnippetInteractions";
import ScrollToTopButton from "./ScrollToTopButton";

const Main = () => {
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (results) => {
    setFilteredResults(results);
    setSearchPerformed(true);
  };

  const {
    submittingComment,
    submittingReaction,
    newComments,
    handleCommentChange,
    handleCommentSubmit,
    handleReaction,
    handleDeleteComment,
    hasUserReacted
  } = useSnippetInteractions(currentUser, filteredResults, setFilteredResults);

  const handleSearchStart = () => {
    setIsLoading(true);
  };

  const handleSearchEnd = () => {
    setIsLoading(false);
  };

  return (
    <main className="main-container">
      <section className="search-section">
        <SearchBar 
          onSearch={handleSearch} 
          onSearchStart={handleSearchStart} 
          onSearchEnd={handleSearchEnd}
          isLoading={isLoading}
        />
      </section>
      
      <section className="results-section">
        <Results
          results={filteredResults}
          searchPerformed={searchPerformed}
          isLoading={isLoading}
          currentUser={currentUser}
          submittingComment={submittingComment}
          submittingReaction={submittingReaction}
          newComments={newComments}
          onCommentChange={handleCommentChange}
          onCommentSubmit={handleCommentSubmit}
          onReaction={handleReaction}
          onDeleteComment={handleDeleteComment}
          hasUserReacted={hasUserReacted}
        />
      </section>

      <ScrollToTopButton />
    </main>
  );
};

export default Main;
