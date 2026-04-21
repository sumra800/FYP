import React, { useState, useRef, useEffect } from 'react';
import './EducationalBot.css';
import { chatAPI, userAPI } from '../../services/api';

const Flashcard = ({ front, back }) => {
    const [flipped, setFlipped] = useState(false);
    return (
        <div className={`chat-flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
            <div className="chat-flashcard-inner">
                <div className="chat-flashcard-front">
                    <span className="flashcard-label">Question</span>
                    <p>{front}</p>
                    <span className="flashcard-hint">Click to flip</span>
                </div>
                <div className="chat-flashcard-back">
                    <span className="flashcard-label">Answer</span>
                    <p>{back}</p>
                </div>
            </div>
        </div>
    );
};

const EducationalBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! 👋 I'm your Study Buddy Assistant. How can I help you today?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const loadChat = async () => {
            if (userAPI.isAuthenticated()) {
                try {
                    const response = await chatAPI.getChatHistory();
                    if (response.messages && response.messages.length > 0) {
                        setMessages(response.messages);
                    }
                } catch (error) {
                    console.error("Failed to load chat history:", error);
                }
            }
            setIsInitialLoadDone(true);
        };
        loadChat();
    }, []);

    useEffect(() => {
        if (isInitialLoadDone && userAPI.isAuthenticated()) {
            const saveChat = async () => {
                try {
                    await chatAPI.saveChatHistory(messages);
                } catch (error) {
                    console.error("Failed to save chat history:", error);
                }
            };
            // Adding a small timeout to avoid double-saves when a bot message comes right after a user message
            const timeoutId = setTimeout(saveChat, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [messages, isInitialLoadDone]);

    const handleClearChat = async () => {
        if (window.confirm("Are you sure you want to clear your chat history?")) {
            try {
                if (userAPI.isAuthenticated()) {
                    await chatAPI.clearChatHistory();
                }
                setMessages([{ id: Date.now(), text: "Hi there! 👋 I'm your Study Buddy Assistant. How can I help you today?", isBot: true }]);
            } catch (error) {
                console.error("Failed to clear chat history:", error);
            }
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (isOpen) setIsMaximized(false); // Reset maximize when closing
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const renderMessage = (text) => {
        if (!text) return null;
        
        // Match **Front:** <text> **Back:** <text>
        const flashcardRegex = /\*\*Front:\*\*\s*(.*?)\s*\*\*Back:\*\*\s*(.*?)(?=\*\*Front:\*\*|$)/gs;
        
        if (text.includes('**Front:**') && text.includes('**Back:**')) {
            const cards = [];
            let match;
            let introText = "";
            
            // Extract text before the first flashcard
            const firstMatchIndex = text.indexOf('**Front:**');
            if (firstMatchIndex > 0) {
                introText = text.substring(0, firstMatchIndex).trim();
            }

            // Must reset lastIndex since we are reusing the regex
            flashcardRegex.lastIndex = 0;
            while ((match = flashcardRegex.exec(text)) !== null) {
                cards.push({ id: match.index, front: match[1].trim(), back: match[2].trim() });
            }

            return (
                <div className="message-with-flashcards">
                    {introText && <div className="message-text" style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>{introText}</div>}
                    <div className="flashcards-container">
                        {cards.map((card) => (
                            <Flashcard key={card.id} front={card.front} back={card.back} />
                        ))}
                    </div>
                </div>
            );
        }

        // Regular message
        return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        // Add user message
        const newUserMsg = { id: Date.now(), text: userText, isBot: false };
        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Format recent messages for context
            const historyToSend = messages
                .filter(m => m.id !== 1) // Exclude default greeting
                .slice(-5) // Send last 5 messages for context
                .map(m => ({
                    role: m.isBot ? "bot" : "user",
                    content: m.text
                }));

            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userText,
                    history: historyToSend
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Format the response, adding sources if available
            let botText = data.answer;
            if (data.sources && data.sources.length > 0) {
                botText += '\n\nSources: ' + data.sources.join(', ');
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: botText,
                    isBot: true
                }
            ]);
        } catch (error) {
            console.error("Chat API error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: "Sorry, I'm having trouble connecting to the server right now. Make sure the Python API is running on port 8000.",
                    isBot: true
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`educational-bot-container ${isOpen ? 'open' : ''} ${isMaximized ? 'maximized' : ''}`}>
            {/* Chat Window */}
            {isOpen && (
                <div className={`bot-chat-window ${isMaximized ? 'maximized' : ''}`}>
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
                        <div className="bot-chat-actions">
                            <button className="bot-action-btn" onClick={handleClearChat} title="Clear chat history" aria-label="Clear chat">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                            <button className="bot-action-btn" onClick={toggleMaximize} title={isMaximized ? "Restore chat" : "Maximize chat"} aria-label={isMaximized ? "Restore chat" : "Maximize chat"}>
                                {isMaximized ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                    </svg>
                                )}
                            </button>
                            <button className="bot-action-btn" onClick={toggleChat} aria-label="Close chat">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
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
                                    {renderMessage(msg.text)}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-message bot-message">
                                <div className="message-avatar">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="4" y="8" width="16" height="12" rx="2" ry="2"></rect>
                                    </svg>
                                </div>
                                <div className="message-bubble">
                                    <span style={{opacity: 0.7}}>Thinking...</span>
                                </div>
                            </div>
                        )}
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
