import React, { useState, useEffect } from "react";
import "../styles/Results.css";
import likeIcon from "../icons/thumb_up.svg";
import dislikeIcon from "../icons/thumb_down.svg";
import { addComment, updateSnippetReaction, deleteComment, migrateCommentsAddIds } from "../firebase/services";
import { subscribeToAuthChanges } from "../firebase/auth";

const Results = ({ results }) => {
  const [resultsState, setResults] = useState(results);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComments, setNewComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [submittingReaction, setSubmittingReaction] = useState({});
  const [expandedSnippets, setExpandedSnippets] = useState({});

  useEffect(() => {
    setResults(results);
  }, [results]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(user => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleCommentChange = (snippetId, value) => {
    setNewComments(prevState => ({
      ...prevState,
      [snippetId]: value
    }));
  };

  const toggleCommentSection = (snippetId) => {
    setExpandedSnippets(prevState => ({
      ...prevState,
      [snippetId]: !prevState[snippetId]
    }));
  };

  const handleCommentSubmit = async (snippetId) => {
    if (!newComments[snippetId]?.trim()) return;

    if (!currentUser) {
      alert("Please log in to add comments");
      return;
    }

    try {
      setSubmittingComment(prevState => ({ ...prevState, [snippetId]: true }));

      const updatedResult = { ...resultsState.find(result => result.id === snippetId) };
      updatedResult.comments = [
        ...updatedResult.comments || [],
        {
          author: currentUser.displayName || "Anonymous User",
          authorId: currentUser.uid,
          text: newComments[snippetId],
          timestamp: new Date()
        }
      ];

      setNewComments(prevState => ({
        ...prevState,
        [snippetId]: ""
      }));

      const updatedResults = resultsState.map(result =>
        result.id === snippetId ? updatedResult : result
      );
      setResults(updatedResults);

      await addComment(snippetId, updatedResult.comments[updatedResult.comments.length - 1]);

    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(prevState => ({ ...prevState, [snippetId]: false }));
    }
  };

  const handleReaction = async (snippetId, isLike) => {
    if (!currentUser) {
      alert("Please log in to react to snippets");
      return;
    }

    const existingReaction = resultsState.find(result => result.id === snippetId).userReactions?.[currentUser.uid];

    try {
      setSubmittingReaction(prevState => ({
        ...prevState,
        [snippetId + (isLike ? "_like" : "_dislike")]: true
      }));

      const updatedResult = { ...resultsState.find(result => result.id === snippetId) };

      if (existingReaction) {
        if (existingReaction === (isLike ? 'like' : 'dislike')) {
          if (isLike) {
            updatedResult.likes = Math.max((updatedResult.likes || 0) - 1, 0);
          } else {
            updatedResult.dislikes = Math.max((updatedResult.dislikes || 0) - 1, 0);
          }
          delete updatedResult.userReactions[currentUser.uid];
        } else {
          if (isLike) {
            updatedResult.likes = (updatedResult.likes || 0) + 1;
            updatedResult.dislikes = Math.max((updatedResult.dislikes || 0) - 1, 0);
          } else {
            updatedResult.dislikes = (updatedResult.dislikes || 0) + 1;
            updatedResult.likes = Math.max((updatedResult.likes || 0) - 1, 0);
          }
          updatedResult.userReactions[currentUser.uid] = isLike ? 'like' : 'dislike';
        }
      } else {
        if (isLike) {
          updatedResult.likes = (updatedResult.likes || 0) + 1;
        } else {
          updatedResult.dislikes = (updatedResult.dislikes || 0) + 1;
        }
        updatedResult.userReactions = {
          ...updatedResult.userReactions,
          [currentUser.uid]: isLike ? 'like' : 'dislike'
        };
      }

      setResults(prevState => prevState.map(result =>
        result.id === snippetId ? updatedResult : result
      ));

      await updateSnippetReaction(snippetId, currentUser.uid, isLike ? 'like' : 'dislike');
    } catch (error) {
      console.error("Error updating reaction:", error);
      alert("Failed to update reaction. Please try again.");
    } finally {
      setSubmittingReaction(prevState => ({
        ...prevState,
        [snippetId + (isLike ? "_like" : "_dislike")]: false
      }));
    }
  };

  const hasUserReacted = (snippet, isLike) => {
    if (!currentUser || !snippet.userReactions) return false;

    const userReaction = snippet.userReactions[currentUser.uid];
    return userReaction === (isLike ? 'like' : 'dislike');
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert("Code copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  };

  const handleDeleteComment = async (snippetId, commentId) => {
    if (!currentUser) {
      alert("You must be logged in to delete comments");
      return;
    }
  
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment(snippetId, commentId);
        const updatedResults = resultsState.map(result => {
          if (result.id === snippetId) {
            result.comments = result.comments.filter(comment => comment.id !== commentId);
          }
          return result;
        });
        setResults(updatedResults);
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("Failed to delete comment. Please try again.");
      }
    }
  };

  return (
    <div className="results-container">
      {resultsState.length === 0 ? (
        <h1 className="not-found-text">No fitting results found.</h1>
      ) : (
        resultsState.map((result) => (
          <div className="result-item" key={result.id}>
            <h3 className="result-header">{result.title}</h3>
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
                onClick={() => handleReaction(result.id, true)}
                disabled={submittingReaction[result.id + "_like"]}
              >
                <img src={likeIcon} alt="Like" className="review-icon" />
                <span>{result.likes || 0}</span>
              </button>

              <button
                className={`reaction-button ${hasUserReacted(result, false) ? 'active' : ''}`}
                onClick={() => handleReaction(result.id, false)}
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
                          {currentUser && comment.authorId === currentUser?.uid && (
                            <button
                              className="delete-comment-button"
                              onClick={() => handleDeleteComment(result.id, index)}
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
                      onChange={(e) => handleCommentChange(result.id, e.target.value)}
                      disabled={!currentUser}
                    />
                    <button
                      className="submit-comment-button"
                      onClick={() => handleCommentSubmit(result.id)}
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
