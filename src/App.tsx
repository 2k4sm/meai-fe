import React from 'react';
import { useAuthStore } from './stores/useAuthStore';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import './App.css';

const App: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return <Login />;

  return <Sidebar />;
};

export default App;
