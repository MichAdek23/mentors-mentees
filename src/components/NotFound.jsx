import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you are using react-router-dom

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center'
    }}>
      <h1>404 - Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      {/* Link back to the homepage - adjust the 'to' path as needed */}
      <Link to="/">Go to Homepage</Link>
    </div>
  );
};

export default NotFound;