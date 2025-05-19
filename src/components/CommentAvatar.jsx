import { useState, useEffect } from "react";
import { getAvatarUrl, getDefaultAvatar } from "../cloudinary/avatar";

const CommentAvatar = ({ comment }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      setLoading(true);

      try {
        const authorId =
          comment.authorId || (comment.author && comment.author.id);
        const authorName =
          typeof comment.author === "object"
            ? comment.author.name
            : comment.author;

        console.debug("CommentAvatar - Author info:", {
          authorId,
          authorName,
          commentAuthor: comment.author,
          commentAuthorId: comment.authorId,
        });

        let avatarUrl;
        if (authorId) {
          avatarUrl = getAvatarUrl(authorId);
        } else {
          avatarUrl = getDefaultAvatar(authorName);
        }
        console.debug("CommentAvatar - Got avatar URL:", avatarUrl);
        setAvatarUrl(avatarUrl);
      } catch (error) {
        console.debug("Error fetching avatar:", error);
        const authorName =
          typeof comment.author === "object"
            ? comment.author.name
            : comment.author;
        setAvatarUrl(getDefaultAvatar(authorName));
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [comment]);
  const authorName =
    typeof comment.author === "object" ? comment.author.name : comment.author;

  if (!comment) {
    console.debug("CommentAvatar - No comment data provided");
    return <div className="avatar-placeholder"></div>;
  }

  return loading ? (
    <div className="avatar-placeholder"></div>
  ) : (
    <img
      src={avatarUrl}
      alt={`${authorName}'s avatar`}
      className="comment-avatar-img"
      title={authorName}
      onError={(e) => {
        console.debug("CommentAvatar - Error loading image, using default");
        e.target.onerror = null;
        e.target.src = getDefaultAvatar(authorName);
      }}
    />
  );
};

export default CommentAvatar;
