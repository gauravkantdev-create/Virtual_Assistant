import React from 'react';

const TestApp = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#050517', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      fontSize: '24px'
    }}>
      <h1>Test App is Working!</h1>
      <p>If you can see this, the React app is loading correctly.</p>
      <p>Check the browser console for any errors.</p>
    </div>
  );
};

export default TestApp;
