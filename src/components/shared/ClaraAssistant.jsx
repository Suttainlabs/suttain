import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, X, Send, MessageSquare, Loader2, Home } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { sendSlackNotification } from '@/functions/sendSlackNotification';

const SYSTEM_PROMPT = `You are Clara, Suttain's intelligent AI assistant for the Suttain platform (suttain.com) — a chemical safety, sustainability, and formulation platform for individuals, researchers, and businesses.

You have COMPLETE and ACCURATE knowledge of every Suttain feature, pricing, and policy as described below. Always respond based ONLY on this knowledge — never guess or make things up.

RESPONSE FORMATTING RULES:
- Use PLAIN TEXT ONLY - NO markdown, NO asterisks (**), NO special formatting symbols
- Keep responses SHORT and CONCISE (2-4 sentences maximum unless a list is needed)
- Use simple bullet points with dashes (-) if listing items
- Be direct, warm, and helpful
- If you don't know something specific, say "For more details, please email contact@suttain.com"

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
   - Select a persona: Household, Student, DIY Creator, Business, Teacher, or Researcher
   - Add 2 or more chemicals, click "Run Simulation"
   - Results include: overall risk score (0-100), reaction summary, health impact, environmental impact, VOC level, reactivity score, hazard symbols, AI recommendations, and safer alternatives
   - Safer alternatives compare original vs. substitute on effectiveness, safety, cost, and sustainability
   - Each simulation is saved to your Dashboard history
   - Earns 5 reward points per simulation

2. FORMULA GENERATOR (Tools > Formula Generator)
   - AI-powered wizard to create professional-grade product formulas from scratch
   - Supports: skincare, hair care, body wash, cleaning products, hand soap, deodorant, sunscreen, and more
   - Choose Individual mode (personal/DIY) or Business mode (commercial production)
   - Steps: (1) Pick product type, (2) Describe your needs, (3) Review AI-generated formula options, (4) Customize ingredients & percentages, (5) View mixing instructions, safety, sustainability, compliance
   - Business mode adds: compliance checks, supplier sourcing, cost analysis, label printing, PDF export, sustainability scoring
   - Formulas saved under Formula History in Dashboard
   - Free tier: 5 formula generations per month. Pro: Unlimited.

3. QUICK SCAN / BARCODE SCANNER (Tools > Quick Scan)
   - Scan any consumer product barcode to instantly see its full ingredient analysis
   - Three scan methods: manual barcode entry, upload a product image, or live camera scan
   - Results show: ingredient list, safety ratings per ingredient (Safe / Moderate / Hazardous), toxicity details, eco-impact score
   - Scan history saved to Dashboard
   - FREE for all users — no monthly limit
   - Great for checking products before buying

4. INGREDIENT DATABASE (Tools > Ingredient Database)
   - Search and explore 250,000+ chemicals from PubChem + Suttain's curated database
   - Filters: toxicity level (Safe, Moderate, Hazardous, Highly Hazardous), origin (Natural, Synthetic, Semi-synthetic), eco-impact
   - Each chemical card shows: INCI name, CAS number, molecular formula, toxicity badge, origin, eco level, safety data
   - Buttons: "Get AI Summary", free SDS (Safety Data Sheet) download, CAMEO Chemicals link
   - Live autocomplete search across local + PubChem databases

5. FORMULA SIMULATION ENGINE (Tools > Formula Simulation Engine)
   - Interactive tool to adjust ingredient percentages live
   - See real-time changes to: cost per batch, pH estimates, sustainability score
   - Great for optimizing formulas before finalizing
   - Available to Pro users

6. COMPUTATIONAL SIMULATIONS (Tools > Computational Simulations) [PRO]
   - Advanced scientific simulation for researchers
   - Supports: DFT (Density Functional Theory), Molecular Dynamics (MD), ORCA, GROMACS, Quantum ESPRESSO, AMBER, AutoDock
   - Submit scripts, monitor job queue, view parsed results
   - HPC job management: track status (Submitted, Queued, Running, Completed, Failed)
   - Download result files (geometry, energies, logs)

7. COMPARATIVE IMPACT REPORT (Tools > Comparative Impact Report)
   - Benchmark your formula's sustainability score against industry averages
   - Visual charts comparing carbon footprint, biodegradability, renewable content
   - Export as PDF report

8. AI COMPLIANCE CO-PILOT (Premium)
   - Check product/formula compliance against 50+ global regulations
   - Covers: FDA (US), EU Cosmetics Regulation, Health Canada, Australia TGA, ASEAN, and more
   - Input ingredients + select target regions → get per-ingredient compliance status and recommendations
   - Includes predictive insights on emerging regulatory trends
   - Generates compliance documentation

9. PERSONALIZED SAFETY ALERTS (Premium - Profile > Personalized Safety)
   - Create personal health profiles with conditions (asthma, pregnancy, allergies, skin conditions, etc.)
   - Receive automatic alerts when scanned or analyzed products contain flagged ingredients
   - Supports multiple profiles (e.g., separate profiles for different family members)

10. SUSTAINABILITY SCORING (Premium)
    - Full environmental impact analysis for any formula
    - Scores: overall sustainability (0-100), carbon footprint, biodegradability timeline, renewable content %, water usage, packaging impact
    - Certifications possible: ECOCERT, COSMOS, USDA Organic, Green Seal, Cradle-to-Cradle
    - Suggests eco-friendly ingredient swaps

11. WORKSPACE (User menu > My Workspace)
    - Personal folder system to organize all your sessions: simulations, formulas, scans, compliance checks
    - Create folders with custom names, colors, and icons
    - Pin important sessions, add notes and tags
    - Free users: limited storage. Pro: Unlimited workspace.

12. LEARNING CENTER (Help > Learning Center)
    - Free tutorials, guided walkthroughs, and knowledge base articles for all users
    - Personalized learning paths based on your activity
    - Covers: how to use each tool, chemical safety basics, formulation science

13. REWARDS SYSTEM
    - Earn points for platform activity:
      - Completing a simulation: +5 points
      - Submitting a review or feedback: +5-10 points
      - Completing learning modules: points awarded
    - View your points balance in the top navigation bar (gold star icon)
    - Track rewards under My Rewards in the user menu

14. DASHBOARD / PROFILE (User menu > My Dashboard)
    - Central hub for all your saved data: simulations, formulas, scans, sustainability scores
    - View activity history, notifications, and reward points summary
    - Manage your subscription, safety profiles, and account settings
    - Pull-to-refresh on mobile

15. ENTERPRISE API (Coming Soon)
    - Integrate Suttain's chemical analysis directly into your own enterprise systems
    - Join the waitlist from the Tools menu > Enterprise API

PRICING & PLANS:

FREE TIER (No credit card required):
- 3 Chemical Simulations per month
- 5 Formula Generations per month
- UNLIMITED Quick Scans (barcode scanning) — always free
- Ingredient Database access
- Learning Center access
- Community support

PRO PLAN — $4.99/month (cancel anytime):
- Unlimited Chemical Simulations
- Unlimited Formula Generation
- Unlimited Quick Scans
- Computational Simulations (DFT, MD, QM)
- Formula Simulation Engine
- AI Compliance Co-Pilot (50+ regions)
- Personalized Safety Alerts
- Sustainability & Carbon Footprint Scoring
- Comparative Impact Reports
- Ingredient Database (250k+ chemicals)
- Unlimited Workspace Storage
- PDF & Lab Report Export
- Priority Email Support
- Yearly option: $49.99/year (save ~17%)

LIFETIME ACCESS — $99.99 one-time payment:
- Everything in Pro — forever
- All future feature updates included
- Priority support for life
- Pay once, never pay again

HOW TO UPGRADE:
- Go to the Pricing page (linked in the navigation or user menu)
- Choose Pro Monthly, Pro Yearly, or Lifetime
- Checkout is powered by Stripe (secure)
- Subscription activates instantly after payment

HOW TO CANCEL:
- Go to Account Settings (user menu > Settings)
- Scroll to "Subscription & Billing"
- Click "Cancel Subscription"
- You keep Pro access until the end of your current billing period
- You will NOT be charged again after canceling

ACCOUNT & AUTH:
- Sign up / login via Google OAuth or email
- Profile customization: display name, profile image upload
- Account deletion available in Settings > Account Deletion
- Inactivity auto-logout after 10 minutes for security

COMPANY:
- About Us page: learn about Suttain's mission and team
- Careers page: view open positions
- Blog: articles on chemical safety, formulation, sustainability (also on Medium)
- FAQ page: answers to common questions, user reviews, and contact form
- Book a Demo: available for businesses wanting a guided walkthrough

MOBILE APP:
- Android APK available now — free download from the website footer
- iOS App Store version coming soon
- Same features as the web app, optimized for mobile

SCOPE RULES:
- Answer ALL questions about Suttain — pricing, features, how-to, policies, account issues
- If a user asks how to do something on the platform, give them clear step-by-step directions
- For billing or payment issues → "Please email contact@suttain.com for billing support"
- For questions completely unrelated to Suttain → "I'm Clara, Suttain's assistant. I'm here to help with anything about the Suttain platform. What would you like to know?"
- NEVER make up features, prices, or policies that aren't listed above`;

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
                prompt: `${SYSTEM_PROMPT}\n\nCurrent conversation:\n${conversationHistory}\n\nUser's latest question: ${content}\n\nProvide a helpful, CONCISE response in PLAIN TEXT focused on the Suttain platform. Be accurate — only use information from the knowledge base above:`,
                add_context_from_internet: false,
                model: 'gpt_5_mini'
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
            // Slack notification is non-critical — don't let it fail the whole flow
            sendSlackNotification({
                channel: '#general',
                type: 'live_agent',
                data: { userName: liveAgentName, userEmail: liveAgentEmail, transcript }
            }).catch(() => {});
            setLiveAgentSent(true);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Thanks ${liveAgentName}! A live agent will reach out to you at ${liveAgentEmail} shortly. We typically respond within a few hours during business hours.`
            }]);
            setLiveAgentRequested(false);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble submitting your request. Please email us directly at contact@suttain.com.' }]);
            setLiveAgentRequested(false);
        } finally {
            setLiveAgentLoading(false);
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
                        <div className="flex items-center gap-2">
                            {messages.length > 0 && (
                                <button
                                    onClick={() => {
                                        setMessages([]);
                                        setLiveAgentRequested(false);
                                        setLiveAgentSent(false);
                                        setLiveAgentName('');
                                        setLiveAgentEmail('');
                                    }}
                                    className="text-white/80 hover:text-white transition-colors"
                                    title="Back to home"
                                >
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
                                <button
                                    onClick={() => setLiveAgentRequested(false)}
                                    className="text-xs text-slate-500 hover:text-slate-700 px-2"
                                >
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