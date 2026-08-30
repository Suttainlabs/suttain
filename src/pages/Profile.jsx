import { Navigate } from 'react-router-dom';

// /Profile consolidates onto /Dashboard (both previously rendered ProfilePage).
export default function Profile() {
    return <Navigate to="/Dashboard" replace />;
}