import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarIcon,
  ListBulletIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import AppointmentCard from './AppointmentCard';
import {
  getProfessionalByUserId,
  getProfessionalBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
} from '../../services/professionalService';
import toast from 'react-hot-toast';

const AppointmentsCalendar = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [professional, setProfessional] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, searchQuery, selectedDate]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const prof = await getProfessionalByUserId(currentUser.uid);
      if (!prof) {
        toast.error('Professional profile not found');
        return;
      }
      setProfessional(prof);

      const bookingsData = await getProfessionalBookings(prof.id);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(b => 
        b.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.service?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(b => b.date === selectedDate);
    }

    setFilteredBookings(filtered);
  };

  const handleAccept = async (booking) => {
    try {
      await acceptBooking(booking.id);
      toast.success('Booking accepted');
      loadData();
    } catch (error) {
      toast.error('Failed to accept booking');
    }
  };

  const handleReject = async (booking) => {
    try {
      await rejectBooking(booking.id);
      toast.success('Booking rejected');
      loadData();
    } catch (error) {
      toast.error('Failed to reject booking');
    }
  };

  const handleComplete = async (booking) => {
    try {
      await completeBooking(booking.id);
      toast.success('Appointment completed');
      loadData();
    } catch (error) {
      toast.error('Failed to complete appointment');
    }
  };

  const handleCancel = async (booking) => {
    try {
      await cancelBooking(booking.id);
      toast.success('Appointment cancelled');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const getStatusCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6">
            Appointments
          </h1>

          {/* View Toggle & Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                  transition-colors duration-200
                  ${viewMode === 'list' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <ListBulletIcon className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                  transition-colors duration-200
                  ${viewMode === 'calendar' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <CalendarIcon className="w-4 h-4" />
                Calendar
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by client name or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2 rounded-lg
                  border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                  text-sm
                "
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <FilterChip
              label="All"
              count={getStatusCount('all')}
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <FilterChip
              label="Pending"
              count={getStatusCount('pending')}
              active={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
              color="yellow"
            />
            <FilterChip
              label="Confirmed"
              count={getStatusCount('confirmed')}
              active={statusFilter === 'confirmed'}
              onClick={() => setStatusFilter('confirmed')}
              color="green"
            />
            <FilterChip
              label="Completed"
              count={getStatusCount('completed')}
              active={statusFilter === 'completed'}
              onClick={() => setStatusFilter('completed')}
              color="blue"
            />
            <FilterChip
              label="Cancelled"
              count={getStatusCount('cancelled')}
              active={statusFilter === 'cancelled'}
              onClick={() => setStatusFilter('cancelled')}
              color="red"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {viewMode === 'list' ? (
          <ListView
            bookings={filteredBookings}
            onAccept={handleAccept}
            onReject={handleReject}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        ) : (
          <CalendarView
            bookings={filteredBookings}
            onAccept={handleAccept}
            onReject={handleReject}
            onComplete={handleComplete}
            onCancel={handleCancel}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </div>
  );
};

// Filter Chip Component
const FilterChip = ({ label, count, active, onClick, color = 'indigo' }) => {
  const colorClasses = {
    indigo: active ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700',
    yellow: active ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700',
    green: active ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700',
    blue: active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700',
    red: active ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700',
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
        whitespace-nowrap transition-all duration-200
        hover:shadow-md active:scale-95
        ${colorClasses[color]}
      `}
    >
      {label}
      <span className={`
        px-2 py-0.5 rounded-full text-xs
        ${active ? 'bg-white bg-opacity-30' : 'bg-gray-200'}
      `}>
        {count}
      </span>
    </button>
  );
};

// List View Component
const ListView = ({ bookings, onAccept, onReject, onComplete, onCancel }) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No appointments found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {bookings.map((booking) => (
        <AppointmentCard
          key={booking.id}
          booking={booking}
          onAccept={onAccept}
          onReject={onReject}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};

// Calendar View Component
const CalendarView = ({ bookings, onAccept, onReject, onComplete, onCancel, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.date === dateStr);
  };

  const days = getDaysInMonth(currentMonth);
  const selectedBookings = selectedDate ? getBookingsForDate(new Date(selectedDate)) : [];

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const dateStr = date.toISOString().split('T')[0];
    onDateSelect(selectedDate === dateStr ? null : dateStr);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {formatMonthYear(currentMonth)}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              ←
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
              →
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = date.toISOString().split('T')[0];
            const dateBookings = getBookingsForDate(date);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  aspect-square rounded-lg p-2
                  flex flex-col items-center justify-center
                  transition-all duration-200
                  ${isSelected 
                    ? 'bg-indigo-500 text-white shadow-lg scale-105' 
                    : isToday
                    ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-300'
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-sm font-medium">{date.getDate()}</span>
                {dateBookings.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {dateBookings.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-indigo-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Bookings */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {selectedDate 
            ? new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })
            : 'Select a date'
          }
        </h3>

        {selectedBookings.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            {selectedDate ? 'No appointments on this date' : 'Click on a date to view appointments'}
          </p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {selectedBookings.map((booking) => (
              <AppointmentCard
                key={booking.id}
                booking={booking}
                onAccept={onAccept}
                onReject={onReject}
                onComplete={onComplete}
                onCancel={onCancel}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsCalendar;
