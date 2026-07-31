import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, TestTube, Atom, Menu, X, HelpCircle, LogIn, ChevronDown, ChevronLeft, LogOut, Sparkles, User as UserIcon, QrCode, Leaf, AppWindow, LayoutDashboard, Star, Linkedin, Instagram, Youtube, Apple, Building2, Briefcase, Bell, Cpu, BarChart2, FolderOpen, ShieldCheck, ShieldAlert, ShoppingBag, TrendingUp, FileText, FlaskConical, Droplets, CreditCard, Microscope, Terminal, ArrowUpRight, Code2, Sprout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/entities/User";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import AuthContext from './components/auth/AuthContext';
import { LanguageProvider, useI18n } from '@/components/i18n/LanguageContext';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import NotificationCenter from './components/notifications/NotificationCenter';
import BottomNavBar from './components/navigation/BottomNavBar';
import GlobalSearch from './components/navigation/GlobalSearch';
import { useQuery } from '@tanstack/react-query';
import useTrialStatus from './hooks/useTrialStatus';
import TrialBadge from './components/trial/TrialBadge';
import { RESEARCH_TOOLS, FARM_TOOLS, API_TOOLS } from './components/navigation/domainNav';
import { hasAccess, productUrl } from './components/auth/productAccess';
import DomainLink from './components/navigation/DomainLink';
import AccessGuard from './components/auth/AccessGuard';

// ── Page title formatter (handles camelCase + acronyms) ────────────
function formatPageTitle(slug) {
  if (!slug) return 'Suttain';
  return slug
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ── Unique meta descriptions per page ──────────────────────────────
const PAGE_META_DESCRIPTIONS = {
  Home: 'Suttain is an AI-powered platform for chemical safety analysis, formula generation, and product scanning. Test chemical interactions, create safe formulas, and scan products for hazards.',
  Pricing: 'Suttain pricing plans for consumers and researchers. Free, Pro, and Lifetime tiers for chemical safety tools. Research plans with API access, simulation credits, and academic discounts.',
  Simulator: 'Test chemical combinations safely before mixing. Get instant hazard analysis, reaction predictions, and safety recommendations with Suttain chemical interaction simulator.',
  generator: 'Create professional skincare, soap, and cleaning product formulas with AI. Get ingredient recommendations, safety validation, and step-by-step manufacturing instructions.',
  BarcodeScanner: 'Scan any product barcode to instantly analyze ingredients. Get safety ratings, allergen alerts, and healthier alternatives for household and personal care products.',
  HydrationHome: 'Track your daily water intake with biological intelligence. Personalized hydration goals based on your weight, activity, climate, and food-linked adjustments.',
  TermsOfService: 'Suttain Terms of Service — the terms and conditions governing use of the Suttain chemical safety, formula generation, and research platform.',
  PrivacyPolicy: 'Suttain Privacy Policy — how we collect, use, and protect your data when using our chemical safety analysis, formula generation, and product scanning tools.',
  FAQ: 'Frequently asked questions about Suttain — chemical safety analysis, formula generation, product scanning, pricing, and research API access.',
  AboutUs: 'Suttain makes chemical safety accessible to everyone. Learn about our mission to democratize chemical knowledge for safer products and formulations.',
  Careers: 'Join Suttain — careers in chemical safety, AI, and sustainable product development. View open positions and help build the future of chemical intelligence.',
  ResearchLanding: 'Suttain Research Portal — a unified computational chemistry platform integrating PubChem, ChEMBL, and EPA CompTox for molecular intelligence, simulation, and API access.',
  ResearchDashboard: 'Your Suttain research dashboard — monitor activity, manage saved molecular formulas, and access computational chemistry tools.',
  ResearchPortal: 'Suttain Research Portal — molecular intelligence, computational simulation, formula generation, and API access for professional chemists and scientists.',
  APIPortal: 'Suttain Research API documentation — REST endpoints for compound lookup, hazard scoring, interaction checking, and formula generation. Python and JavaScript SDKs available.',
  MolecularIntelligence: 'Query any chemical compound for hazard classification, toxicity profiling, environmental fate, and regulatory status. Search by name, SMILES, InChI, or CAS number.',
  MoleculeExplorer: 'Browse and visualize chemical compounds in 3D. Search your database or PubChem, render molecular structures, and view physical, toxicity, and environmental properties.',
  ChemicalDashboard: 'Comprehensive chemical dashboard — view and manage your chemical database with detailed properties, safety data, and regulatory information.',
  ChemicalComparison: 'Compare any two chemical compounds side-by-side. Contrast molecular structure, physical properties, toxicity, and environmental data with delta highlighting.',
  ChemicalLibrary: 'Browse and manage your chemical library. Search by name, CAS, formula, or safety level. Import and export chemical data.',
  ComputationalSimulation: 'Run semi-empirical and DFT-tier computational chemistry simulations. Upload PDB, SDF, MOL2, or SMILES. 3D WebGL viewer with ESP mapping and trajectory playback.',
  SimulationEngine: 'Suttain simulation engine — run molecular dynamics, DFT, and quantum mechanics calculations. Configure forcefields, solvation, and analysis parameters.',
  SDSAnalyzer: 'Upload Safety Data Sheets and extract hazard data, GHS classifications, first aid measures, and regulatory information automatically.',
  EnterpriseAPI: 'Suttain Enterprise API — custom integrations, dedicated infrastructure, and white-label solutions for organizations needing chemical intelligence at scale.',
  Dashboard: 'Your Suttain dashboard — track your chemical safety analyses, saved formulas, scanned products, and sustainability scores in one place.',
  Profile: 'Manage your Suttain profile, subscription, safety preferences, and account settings.',
  BillingDashboard: 'Manage your Suttain subscription, view billing history, update payment methods, and download invoices.',
  Workspace: 'Your Suttain workspace — organize simulations, formulas, and research sessions in custom folders.',
  AdminDashboard: 'Suttain admin dashboard — manage users, subscriptions, blog posts, and platform analytics.',
  Blog: 'Suttain blog — insights on chemical safety, sustainable formulation, regulatory compliance, and the science behind safer products.',
  ComplianceGuide: 'Suttain compliance guide — understand FDA, EU, REACH, and global regulatory requirements for cosmetics, cleaning products, and chemical formulations.',
  LearningSuite: 'Suttain learning center — tutorials and guides on chemical safety, product formulation, and sustainable manufacturing from basics to advanced techniques.',
  ExternalDatabases: 'Explore external chemical databases integrated with Suttain — PubChem, ChEMBL, EPA CompTox, RCSB PDB, and more scientific data sources.',
  BookADemo: 'Book a demo of the Suttain chemical safety and compliance platform. See how our tools can streamline your formulation and regulatory workflows.',
  ComputationalStudio: 'Suttain Computational Studio: a unified workspace for molecular intelligence, protein structure prediction, materials analysis, and hazard prediction with single run, batch, and pipeline modes.',
};

// Lazy-loaded components with error boundaries
const ClaraAssistant = React.lazy(() => import("./components/shared/ClaraAssistant").catch(() => ({ default: () => null })));
const AuthModal = React.lazy(() => import("./components/auth/AuthModal").catch(() => ({ default: () => null })));
const SimplifiedOnboarding = React.lazy(() => import("./components/auth/SimplifiedOnboarding").catch(() => ({ default: () => null })));


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, syncLanguageFromUser } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductSuiteOpen, setIsProductSuiteOpen] = useState(false); // Renamed and combined
  const [isResearchSuiteOpen, setIsResearchSuiteOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuConsistency] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false); // New state for Company menu
  // Removed isPremiumOpen and isProductOpen
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // New state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signup");
  const [showAcknowledgementModal, setShowAcknowledgementModal] = useState(false);
  const [currentGreeting, setCurrentGreeting] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const trialStatus = useTrialStatus(user);

  // Fetch unread notification count
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }),
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
    initialData: []
  });

  const unreadCount = notifications.length;

  const getGreetingText = useCallback((currentUser) => {
    const hour = new Date().getHours();
    const firstName = currentUser?.full_name?.split(' ')[0] || 'User';

    if (hour < 12) return `Good morning, ${firstName}!`;
    if (hour < 17) return `Good afternoon, ${firstName}!`;
    return `Good evening, ${firstName}!`;
  }, []);

  const fetchUserAndSetState = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setCurrentGreeting(getGreetingText(currentUser));

      // Sync language preference from user entity
      if (currentUser?.language) {
        syncLanguageFromUser(currentUser.language);
      }

      // Returning researcher — redirect straight to research dashboard
      if (currentUser && currentUser.first_login === false && currentUser.profile_type === 'researcher') {
        const isOnResearchPage = window.location.pathname === '/enterprise' || window.location.pathname === '/EnterpriseAPI'
          || ['/MolecularIntelligence', '/MoleculeExplorer', '/ChemicalDashboard', '/ResearchPortal',
              '/ResearchDashboard', '/APIPortal', '/ChemicalComparison', '/SDSAnalyzer',
              '/ComputationalSimulation', '/SimulationEngine', '/ChemicalLibrary'].includes(window.location.pathname);
        if (!isOnResearchPage) {
          navigate(createPageUrl('ResearchDashboard'));
        }
      }

      if (currentUser && currentUser.first_login !== false) {
        setShowAcknowledgementModal(true);
        // Send welcome email via backend function (reliable, server-side)
        try {
          await base44.functions.invoke('sendWelcomeEmail', {
            email: currentUser.email,
            full_name: currentUser.full_name || ''
          });
          console.log('Welcome email triggered for:', currentUser.email);
        } catch (welcomeErr) {
          console.error('Failed to send welcome email:', welcomeErr);
        }
      }

      // Track last active date for re-engagement emails (update silently, max once per day)
      if (currentUser) {
        const today = new Date().toISOString().split('T')[0];
        const lastActive = currentUser.last_active_date ? currentUser.last_active_date.split('T')[0] : null;
        if (lastActive !== today) {
          try {
            await base44.auth.updateMe({ last_active_date: new Date().toISOString() });
          } catch {}
        }
      }
    } catch (error) {
      setUser(null);
      setCurrentGreeting('');
    } finally {
      setIsAuthLoading(false);
    }
  }, [getGreetingText]);

  // Effect to fetch user on initial mount.
  // Subsequent user data changes will be handled by explicit calls to fetchUserAndSetState
  // (e.g., from AuthModal onSuccess, or by refreshUser context function)
  useEffect(() => {
    fetchUserAndSetState();
  }, [fetchUserAndSetState]);

  // Effect to update greeting text based on time, and re-establish if 'user' changes.
  useEffect(() => {
    // Set initial greeting immediately if user exists when this effect runs/re-runs
    if (user) {
      setCurrentGreeting(getGreetingText(user));
    } else {
      setCurrentGreeting(''); // Clear greeting if user logs out
    }

    // Set up interval only if user is logged in
    let intervalId;
    if (user) {
        intervalId = setInterval(() => {
             setCurrentGreeting(getGreetingText(user));
        }, 60000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, getGreetingText]);


  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      setCurrentGreeting('');
      localStorage.removeItem('suttain_free_simulation_used');
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleAcceptAcknowledgement = async () => {
    setShowAcknowledgementModal(false);
    const currentUser = await User.me().catch(() => null);
    if (currentUser) {
      setUser(currentUser);
      // Route returning researchers to their research dashboard
      if (currentUser.profile_type === 'researcher') {
        navigate(createPageUrl('ResearchDashboard'));
      }
    }
  };

  const handleDeclineAcknowledgement = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Logout failed after declining acknowledgment:", error);
    } finally {
      setShowAcknowledgementModal(false);
      setUser(null);
      setCurrentGreeting('');
    }
  };

  const openAuthModal = (mode) => {
    navigate('/login');
  };

  const navLinks = [
    { href: "Home", label: "Home", icon: Home },
    { href: "Pricing", label: "Pricing", icon: Star },
  ];

  // Consumer nav only — Research is accessible but not promoted

  const companyMenuItems = [
    { href: "AboutUs", label: "About us", icon: Building2, description: "Learn about our mission and team" },
    { href: "Careers", label: "Careers", icon: Briefcase, description: "View open positions and join us" },
  ];

  const helpMenuItems = [];

  const consumerToolItems = [
    { href: "Simulator", label: "Chemical simulator", icon: TestTube, description: "Safety analysis, compliance and sustainability built in", category: "Safety and analysis" },
    { href: "generator", label: "Formula generator", icon: Atom, description: "Create formulas with safety, compliance and eco scoring", category: "Formulation" },
    { href: "BarcodeScanner", label: "SuttainScan", icon: QrCode, description: "Scan any product for toxicity, sustainability and ingredient detail", category: "Safety and analysis" },
    { href: "CarbonTaxSimulator", label: "Carbon tax simulator", icon: BarChart2, description: "Simulate carbon tax exposure and find greener alternatives with ROI", category: "Safety and analysis" },
  ];

  const researchToolItems = RESEARCH_TOOLS;
  const farmToolItems = FARM_TOOLS;
  const apiToolItems = API_TOOLS;

  // Logged-out visitors see everything; signed-in users only see what they picked.
  const canSee = (key) => !user || hasAccess(user, key);

  const isConsumerToolsActive = consumerToolItems.some(tool => location.pathname === createPageUrl(tool.href));
  const isResearchToolsActive = researchToolItems.some(tool => location.pathname === tool.path);
  const isFarmActive = location.pathname === '/SuttainFarm' || farmToolItems.some(tool => location.pathname === tool.path);
  const isApiActive = API_TOOLS.some(tool => location.pathname === tool.path);


  const getLinkClasses = (href) => {
    const isActive = location.pathname === (href === "Home" ? "/" : createPageUrl(href));
    return `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-sm ${
      isActive
        ? "bg-violet-100 text-violet-600"
        : "text-slate-700 hover:bg-violet-50 hover:text-violet-600"
    }`;
  };


  // Updated active state checks
  const isCompanyMenuActive = companyMenuItems.some(item => location.pathname === createPageUrl(item.href));
  const isHelpToolActive = helpMenuItems.some(item => location.pathname === createPageUrl(item.href));

  const isResearchActive = isResearchToolsActive
    || location.pathname === createPageUrl("ChemicalComparison")
    || location.pathname === createPageUrl("SimulationEngine")
    || location.pathname === createPageUrl("ChemicalLibrary")
    || location.pathname === createPageUrl("ChemicalDashboard")
    || location.pathname === createPageUrl("InventoryDashboard")
    || location.pathname === createPageUrl("StructuralBiology")
    || location.pathname === createPageUrl("ResearchPortal")
    || location.pathname === createPageUrl("MoleculeAnalysis");


  const mobileMenuVariants = {
    open: {
      transition: { staggerChildren: 0.07, delayChildren: 0.2 }
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const mobileNavItemVariants = {
    open: { y: 0, opacity: 1, transition: { y: { stiffness: 1000, velocity: -100 }}},
    closed: { y: 50, opacity: 0, transition: { y: { stiffness: 1000 }}}
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F6F2' }}>
      <style>{`
        :root {
          --suttain-teal: #0F6E56;
          --suttain-blue: #00A8C8;
          --suttain-violet: #534AB7;
          --suttain-dark: #2C2C2A;
          --suttain-text: #45453F;
          --light-background: #F7F6F2;
          --warning-orange: #993C1D;
          --success-green: #3B6D11;
        }

        body {
          font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
          background-color: var(--color-page-bg, #F7F6F2);
          color: var(--color-page-text, #2C2C2A);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        h1, h2, h3, h4, h5, h6, .font-heading {
          font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
          font-weight: 500;
          color: var(--color-page-text, #2C2C2A);
        }

        .gradient-text {
          color: var(--core-accent, #0F6E56);
          -webkit-text-fill-color: currentColor;
        }

        .btn-primary {
          background: var(--core-accent, #0F6E56);
          color: white;
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          background: #0C5A47;
        }

        .btn-secondary {
          background-color: var(--research-accent, #534AB7);
          color: white;
        }
        .btn-secondary:hover {
          background-color: #453DA0;
        }
      `}</style>

      {/* Floating Nav Bar */}
      <header className="sticky top-0 z-50 px-4 pt-[env(safe-area-inset-top)] bg-[#F7F6F2]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm px-4 h-14 overflow-hidden">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 justify-self-start min-w-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
                alt="Suttain"
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop: minimal link row + menu trigger */}
            <nav className="hidden lg:flex items-center gap-1 justify-self-center whitespace-nowrap flex-shrink-0">
              <Link to="/" className={getLinkClasses("Home")}>{t('nav_home')}</Link>

              {/* Tools — plain link */}
              {canSee('consumer') && (
                <Link to="/tools" className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-sm ${
                  location.pathname === '/tools' || isConsumerToolsActive
                    ? 'bg-core-accent-light text-core-accent'
                    : 'text-slate-700 hover:bg-core-accent-light hover:text-core-accent'
                }`}>
                  {t('nav_tools')}
                </Link>
              )}

              {/* Research — research.suttain.com */}
              {canSee('research') && (
                <DomainLink product="research" to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-sm text-slate-700 hover:bg-research-accent-light hover:text-research-accent">
                  {t('nav_research')}
                </DomainLink>
              )}

              {/* Farm — farm.suttain.com */}
              {canSee('farm') && (
                <DomainLink product="farm" to="/SuttainFarm" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-sm text-slate-700 hover:bg-farm-accent-light hover:text-farm-accent">
                  Farm
                </DomainLink>
              )}

              {/* API — api.suttain.com */}
              {canSee('api') && (
                <DomainLink product="api" to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-sm text-slate-700 hover:bg-api-accent-light hover:text-api-accent">
                  API
                </DomainLink>
              )}

              <Link to={createPageUrl("Pricing")} className={getLinkClasses("Pricing")}>{t('nav_pricing')}</Link>
            </nav>

            {/* Right side: language + auth */}
            <div className="flex items-center gap-2 justify-self-end flex-shrink-0">
              {!isAuthLoading && user && (
                <div className="hidden md:flex items-center gap-2">
                  <TrialBadge trialStatus={trialStatus} />
                  <button onClick={() => setShowNotifications(true)} className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <Bell className="w-4 h-4 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              {!isAuthLoading ? (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-1.5 px-2 py-1 h-9 hover:bg-slate-100 rounded-xl">
                        <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                          {user.profile_image_url ? (
                            <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500">
                              <UserIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="hidden lg:block text-sm font-semibold">{(user.display_name || user.full_name || 'Account').split(' ')[0]}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <div className="px-3 py-2 border-b">
                        <p className="font-semibold text-sm">{user.display_name || user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <DropdownMenuItem asChild><Link to="/Dashboard" className="cursor-pointer"><LayoutDashboard className="w-4 h-4 mr-2" />{t('menu_my_dashboard')}</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to={createPageUrl("BillingDashboard")} className="cursor-pointer"><CreditCard className="w-4 h-4 mr-2" />{t('menu_billing')}</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to={createPageUrl("Workspace")} className="cursor-pointer"><FolderOpen className="w-4 h-4 mr-2" />{t('menu_workspace')}</Link></DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild><Link to={createPageUrl("AdminDashboard")} className="cursor-pointer"><LayoutDashboard className="w-4 h-4 mr-2" />Admin dashboard</Link></DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />{t('auth_logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openAuthModal("login")}>
                      {t('auth_sign_in')}
                    </Button>
                    <Button size="sm" onClick={() => openAuthModal("signup")}>
                      {t('auth_get_started')}
                    </Button>
                  </div>
                )
              ) : (
                <div className="hidden md:flex gap-2">
                  <div className="w-16 h-8 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
                </div>
              )}

              {/* Mobile hamburger */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
                    alt="Suttain"
                    className="h-10 w-auto"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <motion.div 
                className="flex-1 flex flex-col min-h-0"
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
              >
                <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                  {navLinks.map(({ href, label, icon: Icon }) => (
                    <motion.div key={href} variants={mobileNavItemVariants}>
                      <Link
                        to={href === "Home" ? "/" : createPageUrl(href)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                          location.pathname === (href === "Home" ? "/" : createPageUrl(href))
                            ? `bg-violet-100 text-violet-600`
                            : "text-suttain-dark hover:bg-violet-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </Link>
                    </motion.div>
                  ))}
                  





                  {/* Tools — plain link */}
                  {canSee('consumer') && (
                  <motion.div variants={mobileNavItemVariants}>
                    <Link
                      to="/tools"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                        location.pathname === '/tools' ? 'bg-core-accent-light text-core-accent' : 'text-suttain-dark hover:bg-core-accent-light'
                      }`}
                    >
                      <TestTube className="w-5 h-5" />
                      {t('mobile_tools')}
                    </Link>
                  </motion.div>
                  )}

                  {/* API — api.suttain.com */}
                  {canSee('api') && (
                  <motion.div variants={mobileNavItemVariants}>
                    <DomainLink product="api" to="/" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors text-suttain-dark hover:bg-api-accent-light">
                      <Terminal className="w-5 h-5" />
                      API
                    </DomainLink>
                  </motion.div>
                  )}

                  {/* Suttain Farm — Mobile */}
                  {canSee('farm') && (
                  <motion.div variants={mobileNavItemVariants}>
                    <DomainLink
                      product="farm"
                      to="/SuttainFarm"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                        location.pathname === "/SuttainFarm" ? "bg-farm-accent-light text-farm-accent" : "text-suttain-dark hover:bg-farm-accent-light"
                      }`}
                    >
                      <Sprout className="w-5 h-5" />
                      Suttain Farm
                    </DomainLink>
                  </motion.div>
                  )}



                  {/* Research Tools Collapsible - Mobile */}
                  {canSee('research') && (
                  <motion.div variants={mobileNavItemVariants}>
                    <DomainLink product="research" to="/" onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors text-suttain-dark hover:bg-research-accent-light">
                      <Microscope className="w-5 h-5" />
                      {t('nav_research')}
                    </DomainLink>
                  </motion.div>
                  )}

                </nav>

                {/* Mobile Auth Section */}
                <div className="border-t border-slate-200 p-4 flex-shrink-0">
                  {!isAuthLoading ? ( // Conditionally render mobile auth section only when not loading
                    user ? (
                      <motion.div variants={mobileNavItemVariants} className="space-y-3">
                        <p className="px-4 text-sm text-suttain-text">
                          {currentGreeting}
                        </p>
                         <Link
                          to={createPageUrl("Profile")}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full justify-start text-base font-semibold flex items-center gap-4 px-4 py-3 text-suttain-dark hover:bg-slate-100 rounded-lg"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          {t('menu_my_dashboard')}
                        </Link>
                        <Link
                          to={createPageUrl("BillingDashboard")}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full justify-start text-base font-semibold flex items-center gap-4 px-4 py-3 text-suttain-dark hover:bg-slate-100 rounded-lg"
                        >
                          <CreditCard className="w-5 h-5" />
                          {t('menu_billing')}
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to={createPageUrl("AdminDashboard")}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full justify-start text-base font-semibold flex items-center gap-4 px-4 py-3 text-suttain-dark hover:bg-slate-100 rounded-lg"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            {t('menu_admin')}
                          </Link>
                        )}
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          className="w-full justify-start text-base font-semibold flex items-center gap-4 px-4 py-3 text-suttain-dark hover:bg-slate-100"
                        >
                          <LogOut className="w-5 h-5" />
                          {t('auth_logout')}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div variants={mobileNavItemVariants} className="space-y-2">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            openAuthModal("login");
                          }}
                          className="w-full"
                        >
                          <LogIn className="w-5 h-5 mr-2" />
                          {t('auth_login')}
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            openAuthModal("signup");
                          }}
                          className="w-full"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          {t('auth_sign_up_free')}
                        </Button>
                      </motion.div>
                    )
                  ) : (
                    // Optional loading state for mobile menu
                    <div className="space-y-2 px-4 py-3">
                      <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
                      <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pb-16 lg:pb-0 relative z-10">
        <AuthContext.Provider value={{ user, isAuthLoading, openAuthModal, refreshUser: fetchUserAndSetState }}>
          <AccessGuard user={user} isAuthLoading={isAuthLoading}>{children}</AccessGuard>
          {/* Clara AI Assistant */}
          <React.Suspense fallback={null}>
            <ClaraAssistant />
          </React.Suspense>

          {/* Notification Center */}
          {user && (
            <NotificationCenter 
              isOpen={showNotifications} 
              onClose={() => setShowNotifications(false)} 
            />
          )}
          </AuthContext.Provider>
          </main>
      
      {/* Footer - Home page only */}
      {currentPageName === 'Home' && (
      <footer className="bg-white border-t border-slate-200 text-sm pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Column 1: Logo & Tagline */}
            <div className="space-y-2">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
                  alt="Suttain"
                  className="h-7 w-auto"
                />
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed">
                Supporting chemical sustainability through robust analysis, safety evaluation, and formulation tools.
              </p>
              <div className="flex space-x-3">
                <a href="https://www.linkedin.com/company/suttainlabs/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[var(--suttain-teal)] transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/suttain.ai" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[var(--suttain-teal)] transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.youtube.com/channel/UCOgVoog8K35lkY9VCsNWqAg" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[var(--suttain-teal)] transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="https://x.com/suttain" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[var(--suttain-teal)] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@suttainlabs" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[var(--suttain-teal)] transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/></svg>
                </a>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('language_label')}</p>
                <LanguageSwitcher />
              </div>
            </div>

            {/* Column 2: Product */}
            <div>
              <h3 className="font-semibold mb-3 text-slate-800 text-sm">Product</h3>
              <ul className="space-y-1.5 text-sm">
                <li><Link to={createPageUrl('Simulator')} className="text-slate-500 hover:text-[var(--suttain-teal)] transition-colors">Simulator</Link></li>
                <li><Link to={createPageUrl('generator')} className="text-slate-500 hover:text-[var(--suttain-teal)] transition-colors">Generator</Link></li>
                <li><Link to={createPageUrl('BarcodeScanner')} className="text-slate-500 hover:text-[var(--suttain-teal)] transition-colors">Scan</Link></li>
              </ul>
            </div>

            {/* Column 3: More from Suttain */}
            <div>
              <h3 className="font-semibold mb-3 text-slate-800 text-sm">More from Suttain</h3>
              <ul className="space-y-1.5 text-sm">
                <li><DomainLink product="research" to={createPageUrl("ResearchDashboard")} className="text-slate-500 hover:text-[var(--suttain-teal)] transition-colors">research.suttain.com</DomainLink></li>
                <li><DomainLink product="api" to="/APIPortal" className="text-slate-500 hover:text-[var(--suttain-teal)] transition-colors">api.suttain.com</DomainLink></li>
                <li><DomainLink product="farm" to="/SuttainFarm" className="text-slate-500 hover:text-[var(--suttain-teal)] transition-colors">farm.suttain.com</DomainLink></li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <h3 className="font-semibold mb-3 text-slate-800 text-sm">Company</h3>
              <ul className="space-y-1.5 text-sm">
                <li><Link to={createPageUrl('Pricing')} className="text-slate-500 hover:text-[var(--suttain-teal)] transition-colors">Pricing</Link></li>
                <li><a href="mailto:contact@suttain.com" className="text-slate-500 hover:text-[var(--suttain-teal)] transition-colors">Contact</a></li>
                <li><Link to={createPageUrl('TermsOfService')} className="text-slate-500 hover:text-[var(--suttain-teal)] transition-colors">Legal</Link></li>
              </ul>
            </div>
            </div>

          <div className="mt-4 pt-4 border-t border-slate-200 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} Suttain. All rights reserved.
          </div>
        </div>
      </footer>
          )}
      
      {/* Bottom Navigation Bar - Mobile Only */}
      {user && <BottomNavBar />}


      
      {/* Simplified Onboarding */}
      <React.Suspense fallback={null}>
        {showAcknowledgementModal && 
          React.createElement(SimplifiedOnboarding, {
            isOpen: showAcknowledgementModal,
            onAccept: handleAcceptAcknowledgement,
            onClose: handleDeclineAcknowledgement,
          })
        }
      </React.Suspense>
    </div>
  );
}