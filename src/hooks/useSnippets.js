import { useState, useEffect, useCallback, useRef } from "react";
import { useFirebaseWithNotifications } from "./useFirebaseWithNotifications";
import { auth } from "../firebase/config";

export const useSnippets = () => {
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { getUserSnippets, uploadSnippet } = useFirebaseWithNotifications();
  const fetchInProgress = useRef(false);
  const fetchSnippets = useCallback(async () => {
    if (fetchInProgress.current) return;

    try {
      fetchInProgress.current = true;
      setIsLoading(true);

      const userSnippets = await getUserSnippets();
      setSnippets(userSnippets);
    } catch (error) {
      console.error("Error fetching user snippets:", error);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [getUserSnippets]);

  useEffect(() => {
    let isMounted = true;

    if (auth.currentUser) {
      fetchSnippets();
    } else {
      setIsLoading(false);
      setSnippets([]);
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!isMounted) return;

      if (user) {
        fetchSnippets();
      } else {
        setSnippets([]);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchSnippets]);

  const handleUploadSnippet = async (snippetData) => {
    setUploading(true);
    try {
      const newSnippet = await uploadSnippet(snippetData);
      setSnippets((prevSnippets) => [newSnippet, ...prevSnippets]);
      return true;
    } catch (error) {
      console.error("Error uploading snippet:", error);
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    snippets,
    isLoading,
    uploading,
    uploadSnippet: handleUploadSnippet,
  };
};
