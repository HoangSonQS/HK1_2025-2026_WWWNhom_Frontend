import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ChatbotButton from './components/ChatbotButton';
import './App.css';

function App() {
  return (
    <Router>
      <AppRoutes />
      <ChatbotButton />
    </Router>
  );
}

export default App;
