import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
// --- REAL-TIME & DB IMPORTS ---
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    createAvailabilitySlot,
    updateAvailabilitySlot,
    // Import real service functions, renaming to avoid conflicts
    subscribeToProfessionalBookings as subscribeToProfessionalBookingsService,
    updateBookingStatus as updateBookingStatusService,
} from '../../services/professionalService';
import { getProfessionalAvailability as getProfessionalAvailabilityDB } from '../../services/databaseService'; // Database function
import { useAuth } from '../../contexts/AuthContext';
import {
    CalendarIcon,
    UsersIcon,
    ClockIcon,
    VideoCameraIcon,
    ChatBubbleLeftRightIcon,
    PhoneIcon,
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

// Placeholder for In-Person icon (using UsersIcon for now)
const InPersonIcon = (props) => <UsersIcon {...props} />;

// --- Slot Creation/Edit Modal Component ---
const SlotCreationModal = ({ isOpen, onClose, professionalId, selectedDate, slotData = null, onSaveSuccess }) => {
    const [title, setTitle] = useState(slotData?.title || 'Available Slot');
    const [startTime, setStartTime] = useState(slotData?.startTime || '09:00');
    const [endTime, setEndTime] = useState(slotData?.endTime || '10:00');
    const [loading, setLoading] = useState(false);

    const isEdit = !!slotData && !!slotData.id;
    const modalTitle = isEdit ? 'Edit Availability Slot' : 'Add Availability Slot';
    const initialDateStr = format(selectedDate, 'EEEE, MMMM dd');

    const handleSave = async () => {
        if (!title.trim() || !startTime || !endTime) {
            toast.error('Please fill in all required fields.');
            return;
        }
        if (!professionalId || professionalId === 'MOCK_PROF_ID') {
            toast.error('Professional ID not found. Please log in as a professional.');
            return;
        }

        setLoading(true);
        try {
            const dateOnly = format(selectedDate, 'yyyy-MM-dd');
            const startDateTime = new Date(`${dateOnly}T${startTime}:00`);
            const endDateTime = new Date(`${dateOnly}T${endTime}:00`);

            if (endDateTime <= startDateTime) {
                toast.error('End time must be after start time.');
                setLoading(false);
                return;
            }

            const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);

            const slotPayload = {
                professional_id: professionalId,
                start_date: startDateTime,
                end_date: endDateTime,
                title: title,
                duration: duration,
                // Mocking default values for database schema alignment
                is_booked: slotData?.is_booked || false,
                is_cancelled: slotData?.is_cancelled || false,
                type: slotData?.type || 'online',
                location: slotData?.location || 'Online',
                price: slotData?.price || 0,
            };

            if (isEdit) {
                const result = await updateAvailabilitySlot(slotData.id, slotPayload);
                if (result.success) {
                    toast.success('Slot updated successfully!');
                    onSaveSuccess();
                } else {
                    throw new Error(result.error);
                }
            } else {
                const result = await createAvailabilitySlot(slotPayload);
                if (result.success) {
                    toast.success('New slot added successfully! ID: ' + result.id);
                    onSaveSuccess();
                } else {
                    throw new Error(result.error);
                }
            }

            onClose();
        } catch (error) {
            console.error('Error saving slot:', error);
            toast.error(`Failed to save slot: ${error.message || 'Check console for details.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">{modalTitle}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-4 text-sm font-medium text-gray-600">
                        📅 {initialDateStr}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., Online Consultation"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || slotData?.is_booked} // Cannot edit booked slots
                            className="px-6 py-2 bg-stone-700 text-white rounded-lg font-medium hover:bg-stone-800 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
// --- END Slot Creation/Edit Modal Component ---


const CalendarModalContent = ({ professional, user, isEditable, onClose }) => {
    // Current date is forced to Nov 18, 2025 for design matching
    // const todayReference = new Date(2025, 10, 18);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // --- START DYNAMIC STATE & EFFECTS ---
    const { currentUser } = useAuth();
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [modalSlotData, setModalSlotData] = useState(null);

    const [availabilitySlots, setAvailabilitySlots] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);

    const professionalId = currentUser?.uid;

    const fetchSlotsAndBookings = async () => {
        if (!professionalId) return;
        setLoadingSlots(true);
        try {
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);

            // Fetch ALL availability slots in the date range
            const allSlots = await getProfessionalAvailabilityDB(
                professionalId,
                start,
                end
            );

            const activeSlots = allSlots.filter(slot =>
                !slot.is_cancelled && !slot.is_booked
            );

            const bookedSlots = allSlots.filter(slot => slot.is_booked && !slot.is_cancelled);

            setAvailabilitySlots(activeSlots);
            setBookings(bookedSlots);

        } catch (error) {
            console.error('Error fetching slots/bookings for calendar:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        if (professionalId) {
            fetchSlotsAndBookings();
        } else {
            // Mock fallback for unauthenticated development testing
            setAvailabilitySlots([]);
            setBookings([]);
            setLoadingSlots(false);
        }
    }, [currentMonth, professionalId]);

    // Derived data for the calendar dots (Step 1)
    const availableDatesMap = useMemo(() => {
        // Group by date string (yyyy-MM-dd)
        return availabilitySlots.reduce((acc, slot) => {
            const dateStr = format(slot.start_date.toDate(), 'yyyy-MM-dd');
            acc[dateStr] = (acc[dateStr] || 0) + 1;
            return acc;
        }, {});
    }, [availabilitySlots]);

    // Derived data for the time grid (Step 2)
    const allSlotsGroupedByDate = useMemo(() => {
        // Combine all events: available slots (for open schedule blocks) and booked slots (for appointments)
        const allEvents = [...availabilitySlots, ...bookings];

        return allEvents.reduce((acc, slot) => {
            const dateStr = format(slot.start_date.toDate(), 'yyyy-MM-dd');
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            const isBooked = slot.is_booked;

            acc[dateStr].push({
                time: format(slot.start_date.toDate(), 'hh:mm a'),
                duration: slot.duration || 60,
                title: slot.title || (isBooked ? slot.clientName || 'Booked Client' : 'Available Slot'),
                color: isBooked ? 'bg-green-300' : 'bg-blue-300',
                startHour: slot.start_date.toDate().getHours(),
                startMinute: slot.start_date.toDate().getMinutes(),
                id: slot.id,
                isBooked: isBooked,
                // Pass full slot data for editing
                ...slot,
            });
            return acc;
        }, {});
    }, [availabilitySlots, bookings]);

    // --- END DYNAMIC STATE & EFFECTS ---

    const daysInMonth = useMemo(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        const prefixCount = getDay(start);
        const prefix = Array(prefixCount).fill(null);

        return [...prefix, ...days];
    }, [currentMonth]);

    const handleDayClick = (date) => {
        if (!date) return;
        setSelectedDate(date);
    };

    const handleTodayClick = () => {
        // This is a professional view, typically showing 'today' in their dashboard context
        const todayReal = new Date();
        setSelectedDate(todayReal);
        setCurrentMonth(startOfMonth(todayReal));
    };

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    // --- Slot Modal Handlers ---
    const handleOpenSlotModal = (date, slot = null) => {
        setSelectedDate(date);
        setModalSlotData(slot);
        setIsSlotModalOpen(true);
    };

    const handleSlotSaveSuccess = () => {
        fetchSlotsAndBookings();
        setIsSlotModalOpen(false);
    };
    // --- END Slot Modal Handlers ---


    // --- Left Column Rendering (Dynamic Dots - Step 1) ---
    const renderCalendarDay = (date, index) => {
        if (!date) return <div key={`empty-${index}`} className="aspect-square" />;

        const dateStr = format(date, 'yyyy-MM-dd');
        // REPLACED MOCK LOGIC: Dynamic dots based on fetched data
        const hasAvailableSlots = availableDatesMap[dateStr] > 0;

        const isSelected = isSameDay(date, selectedDate);
        const isCurrentDay = isToday(date);

        return (
            <button
                key={dateStr}
                onClick={() => handleDayClick(date)}
                className={`
                  aspect-square rounded-full flex flex-col items-center justify-center text-sm font-medium
                  transition-all duration-150 relative p-1
                  ${isSelected
                        ? 'bg-stone-700 text-white shadow-lg scale-105 border border-stone-700'
                        : isCurrentDay
                            ? 'bg-stone-200 text-stone-700 border-2 border-stone-400 font-bold'
                            : hasAvailableSlots // Green dot logic
                                ? 'bg-white text-gray-800 hover:bg-stone-50'
                                : 'text-gray-500 hover:bg-gray-50'
                    }
                  ${!isSelected && !isCurrentDay && !hasAvailableSlots ? 'opacity-50' : ''}
                `}
            >
                <span>{format(date, 'd')}</span>
                {/* DOT RENDERING LOGIC */}
                {hasAvailableSlots && !isSelected && (
                    // Green dot for days with slots
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full" />
                )}
                {hasAvailableSlots && isSelected && (
                    // White dot for selected day if it has slots
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
                )}
            </button>
        );
    };

    // --- Right Column Rendering (Time Grid) ---
    const renderTimeGrid = () => {
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const appointments = allSlotsGroupedByDate[selectedDateStr] || []; // Use grouped real data

        // Generate time labels and grid lines for a 24-hour day in 1-hour increments
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className="min-h-full">
                {hours.map(hour => {
                    const isAM = hour < 12;
                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const timeLabel = `${displayHour}${isAM ? ' AM' : ' PM'}`;

                    // Filter appointments starting within this hour
                    const hourAppointments = appointments.filter(appt => appt.startHour === hour);

                    return (
                        <div key={hour} className="flex border-b border-gray-200">
                            {/* Time Label */}
                            <div className="w-16 flex-shrink-0 text-xs text-gray-500 text-right pr-2 pt-2">
                                {timeLabel}
                            </div>

                            {/* Time Slot (50px height for visual spacing) */}
                            <div className="flex-1 h-[50px] border-l border-gray-200 relative">
                                {hourAppointments.map((appt, index) => {
                                    const durationMinutes = appt.duration || 60;
                                    const durationHeight = (durationMinutes / 60) * 50;
                                    const isBooked = appt.isBooked;

                                    const topOffset = (appt.startMinute / 60) * 50;

                                    // Dynamic edit data preparation
                                    const slotEditData = {
                                        id: appt.id,
                                        title: appt.title.includes(' - ') ? appt.title.split(' - ')[0] : appt.title,
                                        startTime: format(appt.start_date.toDate(), 'HH:mm'),
                                        endTime: format(appt.end_date.toDate(), 'HH:mm'),
                                        is_booked: isBooked,
                                        type: appt.type,
                                        location: appt.location,
                                        price: appt.price,
                                    };

                                    return (
                                        <div
                                            key={index}
                                            // Double-click to edit (only if not booked)
                                            onDoubleClick={() => !isBooked && handleOpenSlotModal(selectedDate, slotEditData)}
                                            className={`
                                                absolute left-0 right-0 p-1 text-xs font-semibold rounded-r-lg shadow-sm -ml-px transition-all duration-300
                                                ${isBooked
                                                    ? 'bg-green-200 text-green-900 border-l-4 border-green-500'
                                                    : 'bg-blue-200 text-blue-900 border-l-4 border-blue-500'
                                                }
                                                ${isBooked ? 'cursor-default' : 'cursor-pointer hover:shadow-lg hover:z-20'}
                                            `}
                                            style={{ height: `${durationHeight}px`, top: `${topOffset}px`, zIndex: 10 }}
                                        >
                                            <span className='line-clamp-1'>
                                                {appt.title}
                                            </span>
                                        </div>
                                    );
                                }).filter(Boolean)}
                                {/* DOUBLE CLICK FOR ADDING NEW SLOT */}
                                <div
                                    onDoubleClick={() => handleOpenSlotModal(selectedDate)}
                                    className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-10 transition-opacity"
                                    title="Double-click to add slot"
                                ></div>
                            </div>
                        </div>
                    );
                }).slice(8, 22)}
                {/* Displaying 8 AM to 10 PM for better context */}
            </div>
        );
    };


    return (
        <div className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                {/* Left Column: Calendar & Slots */}
                <div className="lg:col-span-1 p-4 overflow-y-auto bg-white">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex gap-1">
                            <button onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleTodayClick}
                                className="px-2 py-1 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Today
                            </button>
                            <button onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 text-xs font-semibold text-gray-500 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center">{day}</div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {daysInMonth.map(renderCalendarDay)}
                    </div>

                    {/* Button to Manually Add Slot for Selected Day (Matches Screenshot) */}
                    <button
                        onClick={() => handleOpenSlotModal(selectedDate)}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-800 active:scale-95 transition-all font-medium"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add New Slot on {format(selectedDate, 'MMM dd')}
                    </button>

                    {/* Available Slots Panel (Dynamic Slot List - Step 2) */}
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Available Slots</h3>
                        {loadingSlots ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                Loading slots...
                            </div>
                        ) : (
                            availabilitySlots
                                // FIX: Filter slots only for the selected date
                                .filter(slot => isSameDay(slot.start_date.toDate(), selectedDate))
                                .sort((a, b) => a.start_date.toDate().getTime() - b.start_date.toDate().getTime()) // Sort by time
                                .map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="bg-gray-100 p-3 rounded-lg flex justify-between items-center mb-2"
                                        // Edit functionality on click
                                        onClick={() => handleOpenSlotModal(selectedDate, slot)}
                                    >
                                        <span className="font-medium text-sm text-gray-800">
                                            {format(slot.start_date.toDate(), 'hh:mm a')} ({slot.duration} min)
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white">
                                            {slot.title || 'Available'}
                                        </span>
                                    </div>
                                ))
                        )}
                        {availabilitySlots.filter(slot => isSameDay(slot.start_date.toDate(), selectedDate)).length === 0 && !loadingSlots && (
                            <p className="text-xs text-gray-500">No open slots available on this date.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Time Grid (Full Day View) */}
                <div className="lg:col-span-2 p-4 overflow-y-auto bg-gray-50">
                    <div className="flex items-center justify-start gap-3 border-b border-gray-200 pb-3 mb-4 sticky top-0 bg-gray-50 z-20">
                        <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900">
                            {format(selectedDate, 'EEEE, MMMM dd')}
                        </h3>
                        <button className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                    {loadingSlots ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-700"></div>
                        </div>
                    ) : (
                        renderTimeGrid()
                    )}
                    <div className="h-20" />
                </div>
            </div>

            {/* Render the Slot Modal Here */}
            <AnimatePresence>
                {isSlotModalOpen && (
                    <SlotCreationModal
                        isOpen={isSlotModalOpen}
                        onClose={() => setIsSlotModalOpen(false)}
                        professionalId={professionalId}
                        selectedDate={selectedDate}
                        slotData={modalSlotData}
                        onSaveSuccess={handleSlotSaveSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};


const Appointments = () => {
    // We use the real UID from AuthContext now, but keep mock structure for local storage fallback
    const { currentUser } = useAuth();
    const [user] = useState(() => ({
        user: {
            id: currentUser?.uid || 'prof-123',
            name: currentUser?.displayName || 'Darshan Patel'
        }
    }));
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Real-Time Subscription
    useEffect(() => {
        const professionalId = user?.user?.id; // Use UID from AuthContext if available

        if (!professionalId) {
            setError("User ID not found. Please log in as a professional.");
            setLoading(false);
            return;
        }

        setLoading(true);
        // Use the real-time subscription service imported as subscribeToProfessionalBookingsService
        const unsubscribe = subscribeToProfessionalBookingsService(professionalId, (result) => {
            if (result.success) {
                // This updates 'bookings' every time a change occurs in Firestore
                setBookings(result.bookings);
            } else {
                setError(result.error || "Failed to load bookings.");
            }
            setLoading(false);
        });

        return () => unsubscribe(); 
    }, [user?.user?.id, currentUser?.uid]); // Depend on both for robust useEffect trigger

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();
    // Filter the full list of bookings to only include those for today's date
    return bookings.filter(b => b.appointmentDate.toDateString() === today);
  }, [bookings]);

    // 3. Updated Action Handlers (using real service)
    const handleAcceptAppointment = async (appointmentId) => {
        // Use the real imported update service
        const result = await updateBookingStatusService(appointmentId, 'confirmed');
        if (!result.success) toast.error('Failed to accept appointment.');
        // The real-time listener will handle the UI refresh.
    };

    const handleDeclineAppointment = async (appointmentId) => {
        // Use the real imported update service
        const result = await updateBookingStatusService(appointmentId, 'rejected'); // Use 'rejected' for decline
        if (!result.success) toast.error('Failed to decline appointment.');
        // The real-time listener will handle the UI refresh.
    };

    const handleCompleteAppointment = async (appointmentId) => {
        // Add complete action handler
        const result = await updateBookingStatusService(appointmentId, 'completed');
        if (!result.success) toast.error('Failed to complete appointment.');
    };
    // --- END UPDATED ACTION HANDLERS ---


    const getStatusChipClasses = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'rejected': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSessionTypeIcon = (sessionType) => {
        if (sessionType === 'In-Person') return InPersonIcon;
        if (sessionType === 'Phone Call') return PhoneIcon;
        return VideoCameraIcon;
    };

    const parseNotes = (notes) => {
        if (!notes) return null;
        const parts = notes.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={index} className="font-semibold">{part.replace(/\*\*/g, '')}</span>;
            }
            return part;
        });
        return parts;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-stone-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 min-h-screen">
                <h2 className="text-xl font-bold">Error loading appointments</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="py-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-5 gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">Today's Appointments</h2>
                        <button
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-150 flex items-center font-medium"
                            onClick={() => setIsScheduleModalOpen(true)}
                        >
                            <CalendarIcon className="w-5 h-5 mr-1" />
                            View Full Calendar
                        </button>
                    </div>

                    <div className="space-y-4">
                        {todayAppointments.length > 0 ? todayAppointments.map((appointment) => {
                            const sessionType = appointment.professionalType || appointment.type || 'VideoCall';
                            const SessionIcon = getSessionTypeIcon(sessionType);
                            const isPending = appointment.status === 'pending';
                            const isConfirmed = appointment.status === 'confirmed';

                            const displayTime = appointment.appointmentDate instanceof Date
                                ? format(appointment.appointmentDate, 'hh:mm a')
                                : appointment.appointmentTime;

                            return (
                                <div
                                    key={appointment.id}
                                    className="bg-gray-50 p-4 border border-gray-200 rounded-xl hover:shadow-md transition duration-200"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {appointment.clientName || 'Unknown Client'}
                                        </h3>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChipClasses(appointment.status)}`}>
                                            {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center flex-wrap">
                                        <div className="flex space-x-3 mb-2 sm:mb-0">
                                            <span className="flex items-center text-sm text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
                                                <ClockIcon className="w-4 h-4 mr-1 text-gray-600" />
                                                {displayTime} ({appointment.duration || 60} min)
                                            </span>
                                            <span className="flex items-center text-sm text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
                                                <SessionIcon className="w-4 h-4 mr-1 text-gray-600" />
                                                {sessionType?.replace(/_/g, ' ') || 'Consultation'}
                                            </span>
                                        </div>

                                        <div className="flex space-x-1">
                                            {isPending ? (
                                                <>
                                                    <button
                                                        title="Decline Appointment"
                                                        className="p-1.5 rounded-full text-red-600 hover:bg-red-100 transition duration-150"
                                                        onClick={() => handleDeclineAppointment(appointment.id)}
                                                    >
                                                        <XCircleIcon className="w-6 h-6" />
                                                    </button>
                                                    <button
                                                        title="Accept Appointment"
                                                        className="p-1.5 rounded-full text-green-600 hover:bg-green-100 transition duration-150"
                                                        onClick={() => handleAcceptAppointment(appointment.id)}
                                                    >
                                                        <CheckCircleIcon className="w-6 h-6" />
                                                    </button>
                                                </>
                                            ) : isConfirmed ? (
                                                <button
                                                    title="Mark as Completed"
                                                    className="p-1.5 rounded-full text-blue-600 hover:bg-blue-100 transition duration-150"
                                                    onClick={() => handleCompleteAppointment(appointment.id)}
                                                >
                                                    <CheckCircleIcon className="w-6 h-6" />
                                                </button>
                                            ) : null}

                                            {/* Chat/Video buttons visible for non-cancelled/rejected */}
                                            {appointment.status !== 'cancelled' && appointment.status !== 'rejected' && (
                                                <>
                                                    <button title="Start Video Call" className="p-1.5 rounded-full text-blue-600 hover:bg-blue-100 transition duration-150">
                                                        <VideoCameraIcon className="w-6 h-6" />
                                                    </button>
                                                    <button title="Start Chat" className="p-1.5 rounded-full text-blue-600 hover:bg-blue-100 transition duration-150">
                                                        <ChatBubbleLeftRightIcon className="w-6 h-6" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {appointment.notes && (
                                        <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-200">
                                            {parseNotes(appointment.notes)}
                                        </p>
                                    )}
                                </div>
                            );
                        }) : (
                            <p className="text-center text-gray-500 py-8">
                                No appointments scheduled for today. Time to relax!
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {isScheduleModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Manage Your Schedule</h2>
                            <button
                                className="p-1 rounded-full text-gray-600 hover:bg-gray-100"
                                onClick={() => setIsScheduleModalOpen(false)}
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="h-[75vh]">
                            <CalendarModalContent
                                professional={{ id: user.user.id, ...user.user }}
                                user={user}
                                isEditable={true}
                                onClose={() => setIsScheduleModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;