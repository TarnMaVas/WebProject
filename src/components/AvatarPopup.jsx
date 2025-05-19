import { useState } from 'react';
import '../styles/AvatarPopup.css';

const AvatarPopup = ({ onClose, onSave }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image too large. Please select an image smaller than 5MB.');
        return;
      }

      if (!file.type.match('image.*')) {
        setErrorMessage('Please select an image file');
        return;
      }
      
      setErrorMessage('');
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    if (selectedFile) {
      setIsUploading(true);
      setErrorMessage('');
      try {
        await onSave(selectedFile);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to upload image');
        setIsUploading(false);
      }
    }
  };
  return (
    <div className="avatar-popup-overlay">
      <div className="avatar-popup">
        <div className="avatar-header">
          <h2>Change Avatar</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="avatar-body">
          <label className="avatar-upload-label">
            <span className="upload-button">Choose Image</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
          </label>
          
          {errorMessage && (
            <div className="avatar-error">{errorMessage}</div>
          )}
            {previewUrl && (
            <div className="avatar-preview">
              <img src={previewUrl} alt="Preview" />
              <div className="avatar-preview-label">Preview</div>
            </div>
          )}
        </div>

        <div className="avatar-footer">
          <button 
            className="auth-btn" 
            onClick={handleSave} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Save'}
          </button>
          <button 
            className="toggle-btn" 
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPopup;
