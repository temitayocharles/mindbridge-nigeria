'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, Send, X, Minimize2, Maximize2 } from 'lucide-react'

interface Message {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your AI mental health assistant. I'm here to provide initial support and help you find the right resources. How are you feeling today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [inputText, setInputText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const predefinedResponses = {
        anxiety: "I understand you're feeling anxious. This is very common and you're not alone. Some quick techniques that might help: try the 4-7-8 breathing technique (breathe in for 4, hold for 7, exhale for 8), ground yourself by naming 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
        depression: "I hear that you're going through a difficult time. Depression can feel overwhelming, but help is available. It's important to reach out to a professional therapist. In the meantime, try to maintain a routine, get some sunlight, and connect with supportive people in your life.",
        stress: "Stress is your body's natural response to challenges. Here are some immediate stress-relief techniques: practice deep breathing, try progressive muscle relaxation, take a short walk, or listen to calming music. Regular exercise and adequate sleep also help manage stress levels.",
        emergency: "If you're having thoughts of self-harm or suicide, please reach out immediately: Nigeria Suicide Prevention Initiative: +234 806 210 6493, or contact emergency services at 199. You can also reach out to a trusted friend, family member, or go to your nearest hospital emergency room.",
        default: "Thank you for sharing that with me. Based on what you've told me, I'd recommend connecting with one of our verified therapists who can provide personalized support. Would you like me to help you find a therapist in your area?"
    }

    const generateBotResponse = (userMessage: string): string => {
        const message = userMessage.toLowerCase()

        if (message.includes('suicide') || message.includes('kill myself') || message.includes('end it all')) {
            return predefinedResponses.emergency
        } else if (message.includes('anxious') || message.includes('anxiety') || message.includes('panic')) {
            return predefinedResponses.anxiety
        } else if (message.includes('depressed') || message.includes('depression') || message.includes('sad') || message.includes('hopeless')) {
            return predefinedResponses.depression
        } else if (message.includes('stress') || message.includes('overwhelmed') || message.includes('pressure')) {
            return predefinedResponses.stress
        } else if (message.includes('hello') || message.includes('hi')) {
            return "Hello! I'm here to support you. What's on your mind today?"
        } else if (message.includes('therapist') || message.includes('help') || message.includes('counselor')) {
            return "I can help you find a qualified therapist in your area. What type of support are you looking for? We have specialists in anxiety, depression, trauma, relationships, and more."
        } else {
            return predefinedResponses.default
        }
    }

    const handleSendMessage = async () => {
        if (!inputText.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputText('')
        setIsTyping(true)

        // Simulate typing delay
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateBotResponse(inputText),
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botResponse])
            setIsTyping(false)
        }, 1000 + Math.random() * 2000)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 z-50 animate-pulse"
            >
                <Bot className="w-6 h-6" />
            </button>
        )
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-80 h-96'
            }`}>
            <div className="glass-effect rounded-xl h-full flex flex-col overflow-hidden border border-blue-500/30">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-white">AI Assistant</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                        >
                            {isMinimized ? (
                                <Maximize2 className="w-4 h-4 text-gray-400" />
                            ) : (
                                <Minimize2 className="w-4 h-4 text-gray-400" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${message.sender === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-700 text-gray-100'
                                            }`}
                                    >
                                        {message.text}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-700 text-gray-100 px-3 py-2 rounded-lg text-sm">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-slate-700">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                This AI assistant provides general support. For emergencies, call 199 or +234 806 210 6493
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
