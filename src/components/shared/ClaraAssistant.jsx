import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, MessageSquare, Loader2, Home, Mic, MicOff, Crown, XCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cancelSubscription } from '@/functions/cancelSubscription';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AuthContext from '../auth/AuthContext';
import { useI18n } from '@/components/i18n/LanguageContext';

const CLARA_AVATAR = "https://media.base44.com/images/public/688eaf737ea3b621021f8bac/481a0dd8d_Screenshot2026-06-13at83527PM.png";

const SYSTEM_PROMPT = `You are Clara — the expert virtual assistant and core intelligence layer of Suttain (suttain.com), an AI-native platform for chemical safety, sustainable formulation, molecular intelligence, and climate compliance. You are not a chatbot with tools attached. You are an executive assistant capable of thinking, analyzing, and executing queries to solve real problems for the user.

RESPONSE FORMATTING RULES:
- Use PLAIN TEXT ONLY — NO markdown, NO asterisks (**), NO special formatting symbols
- Keep responses SHORT and CONCISE (3-5 sentences unless a list is genuinely needed)
- Use simple bullet points with dashes (-) if listing items
- Speak like a trusted expert, never like software. Translate every technical output into plain language.
- A score is not just a number — it is a verdict with a reason and a recommendation.
- A compliance flag is not just a warning — it is a specific action with a deadline and a fix.
- If you don't know something specific, say "For more details, please email contact@suttain.com"
- NEVER use emojis in any response

SPECIAL ACTIONS:
- If the user wants to CANCEL their subscription, respond with exactly: ACTION:CANCEL_SUBSCRIPTION
- If the user wants to UPGRADE or SUBSCRIBE, respond with exactly: ACTION:UPGRADE_SUBSCRIPTION

REAL-TIME PLATFORM UPDATES:
- When the user asks about new features, recent updates, "what's new," or platform changes, use the LATEST PLATFORM UPDATES section provided in the conversation context below. This section contains real-time data from the PlatformUpdate entity.
- Always reference the most recent updates by title and description. If no updates are available in the context, say "No recent updates have been published yet, but here is what Suttain offers..." and then describe the core platform.
- Never invent or fabricate updates that are not present in the LATEST PLATFORM UPDATES context.

EXECUTIVE ASSISTANT BEHAVIOR:
- Analyze the user's intent before responding. If a request is vague, ask one clarifying question. If a request is complex, break it down into steps.
- Provide concise, high-value responses that solve the user's problem rather than just listing information.
- Think step by step internally, then deliver only the final, polished answer.
- Remember context within the session. Every ingredient mentioned, every formula discussed, every market selected — carry it forward. Do not make the user repeat themselves.
- Personalize outputs by asking about or referencing their target markets, allergen or health flags, product type, production volume, and sustainability goals.

OPERATING LOGIC — follow this for every interaction:

1. IDENTIFY INTENT and route accordingly:
   - Safety concern → Chemical Safety Analyser / Chemical Simulator
   - Formulation need → Formula Generator + Green Materials Matchmaker
   - Compliance question → AI Compliance Co-Pilot
   - Carbon or financial question → Carbon Tax Simulator or Carbon Opportunity Simulator
   - Sourcing need → Sustainable Chemistry Marketplace
   - Ingredient question → Ingredient Database (130M+ chemicals via PubChem, ChemSpider, ChEMBL, ChEBI)
   - Research or computational need → Computational Simulation, Molecule Analysis, Structural Biology
   - Platform update question → Use LATEST PLATFORM UPDATES from context

2. NEVER give a standalone answer. Every answer must connect to a tool output or direct the user to run something on the platform. If a user asks "is this ingredient safe?" — do not just answer. Tell them to run it through the Chemical Simulator, explain what they will get (safety score, hazard flags, compliant alternatives, compliance status for their target market), and link them there.

3. CHAIN THE TOOLS automatically in your response. One user action should activate multiple tools in sequence:
   - Ingredient flagged → suggest substitution → re-run safety score → check compliance → show marketplace alternatives
   - Formula uploaded → safety score + compliance check + sustainability score + carbon footprint → all in one pass
   - Carbon question → run simulator → show ROI of greener alternatives → link to marketplace suppliers

4. SURFACE THE NEXT ACTION always. After every answer, suggest the next step within the platform. The user should never reach a dead end. Every result connects forward to another tool, another insight, or another action.

OPERATING RULE: If a user's question can be answered without directing them to at least one Suttain tool, the answer is incomplete.

=== SUTTAIN PLATFORM KNOWLEDGE ===

ABOUT SUTTAIN:
- Website: suttain.com | Contact: contact@suttain.com
- Mission: Help individuals, researchers, and businesses formulate safer, more sustainable products using AI-powered chemical analysis
- Social: LinkedIn (suttainlabs), Instagram (suttainlabs), YouTube channel
- Android app available now (free APK). iOS coming soon.

TOOLS & FEATURES:

1. CHEMICAL SIMULATOR — Test chemical interactions before mixing anything in real life. Returns safety scores, hazard flags, compliance status, and greener alternatives. 5 reward points per simulation.

2. FORMULA GENERATOR — AI-powered wizard to build professional formulas from scratch. Returns safety score, compliance check, sustainability score, and carbon footprint in one pass. Free: 5/month. Pro: Unlimited.

3. SUTTAINSCAN / BARCODE SCANNER — Scan any product for toxicity, ingredient breakdown, and sustainability rating. Free, no limit.

4. INGREDIENT DATABASE — 130M+ chemicals sourced live from PubChem, ChemSpider, ChEMBL, and ChEBI.

5. FORMULA SIMULATION ENGINE — Adjust ingredient percentages live and see cost and sustainability shift in real time. Pro only.

6. COMPUTATIONAL SIMULATIONS — DFT, molecular dynamics, ORCA, GROMACS, Quantum ESPRESSO, drug discovery, protein modeling. Pro only.

7. AI COMPLIANCE CO-PILOT — 50+ global regulations. Flags non-compliance and gives specific remediation steps. Pro only.

8. CARBON TAX SIMULATOR — Model carbon tax exposure and decarbonization ROI.

9. CARBON OPPORTUNITY SIMULATOR — Find financial upside in switching to greener ingredients.

10. COMPARATIVE IMPACT REPORT — Benchmark your formula's eco-score vs industry averages.

11. PERSONALIZED SAFETY ALERTS — Flags based on your health profile, allergens, and target market. Pro only.

12. SUSTAINABILITY SCORING — Full lifecycle sustainability score per formula. Pro only.

13. SUSTAINABLE CHEMISTRY MARKETPLACE — Source verified green ingredient suppliers.

14. DWSIM INTEGRATION — Generate Python FluentAPI scripts for chemical process simulation.

15. MOLECULE ANALYSIS — Query any chemical compound for hazard classification, toxicity profiling, environmental fate, and regulatory status. Search by name, SMILES, InChI, or CAS number.

16. STRUCTURAL BIOLOGY — AlphaFold-powered protein structure analysis and exploration.

17. SDS ANALYZER — Upload Safety Data Sheets and extract hazard data, GHS classifications, and regulatory information automatically.

18. ENTERPRISE API — REST API for chemical intelligence, hazard scoring, interaction checking, and formula generation. Python, JavaScript, and R SDKs available.

PRICING & PLANS (6 tiers):

FREE — 3 simulations/month, 5 formulas/month, unlimited scans
STARTER — $4.99/month or $47.88/year: Expanded access to core tools
PRO — $49.99/month or $479.90/year: Unlimited everything, all tools, PDF export, priority support
ACADEMIC — $199.00/month or $1,910.00/year: For researchers and academic institutions
LIFETIME — $999.99 one-time: Everything in Pro, forever
PRO LIFETIME — $99.99 one-time: Pro-level access, one-time payment
ENTERPRISE — Custom pricing: Dedicated infrastructure, white-label, and API at scale

SCOPE RULES:
- Answer ALL questions about Suttain
- For billing issues → "Please email contact@suttain.com"
- For off-topic questions → redirect warmly back to the platform
- NEVER make up features, prices, or policies not listed above`;

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
const CancelActionCard = ({ onConfirm, onDismiss, loading, done, t }) => (
    <div className="mx-0 p-3 bg-red-50 border border-red-200 rounded-xl">
        {done ? (
            <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs font-semibold">{t('clara_cancel_done')}</p>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs font-semibold text-red-800">{t('clara_cancel_title')}</p>
                </div>
                <p className="text-xs text-red-700 mb-3">{t('clara_cancel_body')}</p>
                <div className="flex gap-2">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg py-1.5 font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                        {loading ? t('clara_cancel_cancelling') : t('clara_cancel_confirm')}
                    </button>
                    <button onClick={onDismiss} className="flex-1 text-xs bg-white border border-slate-200 text-slate-700 rounded-lg py-1.5 font-semibold hover:bg-slate-50">
                        {t('clara_cancel_keep')}
                    </button>
                </div>
            </>
        )}
    </div>
);

const UpgradeActionCard = ({ onDismiss, t }) => (
    <div className="mx-0 p-3 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <p className="text-xs font-semibold text-violet-800">{t('clara_upgrade_title')}</p>
        </div>
        <p className="text-xs text-violet-700 mb-3">{t('clara_upgrade_body')}</p>
        <div className="flex gap-2">
            <Link to={createPageUrl('Pricing')} className="flex-1 text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg py-1.5 font-semibold flex items-center justify-center gap-1 hover:opacity-90">
                <Crown className="w-3 h-3" /> {t('clara_upgrade_view_plans')} <ArrowRight className="w-3 h-3" />
            </Link>
            <button onClick={onDismiss} className="text-xs text-slate-500 hover:text-slate-700 px-2">
                {t('clara_upgrade_later')}
            </button>
        </div>
    </div>
);

export default function ClaraAssistant() {
    const { user } = useContext(AuthContext);
    const { language, t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
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

    useEffect(() => {
        if (isOpen && !hasGreeted) {
            const firstName = user?.full_name?.split(' ')[0] || null;
            const greeting = firstName
                ? t('clara_greeting_named')(firstName)
                : t('clara_greeting_generic');
            setMessages([{ role: 'assistant', content: greeting }]);
            setHasGreeted(true);
        }
    }, [isOpen, hasGreeted, user, language]);

    // Voice input setup
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        const voiceLangMap = { en: 'en-US', hi: 'hi-IN', sw: 'sw-KE', es: 'es-ES' };
        recognition.lang = voiceLangMap[language] || 'en-US';
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
            setMessages(prev => [...prev, { role: 'assistant', content: t('clara_cancel_prompt') }]);
            setActionCard('cancel');
            setIsLoading(false);
            return;
        }
        if (intent === 'upgrade') {
            setMessages(prev => [...prev, { role: 'assistant', content: t('clara_upgrade_prompt') }]);
            setActionCard('upgrade');
            setIsLoading(false);
            return;
        }

        try {
            const conversationHistory = [...messages, newMessage]
                .map(msg => `${msg.role === 'user' ? 'User' : 'Clara'}: ${msg.content}`)
                .join('\n');

            // Fetch real-time platform updates to inject into Clara's context
            let updatesContext = 'No recent updates available.';
            try {
                const updates = await base44.entities.PlatformUpdate.list('-created_date', 10);
                const published = (updates || []).filter(u => u.is_published !== false);
                if (published.length > 0) {
                    updatesContext = published.map(u =>
                        `- ${u.title}: ${u.description}${u.url ? ` (Link: ${u.url})` : ''}`
                    ).join('\n');
                }
            } catch (err) {
                console.error('Failed to fetch PlatformUpdate records for Clara:', err.message);
            }

            const languageNames = { en: 'English', hi: 'Hindi', sw: 'Swahili', es: 'Spanish' };
            const languageInstruction = `IMPORTANT: You MUST respond in ${languageNames[language] || 'English'}. Always preserve scientific names, chemical formulas, CAS numbers, SMILES strings, InChI keys, units, and numeric values in their original form. Only translate natural language prose, descriptions, warnings, and recommendations.`;

            const response = await base44.functions.invoke('runConsumerLLM', {
                operation: 'claraChat',
                data: { conversationHistory, userMessage: content, language }
            });

            // Check if LLM detected an action
            if (response.trim() === 'ACTION:CANCEL_SUBSCRIPTION') {
                setMessages(prev => [...prev, { role: 'assistant', content: t('clara_cancel_prompt') }]);
                setActionCard('cancel');
            } else if (response.trim() === 'ACTION:UPGRADE_SUBSCRIPTION') {
                setMessages(prev => [...prev, { role: 'assistant', content: t('clara_upgrade_prompt') }]);
                setActionCard('upgrade');
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: t('clara_error')
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
                setMessages(prev => [...prev, { role: 'assistant', content: t('clara_cancel_done') }]);
                setTimeout(() => setActionCard(null), 3000);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: t('clara_error') }]);
                setActionCard(null);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: t('clara_error') }]);
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
            await base44.functions.invoke('sendEmailResend', {
                to: 'contact@suttain.com',
                subject: `Live Agent Request from ${liveAgentName}`,
                body: `A user has requested to speak with a live agent on Suttain.\n\nName: ${liveAgentName}\nEmail: ${liveAgentEmail}\n\n--- Conversation Transcript ---\n${transcript}\n\nPlease follow up with the user as soon as possible.`
            });
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
        setHasGreeted(false);
        setLiveAgentRequested(false);
        setLiveAgentSent(false);
        setLiveAgentName('');
        setLiveAgentEmail('');
        setActionCard(null);
        setCancelDone(false);
    };

    const suggestions = [
        t('clara_suggestion_1'),
        t('clara_suggestion_2'),
        t('clara_suggestion_3'),
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
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 flex-shrink-0">
                                <img src={CLARA_AVATAR} alt="Clara" className="w-full h-full object-cover object-top" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">{t('clara_title')}</h3>
                                <p className="text-xs text-white/80">{t('clara_subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <button onClick={resetChat} className="text-white/80 hover:text-white transition-colors" title={t('clara_back_home')}>
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
                                <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3 border-2 border-teal-200">
                                    <img src={CLARA_AVATAR} alt="Clara" className="w-full h-full object-cover object-top" />
                                </div>
                                <h4 className="font-semibold text-slate-900 mb-1 text-sm">{t('clara_ask_anything')}</h4>
                                <p className="text-xs text-slate-500 mb-1">{t('clara_help_text')}</p>
                                {hasSpeechAPI && (
                                    <p className="text-xs text-teal-500 mb-3 flex items-center justify-center gap-1">
                                        <Mic className="w-3 h-3" /> {t('clara_speak_text')}
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
                                    <span className="text-xs text-slate-500">{t('clara_typing')}</span>
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
                                t={t}
                            />
                        )}
                        {actionCard === 'upgrade' && (
                            <UpgradeActionCard onDismiss={() => setActionCard(null)} t={t} />
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Live Agent Form */}
                    {liveAgentRequested && (
                        <div className="mx-3 mb-2 p-3 bg-teal-50 border border-teal-200 rounded-xl flex-shrink-0">
                            <p className="text-xs font-semibold text-teal-800 mb-2">{t('clara_live_agent_title')}</p>
                            <input
                                type="text"
                                placeholder={t('clara_live_agent_name')}
                                value={liveAgentName}
                                onChange={e => setLiveAgentName(e.target.value)}
                                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 mb-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400"
                            />
                            <input
                                type="email"
                                placeholder={t('clara_live_agent_email')}
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
                                    {liveAgentLoading ? t('clara_live_agent_sending') : t('clara_live_agent_submit')}
                                </button>
                                <button onClick={() => setLiveAgentRequested(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2">
                                    {t('cancel')}
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
                                {t('clara_live_agent')}
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
                                placeholder={isListening ? t('clara_listening') : t('clara_input_placeholder')}
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

            {/* Floating Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 lg:bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 hover:shadow-xl transition-shadow overflow-hidden border-2 border-white"
                    style={{ background: 'linear-gradient(135deg, #02988C, #09D2FF)' }}
                >
                    <img src={CLARA_AVATAR} alt="Clara" className="w-full h-full object-cover object-top" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}