import re

with open('client/src/pages/DashboardAdmin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I want to replace the `return (` block. Let's find everything from `return (` to the end.
return_idx = content.find('    return (')
if return_idx == -1:
    print("Could not find return block")
    exit(1)

pre_return = content[:return_idx]

# We need the inner content blocks (overview, employees, pricing, discounts)
overview_match = re.search(r"\{\s*\/\*\s*Tab Content: Analytics\s*\*\/\s*\}(.*?)(?=\{\s*\/\*\s*Tab Content: Employees)", content, re.DOTALL)
overview_content = overview_match.group(1).strip() if overview_match else "<div>Analytics Placeholder</div>"
# clean up the overview block wrapper
overview_content = overview_content.replace("{activeTab === 'overview' && (\n                    <div className=\"animate-fadeIn\">", "").replace("</div>\n                )}", "")
overview_content = overview_content.replace("{activeTab === 'dashboard' && (\n                    <div className=\"animate-fadeIn\">", "")


employees_match = re.search(r"\{\s*\/\*\s*Tab Content: Employees.*?\{\s*activeTab === 'employees' && \((.*?)\)\s*\}(?=\s*\{\s*\/\*\s*Tab Content: Pricing )", content, re.DOTALL)
if not employees_match:
    employees_match = re.search(r"\{\s*\/\*\s*Tab Content: Employees.*?\{\s*activeTab === 'users' && \((.*?)\)\s*\}(?=\s*\{\s*\/\*\s*Tab Content: Pricing )", content, re.DOTALL)
employees_content = employees_match.group(1).strip() if employees_match else "<div>Employees Placeholder</div>"

pricing_match = re.search(r"\{\s*\/\*\s*Tab Content: Pricing.*?\{\s*activeTab === 'pricing' && \((.*?)\)\s*\}(?=\s*\{\s*\/\*\s*Tab Content: Discounts )", content, re.DOTALL)
if not pricing_match:
    pricing_match = re.search(r"\{\s*\/\*\s*Tab Content: Pricing.*?\{\s*activeTab === 'configuration' && \((.*?)\)\s*\}(?=\s*\{\s*\/\*\s*Tab Content: Discounts )", content, re.DOTALL)
pricing_content = pricing_match.group(1).strip() if pricing_match else "<div>Pricing Placeholder</div>"

discounts_match = re.search(r"\{\s*\/\*\s*Tab Content: Discounts.*?\{\s*activeTab === 'discounts' && \((.*?)\)\s*\}(?=\s*\{\s*\/\*\s*Employee Add/Edit Modal )", content, re.DOTALL)
if not discounts_match:
        discounts_match = re.search(r"\{\s*\/\*\s*Tab Content: Discounts.*?\{\s*activeTab === 'bookings' && \((.*?)\)\s*\}(?=\s*\{\s*\/\*\s*Employee Add/Edit Modal )", content, re.DOTALL)
discounts_content = discounts_match.group(1).strip() if discounts_match else "<div>Discounts Placeholder</div>"


modals_match = re.search(r"(\{\s*\/\*\s*Employee Add/Edit Modal\s*\*\/\s*\}.*)", content, re.DOTALL)
modals_content = modals_match.group(1).strip() if modals_match else ""
modals_content = modals_content[:-2].strip() # remove `); }; export default...` part, just keep the modals

new_return = f'''    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">
            {{/* Sidebar Navigation */}}
            <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        </div>
                        <h1 className="text-xl font-bold font-display tracking-wide">Eloquente Admin</h1>
                    </div>

                    <nav className="space-y-2 flex-grow">
                        {{[
                            {{ id: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Dashboard' }},
                            {{ id: 'analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Analytics' }},
                            {{ id: 'configuration', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM12 15a3 3 0 100-6 3 3 0 000 6z', label: 'Configuration' }},
                            {{ id: 'settings', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', label: 'Settings' }},
                            {{ id: 'reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Reports' }},
                            {{ id: 'users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Users' }},
                            {{ id: 'bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Bookings' }},
                        ]].map(item => (
                            <button
                                key={{item.id}}
                                onClick={{() => setActiveTab(item.id)}}
                                className={{`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${{activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}}`}}
                            >
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d={{item.icon}} />
                                </svg>
                                <span className="font-medium text-sm">{{item.label}}</span>
                            </button>
                        ))}}
                    </nav>
                </div>
                
                <div className="p-6 mt-auto border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                            {{user?.username?.charAt(0).toUpperCase() || 'A'}}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{{user?.username}}</p>
                            <p className="text-xs text-slate-400 truncate">Top Admin</p>
                        </div>
                    </div>
                    <button onClick={{handleLogout}} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Logout
                    </button>
                </div>
            </aside>

            {{/* Main Content Area */}}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 relative">
                <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">{{activeTab === 'dashboard' ? 'Overview Dashboard' : activeTab}}</h2>
                </header>
                
                <div className="p-8">
                    {{activeTab === 'dashboard' && (
                        <div className="animate-fadeIn">
                            {overview_content}
                        </div>
                    )}}
                    {{activeTab === 'analytics' && (
                        <div className="animate-fadeIn">
                            <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-100">
                                <svg className="w-16 h-16 text-indigo-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Detailed Analytics</h3>
                                <p className="text-gray-500 max-w-md mx-auto">Advanced data visualizations and reports are visible on the dashboard overview. More specific metrics can be integrated here.</p>
                            </div>
                        </div>
                    )}}
                    {{activeTab === 'configuration' && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-end mb-6">
                                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M12 4v16m8-8H4" /></svg>
                                    Add New Menu Option
                                </button>
                            </div>
                            {pricing_content}
                        </div>
                    )}}
                    {{activeTab === 'settings' && (
                        <div className="animate-fadeIn">
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">User Preferences</h3>
                                <div className="space-y-6 max-w-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Email Notifications</h4>
                                            <p className="text-sm text-gray-500">Receive alerts for new bookings and cancellations</p>
                                        </div>
                                        <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Compact View</h4>
                                            <p className="text-sm text-gray-500">Reduce spacing in tables and lists</p>
                                        </div>
                                        <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}}
                    {{activeTab === 'reports' && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Comprehensive Reports</h2>
                                <div className="flex gap-3">
                                    <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Export CSV
                                    </button>
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Export PDF
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 mt-4 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Report Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Generated Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Monthly Sales - February 2026</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mar 01, 2026</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.4 MB</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-indigo-600 hover:text-indigo-900">Download</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Q4 2025 Comprehensive Report</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 10, 2026</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5.1 MB</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-indigo-600 hover:text-indigo-900">Download</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}}
                    {{activeTab === 'users' && (
                        <div className="animate-fadeIn">
                            {employees_content}
                        </div>
                    )}}
                    {{activeTab === 'bookings' && (
                        <div className="animate-fadeIn">
                            {discounts_content}
                        </div>
                    )}}
                </div>
            </main>

            {modals_content}
        </div>
    );
}};

export default DashboardAdmin;
'''

f_out = pre_return + "\n" + new_return

with open('client/src/pages/DashboardAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(f_out)

print("Rewrite of DashboardAdmin.jsx completed.")
