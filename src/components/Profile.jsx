import { useState, useEffect } from "react";
import "../styles/Profile.css";
import { auth } from "../firebase/config";
import { useUserProfile } from "../hooks/useUserProfile";
import { useToast } from "../components/ToastProvider";
import ScrollToTopButton from "./ScrollToTopButton";
import { getDefaultAvatar } from "../cloudinary/avatar";

const Profile = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [isEditing, setIsEditing] = useState({
    displayName: false,
    email: false,
    password: false,
  });
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const {
    isLoading,
    updateUserDisplayName,
    updateUserEmail,
    updateUserPassword,
    stats,
    uploadAvatar,
  } = useUserProfile();
  const toast = useToast();
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setFormData((prev) => ({
          ...prev,
          displayName: currentUser.displayName || "",
          email: currentUser.email || "",
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.showError(
        "Image too large. Please select an image smaller than 2MB."
      );
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      toast.showInfo("Uploading profile picture...");

      await uploadAvatar(avatarFile, {
        transformation: "w_500,h_500,c_fill,g_face",
        onProgress: (progress) => {
          if (progress === 100) {
            toast.showInfo("Finalizing upload...");
          }
        },
        suppressToast: true,
      });

      await auth.currentUser.reload();
      setUser(auth.currentUser);

      setAvatarFile(null);
      setAvatarPreview(null);

      toast.showSuccess("Profile picture updated successfully!");
    } catch (err) {
      console.error("Failed to update avatar:", err);
      toast.showError(`Failed to update profile picture: ${err.message}`);
    }
  };

  const handleEditToggle = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));

    if (isEditing[field]) {
      setFormData((prev) => ({
        ...prev,
        [field]: user[field] || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!formData.displayName.trim()) {
      toast.showWarning("Username cannot be empty");
      return;
    }

    const result = await updateUserDisplayName(formData.displayName);
    if (result.success) {
      setUser(auth.currentUser);
      setIsEditing((prev) => ({ ...prev, displayName: false }));
    }
  };

  const handleUpdateEmail = async () => {
    if (!formData.email.trim()) {
      toast.showWarning("Email cannot be empty");
      return;
    }

    if (!formData.currentPassword) {
      toast.showWarning("Please enter your current password");
      return;
    }

    const result = await updateUserEmail(
      formData.email,
      formData.currentPassword
    );
    if (result.success) {
      setUser(auth.currentUser);
      setIsEditing((prev) => ({ ...prev, email: false }));
      setFormData((prev) => ({ ...prev, currentPassword: "" }));
    }
  };
  const handleUpdatePassword = async () => {
    if (!formData.currentPassword) {
      toast.showWarning("Please enter your current password");
      return;
    }

    if (!formData.newPassword) {
      toast.showWarning("New password cannot be empty");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.showWarning("Password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.showWarning("Passwords do not match");
      return;
    }

    const result = await updateUserPassword(
      formData.currentPassword,
      formData.newPassword
    );
    if (result.success) {
      setIsEditing((prev) => ({ ...prev, password: false }));
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
  };

  if (!user) {
    return (
      <main className="main">
        <h1 className="white bold">My Profile</h1>
        <p className="light-gray">Please sign in to view your profile.</p>
      </main>
    );
  }
  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="profile-stats">
        <h3>Your Activity Summary</h3>
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-value">{stats.snippetsCount || 0}</span>
            <span className="stat-label">Snippets</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.favoritesCount || 0}</span>
            <span className="stat-label">Favorites</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.commentsCount || 0}</span>
            <span className="stat-label">Comments</span>
          </div>
        </div>
        {stats.joinedDate && (
          <div className="joined-date">
            <span className="joined-label">Member since:</span>{" "}
            {formatDate(stats.joinedDate)}
          </div>
        )}
      </div>
    );
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <main className="page-container profile-page">
      <h1 className="page-title">My Profile</h1>
      <p className="page-description">View and update your account settings</p>

      <div className="single-column-profile">
        <section className="profile-section profile-info">
          <div className="avatar-section">
            <div className="avatar-container">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getDefaultAvatar(user.displayName);
                  }}
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user.displayName ? user.displayName[0].toUpperCase() : "?"}
                </div>
              )}
            </div>
            {avatarPreview && (
              <div className="avatar-preview-container">
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="avatar-preview"
                />
                <div className="preview-label">Preview</div>
              </div>
            )}

            <div className="avatar-actions">
              <label className="avatar-upload-button">
                Change Profile Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                  name="avatar-file"
                />
              </label>

              {avatarFile && (
                <button
                  onClick={handleAvatarUpload}
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Uploading..." : "Save Picture"}
                </button>
              )}
            </div>
          </div>

          {renderStats()}

          <h2 className="section-title">Account Information</h2>
          <div className="profile-field">
            <div className="field-content">
              <div className="field-info">
                <span className="field-label">Username</span>
                {!isEditing.displayName && (
                  <div className="field-value">
                    {user.displayName || "Not set"}
                  </div>
                )}
              </div>

              <div className="field-action">
                <button
                  className="edit-toggle-button"
                  onClick={() => handleEditToggle("displayName")}
                >
                  {isEditing.displayName ? "Cancel" : "Edit"}
                </button>
              </div>
            </div>

            {isEditing.displayName && (
              <div className="field-edit">
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="field-input"
                  autoComplete="display-name"
                />
                <button
                  onClick={handleUpdateDisplayName}
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
          <div className="profile-field">
            <div className="field-content">
              <div className="field-info">
                <span className="field-label">Email Address</span>
                {!isEditing.email && (
                  <div className="field-value">{user.email}</div>
                )}
              </div>

              <div className="field-action">
                <button
                  className="edit-toggle-button"
                  onClick={() => handleEditToggle("email")}
                >
                  {isEditing.email ? "Cancel" : "Edit"}
                </button>
              </div>
            </div>

            {isEditing.email && (
              <div className="field-edit">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="field-input"
                  autoComplete="email"
                />
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Current password"
                  className="field-input"
                  autoComplete="current-password"
                />
                <button
                  onClick={handleUpdateEmail}
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
          <div className="profile-field">
            <div className="field-content">
              <div className="field-info">
                <span className="field-label">Password</span>
                {!isEditing.password && (
                  <div className="field-value">••••••••</div>
                )}
              </div>

              <div className="field-action">
                <button
                  className="edit-toggle-button"
                  onClick={() => handleEditToggle("password")}
                >
                  {isEditing.password ? "Cancel" : "Change"}
                </button>
              </div>
            </div>

            {isEditing.password && (
              <div className="field-edit">
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Current password"
                  className="field-input"
                  autoComplete="current-password"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="New password"
                  className="field-input"
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className="field-input"
                  autoComplete="new-password"
                />
                <button
                  onClick={handleUpdatePassword}
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <ScrollToTopButton />
    </main>
  );
};

export default Profile;
