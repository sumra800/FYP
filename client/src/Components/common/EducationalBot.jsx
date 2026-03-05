import React, { useState, useRef, useEffect } from 'react';
import './EducationalBot.css';

const EducationalBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! 👋 I'm your Study Buddy Assistant. How can I help you today?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Add user message
        const newUserMsg = { id: Date.now(), text: inputValue, isBot: false };
        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue('');

        // Simulate bot thinking and replying (for UI demo purposes)
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: "I'm a UI placeholder for now. Once the AI model is integrated, I'll be able to answer all your educational questions!",
                    isBot: true
                }
            ]);
        }, 1000);
    };

    return (
        <div className={`educational-bot-container ${isOpen ? 'open' : ''}`}>
            {/* Chat Window */}
            {isOpen && (
                <div className="bot-chat-window">
                    {/* Header */}
                    <div className="bot-chat-header">
                        <div className="bot-chat-header-info">
                            <div className="bot-avatar">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 8V4H8"></path>
                                    <rect x="4" y="8" width="16" height="12" rx="2" ry="2"></rect>
                                    <path d="M2 14h2"></path>
                                    <path d="M20 14h2"></path>
                                    <path d="M15 13v2"></path>
                                    <path d="M9 13v2"></path>
                                </svg>
                            </div>
                            <div>
                                <h3 className="bot-name">Study Buddy AI</h3>
                                <span className="bot-status">Online</span>
                            </div>
                        </div>
                        <button className="bot-close-btn" onClick={toggleChat} aria-label="Close chat">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="bot-chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-message ${msg.isBot ? 'bot-message' : 'user-message'}`}>
                                {msg.isBot && (
                                    <div className="message-avatar">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="4" y="8" width="16" height="12" rx="2" ry="2"></rect>
                                            <path d="M9 13v2"></path>
                                            <path d="M15 13v2"></path>
                                        </svg>
                                    </div>
                                )}
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form className="bot-chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="chat-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask me anything..."
                        />
                        <button
                            type="submit"
                            className={`chat-send-btn ${inputValue.trim() ? 'active' : ''}`}
                            disabled={!inputValue.trim()}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                className={`bot-fab ${isOpen ? 'hidden' : ''}`}
                onClick={toggleChat}
                aria-label="Open AI Assistant"
            >
                <div className="bot-fab-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8V4H8"></path>
                        <rect x="4" y="8" width="16" height="12" rx="2" ry="2"></rect>
                        <path d="M2 14h2"></path>
                        <path d="M20 14h2"></path>
                        <path d="M15 13v2"></path>
                        <path d="M9 13v2"></path>
                    </svg>
                </div>
                <div className="bot-fab-pulse"></div>
            </button>
        </div>
    );
};

export default EducationalBot;
