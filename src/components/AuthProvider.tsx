import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin" />
  </div>
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchMe, loading, error, reset } = useAuthStore();

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line
  }, []);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-50">
        <div className="bg-white/80 p-8 rounded-xl shadow-xl text-center">
          <div className="mb-4 text-red-600 font-semibold">{error}</div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={reset}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 