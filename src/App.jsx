import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/shared/PageTransition'
import { Suspense, lazy } from 'react'
const ComputationalSimulation = lazy(() => import('./pages/ComputationalSimulation'));
const FormulaComparison = lazy(() => import('./pages/FormulaComparison'));
const BatchSimulation = lazy(() => import('./pages/BatchSimulation'));
const SimulationComparison = lazy(() => import('./pages/SimulationComparison'));
const Workspace = lazy(() => import('./pages/Workspace'));
const CompareIngredients = lazy(() => import('./pages/CompareIngredients'));
const BulkScan = lazy(() => import('./pages/BulkScan'));
const SustainabilityImpact = lazy(() => import('./pages/SustainabilityImpact'));
const ComparativeImpactReport = lazy(() => import('./pages/ComparativeImpactReport'));
const SimulationEngine = lazy(() => import('./pages/SimulationEngine'));
const HPCJobManagement = lazy(() => import('./pages/HPCJobManagement'));
const JobQueueMonitor = lazy(() => import('./pages/JobQueueMonitor'));
const StructureComparison = lazy(() => import('./pages/StructureComparison'));
const SimulationDashboard = lazy(() => import('./pages/SimulationDashboard'));
const SimulationSettings = lazy(() => import('./pages/SimulationSettings'));
const MobileScan = lazy(() => import('./pages/MobileScan'));
const SupplierVerify = lazy(() => import('./pages/SupplierVerify'));
const ImpactDashboard = lazy(() => import('./pages/ImpactDashboard'));
const MolecularVisualization = lazy(() => import('./pages/MolecularVisualization'));
const SimulationQueueManager = lazy(() => import('./pages/SimulationQueueManager'));
const SimulationProductivity = lazy(() => import('./pages/SimulationProductivity'));
const SimulationSandbox = lazy(() => import('./pages/SimulationSandbox'));
const SDSAnalyzer = lazy(() => import('./pages/SDSAnalyzer'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FormulaBuilder = lazy(() => import('./pages/FormulaBuilder'));
const FormulaResults = lazy(() => import('./pages/FormulaResults'));
const IngredientSubstitution = lazy(() => import('./pages/IngredientSubstitution'));
const ReportGenerator = lazy(() => import('./pages/ReportGenerator'));
const CarbonTaxSimulator = lazy(() => import('./pages/CarbonTaxSimulator'));
const CarbonOpportunitySimulator = lazy(() => import('./pages/CarbonOpportunitySimulator'));
const FormulaPortfolio = lazy(() => import('./pages/FormulaPortfolio'));
const SimulationRunner = lazy(() => import('./pages/SimulationRunner'));
const DWSIMIntegration = lazy(() => import('./pages/DWSIMIntegration'));
const SimulationHistory = lazy(() => import('./pages/SimulationHistory'));
const SharedSimulationView = lazy(() => import('./pages/SharedSimulationView'));
const BillingDashboard = lazy(() => import('./pages/BillingDashboard'));
const MolecularIntelligence = lazy(() => import('./pages/MolecularIntelligence'));
const ChemicalDashboard = lazy(() => import('./pages/ChemicalDashboard'));
const InventoryDashboard = lazy(() => import('./pages/InventoryDashboard'));
const MoleculeExplorer = lazy(() => import('./pages/MoleculeExplorer'));
const MoleculeAnalysis = lazy(() => import('./pages/MoleculeAnalysis'));
const ResearchPortal = lazy(() => import('./pages/ResearchPortal'));
const ResearchDashboard = lazy(() => import('./pages/ResearchDashboard'));
const APIPortal = lazy(() => import('./pages/APIPortal'));
const ChemicalComparison = lazy(() => import('./pages/ChemicalComparison'));
const StructuralBiology = lazy(() => import('./pages/StructuralBiology'));
const ComputationalStudio = lazy(() => import('./pages/ComputationalStudio'));
const ComputationalStudioProteins = lazy(() => import('./pages/ComputationalStudioProteins'));
const ComputationalStudioSmallMolecules = lazy(() => import('./pages/ComputationalStudioSmallMolecules'));
const ComputationalStudioMaterials = lazy(() => import('./pages/ComputationalStudioMaterials'));
const ComputationalStudioHazardSafety = lazy(() => import('./pages/ComputationalStudioHazardSafety'));
const HazardEngine = lazy(() => import('./pages/HazardEngine'));
const ComputationalStudioJobs = lazy(() => import('./pages/ComputationalStudioJobs'));
const ComputationalStudioSimulations = lazy(() => import('./pages/ComputationalStudioSimulations'));
const ChemicalLibrary = lazy(() => import('./pages/ChemicalLibrary'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const LandingHub = lazy(() => import('./pages/LandingHub'));
const ApproveSimulation = lazy(() => import('./pages/ApproveSimulation'));

const BatchRecords = lazy(() => import('./pages/BatchRecords'));
const InteractionVisualization = lazy(() => import('./pages/InteractionVisualization'));
const EnterpriseAPI = lazy(() => import('./pages/EnterpriseAPI'));
// Import auth pages directly (not from pagesConfig which may not have them)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResearchGuard from '@/components/research/ResearchGuard';
import { LanguageProvider } from '@/components/i18n/LanguageContext';
import DomTranslator from '@/components/i18n/DomTranslator';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Only block on loading for a short window; never block public pages
  const isPublicRoute = location.pathname === '/'
    || location.pathname === '/enterprise'
    || location.pathname === '/EnterpriseAPI'
    || location.pathname === '/APIPortal'
    || location.pathname === '/ApproveSimulation';

  // Check if on auth routes — never redirect these
  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  if (!isPublicRoute && !isAuthRoute && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors — but never on auth pages
  if (authError) {
    if (authError.type === 'user_not_registered' && !isAuthRoute) {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required' && !isAuthRoute) {
      navigateToLogin();
      return null;
    }
    // For unknown errors on auth routes, fall through and render them anyway
  }

  // Render the main app
  return (
    <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={
        <LayoutWrapper currentPageName="Home">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><LandingHub /></PageTransition></Suspense>
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
      <Route path="/AboutUs" element={<LayoutWrapper currentPageName="AboutUs"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><AboutUs /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/ResearchLanding" element={<Navigate to="/ResearchPortal" replace />} />
      <Route path="/Generator" element={<Navigate to="/generator" replace />} />
      <Route path="/FormulaComparison" element={<LayoutWrapper currentPageName="FormulaComparison"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><FormulaComparison /></PageTransition></Suspense></LayoutWrapper>} />

      {/* ── Auth Pages (outside Layout) ── */}
      <Route path="/login" element={<Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"/></div>}><Login /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"/></div>}><Register /></Suspense>} />
      <Route path="/forgot-password" element={<Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"/></div>}><ForgotPassword /></Suspense>} />
      <Route path="/reset-password" element={<Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"/></div>}><ResetPassword /></Suspense>} />

      {/* ── Redirects for deprecated routes ── */}
      <Route path="/research" element={<Navigate to="/ResearchPortal" replace />} />

      <Route path="/Home" element={<Navigate to="/" replace />} />
      <Route path="/MolecularIntelligence" element={<Navigate to="/MoleculeAnalysis" replace />} />
      <Route path="/MoleculeExplorer" element={<Navigate to="/MoleculeAnalysis" replace />} />
      <Route path="/ComputationalSimulation" element={<Navigate to="/ComputationalStudio/Simulations" replace />} />

      {/* ── Public marketing pages (no login required) ── */}
      <Route path="/enterprise" element={<Navigate to="/APIPortal" replace />} />
      <Route path="/EnterpriseAPI" element={<LayoutWrapper currentPageName="EnterpriseAPI"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><EnterpriseAPI /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/APIPortal" element={<LayoutWrapper currentPageName="APIPortal"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><APIPortal /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/ResearchPortal" element={<LayoutWrapper currentPageName="ResearchPortal"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><ResearchPortal /></PageTransition></Suspense></LayoutWrapper>} />


      {/* ── Protected Tools (consumer + research — require login) ── */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        {['Simulator', 'generator', 'BarcodeScanner',
          'MolecularIntelligence', 'MoleculeExplorer', 'MoleculeAnalysis', 'ChemicalDashboard', 'InventoryDashboard',
          'ResearchDashboard', 'ChemicalComparison', 'SDSAnalyzer',
          'SimulationEngine', 'ChemicalLibrary', 'StructuralBiology'
          ].map(path => {
          // Only premium Research features are hard-locked. Free-tier Research
          // (molecule analysis, explorer, intelligence, portal + dashboard) stays
          // open to all authenticated users per the "Research free" plan.
          const RESEARCH_PATHS = ['ChemicalDashboard','InventoryDashboard','ChemicalComparison','SimulationEngine','ChemicalLibrary','StructuralBiology'];
          const isResearch = RESEARCH_PATHS.includes(path);
          const Page = Pages[path];
          if (!Page) {
            const lazyMap = {
              MolecularIntelligence, MoleculeExplorer, MoleculeAnalysis, ChemicalDashboard, InventoryDashboard,
              ResearchPortal, ResearchDashboard, ChemicalComparison, SDSAnalyzer,
              ComputationalSimulation, SimulationEngine, ChemicalLibrary, StructuralBiology,
              Simulator: Pages['Simulator'], generator: Pages['generator'],
              BarcodeScanner: Pages['BarcodeScanner'],
            };
            const LazyPage = lazyMap[path];
            if (!LazyPage) return null;
            const content = <PageTransition><LazyPage /></PageTransition>;
            return <Route key={path} path={`/${path}`} element={<LayoutWrapper currentPageName={path}><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}>{isResearch ? <ResearchGuard>{content}</ResearchGuard> : content}</Suspense></LayoutWrapper>} />;
          }
          const content = <PageTransition><Page /></PageTransition>;
          return <Route key={path} path={`/${path}`} element={<LayoutWrapper currentPageName={path}>{isResearch ? <ResearchGuard>{content}</ResearchGuard> : content}</LayoutWrapper>} />;
        })}


        <Route path="/ComputationalStudio" element={<LayoutWrapper currentPageName="ComputationalStudio"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><ResearchGuard><PageTransition><ComputationalStudio /></PageTransition></ResearchGuard></Suspense></LayoutWrapper>} />
        <Route path="/ComputationalStudio/Simulations" element={<LayoutWrapper currentPageName="ComputationalStudioSimulations"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><ResearchGuard><PageTransition><ComputationalStudioSimulations /></PageTransition></ResearchGuard></Suspense></LayoutWrapper>} />
        <Route path="/ComputationalStudio/Proteins" element={<LayoutWrapper currentPageName="ComputationalStudioProteins"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><ResearchGuard><PageTransition><ComputationalStudioProteins /></PageTransition></ResearchGuard></Suspense></LayoutWrapper>} />
        <Route path="/ComputationalStudio/SmallMolecules" element={<LayoutWrapper currentPageName="ComputationalStudioSmallMolecules"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><ResearchGuard><PageTransition><ComputationalStudioSmallMolecules /></PageTransition></ResearchGuard></Suspense></LayoutWrapper>} />
        <Route path="/ComputationalStudio/Materials" element={<LayoutWrapper currentPageName="ComputationalStudioMaterials"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><ResearchGuard><PageTransition><ComputationalStudioMaterials /></PageTransition></ResearchGuard></Suspense></LayoutWrapper>} />
        <Route path="/ComputationalStudio/HazardSafety" element={<LayoutWrapper currentPageName="ComputationalStudioHazardSafety"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><ResearchGuard><PageTransition><ComputationalStudioHazardSafety /></PageTransition></ResearchGuard></Suspense></LayoutWrapper>} />
        <Route path="/HazardEngine" element={<LayoutWrapper currentPageName="HazardEngine"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><ResearchGuard><PageTransition><HazardEngine /></PageTransition></ResearchGuard></Suspense></LayoutWrapper>} />
        <Route path="/ComputationalStudio/Jobs" element={<LayoutWrapper currentPageName="ComputationalStudioJobs"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><ResearchGuard><PageTransition><ComputationalStudioJobs /></PageTransition></ResearchGuard></Suspense></LayoutWrapper>} />

      </Route>
      <Route path="/BatchSimulation" element={<LayoutWrapper currentPageName="BatchSimulation"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><BatchSimulation /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SimulationComparison" element={<LayoutWrapper currentPageName="SimulationComparison"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><SimulationComparison /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/Workspace" element={<LayoutWrapper currentPageName="Workspace"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><Workspace /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/CompareIngredients" element={<LayoutWrapper currentPageName="CompareIngredients"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><CompareIngredients /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/BulkScan" element={<LayoutWrapper currentPageName="BulkScan"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><BulkScan /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SustainabilityImpact" element={<LayoutWrapper currentPageName="SustainabilityImpact"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><SustainabilityImpact /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/ComparativeImpactReport" element={<LayoutWrapper currentPageName="ComparativeImpactReport"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><ComparativeImpactReport /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/HPCJobManagement" element={<LayoutWrapper currentPageName="HPCJobManagement"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><HPCJobManagement /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/JobQueueMonitor" element={<LayoutWrapper currentPageName="JobQueueMonitor"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><JobQueueMonitor /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/StructureComparison" element={<LayoutWrapper currentPageName="StructureComparison"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin"/></div>}><PageTransition><StructureComparison /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SimulationDashboard" element={<LayoutWrapper currentPageName="SimulationDashboard"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"/></div>}><PageTransition><SimulationDashboard /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SimulationSettings" element={<LayoutWrapper currentPageName="SimulationSettings"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><SimulationSettings /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/MobileScan" element={<Suspense fallback={<div className="fixed inset-0 bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-700 border-t-teal-400 rounded-full animate-spin"/></div>}><MobileScan /></Suspense>} />
      <Route path="/SupplierVerify" element={<Suspense fallback={<div className="fixed inset-0 bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><SupplierVerify /></Suspense>} />
      <Route path="/ImpactDashboard" element={<LayoutWrapper currentPageName="ImpactDashboard"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><ImpactDashboard /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/MolecularVisualization" element={<LayoutWrapper currentPageName="MolecularVisualization"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><MolecularVisualization /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SimulationQueueManager" element={<LayoutWrapper currentPageName="SimulationQueueManager"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><SimulationQueueManager /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SimulationProductivity" element={<LayoutWrapper currentPageName="SimulationProductivity"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-fuchsia-500 rounded-full animate-spin"/></div>}><PageTransition><SimulationProductivity /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SimulationSandbox" element={<Suspense fallback={<div className="fixed inset-0 bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-700 border-t-violet-400 rounded-full animate-spin"/></div>}><SimulationSandbox /></Suspense>} />

      <Route path="/Dashboard" element={<LayoutWrapper currentPageName="Dashboard"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><Dashboard /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/FormulaBuilder" element={<LayoutWrapper currentPageName="FormulaBuilder"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><FormulaBuilder /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/FormulaResults" element={<LayoutWrapper currentPageName="FormulaResults"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><FormulaResults /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/IngredientSubstitution" element={<LayoutWrapper currentPageName="IngredientSubstitution"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><IngredientSubstitution /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/ReportGenerator" element={<LayoutWrapper currentPageName="ReportGenerator"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><ReportGenerator /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/CarbonTaxSimulator" element={<LayoutWrapper currentPageName="CarbonTaxSimulator"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><CarbonTaxSimulator /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/CarbonOpportunitySimulator" element={<LayoutWrapper currentPageName="CarbonOpportunitySimulator"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><CarbonOpportunitySimulator /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/FormulaPortfolio" element={<LayoutWrapper currentPageName="FormulaPortfolio"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><FormulaPortfolio /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SimulationRunner" element={<LayoutWrapper currentPageName="SimulationRunner"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-violet-500 rounded-full animate-spin"/></div>}><PageTransition><SimulationRunner /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/DWSIMIntegration" element={<LayoutWrapper currentPageName="DWSIMIntegration"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><DWSIMIntegration /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SimulationHistory" element={<LayoutWrapper currentPageName="SimulationHistory"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><SimulationHistory /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/SharedSimulationView" element={<Suspense fallback={<div className="fixed inset-0 bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><SharedSimulationView /></Suspense>} />
      <Route path="/BillingDashboard" element={<LayoutWrapper currentPageName="BillingDashboard"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><BillingDashboard /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/BatchRecords" element={<LayoutWrapper currentPageName="BatchRecords"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><BatchRecords /></PageTransition></Suspense></LayoutWrapper>} />
      <Route path="/InteractionVisualization" element={<LayoutWrapper currentPageName="InteractionVisualization"><Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"/></div>}><PageTransition><InteractionVisualization /></PageTransition></Suspense></LayoutWrapper>} />

      <Route path="/ApproveSimulation" element={<Suspense fallback={<div className="fixed inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-[#02988C] rounded-full animate-spin"/></div>}><ApproveSimulation /></Suspense>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </AnimatePresence>
  );
};


function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
      <DomTranslator />
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App