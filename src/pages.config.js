import Simulator from './pages/Simulator';
import Feedback from './pages/Feedback';
import FAQ from './pages/FAQ';
import CommunityReviews from './pages/CommunityReviews';
import Home from './pages/Home';
import ReviewRewards from './pages/ReviewRewards';
import Profile from './pages/Profile';
import FormulaHistory from './pages/FormulaHistory';
import BookDemo from './pages/BookDemo';
import BookADemo from './pages/BookADemo';
import BarcodeScanner from './pages/BarcodeScanner';
import ComplianceCoPilot from './pages/ComplianceCoPilot';
import PersonalizedSafety from './pages/PersonalizedSafety';
import Sustainability from './pages/Sustainability';
import EnterpriseAPI from './pages/EnterpriseAPI';
import AdminDashboard from './pages/AdminDashboard';
import generator from './pages/generator';
import Careers from './pages/Careers';
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ComplianceGuide from './pages/ComplianceGuide';
import IngredientTrends from './pages/IngredientTrends';
import Settings from './pages/Settings';
import LearningSuite from './pages/LearningSuite';
import Collaboration from './pages/Collaboration';
import Pricing from './pages/Pricing';
import ActivityHistory from './pages/ActivityHistory';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Simulator": Simulator,
    "Feedback": Feedback,
    "FAQ": FAQ,
    "CommunityReviews": CommunityReviews,
    "Home": Home,
    "ReviewRewards": ReviewRewards,
    "Profile": Profile,
    "FormulaHistory": FormulaHistory,
    "BookDemo": BookDemo,
    "BookADemo": BookADemo,
    "BarcodeScanner": BarcodeScanner,
    "ComplianceCoPilot": ComplianceCoPilot,
    "PersonalizedSafety": PersonalizedSafety,
    "Sustainability": Sustainability,
    "EnterpriseAPI": EnterpriseAPI,
    "AdminDashboard": AdminDashboard,
    "generator": generator,
    "Careers": Careers,
    "AboutUs": AboutUs,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
    "ComplianceGuide": ComplianceGuide,
    "IngredientTrends": IngredientTrends,
    "Settings": Settings,
    "LearningSuite": LearningSuite,
    "Collaboration": Collaboration,
    "Pricing": Pricing,
    "ActivityHistory": ActivityHistory,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};