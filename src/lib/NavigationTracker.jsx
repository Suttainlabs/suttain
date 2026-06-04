import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';
import { trackVisitor } from '@/functions/trackVisitor';
import { visitorHeartbeat } from '@/functions/visitorHeartbeat';
import { pagesConfig } from '@/pages.config';

const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const sessionTrackedRef = useRef(false);
    const heartbeatRef = useRef(null);
    const currentPageRef = useRef(location.pathname);
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Keep currentPageRef in sync with navigation
    useEffect(() => {
        currentPageRef.current = location.pathname;
    }, [location.pathname]);

    // Log user activity when navigating to a page
    useEffect(() => {
        const pathname = location.pathname;
        let pageName;

        if (pathname === '/' || pathname === '') {
            pageName = mainPageKey;
        } else {
            const pathSegment = pathname.replace(/^\//, '').split('/')[0];
            const pageKeys = Object.keys(Pages);
            const matchedKey = pageKeys.find(
                key => key.toLowerCase() === pathSegment.toLowerCase()
            );
            pageName = matchedKey || null;
        }

        if (isAuthenticated && pageName) {
            base44.appLogs.logUserInApp(pageName).catch(() => {});
        }

        // Get or create session ID
        let sessionId = sessionStorage.getItem('suttain_session_id');
        if (!sessionId) {
            sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
            sessionStorage.setItem('suttain_session_id', sessionId);
        }

        // Track visitor geo on first load
        if (!sessionTrackedRef.current) {
            sessionTrackedRef.current = true;
            trackVisitor({ session_id: sessionId, page: pathname }).catch(() => {});
        }

        // Send immediate heartbeat on every page change
        visitorHeartbeat({ session_id: sessionId, current_page: pathname }).catch(() => {});

        // Clear old heartbeat interval and start fresh
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        heartbeatRef.current = setInterval(() => {
            visitorHeartbeat({
                session_id: sessionId,
                current_page: currentPageRef.current
            }).catch(() => {});
        }, HEARTBEAT_INTERVAL_MS);

        return () => {
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        };
    }, [location, isAuthenticated, Pages, mainPageKey]);

    return null;
}