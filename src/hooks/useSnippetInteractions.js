import { useState } from 'react';
import { addComment, updateSnippetReaction, deleteComment } from '../firebase/services';
import { useToast } from '../components/ToastProvider';
import { useDialog } from '../components/DialogProvider';

export const useSnippetInteractions = (currentUser, snippets, setSnippets) => {
  const [submittingComment, setSubmittingComment] = useState({});
  const [submittingReaction, setSubmittingReaction] = useState({});
  const [newComments, setNewComments] = useState({});
  const toast = useToast();
  const dialog = useDialog();

  const handleCommentChange = (snippetId, value) => {
    setNewComments(prevState => ({
      ...prevState,
      [snippetId]: value
    }));
  };
  const handleCommentSubmit = async (snippetId) => {
    if (!newComments[snippetId]?.trim()) return;

    if (!currentUser) {
      toast.showWarning("Please log in to add comments");
      return;
    }

    try {
      setSubmittingComment(prevState => ({ ...prevState, [snippetId]: true }));

      const updatedResult = { ...snippets.find(result => result.id === snippetId) };
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

      const updatedResults = snippets.map(result =>
        result.id === snippetId ? updatedResult : result
      );
      setSnippets(updatedResults);

      await addComment(snippetId, updatedResult.comments[updatedResult.comments.length - 1]);    } catch (error) {
      console.error("Error adding comment:", error);
      toast.showError("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(prevState => ({ ...prevState, [snippetId]: false }));
    }
  };

  const handleReaction = async (snippetId, isLike) => {
    if (!currentUser) {
      return;
    }

    const existingReaction = snippets.find(result => result.id === snippetId).userReactions?.[currentUser.uid];

    try {
      setSubmittingReaction(prevState => ({
        ...prevState,
        [snippetId + (isLike ? "_like" : "_dislike")]: true
      }));

      const updatedResult = { ...snippets.find(result => result.id === snippetId) };

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
      }      setSnippets(prevState => prevState.map(result =>
        result.id === snippetId ? updatedResult : result
      ));

      await updateSnippetReaction(snippetId, isLike);
    } catch (error) {
      console.error("Error updating reaction:", error);
      toast.showError("Failed to update reaction. Please try again.");
    } finally {
      setSubmittingReaction(prevState => ({
        ...prevState,
        [snippetId + (isLike ? "_like" : "_dislike")]: false
      }));
    }
  };  const handleDeleteComment = async (snippetId, commentId) => {
    if (!currentUser) {
      toast.showWarning("Please log in to manage comments");
      return;
    }
  
    try {
      await deleteComment(snippetId, commentId);
      const updatedResults = snippets.map(result => {
        if (result.id === snippetId) {
          result.comments = result.comments.filter(comment => comment.id !== commentId);
        }
        return result;
      });
      setSnippets(updatedResults);
      toast.showSuccess("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.showError("Failed to delete comment. Please try again.");
    }
  };

  const hasUserReacted = (snippet, isLike) => {
    if (!currentUser || !snippet.userReactions) return false;

    const userReaction = snippet.userReactions[currentUser.uid];
    return userReaction === (isLike ? 'like' : 'dislike');
  };

  return {
    submittingComment,
    submittingReaction,
    newComments,
    handleCommentChange,
    handleCommentSubmit,
    handleReaction,
    handleDeleteComment,
    hasUserReacted
  };
};
