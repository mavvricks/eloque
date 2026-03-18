import sys

with open('client/src/pages/DashboardFinance.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = "                {activeTab === 'bookings' && ("
end_marker = "                {activeTab === 'ledger' && ("

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found")
    sys.exit(1)

replacement = '''                {activeTab === 'bookings' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800">Payment Verification</h2>
                            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                                <button 
                                    onClick={() => setViewMode('list')} 
                                    className={px-3 py-1.5 rounded-md text-sm font-medium transition-colors }
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                </button>
                                <button 
                                    onClick={() => setViewMode('card')} 
                                    className={px-3 py-1.5 rounded-md text-sm font-medium transition-colors }
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-6 text-center text-gray-500">Loading bookings...</div>
                        ) : bookings.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No bookings found.</div>
                        ) : (
                            <div className="space-y-6">
                                {viewMode === 'list' && (
                                    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 text-left">
                                                    <th className="py-3 px-4 font-semibold">ID</th>
                                                    <th className="py-3 px-4 font-semibold">Client</th>
                                                    <th className="py-3 px-4 font-semibold">Event Date</th>
                                                    <th className="py-3 px-4 font-semibold text-right">Total Cost</th>
                                                    <th className="py-3 px-4 font-semibold text-center">Progress</th>
                                                    <th className="py-3 px-4 font-semibold text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {bookings.map(booking => {
                                                    var progress = getBookingProgress(booking.payments);
                                                    var totalCost = booking.totalCost || 0;
                                                    var paidAmount = booking.payments
                                                        .filter(p => p.status === 'Verified')
                                                        .reduce((sum, p) => sum + p.amount, 0);
                                                    var remainingBalance = totalCost - paidAmount;

                                                    return (
                                                        <React.Fragment key={booking.id}>
                                                            <tr className="hover:bg-gray-50 transition-colors">
                                                                <td className="py-3 px-4 font-medium text-gray-900">#{booking.id}</td>
                                                                <td className="py-3 px-4">
                                                                    <p className="font-semibold text-gray-900">{booking.client_full_name || booking.username}</p>
                                                                    <p className="text-xs text-gray-500">{booking.client_email}</p>
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-600">{booking.event_date}</td>
                                                                <td className="py-3 px-4 text-right font-semibold text-blue-600">?{totalCost.toLocaleString()}</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                        <span className="text-green-600">{progress.verified}</span>/{progress.total}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button 
                                                                        onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                                                                        className="text-primary-600 hover:text-primary-800 font-medium text-xs bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                                                                    >
                                                                        {expandedBooking === booking.id ? 'Close details' : 'View Details'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                            {expandedBooking === booking.id && (
                                                                <tr className="bg-gray-50">
                                                                    <td colSpan="6" className="p-0 border-b-2 border-primary-200 shadow-inner">
                                                                        <div className="p-6">
                                                                            <div className="flex gap-6 text-sm mb-4">
                                                                                <div className="flex-1">
                                                                                    <span className="text-gray-400 block text-xs uppercase mb-1">Status</span>
                                                                                    <span className="font-semibold">{booking.status}</span>
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <span className="text-gray-400 block text-xs uppercase mb-1">Paid Amount</span>
                                                                                    <span className="font-semibold text-green-600">?{paidAmount.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <span className="text-gray-400 block text-xs uppercase mb-1">Remaining Balance</span>
                                                                                    <span className={ont-semibold }>
                                                                                        ?{remainingBalance.toLocaleString()}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex-1 text-right">
                                                                                    <button 
                                                                                        onClick={() => setTrancheBuilderModal({ isOpen: true, booking })}
                                                                                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
                                                                                    >
                                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                                        Tranche Payments
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                                                <table className="w-full text-sm">
                                                                                    <thead>
                                                                                        <tr className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                                                                                            <th className="text-left py-2 px-4">Payment Tier</th>
                                                                                            <th className="text-right py-2 px-4">Amount</th>
                                                                                            <th className="text-center py-2 px-4">Due Date</th>
                                                                                            <th className="text-center py-2 px-4">Status</th>
                                                                                            <th className="text-right py-2 px-4">Actions</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-gray-100">
                                                                                        {booking.payments.map(payment => {
                                                                                            var typeInfo = PAYMENT_TYPE_LABELS[payment.payment_type] || { label: payment.payment_type, pct: '', icon: '-' };
                                                                                            var badge = getStatusBadge(payment.status, payment.due_date);
                                                                                            return (
                                                                                                <tr key={payment.id}>
                                                                                                    <td className="py-3 px-4">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-[10px]">{typeInfo.icon}</span>
                                                                                                            <span className="font-medium text-gray-900">{typeInfo.label}</span>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                    <td className="text-right py-3 px-4 font-semibold">?{(payment.amount || 0).toLocaleString()}</td>
                                                                                                    <td className="text-center py-3 px-4 text-gray-600">{payment.due_date || '-'}</td>
                                                                                                    <td className="text-center py-3 px-4">
                                                                                                        <span className={inline-flex px-2 py-0.5 rounded-full text-xs font-semibold }>{badge.text}</span>
                                                                                                    </td>
                                                                                                    <td className="text-right py-3 px-4">
                                                                                                        {payment.status === 'Pending' ? (
                                                                                                            <div className="flex justify-end gap-2">
                                                                                                                <button onClick={(e) => { e.stopPropagation(); handleVerify(payment.id, 'Verify'); }} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-[10px] font-medium">Verify</button>
                                                                                                                <button onClick={(e) => { e.stopPropagation(); handleVerify(payment.id, 'Reject'); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-[10px] font-medium">Reject</button>
                                                                                                                {(payment.status === 'Pending' || new Date(payment.due_date) < new Date()) && (
                                                                                                                    <button onClick={(e) => { e.stopPropagation(); handleSendReminder(payment.id); }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-[10px] font-medium">Remind</button>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        ) : payment.status === 'Verified' ? (
                                                                                                            <button onClick={(e) => { e.stopPropagation(); setReceiptModal({ isOpen: true, payment: payment, booking: booking }); }} className="text-primary-600 hover:text-primary-800 text-xs font-medium underline">Receipt</button>
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
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {viewMode === 'card' && bookings.map(function (booking) {
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
                                                                                <span className={inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold }>
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
                                                                                        {(payment.status === 'Pending' || new Date(payment.due_date) < new Date()) && (
                                                                                                <button
                                                                                                    onClick={function (e) { e.stopPropagation(); handleSendReminder(payment.id); }}
                                                                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center gap-1"
                                                                                                >
                                                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                                                                                    Remind
                                                                                                </button>
                                                                                        )}
                                                                                    </div>
                                                                                ) : payment.status === 'Verified' ? (
                                                                                    <div className="flex justify-end items-center gap-3">
                                                                                        <span className="text-green-600 text-xs font-medium">Verified</span>
                                                                                        <button
                                                                                            onClick={function (e) { e.stopPropagation(); setReceiptModal({ isOpen: true, payment: payment, booking: booking }); }}
                                                                                            className="text-primary-600 hover:text-primary-800 text-xs font-medium underline flex items-center gap-1"
                                                                                        >
                                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                                            Receipt
                                                                                        </button>
                                                                                    </div>
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
                                                        <div className="flex gap-4 items-center">
                                                            <div className="text-xs text-gray-400">
                                                                {'Booking #' + booking.id + ' | Status: ' + booking.status}
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setTrancheBuilderModal({ isOpen: true, booking }); }}
                                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                Tranche Payment
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-6 text-sm">
                                                            <div>
                                                                <span className="text-gray-400">Paid: </span>
                                                                <span className="font-semibold text-green-600">{'P' + paidAmount.toLocaleString()}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-400">Remaining: </span>
                                                                <span className={ont-semibold }>
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


'''

new_content = content[:start_idx] + replacement + content[end_idx:]

with open('client/src/pages/DashboardFinance.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done python replace!")
