import { useState, useEffect } from "react";
import { useFirebaseWithNotifications } from "./useFirebaseWithNotifications";

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    registerUser,
    loginUser,
    logoutUser,
    resetPassword,
    subscribeToAuthChanges,
  } = useFirebaseWithNotifications();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [subscribeToAuthChanges]);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    const result = await loginUser(email, password);
    setIsLoading(false);
    return result;
  };

  const handleRegister = async (email, password, username) => {
    setIsLoading(true);
    const result = await registerUser(email, password, username);
    setIsLoading(false);
    return result;
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const result = await logoutUser();
    setIsLoading(false);
    return result;
  };

  const handleResetPassword = async (email) => {
    setIsLoading(true);
    const result = await resetPassword(email);
    setIsLoading(false);
    return result;
  };

  return {
    user: currentUser,
    currentUser,
    isLoading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleResetPassword,
  };
};
