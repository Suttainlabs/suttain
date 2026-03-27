import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, TestTube, Atom, Menu, X, HelpCircle, LogIn, UserPlus, ChevronDown, LogOut, Sparkles, MessageSquare, User as UserIcon, QrCode, CalendarCheck, Gem, ShieldCheck, HeartPulse, Leaf, AppWindow, LayoutDashboard, Star, Linkedin, Instagram, Youtube, Apple, Building2, Briefcase, Bell, GraduationCap, BookOpen } from "lucide-react";
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
import { useQuery } from '@tanstack/react-query';
import useTrialStatus from './hooks/useTrialStatus';
import TrialBadge from './components/trial/TrialBadge';

// Import components with error boundaries
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
    setIsAuthLoading(true); // Set loading to true
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setCurrentGreeting(getGreetingText(currentUser));
      // Set trial_start_date if not already set
      if (currentUser && !currentUser.trial_start_date) {
        try {
          await User.updateMyUserData({ trial_start_date: new Date().toISOString(), subscription_plan: currentUser.subscription_plan || 'trial' });
        } catch (e) {
          console.error('Failed to set trial start date:', e);
        }
      }
      if (currentUser && currentUser.first_login) {
        setShowAcknowledgementModal(true);
        // Send admin notification for new user signup
        try {
          await base44.integrations.Core.SendEmail({
            to: 'contact@suttain.com',
            subject: 'New User Signup on Suttain',
            body: `A new user has signed up on Suttain!\n\nName: ${currentUser.full_name || 'N/A'}\nEmail: ${currentUser.email}\nDate: ${new Date().toLocaleString()}\n\nLog in to your admin dashboard to view more details.`
          });
        } catch (emailErr) {
          console.error('Failed to send admin notification:', emailErr);
        }
      }
    } catch (error) {
      setUser(null);
      setCurrentGreeting('');
    } finally {
      setIsAuthLoading(false); // Set loading to false regardless of success or failure
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
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const navLinks = [
    { href: "Home", label: "Home", icon: Home },
  ];

  const companyMenuItems = [
    { href: "AboutUs", label: "About Us", icon: Building2, description: "Learn about our mission and team" },
    { href: "Careers", label: "Careers", icon: Briefcase, description: "View open positions and join us" },
    { href: "Blog", label: "Blog", icon: BookOpen, description: "Read our latest articles and insights" }
  ];

  const helpMenuItems = [
    { href: "LearningSuite", label: "Learning Center", icon: GraduationCap, description: "Tutorials, guides, and knowledge base" },
    { href: "BookADemo", label: "Book a Demo", icon: CalendarCheck, description: "Schedule a live demo with our team" },
    { href: "FAQ", label: "FAQs & Contact", icon: HelpCircle, description: "Get answers and reach out to us" },
    { href: "CommunityReviews", label: "Community Reviews", icon: MessageSquare, description: "See what others are saying" },
  ];

  const productSuiteItems = [
    { href: "Simulator", label: "Chemical Simulator", icon: TestTube, description: "Safety analysis, compliance & sustainability built in", type: 'product' },
    { href: "generator", label: "Formula Generator", icon: Atom, description: "Create formulas with safety, compliance & eco scoring", type: 'product' },
    { href: "BarcodeScanner", label: "Quick Scan", icon: QrCode, description: "Scan products for full safety & eco analysis", type: 'product' },
    { type: 'separator' },
    { href: "EnterpriseAPI", label: "Enterprise API Access", icon: AppWindow, description: "Integrate Suttain into your enterprise systems", type: 'premium', status: 'coming_soon' },
  ];


  const getLinkClasses = (href) => {
    const isActive = location.pathname === createPageUrl(href);
    return `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-semibold text-sm ${
      isActive
        ? "bg-violet-100 text-violet-600"
        : "text-slate-700 hover:bg-violet-50 hover:text-violet-600"
    }`;
  };

  // Updated active state checks
  const isCompanyMenuActive = companyMenuItems.some(item => location.pathname === createPageUrl(item.href));
  const isProductSuiteActive = productSuiteItems.some(tool => tool.href && location.pathname === createPageUrl(tool.href));
  const isHelpToolActive = helpMenuItems.some(item => location.pathname === createPageUrl(item.href));


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
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --suttain-teal: #02988C;
          --suttain-blue: #09D2FF;
          --suttain-violet: #9531F5;
          --suttain-dark: #1e293b;
          --suttain-text: #475569;
          --light-background: #f8fafc;
          --warning-orange: #f97316;
          --success-green: #22c55e;
        }

        body {
          font-family: var(--font-gilroy, 'Gilroy', sans-serif);
          background-color: var(--light-background);
          color: var(--suttain-text);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        h1, h2, h3, h4, h5, h6, .font-heading {
          font-family: var(--font-gilroy, 'Gilroy', sans-serif);
          font-weight: 700;
          color: var(--suttain-dark);
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
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/804622166_PNG1.png"
                alt="Suttain"
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} to={createPageUrl(href)} className={getLinkClasses(href)}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}

              {/* Company Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-sm ${
                    isCompanyMenuActive
                      ? "bg-rose-100 text-rose-600"
                      : "text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                  }`}>
                    <Building2 className="w-4 h-4" />
                    <span>Company</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {companyMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={createPageUrl(item.href)} className="flex items-start gap-3 p-3">
                        <div className="w-8 h-8 bg-[var(--suttain-teal)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-suttain-dark text-sm">{item.label}</p>
                          <p className="text-xs text-suttain-text/80">{item.description}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help & Support Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-sm ${
                    isHelpToolActive
                      ? "bg-purple-100 text-purple-600"
                      : "text-slate-700 hover:bg-purple-50 hover:text-purple-600"
                  }`}>
                    <HelpCircle className="w-4 h-4" />
                    <span>Help</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {helpMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={createPageUrl(item.href)} className="flex items-start gap-3 p-3">
                        <div className="w-8 h-8 bg-[var(--suttain-violet)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-suttain-dark text-sm">{item.label}</p>
                          <p className="text-xs text-suttain-text/80">{item.description}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Combined Product Suite Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-sm ${
                    isProductSuiteActive 
                      ? "bg-cyan-100 text-cyan-600"
                      : "text-slate-700 hover:bg-cyan-50 hover:text-cyan-600"
                  }`}>
                    <AppWindow className="w-4 h-4" />
                    <span>Tools</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {productSuiteItems.map((item, index) => {
                    if (item.type === 'separator') {
                      return <DropdownMenuSeparator key={index} className="my-2" />;
                    }
                    if (item.type === 'header') {
                      return (
                        <DropdownMenuLabel key={index} className="px-3 py-2 text-xs font-semibold text-purple-800 bg-purple-50/60 flex items-center gap-2">
                           <item.icon className="w-4 h-4" />
                           {item.label}
                        </DropdownMenuLabel>
                      );
                    }
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link to={createPageUrl(item.href)} className="flex items-start gap-3 p-3">
                           <div className={`w-8 h-8 ${item.type === 'premium' ? 'bg-[var(--suttain-violet)]' : 'bg-[var(--suttain-teal)]'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <item.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-suttain-dark text-sm">{item.label}</p>
                              {item.type === 'premium' && (
                                <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-[var(--suttain-violet)] rounded font-medium">
                                  {item.status === 'coming_soon' ? 'Soon' : 'Premium'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-suttain-text/80">{item.description}</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Auth Buttons / User Menu */}
            <div className="flex items-center gap-3">
              {!isAuthLoading && user && (
                <div className="hidden md:flex items-center gap-3">
                  {/* Trial Status Badge */}
                  <TrialBadge trialStatus={trialStatus} />
                  {/* Notification Bell */}
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-lg px-3 py-1.5">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-800 font-semibold text-sm">
                      {user.reward_points || 0}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-600 leading-tight">
                      {currentGreeting}
                    </div>
                  </div>
                </div>
              )}
              {!isAuthLoading ? ( // Conditionally render auth buttons or user menu only when not loading
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 text-suttain-dark/90 px-2 py-1 h-10 hover:bg-slate-100">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                           {user.profile_image_url ? (
                             <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500">
                               <UserIcon className="w-4 h-4 text-white" />
                             </div>
                           )}
                        </div>
                        <div className="hidden lg:block text-left">
                          <div className="font-semibold text-sm leading-tight">{(user.display_name || user.full_name || 'Account').split(' ')[0]}</div>
                        </div>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2 border-b">
                        <p className="font-semibold text-sm">{user.display_name || user.full_name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("Profile")} className="cursor-pointer">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          My Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("ReviewRewards")} className="cursor-pointer">
                          <Sparkles className="w-4 h-4 mr-2" />
                          My Rewards
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
                  <div className="hidden md:flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAuthModal("login")}
                      className="text-suttain-dark/80 hover:text-suttain-dark"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openAuthModal("signup")}
                      className="btn-primary"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up
                    </Button>
                  </div>
                )
              ) : (
                // Optionally show a loading indicator or nothing while auth status is being fetched
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-20 h-10 bg-slate-100 rounded-md animate-pulse"></div>
                  <div className="w-24 h-10 bg-slate-100 rounded-md animate-pulse"></div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
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
                className="flex-1 flex flex-col justify-between p-4"
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
              >
                <nav className="flex flex-col gap-2">
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


                  {/* Help & Support Mobile Collapsible */}
                  <motion.div variants={mobileNavItemVariants}>
                    <button
                      onClick={() => setIsHelpMenuConsistency(!isHelpMenuOpen)}
                      className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors text-suttain-dark hover:bg-purple-50 ${
                        isHelpToolActive ? 'bg-purple-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <HelpCircle className="w-5 h-5" />
                        Help & Support
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isHelpMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isHelpMenuOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="pl-6 pt-2 flex flex-col gap-2"
                        >
                          {helpMenuItems.map(({ href, label, icon: Icon }) => (
                             <Link
                              key={href}
                              to={createPageUrl(href)}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors ${
                                location.pathname === createPageUrl(href)
                                  ? "bg-purple-100 text-purple-600"
                                  : "text-suttain-dark hover:bg-purple-50"
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

                  {/* Combined Product Suite Collapsible */}
                  <motion.div variants={mobileNavItemVariants}>
                    <button
                      onClick={() => setIsProductSuiteOpen(!isProductSuiteOpen)}
                      className={`w-full flex items-center justify-between gap-4 px-4 py-3 text-base font-semibold rounded-lg transition-colors text-suttain-dark hover:bg-cyan-50 ${
                        isProductSuiteActive ? 'bg-cyan-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <AppWindow className="w-5 h-5" />
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
                          className="pl-6 pt-2 flex flex-col gap-2 overflow-hidden"
                        >
                          {productSuiteItems.map((item) => {
                             if (item.type === 'separator' || item.type === 'header') return null;
                             return (
                               <Link
                                key={item.href}
                                to={createPageUrl(item.href)}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                                  location.pathname === createPageUrl(item.href)
                                    ? "bg-cyan-100 text-cyan-600"
                                    : "text-suttain-dark hover:bg-cyan-50"
                                }`}
                              >
                                <item.icon className={`w-4 h-4 flex-shrink-0 ${item.type === 'premium' ? 'text-[var(--suttain-violet)]' : ''}`} />
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.type === 'premium' && (
                                  <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-[var(--suttain-violet)] rounded font-medium flex-shrink-0">
                                    {item.status === 'coming_soon' ? 'Soon' : 'Premium'}
                                  </span>
                                )}
                              </Link>
                             )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </nav>

                {/* Mobile Auth Section */}
                <div className="border-t border-slate-200 pt-4">
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
                          className="w-full justify-center text-base font-semibold btn-primary py-3"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Sign Up
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
      
      {/* Footer - Hidden on Dashboard/Profile page */}
      {currentPageName !== 'Profile' && (
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
              <p className="text-slate-400 text-xs leading-relaxed">
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
              </div>
            </div>

            {/* Column 2: Platform */}
            <div>
              <ul className="space-y-1.5 text-xs">
                <li><Link to={createPageUrl('Simulator')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Chemical Simulator</Link></li>
                <li><Link to={createPageUrl('generator')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Formula Generator</Link></li>
                <li><Link to={createPageUrl('AboutUs')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">About Us</Link></li>
                <li><Link to={createPageUrl('FAQ')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Help & FAQ</Link></li>
                <li><Link to={createPageUrl('Careers')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Careers</Link></li>
                <li><Link to={createPageUrl('Blog')} className="text-slate-300 hover:text-[var(--suttain-teal)] transition-colors">Blog</Link></li>
                </ul>
                </div>

                {/* Column 3: Legal */}
            <div>
              <ul className="space-y-1.5 text-xs">
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
                Coming soon to iOS and Android.
              </p>
              <div className="space-y-1.5">
                <a href="#" className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors">
                  <Apple className="w-4 h-4 text-white" />
                  <span className="text-xs text-white font-medium">App Store</span>
                </a>
                <a href="#" className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M3 20.5V3.5c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35z"/>
                    <path fill="#34A853" d="m13.69 12 3.49-3.49 1.38.8c.7.4.7 1.08 0 1.48l-1.38.8-3.49 3.49V12z"/>
                    <path fill="#FBBC05" d="M3.84 2.15 13.69 12l-9.85 9.85c.5.24 1.11.08 1.35-.84l8.5-8.5-8.5-8.5c-.24-.92-.85-1.08-1.35-.86z"/>
                    <path fill="#EA4335" d="m17.18 8.51-3.49 3.49 3.49 3.49 1.38-.8c.7-.4.7-1.08 0-1.48l-1.38-.8 1.38-.8c.7-.4.7-1.08 0-1.48l-1.38-.62z"/>
                  </svg>
                  <span className="text-xs text-white font-medium">Google Play</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700 text-center text-slate-400 text-xs">
            © {new Date().getFullYear()} Suttain. All rights reserved.
          </div>
          </div>
          </footer>
          )}
      
      {/* Bottom Navigation Bar - Mobile Only */}
      {user && <BottomNavBar />}

      {/* Auth Modal */}
      <React.Suspense fallback={null}>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            mode={authMode}
            onSuccess={() => {
              setShowAuthModal(false);
              fetchUserAndSetState();
            }}
          />
        )}
      </React.Suspense>
      
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