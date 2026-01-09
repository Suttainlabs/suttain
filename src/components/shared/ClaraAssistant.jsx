
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ClaraAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (error) {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    const handleSendMessage = async () => {
        if (!userMessage.trim() || isLoading) return;

        const newMessage = {
            role: 'user',
            content: userMessage.trim()
        };

        setMessages(prev => [...prev, newMessage]);
        setUserMessage('');
        setIsLoading(true);

        try {
            const conversationHistory = [...messages, newMessage]
                .map(msg => `${msg.role === 'user' ? 'User' : 'Clara'}: ${msg.content}`)
                .join('\n');

            const systemPrompt = `You are Clara, Suttain's AI Assistant - a helpful and knowledgeable guide for the Suttain chemical safety platform.

RESPONSE FORMATTING RULES:
- Use PLAIN TEXT ONLY - NO markdown, NO asterisks (**), NO special formatting
- Keep responses SHORT and CONCISE (2-4 sentences maximum)
- Use simple bullet points with dashes (-) if listing items
- Be direct and to the point

IMPORTANT SCOPE RESTRICTIONS:
- You ONLY respond to questions about the Suttain platform, its features, navigation, and how to use it
- You help users understand Suttain's tools: Chemical Simulator, Formula Generator, Barcode Scanner, Compliance Co-Pilot, etc.
- You answer questions about navigating the Suttain website and accessing different features
- You explain Suttain's pricing, accounts, rewards system, and platform policies
- You CAN answer compliance and regulatory questions specifically related to using Suttain's Compliance Co-Pilot feature

WHAT YOU DO NOT DO:
- You DO NOT answer general chemical questions unrelated to using Suttain
- You DO NOT provide chemical safety advice outside of directing users to Suttain's features
- You DO NOT discuss topics unrelated to the Suttain platform
- You DO NOT analyze chemical combinations directly (direct users to the Simulator)
- You DO NOT look up barcodes or ingredients (direct users to the Barcode Scanner)

If a user asks something outside your scope, politely redirect them:
- For chemical safety questions -> "I can help you analyze that using our Chemical Simulator! Click on 'Tools' in the menu to get started."
- For barcode/ingredient questions -> "You can scan that using our Barcode Scanner feature! Find it under the Tools menu."
- For compliance/regulatory questions -> "You can check that using our Compliance Co-Pilot! It's available under Premium Suite in the Tools menu."
- For unrelated questions -> "I'm Clara, Suttain's platform assistant. I help with navigating Suttain and using our features. What would you like to know about Suttain?"

SUTTAIN FEATURES YOU CAN DISCUSS (keep descriptions brief):
1. Chemical Simulator - Test chemical interactions safely
2. Formula Generator - Create custom formulas for skincare, cleaning products
3. Barcode Scanner - Scan products to analyze ingredients
4. Compliance Co-Pilot (Premium) - Check regulatory compliance for products, get guidance on FDA, EU, and global regulations
5. Personalized Safety Alerts (Premium) - Get safety alerts based on your health profile
6. Sustainability Scoring (Premium) - Analyze environmental impact
7. Enterprise API (Coming Soon) - For business integration
8. Rewards System - Earn points for reviews and feedback
9. Community Reviews - See what others are saying

COMPLIANCE CO-PILOT SPECIFIC GUIDANCE:
- The Compliance Co-Pilot helps businesses check if their formulas meet regulatory requirements
- It covers FDA (US), EU regulations, and other global standards
- Users can input their formula and target markets to get compliance analysis
- It's a premium feature available under the Tools menu
- For specific regulatory questions, direct users to start a new compliance check in the Co-Pilot

EXAMPLE GOOD RESPONSES (notice the plain text and brevity):
User: "What features does Suttain offer?"
Clara: "Suttain offers several key features:
- Chemical Simulator: Test chemical interactions safely
- Formula Generator: Create custom formulas
- Barcode Scanner: Analyze product ingredients
- Compliance Co-Pilot: Check regulatory compliance (Premium)
All accessible from the Tools menu!"

User: "How do I use the simulator?"
Clara: "Using the Chemical Simulator is easy! Select your user type (student, household, DIY, business, teacher, or researcher), add 2 or more chemicals you want to test, then click 'Run Simulation'. You'll get a detailed safety analysis with risk scores and recommendations."

User: "How do I check if my formula is FDA compliant?"
Clara: "You can use our Compliance Co-Pilot for that! Go to Tools menu, select Compliance Co-Pilot (Premium Suite), then start a New Formula Check. Input your formula ingredients and select US/FDA as your target market. The AI will analyze your formula against FDA regulations and provide detailed compliance insights."

User: "What regulations does the Compliance Co-Pilot cover?"
Clara: "The Compliance Co-Pilot covers major global regulations including:
- FDA regulations (United States)
- EU Cosmetics Regulation
- Canada regulations
- Australia regulations
You can select multiple target markets and get comprehensive compliance analysis for each region."

Current conversation:
${conversationHistory}`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: systemPrompt + `\n\nUser's latest question: ${newMessage.content}\n\nProvide a helpful, CONCISE response in PLAIN TEXT (no markdown formatting) focused on the Suttain platform:`,
                add_context_from_internet: false
            });

            const assistantMessage = {
                role: 'assistant',
                content: response
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Clara error:', error);
            const errorMessage = {
                role: 'assistant',
                content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to browse our FAQ page for common questions about Suttain!"
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setUserMessage(suggestion);
        setTimeout(() => {
            handleSendMessage();
        }, 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-[#02988C]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Clara, your AI Assistant</h3>
                                <p className="text-xs text-white/90">Powered by Suttain's Safety Agent</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-teal-600" />
                                </div>
                                <h4 className="font-semibold text-lg text-slate-900 mb-2">Ask me anything!</h4>
                                <p className="text-sm text-slate-600 mb-6">
                                    I can help you navigate Suttain and use our features.
                                </p>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleSuggestionClick("How do I use the Chemical Simulator?")}
                                        className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm text-slate-700 flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4 text-teal-600" />
                                        How do I use the Chemical Simulator?
                                    </button>
                                    <button
                                        onClick={() => handleSuggestionClick("What features does Suttain offer?")}
                                        className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm text-slate-700 flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4 text-teal-600" />
                                        What features does Suttain offer?
                                    </button>
                                    <button
                                        onClick={() => handleSuggestionClick("How do I earn rewards on Suttain?")}
                                        className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm text-slate-700 flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4 text-teal-600" />
                                        How do I earn rewards on Suttain?
                                    </button>
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-3 ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white'
                                            : 'bg-slate-100 text-slate-900'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 rounded-2xl p-3 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                                    <span className="text-sm text-slate-600">Clara is typing...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                        <div className="flex gap-2">
                            <Input
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about Suttain features..."
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!userMessage.trim() || isLoading}
                                className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] hover:opacity-90"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#02988C] to-[#09D2FF] rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:shadow-xl transition-shadow"
                >
                    <Sparkles className="w-6 h-6" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
