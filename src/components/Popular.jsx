import { useState, useEffect } from "react";
import Results from "./Results";
import "../styles/Popular.css";
import { subscribeToAuthChanges } from "../firebase/auth";
import { useSnippetInteractions } from "../hooks/useSnippetInteractions";
import ScrollToTopButton from "./ScrollToTopButton";
import { useToast } from "./ToastProvider";
import { useFirebaseWithNotifications } from "../hooks/useFirebaseWithNotifications";

const Popular = () => {  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useToast();
  const { getPopularSnippets } = useFirebaseWithNotifications();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPopularSnippets = async () => {
      try {
        setIsLoading(true);
        const popularSnippets = await getPopularSnippets();
        setSnippets(popularSnippets);      
      } catch (err) {
        console.error("Error fetching popular snippets:", err);
        setError("Failed to load popular snippets. Please try again later.");
        toast.showError("Failed to load popular snippets. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };    fetchPopularSnippets();
  }, [getPopularSnippets, toast]);
  
  const {
    submittingComment,
    submittingReaction,
    newComments,
    handleCommentChange,
    handleCommentSubmit,
    handleReaction,
    handleDeleteComment,
    hasUserReacted
  } = useSnippetInteractions(currentUser, snippets, setSnippets);

  return (
    <main className="page-container popular-page">
      <h1 className="page-title popular-title">Popular Snippets</h1>      
      <p className="page-description">
        The most liked and used code snippets from our community
      </p>
      {error && <div className="error-message">{error}</div>}
      {!error && (
        <Results
          results={snippets}
          searchPerformed={true}
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
      )}

      <ScrollToTopButton />
    </main>
  );
};

export default Popular;
