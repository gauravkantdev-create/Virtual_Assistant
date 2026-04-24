import React from 'react';

const TestComponent = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-blue-600">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Test Page Working!
        </h1>
        <p className="text-xl text-white mb-4">
          If you can see this, React and Tailwind are working correctly.
        </p>
        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-white">✅ CSS Loading: Working</p>
          <p className="text-white">✅ React Components: Working</p>
          <p className="text-white">✅ Tailwind Classes: Working</p>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
