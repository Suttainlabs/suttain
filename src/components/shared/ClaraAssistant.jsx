import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, X, Send, MessageSquare, Loader2, Home, Mic, MicOff, Crown, XCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { sendSlackNotification } from '@/functions/sendSlackNotification';
import { cancelSubscription } from '@/functions/cancelSubscription';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const SYSTEM_PROMPT = `You are Clara, Suttain's intelligent AI assistant for the Suttain platform (suttain.com) — a chemical safety, sustainability, and formulation platform for individuals, researchers, and businesses.

You have COMPLETE and ACCURATE knowledge of every Suttain feature, pricing, and policy as described below. Always respond based ONLY on this knowledge — never guess or make things up.

RESPONSE FORMATTING RULES:
- Use PLAIN TEXT ONLY - NO markdown, NO asterisks (**), NO special formatting symbols
- Keep responses SHORT and CONCISE (2-4 sentences maximum unless a list is needed)
- Use simple bullet points with dashes (-) if listing items
- Be direct, warm, and helpful
- If you don't know something specific, say "For more details, please email contact@suttain.com"

SPECIAL ACTIONS:
- If the user wants to CANCEL their subscription (says things like "cancel my subscription", "cancel plan", "stop my subscription", "I want to cancel", "unsubscribe"), respond with exactly: ACTION:CANCEL_SUBSCRIPTION
- If the user wants to UPGRADE or SUBSCRIBE (says things like "upgrade", "subscribe", "get pro", "buy pro", "I want premium", "sign up for pro", "upgrade my plan"), respond with exactly: ACTION:UPGRADE_SUBSCRIPTION

=== COMPLETE SUTTAIN PLATFORM KNOWLEDGE ===

ABOUT SUTTAIN:
- Website: suttain.com
- Mission: Help individuals, researchers, and businesses formulate safer, more sustainable products using AI-powered chemical analysis
- Contact: contact@suttain.com
- Social: LinkedIn (suttainlabs), Instagram (suttainlabs), YouTube channel
- Android app available now (free APK download). iOS app coming soon.

TOOLS & FEATURES:

1. CHEMICAL SIMULATOR (Tools > Chemical Simulator)
   - Test chemical interactions safely BEFORE mixing anything in real life
   - Earns 5 reward points per simulation

2. FORMULA GENERATOR (Tools > Formula Generator)
   - AI-powered wizard to create professional-grade product formulas from scratch
   - Free tier: 5 formula generations per month. Pro: Unlimited.

3. QUICK SCAN / BARCODE SCANNER - FREE for all users, no limit

4. INGREDIENT DATABASE - 250,000+ chemicals from PubChem

5. FORMULA SIMULATION ENGINE - Pro users only

6. COMPUTATIONAL SIMULATIONS - DFT, MD, ORCA, GROMACS, Quantum ESPRESSO [PRO]

7. COMPARATIVE IMPACT REPORT - Benchmark eco-score vs industry

8. AI COMPLIANCE CO-PILOT - 50+ global regulations [Premium]

9. PERSONALIZED SAFETY ALERTS [Premium]

10. SUSTAINABILITY SCORING [Premium]

PRICING & PLANS:

FREE TIER: 3 simulations/month, 5 formulas/month, unlimited scans

PRO PLAN — $4.99/month or $49.99/year:
- Unlimited everything, Computational Simulations, Compliance Co-Pilot, Safety Alerts, Sustainability Scoring, PDF Export, Priority Support

LIFETIME ACCESS — $99.99 one-time: Everything in Pro forever

HOW TO CANCEL:
- Users can ask Clara to cancel directly and she will do it automatically
- Or go to Account Settings > Subscription & Billing > Cancel Subscription

HOW TO UPGRADE:
- Users can ask Clara to upgrade and she will redirect them
- Or go to the Pricing page

SCOPE RULES:
- Answer ALL questions about Suttain — pricing, features, how-to, policies, account issues
- For billing or payment issues → "Please email contact@suttain.com for billing support"
- For questions completely unrelated to Suttain → "I'm Clara, Suttain's assistant. I'm here to help with anything about the Suttain platform."
- NEVER make up features, prices, or policies that aren't listed above`;

// Detect subscription intent locally (fast, no LLM needed)
const detectIntent = (text) => {
    const t = text.toLowerCase();
    const cancelWords = ['cancel', 'unsubscribe', 'stop subscription', 'stop my plan', 'end subscription', 'terminate', 'discontinue'];
    const upgradeWords = ['upgrade', 'subscribe', 'get pro', 'buy pro', 'want premium', 'sign up for pro', 'purchase pro', 'go pro', 'want pro', 'start pro'];
    if (cancelWords.some(w => t.includes(w))) return 'cancel';
    if (upgradeWords.some(w => t.includes(w))) return 'upgrade';
    return null;
};

// Action card components
const CancelActionCard = ({ onConfirm, onDismiss, loading, done }) => (
    <div className="mx-0 p-3 bg-red-50 border border-red-200 rounded-xl">
        {done ? (
            <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-semibold">Subscription cancelled. You keep access until the end of your billing period.</p>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs font-semibold text-red-800">Cancel your subscription?</p>
                </div>
                <p className="text-xs text-red-700 mb-3">You'll keep Pro access until the end of your current billing period, then revert to the free tier.</p>
                <div className="flex gap-2">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg py-1.5 font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                        {loading ? 'Cancelling…' : 'Yes, Cancel'}
                    </button>
                    <button onClick={onDismiss} className="flex-1 text-xs bg-white border border-slate-200 text-slate-700 rounded-lg py-1.5 font-semibold hover:bg-slate-50">
                        Keep Plan
                    </button>
                </div>
            </>
        )}
    </div>
);

const UpgradeActionCard = ({ onDismiss }) => (
    <div className="mx-0 p-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-violet-800">Upgrade to Pro</p>
        </div>
        <p className="text-xs text-violet-700 mb-3">Get unlimited access to all features from just $4.99/month. Cancel anytime.</p>
        <div className="flex gap-2">
            <Link to={createPageUrl('Pricing')} className="flex-1 text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg py-1.5 font-semibold flex items-center justify-center gap-1 hover:opacity-90">
                <Crown className="w-3 h-3" /> View Plans <ArrowRight className="w-3 h-3" />
            </Link>
            <button onClick={onDismiss} className="text-xs text-slate-500 hover:text-slate-700 px-2">
                Later
            </button>
        </div>
    </div>
);

export default function ClaraAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [liveAgentRequested, setLiveAgentRequested] = useState(false);
    const [liveAgentEmail, setLiveAgentEmail] = useState('');
    const [liveAgentName, setLiveAgentName] = useState('');
    const [liveAgentSent, setLiveAgentSent] = useState(false);
    const [liveAgentLoading, setLiveAgentLoading] = useState(false);
    const [actionCard, setActionCard] = useState(null); // 'cancel' | 'upgrade' | null
    const [cancelLoading, setCancelLoading] = useState(false);
    const [cancelDone, setCancelDone] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, actionCard]);

    // Voice input setup
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setUserMessage(transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setIsListening(false);
    };

    const handleSendMessage = async (overrideMessage) => {
        const content = (overrideMessage || userMessage).trim();
        if (!content || isLoading) return;

        const newMessage = { role: 'user', content };
        setMessages(prev => [...prev, newMessage]);
        setUserMessage('');
        setIsLoading(true);
        setActionCard(null);

        // Local intent detection first (instant)
        const intent = detectIntent(content);
        if (intent === 'cancel') {
            setMessages(prev => [...prev, { role: 'assistant', content: 'I can cancel your subscription right now. Please confirm below:' }]);
            setActionCard('cancel');
            setIsLoading(false);
            return;
        }
        if (intent === 'upgrade') {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Great choice! Here are the Pro plans available for you:' }]);
            setActionCard('upgrade');
            setIsLoading(false);
            return;
        }

        try {
            const conversationHistory = [...messages, newMessage]
                .map(msg => `${msg.role === 'user' ? 'User' : 'Clara'}: ${msg.content}`)
                .join('\n');

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `${SYSTEM_PROMPT}\n\nCurrent conversation:\n${conversationHistory}\n\nUser's latest question: ${content}\n\nProvide a helpful, CONCISE response in PLAIN TEXT focused on the Suttain platform:`,
                add_context_from_internet: false,
                model: 'gpt_5_mini'
            });

            // Check if LLM detected an action
            if (response.trim() === 'ACTION:CANCEL_SUBSCRIPTION') {
                setMessages(prev => [...prev, { role: 'assistant', content: 'I can cancel your subscription right now. Please confirm below:' }]);
                setActionCard('cancel');
            } else if (response.trim() === 'ACTION:UPGRADE_SUBSCRIPTION') {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Great choice! Here are the Pro plans available for you:' }]);
                setActionCard('upgrade');
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again or check our FAQ page for help!"
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelConfirm = async () => {
        setCancelLoading(true);
        try {
            const res = await cancelSubscription({});
            if (res.data?.success) {
                setCancelDone(true);
                setMessages(prev => [...prev, { role: 'assistant', content: '✅ Done! Your subscription has been cancelled. You keep full Pro access until the end of your current billing period.' }]);
                setTimeout(() => setActionCard(null), 3000);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'I was unable to cancel automatically. Please go to Settings > Subscription & Billing, or email contact@suttain.com for help.' }]);
                setActionCard(null);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try cancelling from Settings > Subscription & Billing or email contact@suttain.com.' }]);
            setActionCard(null);
        } finally {
            setCancelLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleLiveAgentRequest = async () => {
        if (!liveAgentName.trim() || !liveAgentEmail.trim()) return;
        setLiveAgentLoading(true);
        try {
            const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'Clara'}: ${m.content}`).join('\n') || 'No prior conversation.';
            await base44.integrations.Core.SendEmail({
                to: 'contact@suttain.com',
                subject: `Live Agent Request from ${liveAgentName}`,
                body: `A user has requested to speak with a live agent on Suttain.\n\nName: ${liveAgentName}\nEmail: ${liveAgentEmail}\n\n--- Conversation Transcript ---\n${transcript}\n\nPlease follow up with the user as soon as possible.`
            });
            sendSlackNotification({
                channel: '#general',
                type: 'live_agent',
                data: { userName: liveAgentName, userEmail: liveAgentEmail, transcript }
            }).catch(() => {});
            setLiveAgentSent(true);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Thanks ${liveAgentName}! A live agent will reach out to you at ${liveAgentEmail} shortly.`
            }]);
            setLiveAgentRequested(false);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, please email us directly at contact@suttain.com.' }]);
            setLiveAgentRequested(false);
        } finally {
            setLiveAgentLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([]);
        setLiveAgentRequested(false);
        setLiveAgentSent(false);
        setLiveAgentName('');
        setLiveAgentEmail('');
        setActionCard(null);
        setCancelDone(false);
    };

    const suggestions = [
        "Cancel my subscription",
        "Upgrade to Pro",
        "What features does Suttain offer?",
    ];

    const hasSpeechAPI = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed bottom-36 lg:bottom-20 right-6 w-80 max-w-[calc(100vw-2rem)] h-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
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
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <button onClick={resetChat} className="text-white/80 hover:text-white transition-colors" title="Back to home">
                                    <Home className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {messages.length === 0 && (
                            <div className="text-center pt-4 pb-2">
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Sparkles className="w-6 h-6 text-teal-600" />
                                </div>
                                <h4 className="font-semibold text-slate-900 mb-1 text-sm">Ask me anything!</h4>
                                <p className="text-xs text-slate-500 mb-1">I can help you navigate, subscribe, or cancel.</p>
                                {hasSpeechAPI && (
                                    <p className="text-xs text-teal-500 mb-3 flex items-center justify-center gap-1">
                                        <Mic className="w-3 h-3" /> You can also speak to me
                                    </p>
                                )}
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

                        {/* Action Cards */}
                        {actionCard === 'cancel' && (
                            <CancelActionCard
                                onConfirm={handleCancelConfirm}
                                onDismiss={() => setActionCard(null)}
                                loading={cancelLoading}
                                done={cancelDone}
                            />
                        )}
                        {actionCard === 'upgrade' && (
                            <UpgradeActionCard onDismiss={() => setActionCard(null)} />
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Live Agent Form */}
                    {liveAgentRequested && (
                        <div className="mx-3 mb-2 p-3 bg-teal-50 border border-teal-200 rounded-xl flex-shrink-0">
                            <p className="text-xs font-semibold text-teal-800 mb-2">Connect to a Live Agent</p>
                            <input
                                type="text"
                                placeholder="Your name"
                                value={liveAgentName}
                                onChange={e => setLiveAgentName(e.target.value)}
                                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 mb-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400"
                            />
                            <input
                                type="email"
                                placeholder="Your email"
                                value={liveAgentEmail}
                                onChange={e => setLiveAgentEmail(e.target.value)}
                                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 mb-2 focus:outline-none focus:ring-1 focus:ring-teal-400"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleLiveAgentRequest}
                                    disabled={liveAgentLoading || !liveAgentName.trim() || !liveAgentEmail.trim()}
                                    className="flex-1 text-xs bg-gradient-to-r from-[#02988C] to-[#09D2FF] text-white rounded-lg py-1.5 font-semibold disabled:opacity-50"
                                >
                                    {liveAgentLoading ? 'Sending...' : 'Submit'}
                                </button>
                                <button onClick={() => setLiveAgentRequested(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                        {!liveAgentSent && (
                            <button
                                onClick={() => setLiveAgentRequested(true)}
                                className="w-full text-xs text-teal-600 hover:text-teal-800 font-semibold mb-2 text-center transition-colors"
                            >
                                💬 Talk to a live agent
                            </button>
                        )}
                        <div className="flex gap-2">
                            {hasSpeechAPI && (
                                <button
                                    onMouseDown={startListening}
                                    onMouseUp={stopListening}
                                    onTouchStart={startListening}
                                    onTouchEnd={stopListening}
                                    className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                                        isListening
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                                    title="Hold to speak"
                                >
                                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                </button>
                            )}
                            <Input
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={isListening ? '🎤 Listening…' : 'Ask or say "cancel" / "upgrade"…'}
                                className="flex-1 text-xs h-8"
                                disabled={isLoading || isListening}
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

            {/* Floating button removed — Clara is accessed via the Dashboard card */}
        </AnimatePresence>
    );
}