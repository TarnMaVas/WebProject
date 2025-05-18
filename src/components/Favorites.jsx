import { useState, useEffect } from "react";
import Results from "./Results";
import "../styles/Favorites.css";
import { auth } from "../firebase/config";
import { useSnippetInteractions } from "../hooks/useSnippetInteractions";
import ScrollToTopButton from "./ScrollToTopButton";
import { useFirebaseWithNotifications } from "../hooks/useFirebaseWithNotifications";
import { useToast } from "./ToastProvider";

const Favorites = () => {
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { getFavoriteSnippets } = useFirebaseWithNotifications();
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);

      if (user) {
        fetchFavorites(user.uid);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  const fetchFavorites = async (userId) => {
    try {
      setIsLoading(true);
      const favoriteSnippets = await getFavoriteSnippets(userId);
      setSnippets(Array.isArray(favoriteSnippets) ? favoriteSnippets : []);
    } catch (err) {
      console.error("Error fetching favorite snippets:", err);
      setError("Failed to load favorite snippets. Please try again later.");
      toast.showError("Failed to load favorite snippets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };  const {
    submittingComment,
    submittingReaction,
    newComments,
    handleCommentChange,
    handleCommentSubmit,
    handleReaction,
    handleDeleteComment,
    hasUserReacted
  } = useSnippetInteractions(isAuthenticated ? auth.currentUser : null, snippets, setSnippets);

  return (
    <main className="page-container favorites-page">
      <h1 className="page-title favorites-title">Your Favorite Snippets</h1>
      <p className="page-description">
        Code snippets you've marked as favorites
      </p>

      {!isAuthenticated && (
        <div className="auth-message">
          <p>Please sign in to see your favorite snippets</p>
        </div>
      )}      {isAuthenticated && error && <div className="error-message">{error}</div>}      {isAuthenticated && (
        <Results 
          results={snippets || []}
          searchPerformed={true}
          isLoading={isLoading}
          currentUser={auth.currentUser}
          submittingComment={submittingComment || {}}
          submittingReaction={submittingReaction || {}}
          newComments={newComments || {}}
          onCommentChange={handleCommentChange}
          onCommentSubmit={handleCommentSubmit}
          onReaction={handleReaction}
          onDeleteComment={handleDeleteComment}
          hasUserReacted={hasUserReacted}
        />
      )}
      {isAuthenticated && !isLoading && !error && snippets.length === 0 && (
        <div className="welcome-message">
          <h2>No Favorites Yet</h2>
          <p>
            You haven't added any snippets to your favorites yet. Browse
            snippets and click the heart icon to add them here.
          </p>
        </div>
      )}      <ScrollToTopButton />
    </main>
  );
};

export default Favorites;
