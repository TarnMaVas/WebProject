import { collection, getDocs, doc, arrayRemove, updateDoc, arrayUnion, getDoc, increment, Timestamp, setDoc } from 'firebase/firestore';
import { db } from './config';
import { getCurrentUser } from './auth'
import { v4 as uuidv4 } from 'uuid'

export const getSnippets = async () => {
  try {
    const snippetsCollection = collection(db, 'snippets');
    const snippetsSnapshot = await getDocs(snippetsCollection);
    return snippetsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return [];
  }
};

export const getOptions = async () => {
  try {
    const optionsCollection = collection(db, 'options');
    const optionsSnapshot = await getDocs(optionsCollection);
    const optionsData = optionsSnapshot.docs.map(doc => doc.data());
    return optionsData.length > 0 ? optionsData[0].groupedOptions : [];
  } catch (error) {
    console.error("Error fetching options:", error);
    return [];
  }
};

export const filterSnippets = async (searchText, selectedTags) => {
  try {
    const snippetsCollection = collection(db, 'snippets');
    const snippetsSnapshot = await getDocs(snippetsCollection);
    
    return snippetsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(item => {
        const matchesText = searchText ? 
          item.title.toLowerCase().includes(searchText.toLowerCase()) : 
          true;
        
        const matchesTags = selectedTags.length === 0 || 
          selectedTags.every(tag => item.tags.includes(tag.label));
          
        return matchesText && matchesTags;
      });
  } catch (error) {
    console.error("Error filtering snippets:", error);
    return [];
  }
};

export const addComment = async (snippetId, commentData) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to comment');
    }

    const snippetRef = doc(db, 'snippets', snippetId);

    const completeComment = {
      id: uuidv4(),
      text: commentData.text,
      timestamp: commentData.timestamp || Timestamp.now(),
      author: commentData.author || {
        id: currentUser.uid,
        name: currentUser.displayName || 'Anonymous User',
        photoURL: currentUser.photoURL || null
      }
    };

    await updateDoc(snippetRef, {
      comments: arrayUnion(completeComment)
    });

    return await getDoc(snippetRef);
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};


export const updateSnippetReaction = async (snippetId, isLike) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to react to snippets');
    }
    
    const userId = currentUser.uid;
    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetDoc = await getDoc(snippetRef);
    
    if (!snippetDoc.exists()) {
      throw new Error('Snippet not found');
    }
    
    const snippetData = snippetDoc.data();
    const userReactions = snippetData.userReactions || {};
    const currentReaction = userReactions[userId];
    
    let updates = {};
    
    if (!currentReaction) {
      updates = {
        [`userReactions.${userId}`]: isLike ? 'like' : 'dislike',
        [isLike ? 'likes' : 'dislikes']: increment(1)
      };
    } 
    else if ((currentReaction === 'like' && !isLike) || (currentReaction === 'dislike' && isLike)) {
      updates = {
        [`userReactions.${userId}`]: isLike ? 'like' : 'dislike',
        likes: increment(isLike ? 1 : -1),
        dislikes: increment(isLike ? -1 : 1)
      };
    }
    else if ((currentReaction === 'like' && isLike) || (currentReaction === 'dislike' && !isLike)) {
      updates = {
        [`userReactions.${userId}`]: null,
        [isLike ? 'likes' : 'dislikes']: increment(-1)
      };
    }
    
    await updateDoc(snippetRef, updates);
    
    const updatedSnippet = await getSnippetWithDetails(snippetId);
    return updatedSnippet;
  } catch (error) {
    console.error('Error updating reaction:', error);
    throw error;  }
};

export const createSnippet = async (snippetData) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('You must be logged in to create a snippet');
    }
    
    const snippetRef = doc(collection(db, 'snippets'));
    const timestamp = Timestamp.now();
    
    const newSnippet = {
      id: snippetRef.id,
      title: snippetData.title,
      code: snippetData.code,
      tags: snippetData.tags,
      author: user.displayName || 'Anonymous',
      authorId: user.uid,
      authorPhotoURL: user.photoURL || null,
      createdAt: timestamp,
      updatedAt: timestamp,
      likes: 0,
      dislikes: 0,
      userReactions: {},
      comments: []
    };
    
    await setDoc(snippetRef, newSnippet);
    
    return newSnippet;
  } catch (error) {
    console.error('Error creating snippet:', error);
    throw error;
  }
};

export const getSnippetWithDetails = async (snippetId) => {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetDoc = await getDoc(snippetRef);
    
    if (!snippetDoc.exists()) {
      throw new Error('Snippet not found');
    }
    
    return {
      id: snippetDoc.id,
      ...snippetDoc.data()
    };
  } catch (error) {
    console.error('Error fetching snippet details:', error);
    throw error;
  }
};

export const getUserSnippets = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return [];
    }
    
    const snippetsCollection = collection(db, 'snippets');
    const snippetsSnapshot = await getDocs(snippetsCollection);
    
    const userSnippets = snippetsSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(snippet => snippet.authorId === user.uid)
      .sort((a, b) => {
        return b.createdAt?.seconds - a.createdAt?.seconds || 0;
      });
    
    return userSnippets;
  } catch (error) {
    console.error('Error fetching user snippets:', error);
    throw error;
  }
};

export const getSnippetsWithUserReactions = async (userId) => {
  try {
    const snippets = await getSnippets();
    
    if (!userId) return snippets;
    
    return snippets.map(snippet => {
      const userReaction = snippet.userReactions?.[userId];
      return {
        ...snippet,
        userHasLiked: userReaction === 'like',
        userHasDisliked: userReaction === 'dislike'
      };
    });
  } catch (error) {
    console.error('Error fetching snippets with reactions:', error);
    return [];
  }
};

export const filterSnippetsWithReactions = async (searchText, selectedTags, userId) => {
  try {
    const filteredSnippets = await filterSnippets(searchText, selectedTags);
    
    if (!userId) return filteredSnippets;
    
    return filteredSnippets.map(snippet => {
      const userReaction = snippet.userReactions?.[userId];
      return {
        ...snippet,
        userHasLiked: userReaction === 'like',
        userHasDisliked: userReaction === 'dislike'
      };
    });
  } catch (error) {
    console.error('Error filtering snippets with reactions:', error);
    return [];
  }
};

export const deleteComment = async (snippetId, commentId) => {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetSnap = await getDoc(snippetRef);

    if (!snippetSnap.exists()) {
      throw new Error('Snippet not found');
    }

    const snippetData = snippetSnap.data();
    const comments = snippetData.comments || [];

    const updatedComments = comments.filter(comment => comment.id !== commentId);

    await updateDoc(snippetRef, {
      comments: updatedComments
    });

    console.log('Comment deleted successfully');
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment');
  }
};

export const migrateCommentsAddIds = async () => {
  try {
    const snippetsSnapshot = await getDocs(collection(db, 'snippets'));

    for (const snippetDoc of snippetsSnapshot.docs) {
      const snippetData = snippetDoc.data();
      const comments = snippetData.comments || [];

      let needsUpdate = false;
      const updatedComments = comments.map(comment => {
        if (!comment.id) {
          needsUpdate = true;
          return { ...comment, id: uuidv4() };
        }
        return comment;
      });

      if (needsUpdate) {
        await updateDoc(doc(db, 'snippets', snippetDoc.id), {
          comments: updatedComments
        });
        console.log(`Updated comments for snippet: ${snippetDoc.id}`);
      }
    }

    console.log('Comment ID migration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

export const getPopularSnippets = async () => {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.uid;
    
    const snippetsCollection = collection(db, 'snippets');
    const snippetsSnapshot = await getDocs(snippetsCollection);
    
    const sortedSnippets = snippetsSnapshot.docs
      .map(doc => {
        const snippet = {
          id: doc.id,
          ...doc.data()
        };
          if (userId && snippet.userReactions) {
          const userReaction = snippet.userReactions[userId];
          snippet.userHasLiked = userReaction === 'like';
          snippet.userHasDisliked = userReaction === 'dislike';
        }
          const likes = snippet.likes || 0;
        const dislikes = snippet.dislikes || 0;
        const total = likes + dislikes;
        snippet.rating = total > 0 ? likes / total : 0;
        
        return snippet;
      })
      .sort((a, b) => {
        const likesA = a.likes || 0;
        const likesB = b.likes || 0;
        
        if (likesB !== likesA) {
          return likesB - likesA;
        }
        
        return b.rating - a.rating;
      })
      .slice(0, 15);
    
    return sortedSnippets;
  } catch (error) {
    console.error("Error fetching popular snippets:", error);
    return [];
  }
};

export const getFavoriteSnippets = async (userId) => {
  try {
    if (!userId) return [];
    
    const userFavoritesRef = doc(db, 'favorites', userId);
    const userFavoritesSnapshot = await getDoc(userFavoritesRef);
    
    if (!userFavoritesSnapshot.exists()) {
      return [];
    }
    
    const favoriteIds = userFavoritesSnapshot.data().snippetIds || [];
    
    if (favoriteIds.length === 0) return [];
    
    const snippets = [];
    for (const snippetId of favoriteIds) {
      const snippetRef = doc(db, 'snippets', snippetId);
      const snippetSnapshot = await getDoc(snippetRef);
      
      if (snippetSnapshot.exists()) {
        const snippet = {
          id: snippetSnapshot.id,
          ...snippetSnapshot.data()
        };
        
        if (snippet.userReactions) {
          const userReaction = snippet.userReactions[userId];
          snippet.userHasLiked = userReaction === 'like';
          snippet.userHasDisliked = userReaction === 'dislike';
        }
        
        snippets.push(snippet);
      }
    }
    
    return snippets;
  } catch (error) {
    console.error("Error fetching favorite snippets:", error);
    return [];
  }
};

export const addToFavorites = async (snippetId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to add favorites');
    }
    
    const userId = currentUser.uid;
    const userFavoritesRef = doc(db, 'favorites', userId);
    const userFavoritesDoc = await getDoc(userFavoritesRef);
    
    if (userFavoritesDoc.exists()) {
      const favorites = userFavoritesDoc.data();
      const snippetIds = favorites.snippetIds || [];
      
      if (!snippetIds.includes(snippetId)) {
        await updateDoc(userFavoritesRef, {
          snippetIds: arrayUnion(snippetId)
        });
      }
    } else {
      await setDoc(userFavoritesRef, {
        snippetIds: [snippetId]
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (snippetId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User must be logged in to remove favorites');
    }
    
    const userId = currentUser.uid;
    const userFavoritesRef = doc(db, 'favorites', userId);
    const userFavoritesDoc = await getDoc(userFavoritesRef);
    
    if (userFavoritesDoc.exists()) {
      await updateDoc(userFavoritesRef, {
        snippetIds: arrayRemove(snippetId)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

export const isInFavorites = async (snippetId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return false;
    }
    
    const userId = currentUser.uid;
    const userFavoritesRef = doc(db, 'favorites', userId);
    const userFavoritesDoc = await getDoc(userFavoritesRef);
    
    if (userFavoritesDoc.exists()) {
      const favorites = userFavoritesDoc.data();
      const snippetIds = favorites.snippetIds || [];
      return snippetIds.includes(snippetId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking favorites:', error);
    return false;
  }
};