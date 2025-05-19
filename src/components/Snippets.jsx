import React, { useState } from 'react';
import '../styles/Snippets.css';
import { useSnippets } from '../hooks/useSnippets';
import SnippetUploader from './SnippetUploader';
import { useAuth } from '../hooks/useAuth';
import { useDialog } from '../components/DialogProvider';

const Snippets = () => {
  const [showUploader, setShowUploader] = useState(false);
  const { snippets, isLoading, uploading, uploadSnippet } = useSnippets();
  const { user } = useAuth();
  const { openDialog } = useDialog();
  const handleOpenUploader = () => {
    setShowUploader(true);
  };

  const handleCloseUploader = () => {
    setShowUploader(false);
  };

  const handleUpload = async (snippetData) => {
    const success = await uploadSnippet(snippetData);
    if (success) {
      setShowUploader(false);
    }
    return success;
  };

  const handleSignInClick = () => {
    openDialog('auth', { initialTab: 'login' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <main className="snippets-main">
      <div className="snippets-header">
        <div className="snippets-title-container">
          <h1 className="snippets-title">My Snippets</h1>
          <p className="snippets-description">
            Manage and organize your code snippets for easy reference.
          </p>
        </div>
        {user && (
          <button
            className="create-snippet-button"
            onClick={handleOpenUploader}
          >
            + Create New Snippet
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="snippets-loading">
          <div className="loading-spinner"></div>
          <p>Loading your snippets...</p>
        </div>
      ) : snippets.length > 0 ? (
        <div className="snippets-list">
          {snippets.map((snippet) => (
            <div className="snippet-card" key={snippet.id}>
              <div className="snippet-header">
                <h3 className="snippet-title">{snippet.title}</h3>
                <div className="snippet-meta">
                  <div className="snippet-author">
                    {snippet.authorPhotoURL ? (
                      <img
                        src={snippet.authorPhotoURL}
                        alt={snippet.author}
                        className="author-avatar"
                      />
                    ) : (
                      <div className="author-avatar-placeholder">
                        {snippet.author.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{snippet.author}</span>
                  </div>
                  <div className="snippet-date">
                    {formatDate(snippet.createdAt)}
                  </div>
                </div>
              </div>
              <div className="snippet-code-container">
                <pre className="snippet-code">{snippet.code}</pre>
                <button
                  className="copy-button"
                  onClick={() => navigator.clipboard.writeText(snippet.code)}
                >
                  Copy
                </button>
              </div>
              <div className="snippet-footer">
                <div className="snippet-tags">
                  {snippet.tags.map((tag, index) => (
                    <span key={index} className="snippet-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="snippet-stats">
                  <div className="stat-item">
                    <span className="stat-icon">👍</span>
                    <span>{snippet.likes}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">💬</span>
                    <span>{snippet.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-snippets">
          {user ? (
            <>
              <p>You don't have any snippets yet. Create your first one!</p>
              <button
                className="create-snippet-button-alt"
                onClick={handleOpenUploader}
              >
                + Create New Snippet
              </button>
            </>
          ) : (
            <>
              <p>Sign in to create and manage your code snippets.</p>
              <button 
                className="sign-in-button"
                onClick={handleSignInClick}
              >
                Sign In
              </button>
            </>
          )}
        </div>
      )}

      {showUploader && (
        <SnippetUploader
          onUpload={handleUpload}
          isUploading={uploading}
          onClose={handleCloseUploader}
        />
      )}
    </main>
  );
};

export default Snippets;
