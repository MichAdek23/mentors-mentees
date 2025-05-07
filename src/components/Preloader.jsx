import React from 'react';

const Preloader = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '24px',
      backgroundColor: '#f4f4f4' // Optional: Add a background color
    }}>
      <p>Leap On Mentorship...</p>
      <div style={{
        border: '4px solid #f3f3f3', // Light grey
        borderTop: '4px solid #3498db', // Blue
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }}></div>

      {/* Add a style tag for the spin animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Preloader;