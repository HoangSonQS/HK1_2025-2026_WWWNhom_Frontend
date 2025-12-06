import Chatbot from '../features/ai/components/Chatbot';

const ChatbotPage = () => {
    return (
        <div style={{ 
            height: '100vh', 
            width: '100vw',
            display: 'flex', 
            flexDirection: 'column',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        }}>
            <Chatbot />
        </div>
    );
};

export default ChatbotPage;

