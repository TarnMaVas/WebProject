import { useState, useCallback } from 'react';
import { useFirebaseWithNotifications } from './useFirebaseWithNotifications';
import { isInFavorites } from '../firebase/services';

export const useFavorites = (currentUser) => {
  const [favoriteStatus, setFavoriteStatus] = useState({});
  const [submittingFavorite, setSubmittingFavorite] = useState({});
  const { addToFavorites, removeFromFavorites } = useFirebaseWithNotifications();

  const checkFavoriteStatus = useCallback(async (snippetId) => {
    if (!currentUser) return false;
    
    try {
      const isFavorite = await isInFavorites(snippetId);
      setFavoriteStatus(prev => ({
        ...prev,
        [snippetId]: isFavorite
      }));
      return isFavorite;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  }, [currentUser]);

  const toggleFavorite = async (snippetId) => {
    if (!currentUser) return;
    
    try {
      setSubmittingFavorite(prev => ({
        ...prev,
        [snippetId]: true
      }));
      
      const status = favoriteStatus[snippetId];
      
      if (status) {
        await removeFromFavorites(snippetId);
      } else {
        await addToFavorites(snippetId);
      }
      
      setFavoriteStatus(prev => ({
        ...prev,
        [snippetId]: !status
      }));
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    } finally {
      setSubmittingFavorite(prev => ({
        ...prev,
        [snippetId]: false
      }));
    }
  };

  const checkMultipleFavoriteStatus = useCallback(async (snippets) => {
    if (!currentUser || !snippets?.length) return;
    
    try {
      const promises = snippets.map(snippet => checkFavoriteStatus(snippet.id));
      await Promise.all(promises);
    } catch (error) {
      console.error("Error checking multiple favorite statuses:", error);
    }
  }, [checkFavoriteStatus, currentUser]);

  return {
    favoriteStatus,
    submittingFavorite,
    checkFavoriteStatus,
    toggleFavorite,
    checkMultipleFavoriteStatus
  };
};
