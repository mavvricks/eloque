import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CalendarView from '../../components/client/CalendarView';
import BudgetEstimator from '../../components/client/BudgetEstimator';
import PackageSelector from '../../components/client/PackageSelector';
import MenuCustomizer from '../../components/client/MenuCustomizer';
import EventDetailsForm from '../../components/client/EventDetailsForm';
import Modal from '../../components/common/Modal';

const BookingWizard = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        date: null,
        time: '',
        pax: 50,
        budget: 50000,
        selectedPackage: null,
        customMenu: {},
        totalCost: 0,
        // Step 5 fields
        client_full_name: '',
        venue_address_line: '',
        venue_street: '',
        venue_city: '',
        venue_province: '',
        venue_zip_code: '',
        client_email: '',
        client_phone: '',
        // Optional food tasting
        wantsTasting: false,
        tasting_guest_name: '',
        tasting_guest_email: '',
        tasting_guest_phone: '',
        tasting_preferred_date: '',
        tasting_preferred_time: '',
        tasting_notes: ''
    });

    const updateBooking = (data) => {
        setBookingData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const { user } = useAuth();

    const [modal, setModal] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null,
        confirmText: null
    });

    const showModal = (type, title, message, onConfirm = null, confirmText = null) => {
        setModal({ isOpen: true, type, title, message, onConfirm, confirmText });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const submitBooking = async (eventDetailsData = {}) => {
        if (!user) {
            showModal('error', 'Login Required', 'You must be logged in to book.', () => navigate('/login'));
            return;
        }

        // Merge eventDetailsData on top of bookingData so Step 5 fields are always fresh
        const merged = { ...bookingData, ...eventDetailsData };

        const payload = {
            user_id: user.id,
            event_date: merged.date,
            event_time: merged.time,
            pax: merged.pax,
            budget: merged.budget,
            package_id: merged.selectedPackage?.id || 'custom',
            client_full_name: merged.client_full_name,
            venue_address_line: merged.venue_address_line,
            venue_street: merged.venue_street,
            venue_city: merged.venue_city,
            venue_province: merged.venue_province,
            venue_zip_code: merged.venue_zip_code,
            client_email: merged.client_email,
            client_phone: merged.client_phone,
            total_cost: merged.totalCost || merged.budget
        };

        try {
            const response = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                // If food tasting requested, submit that too
                if (bookingData.wantsTasting) {
                    try {
                        const token = localStorage.getItem('token');
                        await fetch('http://localhost:3000/api/food-tasting', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                guest_name: bookingData.tasting_guest_name,
                                guest_email: bookingData.tasting_guest_email,
                                guest_phone: bookingData.tasting_guest_phone,
                                preferred_date: bookingData.tasting_preferred_date,
                                preferred_time: bookingData.tasting_preferred_time,
                                notes: bookingData.tasting_notes
                            })
                        });
                    } catch (err) {
                        console.error("Food tasting submission error:", err);
                    }
                }

                showModal(
                    'success',
                    'Booking Confirmed! 🎉',
                    'Your booking has been successfully submitted! You can fill in additional event details such as Reservation Time, Serving Time, Event Timeline, and Color Motif in your Dashboard under the "My Events" tab.',
                    () => navigate('/dashboard/client'),
                    'Go to My Events'
                );
            } else {
                showModal('error', 'Booking Failed', data.error);
            }
        } catch (error) {
            console.error("Submission Error:", error);
            showModal('error', 'Submission Error', 'An error occurred while submitting your booking. Please try again.');
        }
    };

    const totalSteps = 5;

    return (
        <div className="min-h-screen bg-gray-50 py-8 pt-24">
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onConfirm={modal.onConfirm}
                confirmText={modal.confirmText}
            />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stepper Progress Bar */}
                <div className="mb-12 max-w-4xl mx-auto">
                    <div className="relative flex justify-between items-center w-full">
                        {/* Connecting Line Background */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded-full"></div>

                        {/* Connecting Line Progress */}
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-primary-600 -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        ></div>

                        {[
                            { step: 1, label: "Date & Time" },
                            { step: 2, label: "Guest & Budget" },
                            { step: 3, label: "Select Package" },
                            { step: 4, label: "Customize Menu" },
                            { step: 5, label: "Event Details" }
                        ].map((item) => (
                            <div key={item.step} className="flex flex-col items-center relative group cursor-default">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-4 ${currentStep > item.step
                                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg scale-110'
                                        : currentStep === item.step
                                            ? 'bg-white border-primary-600 text-primary-600 shadow-xl scale-125 ring-2 ring-primary-100'
                                            : 'bg-white border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {currentStep > item.step ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        item.step
                                    )}
                                </div>
                                <span className={`absolute top-14 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${currentStep >= item.step ? 'text-primary-800' : 'text-gray-400'
                                    }`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 min-h-[600px] transition-all duration-300">
                    {currentStep === 1 && (
                        <CalendarView
                            bookingData={bookingData}
                            updateBooking={updateBooking}
                            onNext={nextStep}
                        />
                    )}
                    {currentStep === 2 && (
                        <BudgetEstimator
                            bookingData={bookingData}
                            updateBooking={updateBooking}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {currentStep === 3 && (
                        <PackageSelector
                            bookingData={bookingData}
                            updateBooking={updateBooking}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {currentStep === 4 && (
                        <MenuCustomizer
                            bookingData={bookingData}
                            updateBooking={updateBooking}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {currentStep === 5 && (
                        <EventDetailsForm
                            bookingData={bookingData}
                            updateBooking={updateBooking}
                            onSubmit={submitBooking}
                            onBack={prevStep}
                            user={user}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingWizard;
