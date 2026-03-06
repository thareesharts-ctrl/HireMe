import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';

const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi! I am your AI career assistant. How can I help you today with your resume or interview prep?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const newMessages = [...messages, { role: 'user', content: userMessage }];

        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Send messages formatted for the API (only role and content)
            const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

            const response = await axios.post('http://localhost:5000/api/chat', {
                messages: apiMessages
            });

            if (response.data && response.data.success) {
                setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
            } else {
                throw new Error(response.data?.error || "Chat failed");
            }
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.error || error.message || 'Unknown error occurred.';
            setMessages([
                ...newMessages,
                { role: 'assistant', content: `Oops! Connecting failed: ${errorMsg}` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    className="chat-fab pulse-animation"
                    onClick={toggleChat}
                    title="Chat with AI Assistant"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window shadow-xl border border-slate-200">
                    <div className="chat-header">
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <h3 className="font-semibold">AI Assistant</h3>
                        </div>
                        <button onClick={toggleChat} className="chat-close-btn p-1 rounded-md hover:bg-emerald-600 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.role}`}>
                                <div className="chat-avatar">
                                    {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="chat-bubble">
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message assistant">
                                <div className="chat-avatar">
                                    <Bot size={16} />
                                </div>
                                <div className="chat-bubble px-4">
                                    <Loader2 size={16} className="animate-spin text-slate-500" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="chat-input-area border-t border-slate-200">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="chat-input"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className={`chat-send-btn ${!input.trim() || isLoading ? 'disabled' : ''}`}
                            disabled={!input.trim() || isLoading}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatAssistant;
