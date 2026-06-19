import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, TestTube, Atom, Menu, X, HelpCircle, LogIn, ChevronDown, ChevronLeft, LogOut, Sparkles, User as UserIcon, QrCode, Leaf, AppWindow, LayoutDashboard, Star, Linkedin, Instagram, Youtube, Apple, Building2, Briefcase, Bell, GraduationCap, BookOpen, Cpu, BarChart2, FolderOpen, ShieldCheck, ShoppingBag, TrendingUp, FileText, FlaskConical, Droplets, CreditCard, Microscope, Terminal, ArrowUpRight } from "lucide-react";
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
import NotificationCenter from './components/notifications/NotificationCenter';
import BottomNavBar from './components/navigation/BottomNavBar';
import GlobalSearch from './components/navigation/GlobalSearch';
import { useQuery } from '@tanstack/react-query';
import useTrialStatus from './hooks/useTrialStatus';
import useInactivityTimeout from './hooks/useInactivityTimeout';
import TrialBadge from './components/trial/TrialBadge';

// Lazy-loaded components with error boundaries
const ClaraAssistant = React.lazy(() => import("./components/shared/ClaraAssistant").catch(() => ({ default: () => null })));
const AuthModal = React.lazy(() => import("./components/auth/AuthModal").catch(() => ({ default: () => null })));
const UserAcknowledgementModal = React.lazy(() => import("./components/auth/UserAcknowledgementModal").catch(() => ({ default: () => null })));


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductSuiteOpen, setIsProductSuiteOpen] = useState(false); // Renamed and combined
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


  // Auto-logout after inactivity (10 minutes)
  const handleInactivityLogout = useCallback(async () => {
    if (!user) return;
    try {
      await User.logout();
    } catch {}
    setUser(null);
    setCurrentGreeting('');
    localStorage.removeItem('suttain_free_simulation_used');
    // Show a brief message then redirect
    navigate('/');
    setTimeout(() => alert('You were signed out due to inactivity.'), 200);
  }, [user, navigate]);

  useInactivityTimeout(handleInactivityLogout, 10 * 60 * 1000, !!user);

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      setCurrentGreeting('');
      localStorage.removeItem('suttain_free_simulation_used');
      setIsMobileMenuOpen(false);
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleAcceptAcknowledgement = async () => {
    try {
      await User.updateMyUserData({ first_login: false });
      setShowAcknowledgementModal(false);
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to accept acknowledgment:", error);
      await User.logout();
      setShowAcknowledgementModal(false);
      setUser(null);
      setCurrentGreeting('');
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
    base44.auth.redirectToLogin();
  };

  const navLinks = [
    { href: "Home", label: "Home", icon: Home },
    { href: "Pricing", label: "Pricing", icon: Star },
  ];

  const companyMenuItems = [
    { href: "AboutUs", label: "About Us", icon: Building2, description: "Learn about our mission and team" },
    { href: "Careers", label: "Careers", icon: Briefcase, description: "View open positions and join us" },
  ];

  const helpMenuItems = [];

  const consumerToolItems = [
    { href: "Simulator", label: "Chemical Simulator", icon: TestTube, description: "Safety analysis, compliance & sustainability built in" },
    { href: "generator", label: "Formula Generator", icon: Atom, description: "Create formulas with safety, compliance & eco scoring" },
    { href: "BarcodeScanner", label: "SuttainScan", icon: QrCode, description: "Scan any product — toxicity, sustainability & ingredient deep-dive" },
    { href: "HydrationHome", label: "Hydration Intelligence", icon: Droplets, description: "Track water intake with biological food-linked adjustments" },
  ];

  const isConsumerToolsActive = consumerToolItems.some(tool => location.pathname === createPageUrl(tool.href));


  const getLinkClasses = (href) => {
    const isActive = location.pathname === createPageUrl(href);
    return `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold text-sm ${
      isActive
        ? "text-[#3D2E1C]"
        : "text-[#6B5B4A] hover:text-[#3D2E1C]"
    }`;
  };

  const activeInsetStyle = "background: #DED4C2; box-shadow: inset 0 1px 3px rgba(0,0,0,0.12)";


  // Updated active state checks
  const isCompanyMenuActive = companyMenuItems.some(item => location.pathname === createPageUrl(item.href));
  const isHelpToolActive = helpMenuItems.some(item => location.pathname === createPageUrl(item.href));

  const isResearchActive = location.pathname === '/research' || location.pathname === '/ResearchLanding'
    || location.pathname === createPageUrl("MolecularIntelligence")
    || location.pathname === createPageUrl("ComputationalSimulation")
    || location.pathname === createPageUrl("CarbonTaxSimulator")
    || location.pathname === createPageUrl("ResearchDashboard")
    || location.pathname === createPageUrl("MoleculeExplorer")
    || location.pathname === createPageUrl("ChemicalComparison")
    || location.pathname === createPageUrl("SDSAnalyzer")
    || location.pathname === createPageUrl("SimulationEngine")
    || location.pathname === createPageUrl("ComparativeImpactReport");

  const isEnterpriseActive = location.pathname === '/enterprise' || location.pathname === '/EnterpriseAPI';


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
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <style>{`
        :root {
          --suttain-teal: #007850;
          --suttain-blue: #00A8C8;
          --suttain-violet: #6B3FA0;
          --suttain-dark: #00281E;
          --suttain-text: #464646;
          --light-background: #EDF7F2;
          --warning-orange: #D4900A;
          --success-green: #00B478;
        }

        body {
          font-family: var(--font-gilroy, 'Inter', sans-serif);
          background-color: var(--color-bg-page, #EDF7F2);
          color: var(--color-text-secondary, #464646);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        h1, h2, h3, h4, h5, h6, .font-heading {
          font-family: var(--font-gilroy, 'Inter', sans-serif);
          font-weight: 700;
          color: var(--color-brand-dark, #00281E);
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--suttain-violet) 0%, var(--suttain-blue) 50%, var(--suttain-teal) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--suttain-teal), var(--suttain-blue));
          color: white;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          box-shadow: 0 4px 15px 0 rgba(2, 152, 140, 0.4);
        }

        .btn-secondary {
          background-color: var(--suttain-violet);
          color: white;
        }
        .btn-secondary:hover {
          background-color: #8125d9;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex justify-between items-center h-14 px-4 lg:px-5 rounded-full" style={{ background: '#EAE0D0', boxShadow: '0 2px 12px rgba(60,46,28,0.10), 0 0 0 1px rgba(60,46,28,0.06)' }}>
            {/* Back button — mobile only, hidden on home routes */}
            {location.pathname !== '/' && location.pathname !== '/Home' && (
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="lg:hidden p-2 -ml-1 mr-1 rounded-lg text-[#6B5B4A] hover:bg-[#DED4C2] flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xl font-bold tracking-tight" style={{ color: '#3D2E1C' }}>Suttain</span>
            </Link>



            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 ml-6 px-1.5 py-1 rounded-full" style={{ background: '#DED4C2', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)' }}>
              {navLinks.map(({ href, label }) => {
                const isActive = location.pathname === createPageUrl(href);
                return (
                  <Link key={href} to={createPageUrl(href)}
                    className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all duration-200 ${isActive ? 'text-[#3D2E1C]' : 'text-[#6B5B4A] hover:text-[#3D2E1C]'}`}
                    style={isActive ? { background: '#EAE0D0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : {}}
                  >
                    {label}
                  </Link>
                );
              })}

              {/* Company Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 font-semibold text-sm ${
                    isCompanyMenuActive ? "text-[#3D2E1C]" : "text-[#6B5B4A] hover:text-[#3D2E1C]"
                  }`}
                    style={isCompanyMenuActive ? { background: '#EAE0D0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : {}}
                  >
                    <span>Company</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl border-[#D4C9B5]" style={{ background: '#F5EFE6' }}>
                  {companyMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={createPageUrl(item.href)} className="flex items-start gap-3 p-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#5A9B8A' }}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#3D2E1C' }}>{item.label}</p>
                          <p className="text-xs" style={{ color: '#6B5B4A' }}>{item.description}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Consumer Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 font-semibold text-sm ${
                    isConsumerToolsActive ? "text-[#3D2E1C]" : "text-[#6B5B4A] hover:text-[#3D2E1C]"
                  }`}
                    style={isConsumerToolsActive ? { background: '#EAE0D0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : {}}
                  >
                    <span>Tools</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-xl border-[#D4C9B5]" style={{ background: '#F5EFE6' }}>
                  {consumerToolItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={createPageUrl(item.href)} className="flex items-start gap-3 p-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#5A9B8A' }}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#3D2E1C' }}>{item.label}</p>
                          <p className="text-xs" style={{ color: '#6B5B4A' }}>{item.description}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Research Link */}
              <div className="relative">
                <Link
                  to="/research"
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 font-semibold text-sm ${
                    isResearchActive ? "text-[#3D2E1C]" : "text-[#6B5B4A] hover:text-[#3D2E1C]"
                  }`}
                  style={isResearchActive ? { background: '#EAE0D0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : {}}
                >
                  <Microscope className="w-3.5 h-3.5" />
                  <span>Research</span>
                </Link>
              </div>

              {/* Enterprise Link */}
              <Link
                to="/enterprise"
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 font-semibold text-sm ${
                  isEnterpriseActive ? "text-[#3D2E1C]" : "text-[#6B5B4A] hover:text-[#3D2E1C]"
                }`}
                style={isEnterpriseActive ? { background: '#EAE0D0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : {}}
              >
                <span>Enterprise</span>
              </Link>
            </nav>

            {/* Auth Buttons / User Menu */}
            <div className="flex items-center gap-2">
              {!isAuthLoading && user && (
                <div className="hidden md:flex items-center gap-2">
                  {/* Trial Status Badge */}
                  <TrialBadge trialStatus={trialStatus} />
                  {/* Notification Bell */}
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: '#DED4C2' }}
                  >
                    <Bell className="w-4.5 h-4.5" style={{ color: '#6B5B4A' }} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center" style={{ background: '#C45B4D' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="flex flex-col items-center px-2">
                    <span className="font-bold text-sm leading-none" style={{ color: '#5A9B8A' }}>
                      {user.reward_points || 0}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: '#8A7D6B' }}>points</span>
                  </div>
                </div>
              )}
              {!isAuthLoading ? (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2.5 pl-4 pr-2 py-1.5 rounded-full transition-colors" style={{ background: '#DED4C2' }}>
                        <span className="text-sm font-semibold hidden lg:block" style={{ color: '#3D2E1C' }}>{currentGreeting}</span>
                        <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#D4C9B5] flex-shrink-0" style={{ background: '#C4B9A5' }}>
                           {user.profile_image_url ? (
                             <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center" style={{ background: '#8A7D6B' }}>
                               <UserIcon className="w-4 h-4 text-white" />
                             </div>
                           )}
                        </div>
                        <ChevronDown className="w-3 h-3" style={{ color: '#6B5B4A' }} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#D4C9B5]" style={{ background: '#F5EFE6' }}>
                      <div className="px-3 py-2 border-b border-[#D4C9B5]">
                        <p className="font-semibold text-sm" style={{ color: '#3D2E1C' }}>{user.display_name || user.full_name}</p>
                        <p className="text-xs" style={{ color: '#8A7D6B' }}>{user.email}</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to="/Dashboard" className="cursor-pointer">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            My Dashboard
                           </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("BillingDashboard")} className="cursor-pointer">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Billing & Payments
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("Workspace")} className="cursor-pointer">
                          <FolderOpen className="w-4 h-4 mr-2" />
                          My Workspace
                        </Link>
                      </DropdownMenuItem>

                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl("AdminDashboard")} className="cursor-pointer">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAuthModal("login")}
                      className="text-[#6B5B4A] hover:text-[#3D2E1C] hover:bg-[#DED4C2] rounded-full"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openAuthModal("signup")}
                      className="text-white hover:opacity-90 rounded-full px-5 font-bold"
                      style={{ background: '#5A9B8A' }}
                    >
                      Sign Up Free
                    </Button>
                  </div>
                )
              ) : (
                // Optionally show a loading indicator or nothing while auth status is being fetched
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-20 h-9 rounded-full animate-pulse" style={{ background: '#DED4C2' }}></div>
                  <div className="w-24 h-9 rounded-full animate-pulse" style={{ background: '#DED4C2' }}></div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: '#6B5B4A' }}
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
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
                <Link to={createPageUrl("Home")} onClick={() => setIsMobileMenuOpen(false)}>
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
                        to={createPageUrl(href)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                          location.pathname === createPageUrl(href)
                            ? `bg-violet-100 text-violet-600`
                            : "text-suttain-dark hover:bg-violet-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {label}
                      </Link>
                    </motion.div>
                  ))}
                  
                   {/* Company Mobile Collapsible */}
                   <motion.div variants={mobileNavItemVariants}>
                    <button
                      onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
                      className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors text-suttain-dark hover:bg-rose-50 ${
                        isCompanyMenuActive ? 'bg-rose-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Building2 className="w-5 h-5" />
                        Company
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isCompanyMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isCompanyMenuOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="pl-6 pt-2 flex flex-col gap-2"
                        >
                          {companyMenuItems.map(({ href, label, icon: Icon }) => (
                             <Link
                              key={href}
                              to={createPageUrl(href)}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                                location.pathname === createPageUrl(href)
                                  ? "bg-rose-100 text-rose-600"
                                  : "text-suttain-dark hover:bg-rose-50"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                              {label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>




                  {/* Consumer Tools Collapsible */}
                  <motion.div variants={mobileNavItemVariants}>
                    <button
                      onClick={() => setIsProductSuiteOpen(!isProductSuiteOpen)}
                      className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors text-suttain-dark hover:bg-cyan-50 ${
                        isConsumerToolsActive ? 'bg-cyan-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <TestTube className="w-5 h-5" />
                        Tools
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isProductSuiteOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isProductSuiteOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="pl-4 pt-1 pb-1 overflow-hidden"
                        >
                          {consumerToolItems.map(item => (
                            <Link key={item.href} to={createPageUrl(item.href)} onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                                location.pathname === createPageUrl(item.href) ? "bg-cyan-100 text-cyan-600" : "text-suttain-dark hover:bg-cyan-50"
                              }`}>
                              <item.icon className="w-4 h-4 flex-shrink-0 text-[var(--suttain-teal)]" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Research Link - Mobile */}
                  <motion.div variants={mobileNavItemVariants}>
                    <Link
                      to="/research"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                        isResearchActive ? "bg-violet-100 text-violet-600" : "text-suttain-dark hover:bg-violet-50"
                      }`}
                    >
                      <Microscope className="w-5 h-5" />
                      Research
                    </Link>
                  </motion.div>

                  {/* Enterprise Link - Mobile */}
                  <motion.div variants={mobileNavItemVariants}>
                    <Link
                      to="/enterprise"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                        isEnterpriseActive ? "bg-amber-100 text-amber-700" : "text-suttain-dark hover:bg-amber-50"
                      }`}
                    >
                      <Terminal className="w-5 h-5" />
                      Enterprise
                    </Link>
                  </motion.div>
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
                          My Dashboard
                        </Link>
                        <Link
                          to={createPageUrl("BillingDashboard")}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full justify-start text-base font-semibold flex items-center gap-4 px-4 py-3 text-suttain-dark hover:bg-slate-100 rounded-lg"
                        >
                          <CreditCard className="w-5 h-5" />
                          Billing & Payments
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to={createPageUrl("AdminDashboard")}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full justify-start text-base font-semibold flex items-center gap-4 px-4 py-3 text-suttain-dark hover:bg-slate-100 rounded-lg"
                          >
                            <LayoutDashboard className="w-5 h-5" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          className="w-full justify-start text-base font-semibold flex items-center gap-4 px-4 py-3 text-suttain-dark hover:bg-slate-100"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div variants={mobileNavItemVariants} className="space-y-2">
                        <Button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            openAuthModal("login");
                          }}
                          variant="ghost"
                          className="w-full justify-start text-base font-semibold flex items-center gap-4 px-4 py-3 text-suttain-dark hover:bg-slate-100"
                        >
                          <LogIn className="w-5 h-5" />
                          Login
                        </Button>
                        <Button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            openAuthModal("signup");
                          }}
                          className="w-full justify-center text-base font-semibold bg-gradient-to-r from-suttain-teal to-suttain-blue text-white py-3 rounded-full"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Sign Up Free
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
      <main className="flex-1 pb-16 lg:pb-0">
        <AuthContext.Provider value={{ user, isAuthLoading, openAuthModal, refreshUser: fetchUserAndSetState }}>
          {children}
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
      <footer className="bg-gradient-to-br from-[#1a3a35] via-slate-900 to-slate-900 text-sm pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Column 1: Logo & Tagline */}
            <div className="space-y-2">
              <Link to={createPageUrl("Home")} className="flex items-center gap-2">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
                  alt="Suttain"
                  className="h-7 w-auto"
                />
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                Supporting chemical sustainability through robust analysis, safety evaluation, and formulation tools.
              </p>
              <div className="flex space-x-3">
                <a href="https://www.linkedin.com/company/suttainlabs/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[var(--suttain-teal)] transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/suttainlabs/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[var(--suttain-teal)] transition-colors">
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
            </div>

            {/* Column 2: Platform */}
            <div>
              <ul className="space-y-1.5 text-sm">
                <li><Link to={createPageUrl('Simulator')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Chemical Simulator</Link></li>
                <li><Link to={createPageUrl('generator')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Formula Generator</Link></li>
                <li><Link to="/research" className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Research Portal</Link></li>
                <li><Link to="/enterprise" className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Enterprise API</Link></li>
                <li><Link to={createPageUrl('AboutUs')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">About Us</Link></li>
                <li><Link to={createPageUrl('Careers')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Careers</Link></li>
                </ul>
                </div>

                {/* Column 3: Legal */}
            <div>
              <ul className="space-y-1.5 text-sm">
                <li><Link to={createPageUrl('PrivacyPolicy')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Privacy Policy</Link></li>
                <li><Link to={createPageUrl('TermsOfService')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Terms of Service</Link></li>
                <li><Link to={createPageUrl('ComplianceGuide')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Compliance Guide</Link></li>
                <li><a href="mailto:contact@suttain.com" className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">contact@suttain.com</a></li>
              </ul>
            </div>

            {/* Column 4: Get the App */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="font-semibold mb-1 text-white text-sm">Get the App</h3>
              <p className="text-slate-400 text-xs mb-3">
                Android app available now. iOS coming soon.
              </p>
              <div className="space-y-1.5">
                <a href="https://drive.google.com/file/d/1N2daMqPWoG8WSxvoNEUCMpKhMdFsiJP4/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#02988C] hover:bg-[#028a7f] px-3 py-2 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M3 20.5V3.5c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35z"/>
                    <path fill="#34A853" d="m13.69 12 3.49-3.49 1.38.8c.7.4.7 1.08 0 1.48l-1.38.8-3.49 3.49V12z"/>
                    <path fill="#FBBC05" d="M3.84 2.15 13.69 12l-9.85 9.85c.5.24 1.11.08 1.35-.84l8.5-8.5-8.5-8.5c-.24-.92-.85-1.08-1.35-.86z"/>
                    <path fill="#EA4335" d="m17.18 8.51-3.49 3.49 3.49 3.49 1.38-.8c.7-.4.7-1.08 0-1.48l-1.38-.8 1.38-.8c.7-.4.7-1.08 0-1.48l-1.38-.62z"/>
                  </svg>
                  <div>
                    <span className="text-xs text-white font-bold block">Download for Android</span>
                    <span className="text-[10px] text-green-200">Free APK — Available Now</span>
                  </div>
                </a>
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg opacity-60 cursor-not-allowed">
                  <Apple className="w-4 h-4 text-white" />
                  <div>
                    <span className="text-xs text-white font-medium block">App Store</span>
                    <span className="text-[10px] text-slate-400">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
            </div>

          <div className="mt-4 pt-4 border-t border-slate-700 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} Suttain. All rights reserved.
          </div>
        </div>
      </footer>
          )}
      
      {/* Bottom Navigation Bar - Mobile Only */}
      {user && <BottomNavBar />}


      
      {/* User Acknowledgement Modal */}
      <React.Suspense fallback={null}>
        {showAcknowledgementModal && (
          <UserAcknowledgementModal
            isOpen={showAcknowledgementModal}
            onAccept={handleAcceptAcknowledgement}
            onClose={handleDeclineAcknowledgement}
          />
        )}
      </React.Suspense>
    </div>
  );
}