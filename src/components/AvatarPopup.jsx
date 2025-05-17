import React, { useState } from 'react';
import '../styles/AvatarPopup.css';

const AvatarPopup = ({ onClose, onSave }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      onSave(selectedFile);
      onClose();
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
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl && (
            <div className="avatar-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
        </div>

        <div className="avatar-footer">
          <button className="auth-btn" onClick={handleSave} disabled={!selectedFile}>Save</button>
          <button className="toggle-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPopup;
