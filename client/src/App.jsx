import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import FoodTasting from './pages/client/FoodTasting';
import ClientDashboard from './pages/client/ClientDashboard';
import Login from './pages/Login';
import DashboardClient from './pages/DashboardClient';
import DashboardOps from './pages/DashboardOps';
import DashboardAdmin from './pages/DashboardAdmin';
import BookingWizard from './pages/client/BookingWizard';
import ClientOverview from './pages/client/ClientOverview';
import Payments from './pages/client/Payments';
import PaymentPage from './pages/client/PaymentPage';
import MenuGallery from './pages/client/MenuGallery';
import DashboardFinance from './pages/DashboardFinance';
import ClientLayout from './components/layout/ClientLayout';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard if they try to access unauthorized route
        const rolePath = {
            'Client': '/dashboard/client',
            'Operations': '/dashboard/ops',
            'Admin': '/dashboard/admin',
            'SuperAdmin': '/dashboard/admin',
            'Finance': '/dashboard/finance'
        };
        return <Navigate to={rolePath[user.role] || '/login'} replace />;
    }

    return <Outlet />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />

                    {/* Client Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Client']} />}>
                        <Route element={<ClientLayout />}>
                            <Route path="/dashboard/client" element={<ClientDashboard />} />
                            <Route path="/food-tasting" element={<FoodTasting />} />
                            <Route path="/book" element={<BookingWizard />} />
                            <Route path="/menu" element={<MenuGallery />} />
                            <Route path="/pay" element={<PaymentPage />} />
                        </Route>
                    </Route>

                    {/* Ops Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Operations', 'Admin', 'SuperAdmin']} />}>
                        <Route path="/dashboard/ops" element={<DashboardOps />} />
                    </Route>

                    {/* Finance Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Finance']} />}>
                        <Route path="/dashboard/finance" element={<DashboardFinance />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']} />}>
                        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
