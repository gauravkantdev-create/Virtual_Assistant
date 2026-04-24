import React, { useContext, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { userDataContext } from './Context/UserContext';

// Lazy load components for better performance
const Customize2 = lazy(() => import('./Pages/Customize2.jsx'));
const Home = lazy(() => import('./Pages/Home.jsx'));
const SignUp = lazy(() => import('./Pages/SignUp.jsx'));
const SignIn = lazy(() => import('./Pages/SignIn.jsx'));
const Customization = lazy(() => import('./Pages/Customization.jsx'));

// Simple loading component with error handling
const LoadingSpinner = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 px-4">
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin animation-delay-150"></div>
      </div>
      <p className="text-white text-lg sm:text-xl md:text-2xl text-center mt-6">
        Loading your AI Assistant...
      </p>
      <p className="text-gray-400 text-sm sm:text-base text-center mt-2">
        Preparing your experience...
      </p>
    </div>
  );
};

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-300 text-base sm:text-lg mb-6">
              We're having trouble loading this page. Please refresh or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const { userData, loading, selectedImage, assistantName } = useContext(userDataContext);

  console.log('App state:', { loading, userData: !!userData, selectedImage: !!selectedImage, assistantName });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('App is loading, showing LoadingSpinner');
    return <LoadingSpinner />;
  }

  const isAuthenticated = Boolean(userData);
  const hasCompletedCustomization = selectedImage && assistantName && assistantName.trim() !== "";

  console.log('App routing:', { isAuthenticated, hasCompletedCustomization });

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Home: only accessible after completing full customization */}
            <Route
              path="/"
              element={
                isAuthenticated && hasCompletedCustomization 
                  ? <Home /> 
                  : isAuthenticated 
                    ? <Navigate to="/customization" replace />
                    : <Navigate to="/signin" replace />
              }
            />

            {/* Sign Up */}
            <Route
              path="/signup"
              element={!isAuthenticated ? <SignUp /> : <Navigate to="/customization" replace />}
            />

            {/* Sign In */}
            <Route
              path="/signin"
              element={!isAuthenticated ? <SignIn /> : <Navigate to="/customization" replace />}
            />

            {/* Customization step 1 */}
            <Route
              path="/customization"
              element={
                isAuthenticated ? <Customization /> : <Navigate to="/signin" replace />
              }
            />

            {/* Customization step 2 */}
            <Route
              path="/customize2"
              element={
                isAuthenticated ? <Customize2 /> : <Navigate to="/signin" replace />
              }
            />

            {/* Catch-all redirect based on auth state */}
            <Route 
              path="*" 
              element={
                isAuthenticated 
                  ? hasCompletedCustomization 
                    ? <Navigate to="/" replace />
                    : <Navigate to="/customization" replace />
                  : <Navigate to="/signin" replace />
              } 
            />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default App;
