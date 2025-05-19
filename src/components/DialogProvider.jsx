import { createContext, useState, useContext } from 'react';
import Dialog from './Dialog';
import AuthPopup from './AuthPopup';

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  const [dialogs, setDialogs] = useState([]);
  const [authDialog, setAuthDialog] = useState({
    isOpen: false,
    initialTab: 'login',
    onAuthSuccess: null
  });

  const showDialog = ({ title, message, confirmText, cancelText, type, showCancel, onConfirm }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setDialogs((prev) => [...prev, { 
      id, 
      title, 
      message, 
      confirmText: confirmText || 'Confirm', 
      cancelText: cancelText || 'Cancel', 
      type: type || 'info', 
      showCancel: showCancel !== false,
      onConfirm: onConfirm || (() => {})
    }]);
    return id;
  };

  const alert = (message, title = 'Alert', options = {}) => {
    return showDialog({
      title,
      message,
      confirmText: options.confirmText || 'OK',
      showCancel: false,
      type: options.type || 'info',
      onConfirm: options.onConfirm || (() => {})
    });
  };

  const confirm = (message, title = 'Confirm', options = {}) => {
    return new Promise((resolve) => {
      showDialog({
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'warning',
        showCancel: true,
        onConfirm: () => {
          resolve(true);
          if (options.onConfirm) options.onConfirm();
        },
        onCancel: () => {
          resolve(false);
          if (options.onCancel) options.onCancel();
        }
      });
    });
  };

  const openDialog = (dialogType, options = {}) => {
    if (dialogType === 'auth') {
      setAuthDialog({ 
        isOpen: true, 
        initialTab: options.initialTab || 'login',
        onAuthSuccess: options.onAuthSuccess || (() => {})
      });
    }
  };

  const closeDialog = (id) => {
    setDialogs((prev) => prev.filter((dialog) => dialog.id !== id));
  };

  const closeAuthDialog = () => {
    setAuthDialog(prev => ({ ...prev, isOpen: false }));
  };

  const currentDialog = dialogs.length > 0 ? dialogs[0] : null;

  return (
    <DialogContext.Provider value={{ alert, confirm, showDialog, closeDialog, openDialog }}>
      {children}
      {currentDialog && (
        <Dialog
          isOpen={true}
          title={currentDialog.title}
          message={currentDialog.message}
          confirmText={currentDialog.confirmText}
          cancelText={currentDialog.cancelText}
          type={currentDialog.type}
          showCancel={currentDialog.showCancel}
          onConfirm={() => {
            currentDialog.onConfirm();
            closeDialog(currentDialog.id);
          }}
          onClose={() => {
            closeDialog(currentDialog.id);
          }}
        />
      )}
      <AuthPopup
        isOpen={authDialog.isOpen}
        onClose={closeAuthDialog}
        onAuthSuccess={authDialog.onAuthSuccess}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
