import { useAuthStore } from './stores/useAuthStore';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import './App.css';

function App() {
  const { user } = useAuthStore();
  if (!user) return <Login />;
  return <MainLayout />;
}

export default App;
