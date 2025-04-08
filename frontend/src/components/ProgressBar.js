import React from "react";


const ProgressBar = ({ score, totalScore }) => {
  const progress = (score / totalScore) * 100; // Calculate progress percentage

  return (
    <div style={{ 
      width: "100%", 
      height: "20px", 
      backgroundColor: "#ccc", // Gray background for total score
      borderRadius: "10px", 
      overflow: "hidden",
      position: "relative",
    }}>
      <div
        style={{
          width: `${progress}%`, // Purple bar width based on progress
          height: "100%",
          backgroundColor: "#800080", // Purple color for points gained
          borderRadius: "10px",
          transition: "width 0.3s ease", // Smooth transition
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#000",
          fontWeight: "bold",
        }}
      >
        {score} / {totalScore} {/* Display score and total score */}
      </div>
    </div>
  );
};

export default ProgressBar;