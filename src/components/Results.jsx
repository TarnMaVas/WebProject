import React from "react";
import "../styles/Results.css";
import likeIcon from "../icons/thumb_up.svg";
import dislikeIcon from "../icons/thumb_down.svg";

const Results = ({ results }) => {
  return (
    <div className="results-container">
      {results.length === 0 ? (
        <h1 className = "not-found-text">No fitting results found.</h1>
      ) : (
        results.map((result) => (
          <div className="result-item" key={result.id}>
            <h3 className="result-header">{result.title}</h3>
            <p className="results-label">
              Author: <span className="result-author">{result.author}</span>
            </p>

            <pre className="result-code">{result.code}</pre>

            <div className="result-tags">
              <p className="results-label">Tags:</p>
              {result.tags.map((tag, index) => (
                <span className="tag" key={index}>{tag}</span>
              ))}
            </div>

            <div className="result-reviews">
            <p>
                <img src={likeIcon} alt="Like" className="review-icon" /> {result.likes} |{" "}
                <img src={dislikeIcon} alt="Dislike" className="review-icon negative" />{" "}
                {result.dislikes}
              </p>
            </div>

            <div className="result-comments">
              <p className="comments-label">Comments:</p>
              {result.comments.map((comment, index) => (
                <div className="comment" key={index}>
                  <p className="comment-author">{comment.author}:</p>
                  <p className="comment-text">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Results;