import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import Login from './Login';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#181C14]/40 z-50">
    <div className="w-12 h-12 border-4 border-t-transparent border-[#ECDFCC] rounded-full animate-spin" />
  </div>
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchMe, loading, error } = useAuthStore();

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line
  }, []);

  if (loading) return <Spinner />;

  if (error) {
    return <Login />;
  }

  return <>{children}</>;
}; 