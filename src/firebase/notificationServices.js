// Enhanced Firebase services with toast notifications
import { 
  addToFavorites as addToFavoritesBase, 
  removeFromFavorites as removeFromFavoritesBase,
  addComment as addCommentBase,
  updateSnippetReaction as updateSnippetReactionBase,
  deleteComment as deleteCommentBase,
  filterSnippets as filterSnippetsBase,
  getPopularSnippets as getPopularSnippetsBase,
  getFavoriteSnippets as getFavoriteSnippetsBase
} from './services';

export const createEnhancedServices = (toast, dialog) => {

  const addToFavorites = async (snippetId) => {
    try {
      await addToFavoritesBase(snippetId);
      toast.showSuccess('Added to favorites');
      return true;
    } catch (error) {
      toast.showError(error.message || 'Failed to add to favorites');
      throw error;
    }
  };


  const removeFromFavorites = async (snippetId) => {
    try {
      await removeFromFavoritesBase(snippetId);
      toast.showInfo('Removed from favorites');
      return true;
    } catch (error) {
      toast.showError(error.message || 'Failed to remove from favorites');
      throw error;
    }
  };

  const filterSnippets = async (searchText, selectedTags) => {
    try {
      const results = await filterSnippetsBase(searchText, selectedTags);
      return results;
    } catch (error) {
      toast.showError('Failed to search snippets. Please try again.');
      throw error;
    }
  };

  const getPopularSnippets = async () => {
    try {
      const snippets = await getPopularSnippetsBase();
      return snippets;
    } catch (error) {
      toast.showError('Failed to load popular snippets. Please try again.');
      return [];
    }
  };


  const getFavoriteSnippets = async (userId) => {
    try {
      const snippets = await getFavoriteSnippetsBase(userId);
      return snippets;
    } catch (error) {
      toast.showError('Failed to load favorite snippets. Please try again.');
      return [];
    }
  };

  return {
    addToFavorites,
    removeFromFavorites,
    filterSnippets,
    getPopularSnippets,
    getFavoriteSnippets
  };
};
