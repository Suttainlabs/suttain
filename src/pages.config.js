/**
 * pages.config.js - Page routing configuration
 *
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * The mainPage value controls which page is the landing page. Note: the
 * public landing route ("/") is handled explicitly in App.jsx (LandingHub).
 */
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/AdminDashboard';
import BarcodeScanner from './pages/BarcodeScanner';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import ComplianceGuide from './pages/ComplianceGuide';
import ExternalDatabases from './pages/ExternalDatabases';
import FAQ from './pages/FAQ';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import ReviewRewards from './pages/ReviewRewards';
import Settings from './pages/Settings';
import Simulator from './pages/Simulator';
import TermsOfService from './pages/TermsOfService';
import generator from './pages/generator';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "AdminDashboard": AdminDashboard,
    "BarcodeScanner": BarcodeScanner,
    "Blog": Blog,
    "Careers": Careers,
    "ComplianceGuide": ComplianceGuide,
    "ExternalDatabases": ExternalDatabases,
    "FAQ": FAQ,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "ReviewRewards": ReviewRewards,
    "Settings": Settings,
    "Simulator": Simulator,
    "TermsOfService": TermsOfService,
    "generator": generator,
}

export const pagesConfig = {
    mainPage: "AboutUs",
    Pages: PAGES,
    Layout: __Layout,
};