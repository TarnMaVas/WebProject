import { collection, getDocs} from 'firebase/firestore';
import { db } from './config';

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