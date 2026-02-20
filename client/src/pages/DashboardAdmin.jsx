import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardAdmin = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold font-display text-white">Eloquente Admin</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-300 mr-4">{user?.username}</span>
                            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Placeholder Cards */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">₱450k</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Active Inquiries</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">8</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Confirmed Bookings</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">12</dd>
                        </div>
                    </div>
                </div>

                <div className="mt-8 px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                        <h2 className="text-2xl font-semibold text-gray-400">Management & Sales Analytics</h2>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardAdmin;
