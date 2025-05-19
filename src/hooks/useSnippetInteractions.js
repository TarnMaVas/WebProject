import { useState, useCallback, useMemo } from 'react';
import { useFirebaseWithNotifications } from './useFirebaseWithNotifications';
import { useToast } from '../components/ToastProvider';

export const useSnippetInteractions = (currentUser, snippets, setSnippets) => {
  const [submittingComment, setSubmittingComment] = useState({});
  const [submittingReaction, setSubmittingReaction] = useState({});
  const [newComments, setNewComments] = useState({});
  const toast = useToast();
  const { addComment, updateSnippetReaction, deleteComment } = useFirebaseWithNotifications();

  const handleCommentChange = useCallback((snippetId, value) => {
    setNewComments(prevState => ({
      ...prevState,
      [snippetId]: value
    }));
  }, []);

  const handleCommentSubmit = useCallback(async (snippetId) => {
    if (!newComments[snippetId]?.trim()) return;

    if (!currentUser) {
      toast.showWarning("Please log in to add comments");
      return;
    }

    try {
      setSubmittingComment(prevState => ({ ...prevState, [snippetId]: true }));

      const commentData = {
        author: {
          id: currentUser.uid,
          name: currentUser.displayName || "Anonymous User",
          photoURL: currentUser.photoURL || null
        },
        text: newComments[snippetId],
        timestamp: new Date()
      };

      const updatedResult = { ...snippets.find(result => result.id === snippetId) };
      updatedResult.comments = [
        ...updatedResult.comments || [],
        commentData
      ];

      setNewComments(prevState => ({
        ...prevState,
        [snippetId]: ""
      }));

      const updatedResults = snippets.map(result =>
        result.id === snippetId ? updatedResult : result
      );
      setSnippets(updatedResults);

      await addComment(snippetId, commentData);
    } catch (error) {
      console.error("Error adding comment:", error);

    } finally {
      setSubmittingComment(prevState => ({ ...prevState, [snippetId]: false }));
    }
  }, [currentUser, snippets, newComments, toast, addComment, setSnippets]);

  const handleReaction = useCallback(async (snippetId, isLike) => {
    if (!currentUser) {
      toast.showWarning("Please log in to react to snippets");
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
      }
      
      setSnippets(prevState => prevState.map(result =>
        result.id === snippetId ? updatedResult : result
      ));

      await updateSnippetReaction(snippetId, isLike);
    } catch (error) {
      console.error("Error updating reaction:", error);
    } finally {
      setSubmittingReaction(prevState => ({
        ...prevState,
        [snippetId + (isLike ? "_like" : "_dislike")]: false
      }));
    }
  }, [currentUser, snippets, updateSnippetReaction, toast, setSnippets]);

  const handleDeleteComment = useCallback(async (snippetId, commentId) => {
    if (!currentUser) {
      toast.showWarning("Please log in to manage comments");
      return;
    }
  
    try {
      const snippet = snippets.find(result => result.id === snippetId);
      if (!snippet) {
        toast.showError("Snippet not found");
        return;
      }
      
      const comment = snippet.comments?.find(c => c.id === commentId);
      if (!comment) {
        toast.showError("Comment not found");
        return;
      }
      const authorId = comment.author?.id || comment.authorId;
      const isAuthor = authorId === currentUser.uid || 
                       (!authorId && comment.author === currentUser.displayName) || 
                       currentUser.email?.includes("admin");
      
      if (!isAuthor) {
        console.log("Cannot delete - Comment data:", comment, "Current user:", currentUser.uid);
        toast.showWarning("You can only delete your own comments");
        return;
      }

      const updatedResults = snippets.map(result => {
        if (result.id === snippetId) {
          return {
            ...result,
            comments: (result.comments || []).filter(comment => comment.id !== commentId)
          };
        }
        return result;
      });
      setSnippets(updatedResults);

      await deleteComment(snippetId, commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);

      const snippetDoc = snippets.find(s => s.id === snippetId);
      if (snippetDoc) {
        setSnippets(prev => prev.map(s => 
          s.id === snippetId ? snippetDoc : s
        ));
      }
    }
  }, [currentUser, snippets, toast, deleteComment, setSnippets]);

  const hasUserReacted = useCallback((snippet, isLike) => {
    if (!currentUser || !snippet.userReactions) return false;

    const userReaction = snippet.userReactions[currentUser.uid];
    return userReaction === (isLike ? 'like' : 'dislike');
  }, [currentUser]);

  return useMemo(() => ({
    submittingComment,
    submittingReaction,
    newComments,
    handleCommentChange,
    handleCommentSubmit,
    handleReaction,
    handleDeleteComment,
    hasUserReacted
  }), [
    submittingComment,
    submittingReaction,
    newComments,
    handleCommentChange,
    handleCommentSubmit,
    handleReaction, 
    handleDeleteComment,
    hasUserReacted
  ]);
};
