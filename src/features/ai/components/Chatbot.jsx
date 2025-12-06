import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../api/aiService';
import './Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: 'Xin chào! Tôi là trợ lý AI của SEBook. Tôi có thể giúp bạn tìm sách, trả lời câu hỏi về đơn hàng, và nhiều hơn nữa. Bạn cần hỗ trợ gì?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto scroll to bottom when new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when component mounts
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) {
            return;
        }

        const userMessage = inputMessage.trim();
        setInputMessage('');
        
        // Add user message to chat
        const userMsg = {
            id: Date.now(),
            text: userMessage,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);

        // Show loading indicator
        setIsLoading(true);
        const loadingMsg = {
            id: Date.now() + 1,
            text: 'Đang suy nghĩ...',
            sender: 'bot',
            timestamp: new Date(),
            isLoading: true
        };
        setMessages(prev => [...prev, loadingMsg]);

        try {
            // Call AI API
            const response = await chatWithAI(userMessage, conversationId);
            
            // Update conversation ID
            if (response.conversationId) {
                setConversationId(response.conversationId);
            }

            // Remove loading message and add bot response
            setMessages(prev => {
                const filtered = prev.filter(msg => !msg.isLoading);
                return [...filtered, {
                    id: Date.now() + 2,
                    text: response.response,
                    sender: 'bot',
                    timestamp: new Date(),
                    suggestedBooks: response.suggestedBooks || [],
                    sources: response.sources || []
                }];
            });
        } catch (error) {
            console.error('Error chatting with AI:', error);
            
            // Remove loading message and add error message
            setMessages(prev => {
                const filtered = prev.filter(msg => !msg.isLoading);
                return [...filtered, {
                    id: Date.now() + 2,
                    text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
                    sender: 'bot',
                    timestamp: new Date(),
                    isError: true
                }];
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <div className="chatbot-header-content">
                    <div className="chatbot-avatar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="chatbot-header-text">
                        <h3>Trợ lý AI SEBook</h3>
                        <p className="chatbot-status">Đang hoạt động</p>
                    </div>
                </div>
            </div>

            <div className="chatbot-messages">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`chatbot-message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.isError ? 'error-message' : ''}`}
                    >
                        {message.sender === 'bot' && (
                            <div className="message-avatar bot-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                                </svg>
                            </div>
                        )}
                        <div className="message-content">
                            <div className="message-text">{message.text}</div>
                            {message.suggestedBooks && message.suggestedBooks.length > 0 && (
                                <div className="suggested-books">
                                    <p className="suggested-books-title">📚 Sách được đề xuất:</p>
                                    <ul className="suggested-books-list">
                                        {message.suggestedBooks.map((book, index) => (
                                            <li key={index}>{book}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="message-time">
                                {message.timestamp.toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                        {message.sender === 'user' && (
                            <div className="message-avatar user-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-container">
                <div className="chatbot-input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="chatbot-input"
                        placeholder="Nhập câu hỏi của bạn..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <button
                        className="chatbot-send-button"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                    >
                        {isLoading ? (
                            <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                                    <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                                </circle>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
