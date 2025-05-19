import { useState, useEffect, useCallback } from "react";
import { getDefaultAvatar } from "../cloudinary/avatar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { checkCloudinaryAvatarExists } from "../cloudinary/avatar_helper";

const CommentAvatar = ({ comment }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthorInfo = useCallback(() => {
    const authorId = comment.authorId || (comment.author && comment.author.id);
    const authorName = typeof comment.author === "object"
      ? comment.author.name
      : comment.author;
    
    return { authorId, authorName };
  }, [comment]);
  useEffect(() => {
    const fetchAvatar = async () => {
      setLoading(true);
      try {
        const { authorId, authorName } = getAuthorInfo();

        console.debug("CommentAvatar - Author info:", {
          authorId,
          authorName,
          commentAuthor: comment.author,
          commentAuthorId: comment.authorId,
        });

        const defaultAvatarUrl = getDefaultAvatar(authorName);
        setAvatarUrl(defaultAvatarUrl);

        if (authorId) {
            try {

            const userDocRef = doc(db, "users", authorId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists() && userDoc.data().photoURL) {
              const photoURL = userDoc.data().photoURL;
              console.debug("CommentAvatar - Found photoURL in document:", photoURL);
              setAvatarUrl(photoURL);
              
            } else {
              const hasAvatar = await checkCloudinaryAvatarExists(authorId);
              
              if (hasAvatar) {
                const cloudinaryConfig = {
                  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dthieumo8'
                };
                const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
                const timestamp = new Date().getTime();
                const publicId = `user_avatars/avatar_${authorId}`;
                const cloudinaryUrl = `${baseUrl}/w_200,h_200,c_fill,g_face,a_0,r_max/${publicId}?t=${timestamp}`;
                
                console.debug("CommentAvatar - Using direct Cloudinary URL:", cloudinaryUrl);
                setAvatarUrl(cloudinaryUrl);
              } else {
                console.debug("CommentAvatar - No avatar found, using default");
              }
            }
          } catch (docError) {
            console.debug("Error fetching user document:", docError);

            const hasAvatar = await checkCloudinaryAvatarExists(authorId);
            
            if (hasAvatar) {
              const cloudinaryConfig = {
                cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dthieumo8'
              };
              const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
              const timestamp = new Date().getTime();
              const publicId = `user_avatars/avatar_${authorId}`;
              const cloudinaryUrl = `${baseUrl}/w_200,h_200,c_fill,g_face,a_0,r_max/${publicId}?t=${timestamp}`;
              setAvatarUrl(cloudinaryUrl);
            }
          }
        } else {
          console.debug("CommentAvatar - No author ID, using default avatar");
        }
      } catch (error) {
        console.debug("Error fetching avatar:", error);
        const { authorName } = getAuthorInfo();
        setAvatarUrl(getDefaultAvatar(authorName));
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [comment, getAuthorInfo]);

  const { authorName } = getAuthorInfo();

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
        const defaultAvatar = getDefaultAvatar(authorName);
        console.debug(
          "CommentAvatar - Falling back to default:",
          defaultAvatar
        );
        e.target.src = defaultAvatar;

        if (avatarUrl !== defaultAvatar) {
          setAvatarUrl(defaultAvatar);
        }
      }}
    />
  );
};

export default CommentAvatar;
