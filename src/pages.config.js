import AboutUs from './pages/AboutUs';
import ActivityHistory from './pages/ActivityHistory';
import AdminDashboard from './pages/AdminDashboard';
import BarcodeScanner from './pages/BarcodeScanner';
import BookADemo from './pages/BookADemo';
import BookDemo from './pages/BookDemo';
import Careers from './pages/Careers';
import Collaboration from './pages/Collaboration';
import CommunityReviews from './pages/CommunityReviews';
import ComplianceCoPilot from './pages/ComplianceCoPilot';
import ComplianceGuide from './pages/ComplianceGuide';
import EnterpriseAPI from './pages/EnterpriseAPI';
import FAQ from './pages/FAQ';
import Feedback from './pages/Feedback';
import FormulaHistory from './pages/FormulaHistory';
import Home from './pages/Home';
import IngredientTrends from './pages/IngredientTrends';
import LearningSuite from './pages/LearningSuite';
import PersonalizedSafety from './pages/PersonalizedSafety';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import ReviewRewards from './pages/ReviewRewards';
import Settings from './pages/Settings';
import Simulator from './pages/Simulator';
import Sustainability from './pages/Sustainability';
import TermsOfService from './pages/TermsOfService';
import generator from './pages/generator';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "ActivityHistory": ActivityHistory,
    "AdminDashboard": AdminDashboard,
    "BarcodeScanner": BarcodeScanner,
    "BookADemo": BookADemo,
    "BookDemo": BookDemo,
    "Careers": Careers,
    "Collaboration": Collaboration,
    "CommunityReviews": CommunityReviews,
    "ComplianceCoPilot": ComplianceCoPilot,
    "ComplianceGuide": ComplianceGuide,
    "EnterpriseAPI": EnterpriseAPI,
    "FAQ": FAQ,
    "Feedback": Feedback,
    "FormulaHistory": FormulaHistory,
    "Home": Home,
    "IngredientTrends": IngredientTrends,
    "LearningSuite": LearningSuite,
    "PersonalizedSafety": PersonalizedSafety,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "ReviewRewards": ReviewRewards,
    "Settings": Settings,
    "Simulator": Simulator,
    "Sustainability": Sustainability,
    "TermsOfService": TermsOfService,
    "generator": generator,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};