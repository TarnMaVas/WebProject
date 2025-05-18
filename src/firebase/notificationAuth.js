import {
  registerUser as registerUserBase,
  loginUser as loginUserBase,
  logoutUser as logoutUserBase,
  resetPassword as resetPasswordBase,
  getCurrentUser,
  subscribeToAuthChanges
} from './auth';


export const createEnhancedAuthServices = (toast) => {

  const registerUser = async (email, password, username) => {
    try {
      const result = await registerUserBase(email, password, username);
      
      if (result.user) {
        toast.showSuccess(`Welcome, ${username}! Your account has been created.`);
      } else if (result.error) {
        toast.showError(result.error);
      }
      
      return result;
    } catch (error) {
      toast.showError('Registration failed. Please try again later.');
      return { user: null, error: error.message };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const result = await loginUserBase(email, password);
      
      if (result.user) {
        toast.showSuccess(`Welcome back, ${result.user.displayName || 'User'}!`);
      } else if (result.error) {
        toast.showError(result.error);
      }
      
      return result;
    } catch (error) {
      toast.showError('Login failed. Please try again later.');
      return { user: null, error: error.message };
    }
  };

  const logoutUser = async () => {
    try {
      const result = await logoutUserBase();
      
      if (result.success) {
        toast.showInfo('You have been logged out successfully');
      } else if (result.error) {
        toast.showError(result.error);
      }
      
      return result;
    } catch (error) {
      toast.showError('Logout failed. Please try again later.');
      return { success: false, error: error.message };
    }
  };


  const resetPassword = async (email) => {
    try {
      const result = await resetPasswordBase(email);
      
      if (result.success) {
        toast.showSuccess('Password reset email has been sent. Please check your inbox.');
      } else if (result.error) {
        toast.showError(result.error);
      }
      
      return result;
    } catch (error) {
      toast.showError('Password reset failed. Please try again later.');
      return { success: false, error: error.message };
    }
  };

  return {
    registerUser,
    loginUser,
    logoutUser,
    resetPassword,
    getCurrentUser,
    subscribeToAuthChanges
  };
};
