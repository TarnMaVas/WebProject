import { useState } from "react";
import "../styles/SnippetUploader.css";
import { useTags } from "../hooks/useTags";

const SnippetUploader = ({ onUpload, isUploading, onClose }) => {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const { availableTags, isLoading: tagsLoading } = useTags();

  const handleTagToggle = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!code.trim()) {
      newErrors.code = "Code snippet is required";
    }

    if (tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const snippetData = {
      title,
      code,
      tags,
    };

    const success = await onUpload(snippetData);
    if (success) {
      setTitle("");
      setCode("");
      setTags([]);
      onClose();
    }
  };

  return (
    <div className="snippet-uploader-overlay">
      <div className="snippet-uploader">
        <h2>Upload New Snippet</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your snippet a descriptive title"
              className={errors.title ? "error" : ""}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="code">Code Snippet</label>
            <textarea
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              rows={10}
              className={errors.code ? "error" : ""}
            />
            {errors.code && <span className="error-text">{errors.code}</span>}
          </div>

          <div className="form-group">
            <p className='description-p'>Tags (select at least one)</p>
            <div id="tags-div" className={`tags-selector ${errors.tags ? "error" : ""}`}>
              {tagsLoading ? (
                <div className="tags-loading">Loading tags...</div>
              ) : (
                <div className="available-tags">
                  {availableTags.map((tag, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => handleTagToggle(tag)}
                      className={`tag-option ${
                        tags.includes(tag) ? "selected" : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.tags && <span className="error-text">{errors.tags}</span>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="upload-btn" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Snippet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnippetUploader;
