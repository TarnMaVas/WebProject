import React from "react";
import "../styles/Results.css";

const Results = () => {
  return (
    <div className="results-container">
      <div className="result-item">
        <h3 className="result-header">Comparetto</h3>
        <p className="results-label">Author: <span className="result-author">CodeMaster</span></p>

        <pre className="result-code">
        {`function compareNumbers(a, b) {
  if (a > b) {
    return "a is greater";
  } else if (a < b) {
    return "b is greater";
  } else {
    return "a and b are equal";
  }
}`}
        </pre>

        <div className="result-tags">
          <p className="results-label">Tags:</p>
          <span className="tag">JavaScript</span>
          <span className="tag">Beginner</span>
        </div>

        <div className="result-reviews">
          <p>
            <span>👍 120</span> | <span className="negative">👎 5</span>
          </p>
        </div>

        <div className="result-comments">
          <p className="comments-label">Comments:</p>
          <div className="comment">
            <p className="comment-author">User123:</p>
            <p className="comment-text">This is a great example for beginners!</p>
          </div>
          <div className="comment">
            <p className="comment-author">CodeLover:</p>
            <p className="comment-text">Nice french!</p>
          </div>

        </div>
      </div>

      <div className="result-item">
        <h3 className="result-header">Comparetto</h3>
        <p className="results-label">Author: <span className="result-author">CodeMaster</span></p>

        <pre className="result-code">
        {`function compareNumbers(a, b) {
  if (a > b) {
    return "a is greater";
  } else if (a < b) {
    return "b is greater";
  } else {
    return "a and b are equal";
  }
}`}
        </pre>

        <div className="result-tags">
          <p className="results-label">Tags:</p>
          <span className="tag">JavaScript</span>
          <span className="tag">Beginner</span>
        </div>

        <div className="result-reviews">
          <p>
            <span>👍 120</span> | <span className="negative">👎 5</span>
          </p>
        </div>

        <div className="result-comments">
          <p className="comments-label">Comments:</p>
          <div className="comment">
            <p className="comment-author">User123:</p>
            <p className="comment-text">This is a great example for beginners!</p>
          </div>
          <div className="comment">
            <p className="comment-author">CodeLover:</p>
            <p className="comment-text">Nice french!</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Results;