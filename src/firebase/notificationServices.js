import {
  addToFavorites as addToFavoritesBase,
  removeFromFavorites as removeFromFavoritesBase,
  addComment as addCommentBase,
  updateSnippetReaction as updateSnippetReactionBase,
  deleteComment as deleteCommentBase,
  filterSnippets as filterSnippetsBase,
  getPopularSnippets as getPopularSnippetsBase,
  getFavoriteSnippets as getFavoriteSnippetsBase,
  createSnippet as createSnippetBase,
  getUserSnippets as getUserSnippetsBase,
} from "./services";

export const createEnhancedServices = (toast) => {
  const addToFavorites = async (snippetId) => {
    try {
      await addToFavoritesBase(snippetId);
      toast.showSuccess("Added to favorites");
      return true;
    } catch (error) {
      toast.showError(error.message || "Failed to add to favorites");
      throw error;
    }
  };

  const removeFromFavorites = async (snippetId) => {
    try {
      await removeFromFavoritesBase(snippetId);
      toast.showInfo("Removed from favorites");
      return true;
    } catch (error) {
      toast.showError(error.message || "Failed to remove from favorites");
      throw error;
    }
  };

  const addComment = async (snippetId, commentData) => {
    try {
      const result = await addCommentBase(snippetId, commentData);
      toast.showSuccess("Comment added successfully");
      return result;
    } catch (error) {
      toast.showError(error.message || "Failed to add comment");
      throw error;
    }
  };

  const updateSnippetReaction = async (snippetId, isLike) => {
    try {
      const result = await updateSnippetReactionBase(snippetId, isLike);
      if (isLike) {
        toast.showSuccess("You liked this snippet");
      } else {
        toast.showInfo("You disliked this snippet");
      }
      return result;
    } catch (error) {
      toast.showError(error.message || "Failed to update reaction");
      throw error;
    }
  };

  const deleteComment = async (snippetId, commentId) => {
    try {
      await deleteCommentBase(snippetId, commentId);
      toast.showInfo("Comment removed");
      return true;
    } catch (error) {
      toast.showError(error.message || "Failed to delete comment");
      throw error;
    }
  };

  const filterSnippets = async (searchText, selectedTags) => {
    try {
      const results = await filterSnippetsBase(searchText, selectedTags);
      return results;
    } catch (error) {
      toast.showError("Failed to search snippets. Please try again.");
      throw error;
    }
  };

  const getPopularSnippets = async () => {
    try {
      const snippets = await getPopularSnippetsBase();
      return snippets;
    } catch (error) {
      toast.showError("Failed to load popular snippets. Please try again.");
      return [];
    }
  };

  const getFavoriteSnippets = async (userId) => {
    try {
      const snippets = await getFavoriteSnippetsBase(userId);
      return snippets;
    } catch (error) {
      toast.showError("Failed to load favorite snippets. Please try again.");
      return [];
    }
  };
  const uploadSnippet = async (snippetData) => {
    try {
      const result = await createSnippetBase(snippetData);
      toast.showSuccess("Snippet created successfully!");
      return result;
    } catch (error) {
      toast.showError(error.message || "Failed to create snippet");
      throw error;
    }
  };

  const getUserSnippets = async () => {
    try {
      const snippets = await getUserSnippetsBase();
      return snippets;
    } catch (error) {
      toast.showError("Failed to load your snippets. Please try again.");
      return [];
    }
  };

  return {
    addToFavorites,
    removeFromFavorites,
    filterSnippets,
    getPopularSnippets,
    getFavoriteSnippets,
    addComment,
    updateSnippetReaction,
    deleteComment,
    uploadSnippet,
    getUserSnippets,
  };
};
