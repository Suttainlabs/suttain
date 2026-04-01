import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/shared/PageTransition'
import { Suspense, lazy } from 'react'
const IngredientDatabase = lazy(() => import('./pages/IngredientDatabase'));
const MyAnalytics = lazy(() => import('./pages/MyAnalytics'));
const ComputationalSimulation = lazy(() => import('./pages/ComputationalSimulation'));
const FormulaComparison = lazy(() => import('./pages/FormulaComparison'));
const BatchSimulation = lazy(() => import('./pages/BatchSimulation'));
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
// IngredientDatabase and FormulaComparison are lazy-loaded above
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <PageTransition><MainPage /></PageTransition>
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <PageTransition><Page /></PageTransition>
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/IngredientDatabase" element={<LayoutWrapper currentPageName="IngredientDatabase"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><IngredientDatabase /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/FormulaComparison" element={<LayoutWrapper currentPageName="FormulaComparison"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><FormulaComparison /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/MyAnalytics" element={<LayoutWrapper currentPageName="MyAnalytics"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><MyAnalytics /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/ComputationalSimulation" element={<LayoutWrapper currentPageName="ComputationalSimulation"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><ComputationalSimulation /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/BatchSimulation" element={<LayoutWrapper currentPageName="BatchSimulation"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><BatchSimulation /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </AnimatePresence>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App