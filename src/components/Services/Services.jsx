// src/components/Services/Services.jsx

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ServiceOptionsCard from '../Services/ServiceOptionsCard';
import {
  searchJobs,
  getProfessionalsByCategory,
  getProfessionalTypes,
  getProfessionalAvailability, 
  updateSlotStatus,           
  createBooking               
} from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import DataCards from '../Chat/DataCards';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline'; 
import { format } from 'date-fns';

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [professionalTypesMap, setProfessionalTypesMap] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;


  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [availableSlotsMap, setAvailableSlotsMap] = useState({});
  const [isBookingStep, setIsBookingStep] = useState(false);
  const [isSlotLoading, setIsSlotLoading] = useState(false);
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  useEffect(() => { 
    const loadProfessionalTypes = async () => {
      try {
        const types = await getProfessionalTypes();
        const map = types.reduce((acc, type) => {
          acc[type.id] = type.title || type.label;
          return acc;
        }, {});
        setProfessionalTypesMap(map);
      } catch (error) {
        console.error('Services: Error loading professional types:', error);
      }
    };
    loadProfessionalTypes();
  }, []); 

  // Function to add the human-readable label to results (remains the same)
  const mapProfessionalLabels = (results) => {
    return results.map(doc => {
      const typeId = String(doc.professional_type_id);
      const label = professionalTypesMap[typeId] ||
        doc.category ||
        'Service Provider';

      return {
        ...doc,
        professional_type_label: label,
      };
    });
  }; //

  // Function to reset and show the Service Options Card
  const handleBackToSelector = () => {
    setSelectedService(null);
    setSearchResults([]);
    setIsBookingStep(false); // Reset booking state
    setSelectedProfessional(null);
    setCurrentPage(1); // Reset pagination
  }; //

  // --- NEW: Booking Functions ---

  const checkIfAvailableToday = async (professionalId) => {
    if (!professionalId) return [];
    try {
      const today = new Date();
      // Set the start of today and end of today for precise query
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));

      const availableSlots = await getProfessionalAvailability(
        professionalId,
        startOfToday,
        endOfToday
      ); 

      // Filter out past slots, booked slots, and cancelled slots
      const liveSlots = availableSlots.filter(slot => {
        const slotTime = slot.start_date.toDate ? slot.start_date.toDate() : new Date(slot.start_date);
        const isToday = slotTime.toDateString() === new Date().toDateString();
        // Check if the slot is still in the future AND not booked/cancelled
        return isToday;
      });

      // Return the live slots formatted as time strings
      return liveSlots.map(slot => slot.start_date.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error(`Error checking availability for ${professionalId}:`, error);
      return [];
    }
  };


  // Modified search function to include slot check before rendering
  const handleServiceSelection = async (serviceOption) => {
    setSelectedService(serviceOption);
    setSearchResults([]);
    setCurrentPage(1); // Reset to page 1 on new search
    setLoading(true);

    try {
      let results = [];
      const categoryMap = {
        'job_search': 'placement',
        'general_doctor': 'mbbs',
        'mental_health': 'mental',
        'legal_aid': 'legal',
        'lab_tests': 'pathology',
        'pharmacy': 'pharmacy',
      };
      const category = categoryMap[serviceOption.action] || serviceOption.action;

      // Fetch professional data
      const fetchFunction = serviceOption.action === 'job_search' ? searchJobs : getProfessionalsByCategory;
      results = await fetchFunction(category); //

      if (serviceOption.action !== 'job_search') {
        let professionalsWithSlots = await Promise.all(
          results.map(async (doc) => {
            const professionalId = doc.id;
            const liveSlots = await checkIfAvailableToday(professionalId);
            return {
              ...doc,
              professional_type_label: professionalTypesMap[doc.professional_type_id] || 'Service Provider',
              availableSlots: liveSlots, // Attach live slots for 'Book Now' check
            };
          })
        );
        results = professionalsWithSlots;
      } else {
        // Ensure job objects have necessary IDs if needed
        results = results.map((job, index) => ({ ...job, id: job.id || `job-${index}` }));
      }

      setSearchResults(results);

      if (results.length === 0) {
        toast.error('No results found. Try a different service.');
      } else {
        // Scroll to top when results load
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error fetching service data:', error);
      toast.error('Failed to load services. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }; //


  // This function is called when 'Book Now' is clicked on a ProfessionalCard
  const handleBookSlots = async (professional) => {
    if (!currentUser) {
      toast.error('Please log in to book an appointment.');
      return;
    }

    setSelectedProfessional(professional);
    setAvailableSlotsMap({});
    setIsBookingStep(true);
    setIsSlotLoading(true);

    const professionalId = professional.id || professional.professional_id || professional.uid;

    if (!professionalId) {
      toast.error('Professional ID missing for booking.');
      setIsBookingStep(false);
      setIsSlotLoading(false);
      return;
    }

    try {
      // Determine a time range for fetching slots (e.g., next 7 days)
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const allSlots = await getProfessionalAvailability(
        professionalId,
        today,
        nextWeek
      ); //

      const availableSlots = allSlots.filter(slot => {
        const slotTime = slot.start_date.toDate ? slot.start_date.toDate() : new Date(slot.start_date);
        const isBookedOrCancelled = slot.is_booked || slot.is_cancelled;
        const isFuture = slotTime > new Date();

        // Only return slots that are NOT booked, NOT cancelled, and in the FUTURE
        return !isBookedOrCancelled && isFuture;
      });

      const slotsMap = availableSlots.reduce((acc, slot) => {
        acc[slot.id] = slot;
        return acc;
      }, {});

      setAvailableSlotsMap(slotsMap);

      if (availableSlots.length === 0) {
        toast('No available slots found for the next 7 days.', { icon: '⚠️' });
      }

    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load slots.');
      setIsBookingStep(false);
    } finally {
      setIsSlotLoading(false);
    }
  };

  // This function is called when a slot is clicked on the booking step
  const handleSlotConfirmation = async (slotId) => {
    if (!currentUser) {
      toast.error('Please log in to confirm your booking.');
      return;
    }

    const slot = availableSlotsMap[slotId];
    const professional = selectedProfessional;

    if (!slot || !professional) {
      toast.error('Booking failed: Missing slot or professional data.');
      return;
    }

    setIsSlotLoading(true);

    const professionalName = professional.first_name || professional.last_name || 'Professional';
    const slotTime = slot.start_date.toDate();
    const formattedTime = format(slotTime, 'p');
    const formattedDate = format(slotTime, 'MMM dd, yyyy');
    const location = slot.location || professional.address || 'Location not specified';
    const fee = professional.hourly_rate || slot.fee || 'Contact for fee';

    try {
      // 1. Update slot status in 'availabilitySlots'
      await updateSlotStatus(slotId, {
        is_booked: true,
        booked_by_uid: currentUser.uid,
      }); //

      // 2. Create the formal booking record in 'bookings'
      const bookingRecord = {
        slotId: slotId,
        professionalId: professional.id,
        clientId: currentUser.uid,
        professionalName: professionalName,
        clientName: currentUser.displayName || currentUser.email,
        appointmentDate: slot.start_date, // Use the Timestamp from the slot
        appointmentTime: formattedTime,
        professionalType: professional.professional_type_label || professional.specialization || 'Consultation',
        status: 'confirmed',
        location: location,
        fee: fee,
        clientEmail: currentUser.email,
        duration: slot.duration || 60,
      };

      const newBooking = await createBooking(bookingRecord); //

      // 3. Final update to availabilitySlots with the real booking ID
      await updateSlotStatus(slotId, {
        booking_id: newBooking.id
      }); 

      // Success notification
      toast.success(
        `✅ Appointment confirmed with ${professionalName} at ${formattedTime} on ${formattedDate}.`,
        { duration: 5000 }
      );
      handleBackToSelector();
   
    } catch (error) {
      console.error('Error in handleSlotConfirmation:', error);
      toast.error('❌ Booking failed. Please try again.');
    } finally {
      setIsSlotLoading(false);
    }
  };

  // Main action handler passed to DataCards
  const handleDataAction = (action, data) => {
    console.log(`Action requested in Services.jsx: ${action}`, data);
    const item = data.name || data.title || 'the item';

    if (action === 'view_details' || action === 'apply') {
      toast(`Viewing details for ${item}.`, { icon: '🔍' });
    } else if (action === 'book') {
      handleBookSlots(data); // <<< Trigger booking flow
    }
  }; //

  // --- Rendering Functions ---

  const renderBookingInterface = () => {
    if (!selectedProfessional) return null;

    const professionalName = selectedProfessional.first_name || selectedProfessional.last_name || 'Professional';

    const groupedSlots = Object.values(availableSlotsMap).reduce((acc, slot) => {
      const slotTime = slot.start_date.toDate();
      const dateKey = format(slotTime, 'EEE, MMM dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(slot);
      return acc;
    }, {});

    return (
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-primary-200 animate-slideDown">
        <div className="flex justify-between items-center border-b pb-3 mb-3">
          <h3 className="text-lg font-bold text-primary-800 flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
            Book with {professionalName}
          </h3>
          <button
            onClick={() => setIsBookingStep(false)}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            ← Back to List
          </button>
        </div>

        {isSlotLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Checking for available slots...</p>
          </div>
        ) : Object.keys(availableSlotsMap).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">❌</div>
            <p className="text-gray-600">
              No available slots found for the next 7 days.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Try again later or check the professional's contact details.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} className="border-b border-gray-100 pb-3">
                <h4 className="font-semibold text-primary-700 mb-2 px-1 py-1 bg-primary-50 rounded-md">
                  {date}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => {
                    const slotTime = slot.start_date.toDate();
                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotConfirmation(slot.id)}
                        disabled={isSlotLoading}
                        className="px-3 py-2 border border-green-300 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50 flex flex-col items-center"
                      >
                        <ClockIcon className="w-4 h-4" />
                        <span>{format(slotTime, 'h:mm a')}</span>
                        <span className="text-xs text-green-600 mt-1">
                          {slot.duration || 60} min
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="pt-4 text-center">
              <p className="text-xs text-primary-600">Click a slot to confirm your booking.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed within page - Hidden on desktop (shown in Layout) */}
      <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200 lg:hidden">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('search')}
        </h1>
        <p className="text-gray-600">
          {t('findServices')}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-6 lg:p-0">
          {/* Conditional Rendering based on selectedService state */}
          {!selectedService ? (
            // SHOW SERVICE SELECTOR CHIPS
            <div className="bg-white lg:bg-transparent p-2 lg:p-0 rounded-xl">
              <ServiceOptionsCard onOptionSelect={handleServiceSelection} />
            </div>
          ) : (
            // SHOW RESULTS OR BOOKING STEP
            <>
              {/* Selected Service Header/Context - MODIFIED TO MATCH IMAGE */}
              <div className="mb-6 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedService.icon}</span>
                    <h2 className="text-lg font-semibold">{selectedService.text}</h2>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {t('showingResults')} {selectedService.text} {t('providers')}.
                </p>
              </div>

              {isBookingStep ? (
                renderBookingInterface() // Show booking interface if in booking step
              ) : searchResults.length > 0 ? (
                // Show search results list with pagination
                <>
                  {(() => {
                    // Calculate pagination
                    const indexOfLastResult = currentPage * resultsPerPage;
                    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
                    const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult);
                    const totalPages = Math.ceil(searchResults.length / resultsPerPage);
                    
                    return (
                      <>
                        {/* Results count */}
                        <div className="mb-4 text-sm text-gray-600">
                          {t('showing')} {indexOfFirstResult + 1}-{Math.min(indexOfLastResult, searchResults.length)} {t('of')} {searchResults.length} {t('results')}
                        </div>

                        <DataCards
                          data={currentResults}
                          type={selectedService.action === 'job_search' ? 'jobs' : 'professionals'}
                          onAction={handleDataAction} // Pass action handler
                        />

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {t('previous')}
                            </button>
                            
                            <div className="flex items-center gap-1">
                              {(() => {
                                const pages = [];
                                const showPages = 5; // Show max 5 page numbers
                                
                                if (totalPages <= showPages) {
                                  // Show all pages
                                  for (let i = 1; i <= totalPages; i++) {
                                    pages.push(i);
                                  }
                                } else {
                                  // Smart pagination
                                  if (currentPage <= 3) {
                                    pages.push(1, 2, 3, 4, '...', totalPages);
                                  } else if (currentPage >= totalPages - 2) {
                                    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                  } else {
                                    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                                  }
                                }
                                
                                return pages.map((page, index) => (
                                  page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                                  ) : (
                                    <button
                                      key={page}
                                      onClick={() => setCurrentPage(page)}
                                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                        currentPage === page
                                          ? 'bg-primary-600 text-white'
                                          : 'text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  )
                                ));
                              })()}
                            </div>
                            
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {t('next')}
                            </button>
                          </div>
                        )}

                        {/* Back to Services Button */}
                        <div className="mt-6 pb-4">
                          <button
                            onClick={handleBackToSelector}
                            className="flex items-center gap-2 px-4 py-2 border border-primary-200 text-primary-700 rounded-full hover:bg-gray-100 transition-colors shadow-sm text-sm font-medium"
                          >
                            ← {t('backToServices')}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('searchingFor')} {selectedService.text}...</p>
                </div>
              ) : (
                // No results found UI
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-600 mb-2">{t('noResults')} {selectedService.text}.</p>
                  <button
                    onClick={() => handleServiceSelection(selectedService)}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    {t('tryAgain')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;