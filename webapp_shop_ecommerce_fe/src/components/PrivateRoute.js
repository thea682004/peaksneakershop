import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';

/**
 * PrivateRoute component - protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export default function PrivateRoute({ children }) {
    const location = useLocation();

    if (!isAuthenticated()) {
        // Redirect to login page, but save the location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
