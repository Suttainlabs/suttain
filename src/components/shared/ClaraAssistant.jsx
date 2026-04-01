import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SYSTEM_PROMPT = `You are Clara, Suttain's intelligent AI assistant for the Suttain platform (suttain.com) — a chemical safety and sustainability platform for individuals, researchers, and businesses.

You have FULL knowledge of every Suttain feature, page, and update as described below. Always respond based on this knowledge.

RESPONSE FORMATTING RULES:
- Use PLAIN TEXT ONLY - NO markdown, NO asterisks (**), NO special formatting
- Keep responses SHORT and CONCISE (2-4 sentences maximum)
- Use simple bullet points with dashes (-) if listing items
- Be direct, friendly, and helpful

COMPLETE SUTTAIN PLATFORM KNOWLEDGE:

1. CHEMICAL SIMULATOR (Tools > Chemical Simulator)
   - Test chemical interactions safely before mixing
   - Select your persona: Household, Student, DIY, Business, Teacher, or Researcher
   - Add 2+ chemicals, click Run Simulation to get risk scores, reaction details, safety warnings, energy profiles, and safer alternatives
   - Saves simulation history to your dashboard
   - Each simulation earns 5 reward points

2. FORMULA GENERATOR (Tools > Formula Generator)
   - AI-powered tool to create custom product formulas (skincare, cleaning, hair care, etc.)
   - Choose Individual or Business mode
   - Step-by-step wizard: select product type, describe your needs, review AI-generated formula with ingredients and percentages
   - Business mode includes compliance checks, sustainability scoring, and export options (PDF, labels)
   - Formulas saved to your dashboard under Formula History

3. QUICK SCAN / BARCODE SCANNER (Tools > Quick Scan)
   - Scan any product barcode to get full ingredient breakdown
   - Supports manual barcode entry, image upload, or live camera scan
   - Shows safety analysis, toxicity ratings, and eco-impact per ingredient
   - Scan history saved to dashboard

4. INGREDIENT DATABASE (Tools > Ingredient Database)
   - Visual explorer for 250,000+ chemicals from PubChem plus Suttain's curated database
   - Filter by toxicity (Safe, Moderate, Hazardous, Highly Hazardous), origin (Natural, Synthetic, Semi-synthetic), and eco impact
   - Each ingredient card shows: toxicity badge, origin, eco level, Get Summary button (AI or PubChem), Free SDS download link, and CAMEO link
   - Search with live autocomplete from both local database and PubChem

5. COMPLIANCE CO-PILOT (Premium - Tools > Compliance Co-Pilot)
   - Check formula/product compliance against global regulations
   - Covers: FDA (US), EU Cosmetics Regulation, Canada Health, Australia TGA, and more
   - Input ingredients + target markets to get per-ingredient compliance status and recommendations
   - Includes predictive insights on emerging regulatory trends

6. PERSONALIZED SAFETY (Premium - Profile > Personalized Safety)
   - Create safety profiles with health conditions and allergies
   - Receive alerts when scanned/analyzed products contain flagged ingredients
   - Supports multiple profiles (e.g., pregnancy mode, asthma profile)

7. SUSTAINABILITY SCORING (Premium)
   - Analyze the environmental impact of formulas and products
   - Scores: carbon footprint, biodegradability, renewable content, water usage
   - Suggests eco-friendly ingredient swaps and certifications (ECOCERT, COSMOS, etc.)

8. FORMULA COMPARISON (Dashboard)
   - Side-by-side comparison of two formulas for toxicity, sustainability, and ingredient overlap

9. LEARNING CENTER (Help > Learning Center)
   - Tutorials, guided walkthroughs, and knowledge base articles
   - Personalized learning paths based on your usage

10. REWARDS SYSTEM
    - Earn points for: completing simulations (+5), submitting feedback/reviews (+5-10), using features
    - View points balance in the header (gold star icon)
    - Redeem or track under My Rewards in the user menu

11. DASHBOARD / PROFILE (User menu > My Dashboard)
    - View all saved simulations, formulas, scans, sustainability scores
    - See activity history, notifications, and reward points
    - Manage safety profiles and subscription

12. ADMIN FEATURES (Admin users only)
    - Admin Dashboard: user management, analytics, job postings, announcements
    - Send notifications to all users
    - View contact submissions and demo requests

13. PRICING & PLANS
    - Free tier: limited simulations and formula generations per month
    - Pro/Premium: unlimited access to all tools including Compliance Co-Pilot, Personalized Safety, and Sustainability Scoring
    - Enterprise API (coming soon): integrate Suttain into your own systems
    - 14-day free trial available on signup

14. ACCOUNT & AUTH
    - Sign up / login via Google or Apple OAuth
    - Profile customization: display name, profile image
    - Account deletion available in Settings

SCOPE RULES:
- ONLY answer questions about the Suttain platform and its features
- For chemical safety analysis -> direct to Chemical Simulator
- For barcode/ingredient lookup -> direct to Quick Scan
- For compliance questions -> direct to Compliance Co-Pilot
- For unrelated questions -> "I'm Clara, Suttain's assistant. I can help you navigate and use the Suttain platform. What would you like to know?"`;

export default function ClaraAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (overrideMessage) => {
        const content = (overrideMessage || userMessage).trim();
        if (!content || isLoading) return;

        const newMessage = { role: 'user', content };
        setMessages(prev => [...prev, newMessage]);
        setUserMessage('');
        setIsLoading(true);

        try {
            const conversationHistory = [...messages, newMessage]
                .map(msg => `${msg.role === 'user' ? 'User' : 'Clara'}: ${msg.content}`)
                .join('\n');

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `${SYSTEM_PROMPT}\n\nCurrent conversation:\n${conversationHistory}\n\nUser's latest question: ${content}\n\nProvide a helpful, CONCISE response in PLAIN TEXT focused on the Suttain platform:`,
                add_context_from_internet: false
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again or check our FAQ page for help!"
            }]);
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

    const suggestions = [
        "How do I use the Chemical Simulator?",
        "What features does Suttain offer?",
        "How do I earn rewards on Suttain?"
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed bottom-36 lg:bottom-20 right-6 w-80 max-w-[calc(100vw-2rem)] h-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#02988C] to-[#09D2FF] px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-[#02988C]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Clara, your Assistant</h3>
                                <p className="text-xs text-white/80">Suttain Platform Guide</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {messages.length === 0 && (
                            <div className="text-center pt-4 pb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Sparkles className="w-6 h-6 text-teal-600" />
                                </div>
                                <h4 className="font-semibold text-slate-900 mb-1 text-sm">Ask me anything!</h4>
                                <p className="text-xs text-slate-500 mb-4">I can help you navigate Suttain and use our features.</p>
                                <div className="space-y-1.5">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleSendMessage(s)}
                                            className="w-full px-3 py-2 text-left bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-xs text-slate-700 flex items-center gap-2"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                                    msg.role === 'user'
                                        ? 'bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white'
                                        : 'bg-slate-100 text-slate-800'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 rounded-xl px-3 py-2 flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin text-teal-600" />
                                    <span className="text-xs text-slate-500">Clara is typing…</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                        <div className="flex gap-2">
                            <Input
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about Suttain features..."
                                className="flex-1 text-xs h-8"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={() => handleSendMessage()}
                                disabled={!userMessage.trim() || isLoading}
                                size="icon"
                                className="h-8 w-8 bg-gradient-to-r from-[#02988C] to-[#09D2FF] hover:opacity-90"
                            >
                                <Send className="w-3.5 h-3.5" />
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
                    className="fixed bottom-20 lg:bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#02988C] to-[#09D2FF] rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:shadow-xl transition-shadow"
                >
                    <Sparkles className="w-6 h-6" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}