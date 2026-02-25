import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PACKAGES, DISHES } from '../data/mockData';

const DashboardAdmin = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // ==========================================
    // EMPLOYEE MANAGEMENT STATE
    // ==========================================
    const [employees, setEmployees] = useState([]);
    const [empLoading, setEmpLoading] = useState(false);
    const [empModal, setEmpModal] = useState({ open: false, mode: 'add', data: null });
    const [empForm, setEmpForm] = useState({ username: '', password: '', role: 'Marketing', email: '', phone: '' });
    const [empFormLoading, setEmpFormLoading] = useState(false);

    // ==========================================
    // PRICING CONTROL STATE
    // ==========================================
    const [pricingOverrides, setPricingOverrides] = useState({});
    const [pricingLoading, setPricingLoading] = useState(false);

    // ==========================================
    // DISCOUNTS STATE
    // ==========================================
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [discountModal, setDiscountModal] = useState({ open: false, data: null });
    const [discountForm, setDiscountForm] = useState({ discount_type: 'fixed', discount_value: 0 });
    const [discountLoading, setDiscountLoading] = useState(false);

    // ==========================================
    // ANALYTICS STATE
    // ==========================================
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    // Toast notification
    const [toast, setToast] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (activeTab === 'employees') {
            fetchEmployees();
        } else if (activeTab === 'pricing') {
            fetchPricingOverrides();
        } else if (activeTab === 'overview') {
            fetchAnalytics();
        } else if (activeTab === 'discounts') {
            fetchBookings();
        }
    }, [activeTab]);

    const fetchEmployees = async () => {
        setEmpLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/admin/employees', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch employees", 'error');
        } finally {
            setEmpLoading(false);
        }
    };

    const fetchPricingOverrides = async () => {
        setPricingLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/pricing', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPricingOverrides(data.overrides || {});
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch pricing", 'error');
        } finally {
            setPricingLoading(false);
        }
    };

    const handlePricingUpdate = async (item_type, item_id, new_price) => {
        if (!new_price || isNaN(new_price) || new_price < 0) {
            return showToast("Invalid price amount", 'error');
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/admin/pricing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: `${item_type}_${item_id}`,
                    item_type,
                    item_id,
                    new_price: parseFloat(new_price)
                })
            });

            if (res.ok) {
                showToast("Price updated successfully");
                fetchPricingOverrides();
            } else {
                showToast("Failed to update price", 'error');
            }
        } catch (error) {
            console.error(error);
            showToast("Network error", 'error');
        }
    };

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/admin/analytics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/finance/bookings', { // Fetching from finance to get full booking data + total costs easily
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch bookings", 'error');
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleDiscountSubmit = async (e) => {
        e.preventDefault();
        setDiscountLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/admin/bookings/${discountModal.data.id}/discount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(discountForm)
            });

            if (res.ok) {
                showToast("Discount applied successfully");
                setDiscountModal({ open: false, data: null });
                fetchBookings();
            } else {
                showToast("Failed to apply discount", 'error');
            }
        } catch (error) {
            console.error(error);
            showToast("Network error", 'error');
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleEmpSubmit = async (e) => {
        e.preventDefault();
        setEmpFormLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = empModal.mode === 'add'
                ? 'http://localhost:3000/api/admin/employees'
                : `http://localhost:3000/api/admin/employees/${empModal.data.id}`;
            const method = empModal.mode === 'add' ? 'POST' : 'PUT';

            // Only send password if provided (for edits)
            const payload = { ...empForm };
            if (empModal.mode === 'edit' && !payload.password) {
                delete payload.password;
            }

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                showToast(`Employee ${empModal.mode === 'add' ? 'created' : 'updated'} successfully`);
                setEmpModal({ open: false, mode: 'add', data: null });
                fetchEmployees();
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to save employee", 'error');
            }
        } catch (error) {
            console.error(error);
            showToast("Network error", 'error');
        } finally {
            setEmpFormLoading(false);
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/api/admin/employees/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showToast("Employee deleted successfully");
                fetchEmployees();
            } else {
                showToast("Failed to delete employee", 'error');
            }
        } catch (error) {
            console.error(error);
            showToast("Network error", 'error');
        }
    };

    const openEmpModal = (mode, employee = null) => {
        if (mode === 'add') {
            setEmpForm({ username: '', password: '', role: 'Marketing', email: '', phone: '' });
        } else {
            setEmpForm({
                username: employee.username,
                password: '', // blank password for editing implies no change
                role: employee.role,
                email: employee.email || '',
                phone: employee.phone || ''
            });
        }
        setEmpModal({ open: true, mode, data: employee });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-gray-900 shadow-md flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            </div>
                            <h1 className="text-xl font-bold font-display text-white tracking-wide">Eloquente Superadmin</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs font-semibold text-gray-300 border border-gray-700">
                                {user?.username} (Top Admin)
                            </span>
                            <button onClick={handleLogout} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
                {/* Tabs */}
                <div className="mb-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                        <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            DSS Analytics
                        </button>
                        <button onClick={() => setActiveTab('employees')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'employees' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Employee Accounts (RBAC)
                        </button>
                        <button onClick={() => setActiveTab('pricing')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'pricing' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Global Pricing Config
                        </button>
                        <button onClick={() => setActiveTab('discounts')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'discounts' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            On-The-Fly Discounts
                        </button>
                    </nav>
                </div>

                {/* Tab Content: Analytics */}
                {activeTab === 'overview' && (
                    <div className="animate-fadeIn">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100">
                                <div className="px-5 py-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Total Revenue
                                    </dt>
                                    <dd className="mt-2 text-3xl font-extrabold text-gray-900">₱450k</dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100">
                                <div className="px-5 py-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        Active Inquiries
                                    </dt>
                                    <dd className="mt-2 text-3xl font-extrabold text-gray-900">8</dd>
                                </div>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-xl border border-gray-100">
                                <div className="px-5 py-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate flex items-center gap-2">
                                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Confirmed Bookings
                                    </dt>
                                    <dd className="mt-2 text-3xl font-extrabold text-gray-900">12</dd>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue Trends */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    Revenue Trends (Last 6 Months)
                                </h3>
                                <div className="h-64 flex items-end justify-between gap-2 overflow-hidden">
                                    {[35, 45, 30, 65, 85, 55].map((val, i) => (
                                        <div key={i} className="w-full h-full flex flex-col items-center justify-end gap-2 group">
                                            <div className="w-full bg-indigo-100 rounded-t-md relative flex items-end justify-center group-hover:bg-indigo-200 transition-colors" style={{ height: `${val}%` }}>
                                                <div className="absolute -top-8 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    ₱{val}0k
                                                </div>
                                                <div className="w-full bg-indigo-500 rounded-t-md opacity-70" style={{ height: `${val > 50 ? val - 20 : val}%` }}></div>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500">Month {i + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Market Intelligence: Top Sellers */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    Market Intelligence (Top Sellers)
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { name: 'Grand Wedding Package', count: 12, percent: 85, color: 'bg-green-500' },
                                        { name: 'Corporate Gala Standard', count: 8, percent: 60, color: 'bg-blue-500' },
                                        { name: 'Roasted Beef Carving (Add-on)', count: 15, percent: 95, color: 'bg-orange-500' },
                                        { name: 'Truffle Mushroom Pasta (Add-on)', count: 10, percent: 70, color: 'bg-purple-500' }
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-bold text-gray-700">{item.name}</span>
                                                <span className="text-gray-500 font-bold">{item.count} Bookings</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.percent}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Peak Season Heatmap Placeholder */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Peak Season Heatmap (Demand Intensity)
                                </h3>
                                <div className="grid grid-cols-6 md:grid-cols-12 gap-3 text-center text-xs">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
                                        // Mock heatmap logic
                                        const intensityMap = [2, 3, 5, 4, 8, 9, 6, 7, 5, 8, 10, 10];
                                        const val = intensityMap[i];
                                        const bgColor = val <= 3 ? 'bg-green-100 text-green-800' : val <= 6 ? 'bg-yellow-200 text-yellow-800' : val <= 8 ? 'bg-orange-300 text-orange-900' : 'bg-red-500 text-white font-bold shadow-sm';

                                        return (
                                            <div key={i} className={`flex flex-col items-center justify-center p-4 rounded-xl ${bgColor} transition-transform hover:scale-105 cursor-default`}>
                                                <span className="font-bold text-sm mb-1">{month}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 flex items-center justify-end gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 rounded"></div> Low</span>
                                    <span className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-200 rounded"></div> Med</span>
                                    <span className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-300 rounded"></div> High</span>
                                    <span className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded"></div> Peak</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Employees (RBAC) */}
                {activeTab === 'employees' && (
                    <div className="animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Personnel Roster</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage Marketing and Accounting staff accounts and sub-role accesses.</p>
                            </div>
                            <button onClick={() => openEmpModal('add')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add Employee
                            </button>
                        </div>

                        <div className="bg-white shadow overflow-hidden sm:rounded-xl border border-gray-100">
                            {empLoading ? (
                                <div className="p-8 text-center text-gray-500">Loading accounts...</div>
                            ) : employees.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">No employee accounts found.</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role Structure</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Details</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {employees.map(emp => (
                                            <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center text-indigo-700 font-bold">
                                                            {emp.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900">{emp.username}</div>
                                                            <div className="text-xs text-gray-400">Joined {new Date(emp.created_at).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${emp.role === 'Marketing' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                                                        {emp.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700">{emp.email || <span className="text-gray-400 italic">No email</span>}</div>
                                                    <div className="text-sm text-gray-500">{emp.phone || <span className="text-gray-400 italic">No phone</span>}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openEmpModal('edit', emp)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold">Edit</button>
                                                    <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-500 hover:text-red-700 font-semibold">Retire</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content: Pricing Config */}
                {activeTab === 'pricing' && (
                    <div className="animate-fadeIn">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Global Pricing Configuration</h2>
                            <p className="text-sm text-gray-500 mt-1">Set permanent price overrides for packages and menu items. This overrides the default catalog prices.</p>
                        </div>

                        {pricingLoading ? (
                            <div className="p-8 text-center text-gray-500">Loading pricing configuration...</div>
                        ) : (
                            <div className="space-y-8">
                                {/* Packages Pricing */}
                                <div className="bg-white shadow overflow-hidden rounded-xl border border-gray-100">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Event Packages (Per Head)</h3>
                                    </div>
                                    <div className="divide-y divide-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {PACKAGES.map(pkg => {
                                            const overrideId = `package_${pkg.id}`;
                                            const currentPrice = pricingOverrides[overrideId] !== undefined ? pricingOverrides[overrideId] : pkg.basePrice;

                                            return (
                                                <div key={pkg.id} className="p-5 border border-gray-200 rounded-xl relative hover:border-indigo-300 transition-colors">
                                                    {pricingOverrides[overrideId] !== undefined && (
                                                        <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm">Overridden</span>
                                                    )}
                                                    <h4 className="font-bold text-gray-900 mb-1">{pkg.name}</h4>
                                                    <p className="text-xs text-gray-500 mb-4 line-clamp-1">{pkg.description}</p>
                                                    <div className="flex items-end justify-between gap-4">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Price (₱)</label>
                                                            <input
                                                                type="number"
                                                                id={`price_input_${pkg.id}`}
                                                                defaultValue={currentPrice}
                                                                className="w-full text-lg font-bold text-gray-900 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const el = document.getElementById(`price_input_${pkg.id}`);
                                                                handlePricingUpdate('package', pkg.id, el.value);
                                                            }}
                                                            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm rounded-lg transition-colors border border-indigo-200"
                                                        >
                                                            Update
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Menu Pricing */}
                                <div className="bg-white shadow overflow-hidden rounded-xl border border-gray-100">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Menu Items (Premium Add-ons)</h3>
                                    </div>
                                    <div className="p-6">
                                        {Object.entries(DISHES).map(([category, items]) => (
                                            <div key={category} className="mb-8 last:mb-0">
                                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 capitalize">{category}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {items.filter(item => item.priceAdj > 0).map(item => {
                                                        const overrideId = `dish_${item.id}`;
                                                        const currentPrice = pricingOverrides[overrideId] !== undefined ? pricingOverrides[overrideId] : item.priceAdj;

                                                        return (
                                                            <div key={item.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50/50 flex flex-col hover:bg-gray-50 transition-colors">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex-1 pr-3">
                                                                        <h5 className="font-semibold text-gray-900 text-sm leading-tight">{item.name}</h5>
                                                                        {pricingOverrides[overrideId] !== undefined && (
                                                                            <span className="inline-block mt-1 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Custom Price</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="w-10 h-10 rounded-md bg-gray-200 overflow-hidden flex-shrink-0 relative">
                                                                        <img src={item.image} alt="" className="object-cover w-full h-full" />
                                                                    </div>
                                                                </div>
                                                                <div className="mt-auto flex items-end justify-between gap-3">
                                                                    <div className="flex-1">
                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">+₱</span>
                                                                            <input
                                                                                type="number"
                                                                                id={`price_input_${item.id}`}
                                                                                defaultValue={currentPrice}
                                                                                className="w-full pl-9 pr-3 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            const el = document.getElementById(`price_input_${item.id}`);
                                                                            handlePricingUpdate('dish', item.id, el.value);
                                                                        }}
                                                                        className="px-3 py-2 bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-700 font-bold text-sm rounded-lg transition-colors shadow-sm"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {items.filter(item => item.priceAdj > 0).length === 0 && (
                                                        <div className="text-sm text-gray-400 italic">No premium items in this category.</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: Discounts */}
                {activeTab === 'discounts' && (
                    <div className="animate-fadeIn">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Custom On-The-Fly Discounts</h2>
                            <p className="text-sm text-gray-500 mt-1">Apply exclusive percentage or fixed-amount discounts to specific client bookings.</p>
                        </div>

                        <div className="bg-white shadow overflow-hidden sm:rounded-xl border border-gray-100">
                            {bookingsLoading ? (
                                <div className="p-8 text-center text-gray-500">Loading bookings...</div>
                            ) : bookings.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">No active bookings found.</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client & Event</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Package</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Cost</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {bookings.map(booking => (
                                            <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">{booking.client_name}</div>
                                                    <div className="text-xs text-gray-500">{booking.event_type} • {booking.event_time}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 font-medium">{booking.selected_package}</div>
                                                    <div className="text-xs text-gray-500">{booking.pax} Guests</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">₱{booking.total_cost?.toLocaleString()}</div>
                                                    {(booking.discount_value > 0 || booking.discount_type) && (
                                                        <div className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                                            Discounted
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setDiscountForm({ discount_type: booking.discount_type || 'fixed', discount_value: booking.discount_value || 0 });
                                                            setDiscountModal({ open: true, data: booking });
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors inline-block"
                                                    >
                                                        Apply Discount
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Employee Add/Edit Modal */}
            {empModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setEmpModal({ open: false, mode: 'add', data: null })}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">{empModal.mode === 'add' ? 'Provision New Account' : 'Modify Credentials'}</h3>
                        </div>
                        <form onSubmit={handleEmpSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Username</label>
                                    <input type="text" required value={empForm.username} onChange={e => setEmpForm({ ...empForm, username: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Email (Optional)</label>
                                        <input type="email" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Phone (Optional)</label>
                                        <input type="text" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Password</label>
                                    <input type="text" required={empModal.mode === 'add'} minLength="6" value={empForm.password} onChange={e => setEmpForm({ ...empForm, password: e.target.value })} placeholder={empModal.mode === 'edit' ? "Leave blank to keep current" : ""} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Privilege Level</label>
                                    <select value={empForm.role} onChange={e => setEmpForm({ ...empForm, role: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium">
                                        <option value="Marketing">Marketing / Ops</option>
                                        <option value="Accounting">Accounting / Finance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setEmpModal({ open: false, mode: 'add', data: null })} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" disabled={empFormLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50">
                                    {empFormLoading ? 'Configuring...' : empModal.mode === 'add' ? 'Create Account' : 'Update Credentials'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Discount Modal */}
            {discountModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDiscountModal({ open: false, data: null })}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Apply Booking Discount</h3>
                            <p className="text-xs text-gray-500 mt-1">{discountModal.data?.client_name}'s Event</p>
                        </div>
                        <form onSubmit={handleDiscountSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Discount Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`border rounded-lg p-3 flex cursor-pointer transition-colors ${discountForm.discount_type === 'fixed' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                            <input type="radio" name="discount_type" value="fixed" checked={discountForm.discount_type === 'fixed'} onChange={() => setDiscountForm({ ...discountForm, discount_type: 'fixed' })} className="hidden" />
                                            <div className="font-bold text-sm text-center w-full">Fixed Amount (₱)</div>
                                        </label>
                                        <label className={`border rounded-lg p-3 flex cursor-pointer transition-colors ${discountForm.discount_type === 'percentage' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                            <input type="radio" name="discount_type" value="percentage" checked={discountForm.discount_type === 'percentage'} onChange={() => setDiscountForm({ ...discountForm, discount_type: 'percentage' })} className="hidden" />
                                            <div className="font-bold text-sm text-center w-full">Percentage (%)</div>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Discount Value</label>
                                    <div className="relative">
                                        {discountForm.discount_type === 'fixed' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₱</span>}
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={discountForm.discount_value}
                                            onChange={e => setDiscountForm({ ...discountForm, discount_value: parseFloat(e.target.value) || 0 })}
                                            className={`w-full ${discountForm.discount_type === 'fixed' ? 'pl-8' : 'px-4'} py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg font-bold`}
                                        />
                                        {discountForm.discount_type === 'percentage' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setDiscountModal({ open: false, data: null })} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" disabled={discountLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50">
                                    {discountLoading ? 'Applying...' : 'Apply Discount'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
                    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium text-sm ${toast.type === 'success' ? 'bg-gray-900 border border-gray-700' : 'bg-red-600'}`}>
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAdmin;
