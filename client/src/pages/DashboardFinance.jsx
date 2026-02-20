import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PAYMENT_TYPE_LABELS = {
    Reservation: { label: 'Reservation Payment', pct: '10%', icon: 'R' },
    DownPayment: { label: 'Down Payment', pct: '70%', icon: 'D' },
    Final: { label: 'Final Payment', pct: '20%', icon: 'F' },
};

const DashboardFinance = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [ledgerPayments, setLedgerPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [expandedBooking, setExpandedBooking] = useState(null);

    const [ledgerFilter, setLedgerFilter] = useState({ status: 'All', startDate: '', endDate: '' });

    useEffect(() => {
        if (activeTab === 'bookings') {
            fetchBookings();
        } else {
            fetchLedger();
        }
    }, [activeTab, ledgerFilter]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/finance/bookings', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const query = new URLSearchParams(ledgerFilter).toString();
            const res = await fetch('http://localhost:3000/api/finance/ledger?' + query, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            setLedgerPayments(data);
        } catch (error) {
            console.error("Error fetching ledger:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/finance/payments/' + id + '/verify', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ action: action })
            });
            if (res.ok) {
                fetchBookings();
                setToast({
                    message: 'Payment ' + (action === 'Verify' ? 'Verified' : 'Rejected') + ' successfully!',
                    type: action === 'Verify' ? 'success' : 'error'
                });
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
            setToast({ message: 'Failed to process payment. Please try again.', type: 'error' });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusBadge = (status, dueDate) => {
        var isOverdue = dueDate && new Date(dueDate) < new Date() && status === 'Pending';
        if (isOverdue) return { cls: 'bg-red-100 text-red-800', text: 'Overdue' };
        if (status === 'Verified') return { cls: 'bg-green-100 text-green-800', text: 'Paid' };
        if (status === 'Pending') return { cls: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
        if (status === 'Rejected') return { cls: 'bg-gray-100 text-gray-600', text: 'Rejected' };
        return { cls: 'bg-gray-100 text-gray-600', text: status };
    };

    const getBookingProgress = (payments) => {
        var verified = payments.filter(function (p) { return p.status === 'Verified'; }).length;
        return { verified: verified, total: payments.length };
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold font-display text-primary-600">Eloquente Finance</h1>
                        </div>
                        <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-4">Finance View</div>
                            <span className="text-gray-700 mr-4">{user && user.username}</span>
                            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={activeTab === 'bookings' ? 'border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm' : 'border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'}
                        >
                            Payment Verification
                        </button>
                        <button
                            onClick={() => setActiveTab('ledger')}
                            className={activeTab === 'ledger' ? 'border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm' : 'border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'}
                        >
                            Transaction Ledger
                        </button>
                    </nav>
                </div>

                {activeTab === 'bookings' && (
                    <div>
                        {loading ? (
                            <div className="p-6 text-center text-gray-500">Loading bookings...</div>
                        ) : bookings.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No bookings found.</div>
                        ) : (
                            <div className="space-y-6">
                                {bookings.map(function (booking) {
                                    var progress = getBookingProgress(booking.payments);
                                    var isExpanded = expandedBooking === booking.id;
                                    var totalCost = booking.totalCost || 0;
                                    var paidAmount = booking.payments
                                        .filter(function (p) { return p.status === 'Verified'; })
                                        .reduce(function (sum, p) { return sum + p.amount; }, 0);
                                    var remainingBalance = totalCost - paidAmount;

                                    return (
                                        <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                            <div
                                                className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                                                            {'#' + booking.id}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {booking.client_full_name || booking.username}
                                                            </h3>
                                                            <p className="text-sm text-gray-500">
                                                                {'Event: ' + booking.event_date + ' | ' + booking.pax + ' pax'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Cost</p>
                                                            <p className="text-lg font-bold text-gray-900">{'P' + totalCost.toLocaleString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-400 uppercase tracking-wider">Payments</p>
                                                            <p className="text-sm font-semibold">
                                                                <span className="text-green-600">{progress.verified}</span>
                                                                <span className="text-gray-400">{'/' + progress.total}</span>
                                                                <span className="text-gray-400 text-xs ml-1">verified</span>
                                                            </p>
                                                        </div>
                                                        <svg
                                                            className={'w-5 h-5 text-gray-400 transition-transform duration-200' + (isExpanded ? ' rotate-180' : '')}
                                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: (totalCost > 0 ? (paidAmount / totalCost) * 100 : 0) + '%' }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between mt-1 text-xs text-gray-400">
                                                    <span>{'Paid: P' + paidAmount.toLocaleString()}</span>
                                                    <span>{'Balance: P' + remainingBalance.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 animate-fadeIn">
                                                    <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                                        {booking.client_email && (
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                                {booking.client_email}
                                                            </span>
                                                        )}
                                                        {booking.client_phone && (
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                                {booking.client_phone}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="text-xs uppercase text-gray-400 border-b border-gray-200">
                                                                    <th className="text-left py-2 pr-4">Payment Tier</th>
                                                                    <th className="text-right py-2 px-4">Amount</th>
                                                                    <th className="text-center py-2 px-4">Due Date</th>
                                                                    <th className="text-center py-2 px-4">Status</th>
                                                                    <th className="text-right py-2 pl-4">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {booking.payments.map(function (payment) {
                                                                    var typeInfo = PAYMENT_TYPE_LABELS[payment.payment_type] || { label: payment.payment_type, pct: '', icon: '-' };
                                                                    var badge = getStatusBadge(payment.status, payment.due_date);

                                                                    return (
                                                                        <tr key={payment.id} className="border-b border-gray-100 last:border-b-0">
                                                                            <td className="py-3 pr-4">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-lg w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">{typeInfo.icon}</span>
                                                                                    <div>
                                                                                        <p className="font-medium text-gray-900">{typeInfo.label}</p>
                                                                                        <p className="text-xs text-gray-400">{typeInfo.pct + ' of total'}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="text-right py-3 px-4">
                                                                                <span className="font-semibold text-gray-900">{'P' + (payment.amount ? payment.amount.toLocaleString() : '0')}</span>
                                                                            </td>
                                                                            <td className="text-center py-3 px-4">
                                                                                <span className="text-gray-600">{payment.due_date || '-'}</span>
                                                                            </td>
                                                                            <td className="text-center py-3 px-4">
                                                                                <span className={'inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ' + badge.cls}>
                                                                                    {badge.text}
                                                                                </span>
                                                                            </td>
                                                                            <td className="text-right py-3 pl-4">
                                                                                {payment.status === 'Pending' ? (
                                                                                    <div className="flex justify-end gap-2">
                                                                                        <button
                                                                                            onClick={function (e) { e.stopPropagation(); handleVerify(payment.id, 'Verify'); }}
                                                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-sm transition-colors"
                                                                                        >
                                                                                            Verify
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={function (e) { e.stopPropagation(); handleVerify(payment.id, 'Reject'); }}
                                                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-sm transition-colors"
                                                                                        >
                                                                                            Reject
                                                                                        </button>
                                                                                    </div>
                                                                                ) : payment.status === 'Verified' ? (
                                                                                    <span className="text-green-600 text-xs font-medium">Verified</span>
                                                                                ) : (
                                                                                    <span className="text-gray-400 text-xs">-</span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                                        <div className="text-xs text-gray-400">
                                                            {'Booking #' + booking.id + ' | Status: ' + booking.status}
                                                        </div>
                                                        <div className="flex gap-6 text-sm">
                                                            <div>
                                                                <span className="text-gray-400">Paid: </span>
                                                                <span className="font-semibold text-green-600">{'P' + paidAmount.toLocaleString()}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400">Remaining: </span>
                                                                <span className={'font-semibold ' + (remainingBalance > 0 ? 'text-red-600' : 'text-green-600')}>
                                                                    {'P' + remainingBalance.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ledger' && (
                    <div>
                        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
                            <div className="flex flex-col">
                                <label className="text-xs font-medium text-gray-500 mb-1">Status</label>
                                <select
                                    value={ledgerFilter.status}
                                    onChange={function (e) { setLedgerFilter(Object.assign({}, ledgerFilter, { status: e.target.value })); }}
                                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="All">All</option>
                                    <option value="Verified">Verified</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs font-medium text-gray-500 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={ledgerFilter.startDate}
                                    onChange={function (e) { setLedgerFilter(Object.assign({}, ledgerFilter, { startDate: e.target.value })); }}
                                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-xs font-medium text-gray-500 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={ledgerFilter.endDate}
                                    onChange={function (e) { setLedgerFilter(Object.assign({}, ledgerFilter, { endDate: e.target.value })); }}
                                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="bg-white shadow overflow-hidden rounded-xl">
                            {loading ? (
                                <div className="p-6 text-center text-gray-500">Loading transactions...</div>
                            ) : ledgerPayments.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No records found.</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr className="text-xs uppercase text-gray-400">
                                            <th className="text-left py-3 px-4">ID</th>
                                            <th className="text-left py-3 px-4">Client</th>
                                            <th className="text-left py-3 px-4">Type</th>
                                            <th className="text-right py-3 px-4">Amount</th>
                                            <th className="text-center py-3 px-4">Due Date</th>
                                            <th className="text-center py-3 px-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledgerPayments.map(function (p) {
                                            var badge = getStatusBadge(p.status, p.due_date);
                                            var typeInfo = PAYMENT_TYPE_LABELS[p.payment_type] || { label: p.payment_type || 'Legacy', icon: '-' };
                                            return (
                                                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-500">{'#' + p.id}</td>
                                                    <td className="py-3 px-4 font-medium text-gray-900">{p.client_full_name || p.username}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="flex items-center gap-1.5">
                                                            <span>{typeInfo.icon}</span>
                                                            <span>{typeInfo.label}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-semibold">{'P' + (p.amount ? p.amount.toLocaleString() : '0')}</td>
                                                    <td className="py-3 px-4 text-center text-gray-600">{p.due_date || '-'}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={'inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ' + badge.cls}>
                                                            {badge.text}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
                    <div className={'flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium text-sm ' + (toast.type === 'success' ? 'bg-green-600' : 'bg-red-600')}>
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        <span>{toast.message}</span>
                        <button onClick={function () { setToast(null); }} className="ml-2 text-white/70 hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardFinance;
