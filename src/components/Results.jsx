import { useState, useEffect } from "react";
import "../styles/Results.css";
import likeIcon from "../icons/thumb_up.svg";
import dislikeIcon from "../icons/thumb_down.svg";
import { useDialog } from "./DialogProvider";
import { useToast } from "./ToastProvider";
import { useFavorites } from "../hooks/useFavorites";

const Results = ({ 
  results, 
  searchPerformed, 
  isLoading, 
  currentUser,
  submittingComment,
  submittingReaction,
  newComments,
  onCommentChange,
  onCommentSubmit,
  onReaction,
  onDeleteComment,
  hasUserReacted
}) => {
  const [expandedSnippets, setExpandedSnippets] = useState({});
  const dialog = useDialog();
  const toast = useToast();
  const { favoriteStatus, submittingFavorite, toggleFavorite, checkMultipleFavoriteStatus } = useFavorites(currentUser);
  
  useEffect(() => {
    if (results.length > 0 && currentUser) {
      checkMultipleFavoriteStatus(results);
    }
  }, [results, currentUser, checkMultipleFavoriteStatus]);

  const toggleCommentSection = (snippetId) => {
    setExpandedSnippets(prevState => ({
      ...prevState,
      [snippetId]: !prevState[snippetId]
    }));
  };
  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.showSuccess("Code copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast.showError("Failed to copy code. Please try again.");
      });
  };

  return (
    <div className="results-container">
      {isLoading ? (
        <div className="search-message">
          <div className="loading-spinner"></div>
          <h2 className="loading-text">Searching...</h2>
        </div>
      ) : results.length === 0 ? (
        searchPerformed ? (
          <h2 className="not-found-text">No fitting results found.</h2>
        ) : (
          <div className="welcome-message">
            <h2>Welcome to SnippetSearch!</h2>
            <p>Search for code snippets using the search bar above...</p>
          </div>
        )
      ) : (
        results.map((result) => (
          <div className="result-item" key={result.id}>            <div className="result-header-row">
              <h3 className="result-header">{result.title}</h3>
              {currentUser && (
                <button
                  className={`favorite-button ${favoriteStatus[result.id] ? 'favorited' : ''}`}
                  onClick={() => toggleFavorite(result.id)}
                  disabled={submittingFavorite[result.id]}
                  title={favoriteStatus[result.id] ? "Remove from favorites" : "Add to favorites"}
                >
                  {submittingFavorite[result.id] ? '...' : favoriteStatus[result.id] ? '★' : '☆'}
                </button>
              )}
            </div>
            <p className="results-label">
              Author: <span className="result-author">{result.author}</span>
            </p>

            <div className="code-container">
              <pre className="result-code">{result.code}</pre>
              <button
                className="copy-button"
                onClick={() => copyToClipboard(result.code)}
                title="Copy to clipboard"
              >
                Copy
              </button>
            </div>

            <div className="result-tags">
              <p className="results-label">Tags:</p>
              {result.tags.map((tag, index) => (
                <span className="tag" key={index}>{tag}</span>
              ))}
            </div>

            <div className="result-reactions">
              <button
                className={`reaction-button ${hasUserReacted(result, true) ? 'active' : ''}`}
                onClick={() => onReaction(result.id, true)}
                disabled={submittingReaction[result.id + "_like"]}
              >
                <img src={likeIcon} alt="Like" className="review-icon" />
                <span>{result.likes || 0}</span>
              </button>

              <button
                className={`reaction-button ${hasUserReacted(result, false) ? 'active' : ''}`}
                onClick={() => onReaction(result.id, false)}
                disabled={submittingReaction[result.id + "_dislike"]}
              >
                <img src={dislikeIcon} alt="Dislike" className="review-icon negative" />
                <span>{result.dislikes || 0}</span>
              </button>
            </div>

            <div className="comments-section">
              <button
                className="comments-toggle"
                onClick={() => toggleCommentSection(result.id)}
              >
                {expandedSnippets[result.id] ? 'Hide Comments' : `Show Comments (${result.comments?.length || 0})`}
              </button>

              {expandedSnippets[result.id] && (
                <>
                  <div className="result-comments">
                    <p className="comments-label">Comments:</p>
                    {result.comments && result.comments.length > 0 ? (
                      result.comments.map((comment, index) => (
                        <div className="comment" key={index}>
                          <p className="comment-author">{comment.author}:</p>
                          <p className="comment-text">{comment.text}</p>
                          <p className="comment-timestamp">
                            {comment.timestamp ? new Date(comment.timestamp.seconds * 1000).toLocaleString() : ''}
                          </p>
                          {currentUser && comment.authorId === currentUser?.uid && (                            <button
                              className="delete-comment-button"
                              onClick={() => {
                                dialog.confirm(
                                  'Are you sure you want to delete this comment?',
                                  'Delete Comment',
                                  {
                                    type: 'error',
                                    confirmText: 'Delete',
                                    onConfirm: () => {
                                      onDeleteComment(result.id, comment.id);
                                      toast.showSuccess('Comment deleted successfully');
                                    }
                                  }
                                );
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="no-comments">No comments yet. Be the first to comment!</p>
                    )}
                  </div>

                  <div className="add-comment-section">
                    <textarea
                      placeholder="Add a comment..."
                      value={newComments[result.id] || ''}
                      onChange={(e) => onCommentChange(result.id, e.target.value)}
                      disabled={!currentUser}
                    />
                    <button
                      className="submit-comment-button"
                      onClick={() => onCommentSubmit(result.id)}
                      disabled={submittingComment[result.id] || !newComments[result.id]?.trim() || !currentUser}
                    >
                      {submittingComment[result.id] ? 'Posting...' : 'Post Comment'}
                    </button>
                    {!currentUser && <p className="login-prompt">Please log in to add comments</p>}
                  </div>
                </>
              )}            
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Results;
