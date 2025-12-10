import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ChatbotButton from './components/ChatbotButton';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const path = location.pathname || '';
  const hideChat =
    path.startsWith('/admin') ||
    path.startsWith('/staff') ||
    path.startsWith('/auth/login') ||
    path === '/register' ||
    path.startsWith('/password/forgot') ||
    path.startsWith('/password/reset');

  return (
    <>
      <AppRoutes />
      {!hideChat && <ChatbotButton />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
