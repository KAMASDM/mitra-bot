import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusIcon,
  TrashIcon,
  ClockIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import TimeSlotPicker from './TimeSlotPicker';
import {
  getProfessionalByUserId,
  getAvailabilitySlots,
  createAvailabilitySlot,
  createBulkAvailabilitySlots,
  deleteAvailabilitySlot,
  generateRecurringSlots,
} from '../../services/professionalService';
import toast from 'react-hot-toast';

const AvailabilityManager = () => {
  const { currentUser } = useAuth();
  
  const [professional, setProfessional] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [slotType, setSlotType] = useState('single'); // 'single' or 'recurring'
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [duration, setDuration] = useState(60);
  const [locationType, setLocationType] = useState('online');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  const daysOfWeek = [
    { id: 0, name: 'Sunday', short: 'Sun' },
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
  ];

  useEffect(() => {
    loadData();
  }, [currentUser]);

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

      // Set default price from profile
      if (prof.hourly_rate || prof.fee) {
        setPrice((prof.hourly_rate || prof.fee).toString());
      }

      const slotsData = await getAvailabilitySlots(prof.id, {
        startDate: new Date().toISOString().split('T')[0]
      });
      setSlots(slotsData);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlots = async () => {
    if (!professional) return;

    try {
      if (slotType === 'single') {
        // Single day slots
        if (!date || selectedTimes.length === 0) {
          toast.error('Please select date and time slots');
          return;
        }

        const slotsToCreate = selectedTimes.map(time => {
          const [hours, minutes] = time.split(':');
          const startDateTime = new Date(date);
          startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const endDateTime = new Date(startDateTime);
          endDateTime.setMinutes(endDateTime.getMinutes() + duration);

          return {
            start_date: startDateTime,
            end_date: endDateTime,
            duration,
            type: locationType,
            location: locationType === 'in-person' ? location : 'Online',
            price: parseFloat(price) || professional.hourly_rate || professional.fee || 0
          };
        });

        await createBulkAvailabilitySlots(professional.id, slotsToCreate);
        toast.success(`${slotsToCreate.length} slots added successfully`);
      } else {
        // Recurring slots
        if (!startDate || !endDate || selectedTimes.length === 0 || selectedDays.length === 0) {
          toast.error('Please fill all required fields');
          return;
        }

        const recurringSlots = generateRecurringSlots(
          startDate,
          endDate,
          selectedTimes,
          selectedDays,
          {
            duration,
            type: locationType,
            location: locationType === 'in-person' ? location : 'Online',
            price: parseFloat(price) || professional.hourly_rate || professional.fee || 0
          }
        );

        await createBulkAvailabilitySlots(professional.id, recurringSlots);
        toast.success(`${recurringSlots.length} recurring slots added successfully`);
      }

      // Reset form
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error adding slots:', error);
      toast.error('Failed to add slots');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteAvailabilitySlot(slotId);
      toast.success('Slot deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete slot');
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setDate('');
    setStartDate('');
    setEndDate('');
    setSelectedTimes([]);
    setSelectedDays([]);
  };

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Availability Management
            </h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="
                flex items-center gap-2
                bg-indigo-500 text-white px-4 py-2 rounded-xl
                font-medium text-sm
                hover:bg-indigo-600 active:scale-95
                transition-all duration-200
              "
            >
              <PlusIcon className="w-5 h-5" />
              {showAddForm ? 'Cancel' : 'Add Slots'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Slots Form */}
          {showAddForm && (
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Availability</h2>

              {/* Slot Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setSlotType('single')}
                  className={`
                    flex-1 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors duration-200
                    ${slotType === 'single' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600'
                    }
                  `}
                >
                  Single Day
                </button>
                <button
                  onClick={() => setSlotType('recurring')}
                  className={`
                    flex-1 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors duration-200
                    ${slotType === 'recurring' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-600'
                    }
                  `}
                >
                  Recurring
                </button>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                {slotType === 'single' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="
                        w-full px-4 py-2 rounded-lg
                        border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                      "
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="
                          w-full px-4 py-2 rounded-lg
                          border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                        "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="
                          w-full px-4 py-2 rounded-lg
                          border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                        "
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Days of Week (Recurring only) */}
              {slotType === 'recurring' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.id}
                        onClick={() => toggleDay(day.id)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium
                          transition-all duration-200
                          ${selectedDays.includes(day.id)
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Slots */}
              <div className="mb-6">
                <TimeSlotPicker
                  selectedSlots={selectedTimes}
                  onChange={setSelectedTimes}
                />
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Duration (minutes)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="
                    w-full px-4 py-2 rounded-lg
                    border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                  "
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Location Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setLocationType('online')}
                    className={`
                      flex items-center justify-center gap-2 p-4 rounded-lg
                      border-2 transition-all duration-200
                      ${locationType === 'online'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <GlobeAltIcon className="w-5 h-5" />
                    <span className="font-medium">Online</span>
                  </button>
                  <button
                    onClick={() => setLocationType('in-person')}
                    className={`
                      flex items-center justify-center gap-2 p-4 rounded-lg
                      border-2 transition-all duration-200
                      ${locationType === 'in-person'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <MapPinIcon className="w-5 h-5" />
                    <span className="font-medium">In-Person</span>
                  </button>
                </div>
              </div>

              {/* Location (In-Person only) */}
              {locationType === 'in-person' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Address
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter clinic/office address"
                    className="
                      w-full px-4 py-2 rounded-lg
                      border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                    "
                  />
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <div className="relative">
                  <CurrencyRupeeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
                    className="
                      w-full pl-10 pr-4 py-2 rounded-lg
                      border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                    "
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddSlots}
                disabled={selectedTimes.length === 0}
                className="
                  w-full flex items-center justify-center gap-2
                  bg-indigo-500 text-white px-6 py-3 rounded-xl
                  font-medium
                  hover:bg-indigo-600 active:scale-95
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                <PlusIcon className="w-5 h-5" />
                Add {selectedTimes.length} Slot{selectedTimes.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          {/* Existing Slots */}
          <div className={showAddForm ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Your Availability ({slots.length})
              </h2>

              {slots.length === 0 ? (
                <div className="text-center py-12">
                  <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No availability slots
                  </h3>
                  <p className="text-sm text-gray-500">
                    Add your first availability slot to start receiving bookings
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {slots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      onDelete={() => handleDeleteSlot(slot.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Slot Card Component
const SlotCard = ({ slot, onDelete }) => {
  const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    booked: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium border
              ${statusColors[slot.status] || statusColors.available}
            `}>
              {slot.status?.toUpperCase() || 'AVAILABLE'}
            </span>
            {slot.type === 'online' ? (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <GlobeAltIcon className="w-3 h-3" />
                Online
              </span>
            ) : (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <MapPinIcon className="w-3 h-3" />
                In-Person
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">
            {formatDateTime(slot.start_date)}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Duration: {slot.duration} min • ₹{slot.price}
          </p>
          {slot.location && slot.type === 'in-person' && (
            <p className="text-xs text-gray-500 mt-1 truncate">{slot.location}</p>
          )}
        </div>
        
        {slot.status === 'available' && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AvailabilityManager;
