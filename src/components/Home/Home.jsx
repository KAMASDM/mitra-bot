import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from '../Chat/MessageBubble';
import QuickReplies from '../Chat/QuickReplies';
import TypingIndicator from '../Chat/TypingIndicator';
// import ServiceSelector from '../Services/ServiceSelector';
import ServiceOptionsCard from '../Services/ServiceOptionsCard';
import WeatherCard from '../Common/WeatherCard';
import NewsCard from '../Common/NewsCard';
import chatbotService from '../../services/chatbotService';
import { getProfessionalTypes, getProfessionalAvailability, createBooking, updateSlotStatus } from '../../services/databaseService';

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  // const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showServiceOptions, setShowServiceOptions] = useState(true);
  const [showNewsCard, setShowNewsCard] = useState(true);
  const [professionalTypesMap, setProfessionalTypesMap] = useState({});
  const [inputText, setInputText] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [availableSlotsMap, setAvailableSlotsMap] = useState({});
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initialize with empty messages - greeting is now in weather card
    setMessages([]);   
    const loadProfessionalTypes = async () => {
      try {
        const types = await getProfessionalTypes();
        const map = types.reduce((acc, type) => {
          // acc[type.id] = type.title || type.label;
          acc[type.id] = type;
          // acc[type.label.toLowerCase()] = type;
          return acc;
        }, {});
        setProfessionalTypesMap(map);
        console.log(' Professional Types Map loaded:', map);
      } catch (error) {
        console.error('Error loading professional types:', error);
      }
    };
    loadProfessionalTypes(); 
  }, [t]); // Reload on language change

  const addMessage = (text, sender = 'user', quickReplies = null, data = null) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
      quickReplies,
      data
    };
    setMessages(prev => [...prev, newMessage]);
  };

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
        return isToday;
      });

      // Return the live, unbooked, and uncancelled slots
      return liveSlots.map(slot => slot.start_date.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error(`Error checking availability for ${professionalId}:`, error);
      return [];
    }
  };
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage(userMessage);
    // Show typing indicator
    setIsTyping(true);

    try {
      // Process user message and generate intelligent bot response
      const botResponse = await generateBotResponse(userMessage);
      setIsTyping(false);
      // Add bot response with any additional data
      addMessage(botResponse.text, 'bot', botResponse.quickReplies, botResponse.data);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setIsTyping(false);

      // Add error fallback message
      addMessage(
        "I'm sorry, I encountered an issue. Please try asking again or contact support if the problem persists.",
        'bot',
        [
          { text: 'Try again', action: 'try_again' },
          { text: 'Main menu', action: 'main_menu' },
          { text: 'Contact support', action: 'contact_support' }
        ]
      );
    }
  };

  const generateBotResponse = async (userInput) => {
    try {
      // Use the intelligent chatbot service
      const response = await chatbotService.generateResponse(userInput, currentUser?.uid);

      // Convert the intelligent response format to our UI format
      return {
        text: response.text,
        quickReplies: response.quickReplies?.map(reply => ({
          text: reply,
          action: reply.toLowerCase().replace(/\s+/g, '_')
        })) || [],
        data: response.data // For any additional data like professional/job lists
      };
    } catch (error) {
      console.error('Error generating bot response:', error);

      // Fallback to simple responses if the intelligent service fails
      return {
        text: "I apologize, but I'm having trouble processing your request right now. How can I help you today?",
        quickReplies: [
          { text: t('jobSearch'), action: 'job_search' },
          { text: t('generalDoctor'), action: 'general_doctor' },
          { text: t('mentalHealthCounselor'), action: 'mental_health' },
          { text: 'Show all services', action: 'other_services' }
        ]
      };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDataAction = async (action, data) => {
    setIsTyping(true);

    try {
      switch (action) {
        case 'book':
          const professional = data;
          setSelectedProfessional(professional);
          setAvailableSlotsMap({});
          addMessage(`I'm checking available slots for ${professional.first_name || professional.last_name || 'the professional'}...`, 'bot');

          // Determine a time range for fetching slots (e.g., next 7 days)
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);

          // Assuming professional has a unique identifier like 'professional_id' or 'id'
          const professionalId = professional.id || professional.professional_id || professional.uid;

          if (!professionalId) {
            throw new Error('Professional ID missing for booking.');
          }

          const allSlots = await getProfessionalAvailability(
            professionalId,
            today,
            nextWeek
          );

          const availableSlots = allSlots.filter(slot => {
            const isBookedOrCancelled = slot.is_booked || slot.is_cancelled;

            // Assuming slot.start_date is a Firebase Timestamp
            const slotTime = slot.start_date.toDate ? slot.start_date.toDate() : new Date(slot.start_date);
            const isFuture = slotTime > new Date();

            // Only return slots that are NOT booked, NOT cancelled, and in the FUTURE
            return !isBookedOrCancelled && isFuture;
          });
          // --- END FETCH SLOTS LOGIC ---

          const slotsMap = availableSlots.reduce((acc, slot) => {
            acc[slot.id] = slot;
            return acc;
          }, {});

          setAvailableSlotsMap(slotsMap);
          setIsTyping(false);

          if (availableSlots.length > 0) {
            let slotsText = `📅 **Available Slots for ${professional.first_name || professional.last_name || 'Professional'}:**\n\n`;

            const groupedSlots = availableSlots.reduce((acc, slot) => {
              const dateKey = slot.start_date.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              if (!acc[dateKey]) {
                acc[dateKey] = [];
              }
              acc[dateKey].push(slot);
              return acc;
            }, {});

            Object.entries(groupedSlots).forEach(([date, slots]) => {
              slots.forEach(slot => {
                const time = slot.start_date.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                slotsText += `• ${date}, ${time} (${slot.title || 'Slot'})\n`;
              });
            });


            slotsText += `\nClick on a slot to confirm your booking.`;

            addMessage(
              slotsText,
              'bot',
              availableSlots.slice(0, 3).map(slot => ({ // Show first 3 slots as quick replies
                text: slot.start_date.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                action: `book_slot_${slot.id}` // Use unique slot ID for action
              })).concat([
                { text: 'See more slots', action: 'see_more_slots' },
                { text: 'Cancel booking', action: 'cancel_booking' }
              ])
            );
          } else {
            addMessage(
              `I'm sorry, *${professional.first_name || professional.last_name || 'the professional'}* does not have any available slots for the next 7 days.`,
              'bot',
              [
                // { text: 'Contact them directly', action: `contact_${professionalId}` },
                // { text: 'Find another professional', action: 'find_another_professional' }
              ]
            );
          }
          break;

        case 'apply':
          addMessage(`I'd like to apply for ${data.title} at ${data.company}`);
          const applyResponse = await generateBotResponse(`Apply for ${data.title} position`);
          setIsTyping(false);
          addMessage(applyResponse.text, 'bot', applyResponse.quickReplies, applyResponse.data);
          break;

        case 'view_details':
          addMessage(`Show me more details about ${data.name || data.jobTitle || data.title}`);
          setIsTyping(false);
          // Create a detailed view message with just this single item
          const detailsText = data.jobTitle ?
            `Here are the complete details for the ${data.jobTitle} position:` :
            `Here are the complete details for ${data.name}:`;
          addMessage(detailsText, 'bot', [], [data]); // Pass single item in array
          break;

        default:
          setIsTyping(false);
          addMessage("I can help you with that. What would you like to know?", 'bot');
      }
    } catch (error) {
      console.error('Error handling data action:', error);
      setIsTyping(false);
      addMessage("I apologize, but I'm having trouble processing that request. Please try again.", 'bot');
    }
  };

  const handleServiceOptionSelect = (option) => {
    // Hide service options and news card after selection
    setShowServiceOptions(false);
    setShowNewsCard(false);
    // Add user message first
    setTimeout(() => {
      handleServiceSelection(option.action);
    }, 500);
  };

  const handleQuickReply = async (reply) => {
    // Add user's selection as a message

    if (reply.action.startsWith('book_slot_')) {
      await handleSlotConfirmation(reply);
      return;
    }
    // Show typing indicator
    setIsTyping(true);

    try {
      // Use the intelligent chatbot service for quick replies too
      const botResponse = await generateBotResponse(reply.text);
      setIsTyping(false);

      addMessage(botResponse.text, 'bot', botResponse.quickReplies, botResponse.data);
    } catch (error) {
      console.error('Error in handleQuickReply:', error);
      setIsTyping(false);

      // Fallback for specific actions that need custom handling
      switch (reply.action) {
        case 'other_services':
          setShowServiceSelector(true);
          break;
        case 'job_search':
          handleJobSearch();
          break;
        case 'general_doctor':
          handleDoctorSearch();
          break;
        case 'mental_health':
          handleMentalHealthSearch();
          break;
        case 'legal_aid':
          handleLegalSearch();
          break;
        case 'specialist_care':
          handleDoctorSearch();
          break;
        case 'book_sharma':
        case 'book_patel':
        case 'book_singh':
        case 'book_mehta':
        case 'book_kumar':
          handleBookingSelection(reply);
          break;
        case 'book_slot_10':
        case 'book_slot_14':
        case 'book_slot_16':
          handleSlotConfirmation(reply);
          break;
        case 'apply_job_1':
          handleJobApplication();
          break;
        case 'filter_location':
          handleLocationFilter();
          break;
        case 'more_doctors':
          handleDoctorSearch();
          break;
        case 'back_to_services':
          handleBackToServices();
          break;
        case 'order_medplus':
        case 'visit_community':
          handlePharmacySelection(reply);
          break;
        case 'blood_tests':
        case 'health_package':
        case 'hormone_tests':
          handleTestSelection(reply);
          break;
        default:
          addMessage("I'll help you find the right service. Let me search for options...", 'bot');
      }
    }
  };

  const handleSlotConfirmation = async (reply) => {
    if (!currentUser?.uid) {
      toast.error('Please log in to confirm your booking.');
      setIsTyping(false);
      return;
    }
    // 1. Extract slotId from action (e.g., 'book_slot_BDMF6H8H')
    const slotId = reply.action.replace('book_slot_', '');
    const slot = availableSlotsMap[slotId];
    const professional = selectedProfessional;

    if (!slot || !professional || !currentUser?.uid) {
      console.error('Step A: Missing data for booking confirmation:', { slot, professional, currentUser });
      toast.error('Booking failed: Missing slot or professional data.');
      setIsTyping(false);
      return;
    }
    // 2. Prepare display names and date/time
    const professionalName = professional.first_name || professional.last_name || 'Professional';
    const slotTime = slot.start_date.toDate();
    const formattedTime = slotTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = slotTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const location = slot.location || professional.address || 'Location not specified';
    const fee = professional.hourly_rate || slot.fee || 'Contact for fee';

    setIsTyping(true);
    addMessage(`Attempting to book slot at ${formattedTime} on ${formattedDate}...`, 'bot');

    try {
      await updateSlotStatus(slotId, {
        is_booked: true,
        booked_by_uid: currentUser.uid, // Map this professional & user id       
      });

      // B. Create the formal booking record in the 'bookings' collection
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

      const newBooking = await createBooking(bookingRecord);

      // C. Final update to availabilitySlots with the real booking ID
      await updateSlotStatus(slotId, {
        is_booked: true, // Set to true
        booked_by_uid: currentUser.uid, // Store the client's UID
        booking_id: newBooking.id
      });

      await new Promise(resolve => setTimeout(resolve, 1500)); // Delay for effect
      setIsTyping(false);

      addMessage(
        `✅ **Appointment Confirmed!**\n\n` +
        `📅 Date: ${formattedDate}\n` +
        `🕒 Time: ${formattedTime}\n` +
        `👨‍⚕️ Professional: ${professionalName}\n` +
        `📍 Location: ${location}\n` +
        `💰 Fee: ${typeof fee === 'number' ? `₹${fee}` : fee}\n\n` +
        `Your Booking ID is: **${newBooking.id}**\n\n` +
        `📱 You'll receive SMS and app notifications.\n` +
        `📋 Please bring your ID and any previous reports.\n\n` +
        `Is there anything else I can help you with?`,
        'bot',
        [
          { text: 'Add to calendar', action: 'add_calendar' },
          { text: 'Get directions', action: 'get_directions' },
          { text: 'Find another service', action: 'back_to_services' },
          { text: 'That\'s all, thanks!', action: 'end_conversation' }
        ]
      );

      // Clean up state after successful booking
      setSelectedProfessional(null);
      setAvailableSlotsMap({});

    } catch (error) {
      console.error('Error in handleSlotConfirmation:', error);
      setIsTyping(false);
      // toast.error('Booking failed. Please try again or check console for details.');
      addMessage(
        `❌ I encountered an error while trying to confirm your appointment with ${professionalName}. Please try again later.`,
        'bot',
        [
          { text: 'Try again', action: `book_slot_${slotId}` },
          { text: 'Contact support', action: 'contact_support' }
        ]
      );
    }
  };
  const handleJobApplication = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTyping(false);

    addMessage(
      `🎉 **Application Started!**\n\n` +
      `I'm redirecting you to the job application portal...\n\n` +
      `📋 **What's needed:**\n` +
      `• Updated resume\n` +
      `• Portfolio (if applicable)\n` +
      `• Cover letter\n\n` +
      `💡 **Tip:** Mention your community involvement and unique perspective!\n\n` +
      `Would you like help with anything else?`,
      'bot',
      [
        { text: 'Help with resume', action: 'resume_help' },
        { text: 'Find more jobs', action: 'more_jobs' },
        { text: 'Career counseling', action: 'career_counseling' },
        // { text: 'Back to services', action: 'back_to_services' }
      ]
    );
  };

  const handleLocationFilter = () => {
    addMessage(
      `📍 **Choose your preferred location:**`,
      'bot',
      [
        { text: 'Remote only', action: 'location_remote' },
        { text: 'Ahmedabad', action: 'location_ahmedabad' },
        { text: 'Vadodara', action: 'location_vadodara' },
        { text: 'Surat', action: 'location_surat' },
        { text: 'Any location', action: 'location_any' }
      ]
    );
  };

  const handleBackToServices = () => {
    // Reset to initial homepage state
    setMessages([]);
    setShowServiceOptions(true);
    setShowNewsCard(true);
    setIsTyping(false);

    // Scroll to top to show the service options
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePharmacySelection = async (reply) => {
    const pharmacy = reply.action === 'order_medplus' ? 'MedPlus' : 'Community Pharmacy';
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(false);

    addMessage(
      `🎯 **${pharmacy} Selected**\n\n` +
      `What would you like to do?`,
      'bot',
      [
        { text: 'Order medicines', action: 'order_medicines' },
        { text: 'Upload prescription', action: 'upload_prescription' },
        { text: 'Check medicine prices', action: 'check_prices' },
        { text: 'Get directions', action: 'pharmacy_directions' }
      ]
    );
  };

  const handleTestSelection = async (reply) => {
    const testType = reply.text.toLowerCase();
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(false);

    addMessage(
      `🔬 **${reply.text} Information**\n\n` +
      `📋 Available packages and pricing:\n` +
      `• Basic ${testType}: ₹800-1200\n` +
      `• Comprehensive ${testType}: ₹1500-2500\n` +
      `• Premium ${testType}: ₹2500-4000\n\n` +
      `🏠 Home collection available\n` +
      `📱 Reports via WhatsApp\n\n` +
      `Would you like to book a test?`,
      'bot',
      [
        { text: 'Book basic package', action: 'book_basic_test' },
        { text: 'Book comprehensive', action: 'book_comprehensive_test' },
        { text: 'Schedule home collection', action: 'schedule_collection' },
        { text: 'Compare labs', action: 'compare_labs' }
      ]
    );
  };

  const handleJobSearch = async () => {
    addMessage(
      "Great! I'll help you find job opportunities. Let me search for available positions...",
      'bot'
    );
    setIsTyping(true);
    try {
      // Fetch all active jobs from database
      const { searchJobs } = await import('../../services/databaseService');
      const jobs = await searchJobs({ limit: 50 });
      console.log('Fetched jobs:', jobs);
      setIsTyping(false);

      if (jobs.length === 0) {
        addMessage(
          "I couldn't find any active job postings at the moment. Please try again later or contact support.",
          'bot',
          [
            { text: 'Try again', action: 'job_search' },
            // { text: '← Back to Services', action: 'back_to_services' }
          ]
        );
      } else {
        addMessage(
          `Found ${jobs.length} job opportunities. Click on any card below to view details or apply.`,
          'bot',
          [
            // { text: '← Back to Services', action: 'back_to_services' }
          ],
          jobs // Pass jobs as data
        );
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      console.error('Error details:', error.message, error.stack);
      setIsTyping(false);
      addMessage(
        `I'm having trouble fetching jobs right now: ${error.message}. Please try again.`,
        'bot',
        [
          { text: 'Try again', action: 'job_search' },
          // { text: '← Back to Services', action: 'back_to_services' }
        ]
      );
    }
  };

  const handleExperienceSelection = async (reply) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTyping(false);

    const experienceLevel = reply.action.replace('experience_', '');
    const jobListings = getJobListingsByExperience(experienceLevel);

    addMessage(
      `Perfect! Here are job opportunities for ${reply.text.toLowerCase()} level:\n\n${jobListings}`,
      'bot',
      [
        { text: 'Apply to first job', action: 'apply_job_1' },
        { text: 'See more details', action: 'job_details' },
        { text: 'Filter by location', action: 'filter_location' },
        // { text: 'Back to services', action: 'back_to_services' }
      ]
    );
  };

  const getJobListingsByExperience = (level) => {
    const jobListings = {
      fresher: `💼 **Software Developer Trainee**
🏢 TechStart India
💰 ₹2.5-4 LPA
📍 Remote/Ahmedabad
✨ LGBTQAI+ Inclusive Employer
📝 Requirements: Basic programming, willingness to learn

💼 **Content Writer**
🏢 Digital Marketing Agency
💰 ₹2-3.5 LPA  
📍 Vadodara
✨ Women-led Organization
📝 Requirements: Good English, creative writing

💼 **Customer Support Executive**
🏢 E-commerce Startup
💰 ₹2-3 LPA
📍 Work from home
✨ Diversity-focused company
📝 Requirements: Communication skills, Hindi/Gujarati`,

      junior: `💼 **Frontend Developer**
🏢 WebTech Solutions
💰 ₹4-6 LPA
📍 Remote/Surat
✨ LGBTQAI+ Inclusive Employer
📝 Requirements: React, 1-3 years experience

💼 **Digital Marketing Specialist**
🏢 Creative Agency
💰 ₹3.5-5.5 LPA
📍 Ahmedabad
✨ Equal opportunity employer
📝 Requirements: SEO, Social media, 2+ years exp

💼 **HR Associate**
🏢 Consulting Firm
💰 ₹3-5 LPA
📍 Vadodara
✨ Diversity champion
📝 Requirements: HR degree, 1-2 years experience`,

      mid: `💼 **Senior Developer**
🏢 InnovateTech
💰 ₹8-12 LPA
📍 Remote/Pune
✨ LGBTQAI+ Inclusive Employer
📝 Requirements: Full-stack, 3-7 years experience

💼 **Project Manager**
🏢 Global Solutions
💰 ₹7-11 LPA
📍 Ahmedabad
✨ Progressive workplace
📝 Requirements: PMP, 5+ years experience

💼 **UX Designer**
🏢 Design Studio
💰 ₹6-9 LPA
📍 Remote
✨ Creative inclusive environment
📝 Requirements: UI/UX portfolio, 4+ years exp`,

      senior: `💼 **Technical Lead**
🏢 Enterprise Corp
💰 ₹15-25 LPA
📍 Mumbai/Remote
✨ LGBTQAI+ Inclusive Employer
📝 Requirements: Team leadership, 7+ years experience

💼 **Senior Consultant**
🏢 Strategy Consulting
💰 ₹12-20 LPA
📍 Ahmedabad
✨ Diversity & inclusion leader
📝 Requirements: MBA, 8+ years experience

💼 **Head of Marketing**
🏢 HealthTech Startup
💰 ₹18-30 LPA
📍 Vadodara/Hybrid
✨ Women leadership encouraged
📝 Requirements: Marketing strategy, 10+ years exp`
    };

    return jobListings[level] || "No jobs found for this experience level.";
  };

  const handleDoctorSearch = async () => {
    addMessage(
      "I'm searching for doctors in your area...",
      'bot'
    );
    setIsTyping(true);

    try {
      // Use 'mbbs' as the category label for doctors/surgeons
      const { getProfessionalsByCategory } = await import('../../services/databaseService');
      const doctors = await getProfessionalsByCategory('mbbs');

      console.log('Fetched doctors:', doctors);
      const doctorsWithLiveSlotsPromises = doctors.map(async (doc) => {

        const professionalId = doc.id;
        const name = doc.first_name || doc.name || doc.displayName || 'Unknown Professional';
        // console.log(`DEBUG: Checking slots for Professional: ${name}, ID: ${professionalId}`);

        const liveSlots = await checkIfAvailableToday(professionalId);
        // console.log(`DEBUG: Professional ${name} returned ${liveSlots.length} available slots.`);
        return {
          ...doc,
          professional_type_label: professionalTypesMap[doc.professional_type_id]?.title || 'Healthcare Professional',
          availableSlots: liveSlots,
        };
      });
      const doctorsWithTitles = await Promise.all(doctorsWithLiveSlotsPromises);

      setIsTyping(false);

      if (doctorsWithTitles.length === 0) {
        addMessage(
          "I couldn't find any doctors at the moment. This might be a database issue. Please contact support.",
          'bot',
          [],
        );
      } else {

        console.log('Doctors with titles:', doctorsWithTitles);
        addMessage(
          `Found ${doctorsWithTitles.length} healthcare professionals. Click on any card below to view details or book an appointment.`,
          'bot',
          [
            // { text: '← Back to Services', action: 'back_to_services' }
          ],
          doctorsWithTitles
        );
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      console.error('Error details:', error.message, error.stack);
      setIsTyping(false);
      addMessage(
        `I'm having trouble fetching doctors right now: ${error.message}. Please try again.`,
        'bot',
        [
          { text: 'Try again', action: 'general_doctor' },
          // { text: 'Back to services', action: 'back_to_services' }
        ]
      );
    }
  };

  const handleMentalHealthSearch = async () => {
    addMessage(
      "I understand you're looking for mental health support. Let me find qualified counselors...",
      'bot'
    );

    setIsTyping(true);

    try {
      // Use 'mental' as the category label for mental health professionals
      const { getProfessionalsByCategory } = await import('../../services/databaseService');
      const counselors = await getProfessionalsByCategory('mental');

      console.log('Fetched mental health professionals:', counselors);

      setIsTyping(false);

      if (counselors.length === 0) {
        addMessage(
          "I couldn't find any mental health professionals at the moment. Please try again later or contact support.",
          'bot',
          [
            { text: 'Try again', action: 'mental_health' },
            // { text: 'Back to services', action: 'back_to_services' }
          ]
        );
      } else {
        // ATTACH TITLE: professional_type_id ko title se map karein
        const counselorsWithTitles = counselors.map(doc => ({
          ...doc,
          professional_type_label: professionalTypesMap[doc.professional_type_id]?.title || 'Mental Health Professional'
        }));

        addMessage(
          `Found ${counselorsWithTitles.length} mental health professionals. Click on any card below to view details or book an appointment.`,
          'bot',
          [
            // { text: '← Back to Services', action: 'back_to_services' }
          ],
          counselorsWithTitles // Pass mapped data
        );
      }
    } catch (error) {
      console.error('Error fetching mental health professionals:', error);
      console.error('Error details:', error.message, error.stack);
      setIsTyping(false);
      addMessage(
        `I'm having trouble fetching mental health professionals: ${error.message}. Please try again.`,
        'bot',
        [
          { text: 'Try again', action: 'mental_health' },
          // { text: 'Back to services', action: 'back_to_services' }
        ]
      );
    }
  };

  const handleLegalSearch = async () => {
    addMessage(
      "I'm searching for legal aid and counselors in your area...",
      'bot'
    );

    setIsTyping(true);

    try {
      const { getProfessionalsByCategory } = await import('../../services/databaseService');
      const legalProfessionals = await getProfessionalsByCategory('legal');

      console.log('Fetched legal professionals:', legalProfessionals);

      setIsTyping(false);

      if (legalProfessionals.length === 0) {
        addMessage(
          "I couldn't find any legal professionals at the moment. Please try again later or contact support.",
          'bot',
          [
            { text: 'Try again', action: 'legal_aid' },
            { text: 'Back to services', action: 'back_to_services' }
          ]
        );
      } else {
        const professionalsWithTitles = legalProfessionals.map(doc => ({
          ...doc,
          professional_type_label: professionalTypesMap[doc.professional_type_id]?.title || 'Legal Professional'
        }));

        addMessage(
          `Found ${professionalsWithTitles.length} legal professionals offering aid. Click on any card below to view details or book a consultation.`,
          'bot',
          [
            // { text: 'Filter by specialty', action: 'filter_legal_specialty' }
          ],
          professionalsWithTitles
        );
      }
    } catch (error) {
      console.error('Error fetching legal professionals:', error);
      setIsTyping(false);
      addMessage(
        `I'm having trouble fetching legal professionals right now: ${error.message}. Please try again.`,
        'bot',
        [
          { text: 'Try again', action: 'legal_aid' },
          { text: 'Back to services', action: 'back_to_services' }
        ]
      );
    }
  };

  const handleBookingSelection = async (reply) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTyping(false);

    const doctorName = reply.action.replace('book_', '').replace('_', ' ');
    addMessage(
      `Great choice! I'm checking available slots for Dr. ${doctorName}...\n\n` +
      `📅 **Available Slots Tomorrow (14 Oct):**\n` +
      `• 10:00 AM - Available\n` +
      `• 2:00 PM - Available\n` +
      `• 4:30 PM - Available\n\n` +
      `Which time works best for you?`,
      'bot',
      [
        { text: '10:00 AM', action: 'book_slot_10' },
        { text: '2:00 PM', action: 'book_slot_14' },
        { text: '4:30 PM', action: 'book_slot_16' },
        { text: 'See other days', action: 'other_days' }
      ]
    );
  };

  const handleServiceSelection = async (service) => {
    // setShowServiceSelector(false);
    setShowServiceOptions(false);

    // Handle both object and string inputs
    const serviceName = typeof service === 'string' ? service : service.name || service.text;
    const serviceId = typeof service === 'string' ? service : service.id || service.action;

    // if (serviceName) {
    //   addMessage(serviceName);
    // }
    // Process the selected service
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTyping(false);

    // Route to appropriate handler based on service type
    switch (serviceId) {
      case 'job_search':
        handleJobSearch();
        break;
      case 'general_doctor':
        handleDoctorSearch();
        break;
      case 'mental_health':
        handleMentalHealthSearch();
        break;
      case 'legal_aid':
        handleLegalSearch();
        break;
      case 'specialist_care':
        handleDoctorSearch();
        break;
      case 'pharmacy':
        handlePharmacySearch();
        break;
      case 'pathology_lab':
      case 'lab_tests':
        handlePathologySearch();
        break;
      default:
        addMessage(
          `I'm searching for ${service.name} providers in your area...\n\n` +
          `Found 3 providers near you. Would you like to see the list?`,
          'bot',
          [
            { text: 'Yes, show providers', action: 'show_providers' },
            { text: 'Filter by distance', action: 'filter_distance' },
            // { text: 'Back to services', action: 'back_to_services' }
          ]
        );
    }
  };

  const handlePharmacySearch = async () => {
    addMessage(
      "💊 I'm searching for pharmacies with discounts and community support...",
      'bot'
    );
    setIsTyping(true);

    try {
      const { getProfessionalsByCategory } = await import('../../services/databaseService');
      const pharmacies = await getProfessionalsByCategory('pharmacy'); // Use 'pharmacy' category

      console.log('Fetched pharmacies:', pharmacies);

      setIsTyping(false);

      if (pharmacies.length === 0) {
        addMessage(
          "I couldn't find any pharmacies in our network at the moment. Please try again later or contact support.",
          'bot',
          [
            { text: 'Try again', action: 'pharmacy' },
          ]
        );
      } else {

        const professionalsWithTitles = pharmacies.map(doc => ({
          ...doc,
          professional_type_label: professionalTypesMap[doc.professional_type_id]?.title || 'Pharmacy / Medicine Supplier'
        }));

        addMessage(
          `Found ${professionalsWithTitles.length} discounted pharmacies. Click on any card below to view details or order online.`,
          'bot',
          [
            // { text: 'Upload Prescription', action: 'upload_prescription' }
          ],
          professionalsWithTitles // Pass data to render cards
        );
      }
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      setIsTyping(false);
      addMessage(
        `I'm having trouble fetching pharmacies right now: ${error.message}. Please try again.`,
        'bot',
        [
          { text: 'Try again', action: 'pharmacy' },
          { text: 'Back to services', action: 'back_to_services' }
        ]
      );
    }
  };

  const handlePathologySearch = async () => {
    addMessage(
      "🔬 I'm searching for pathology labs and diagnostic centers in your area...",
      'bot'
    );

    setIsTyping(true);

    try {
      const { getProfessionalsByCategory } = await import('../../services/databaseService');
      const labs = await getProfessionalsByCategory('pathology'); // Use 'pathology' category

      console.log('Fetched pathology labs:', labs);

      setIsTyping(false);

      if (labs.length === 0) {
        addMessage(
          "I couldn't find any pathology labs at the moment. Please try again later or contact support.",
          'bot',
          [
            // { text: 'Try again', action: 'pathology_lab' },
            // { text: 'Back to services', action: 'back_to_services' }
          ]
        );
      } else {

        const professionalsWithTitles = labs.map(doc => ({
          ...doc,
          professional_type_label: professionalTypesMap[doc.professional_type_id]?.title || 'Pathology Lab / Diagnostic Center'
        }));

        addMessage(
          `Found ${professionalsWithTitles.length} pathology labs and diagnostic centers. Click on any card below to view details or book a test.`,
          'bot',
          [
            // { text: 'Compare Packages', action: 'compare_packages' }
          ],
          professionalsWithTitles // Pass data to render cards
        );
      }
    } catch (error) {
      console.error('Error fetching pathology labs:', error);
      setIsTyping(false);
      addMessage(
        `I'm having trouble fetching pathology labs right now: ${error.message}. Please try again.`,
        'bot',
        [
          { text: 'Try again', action: 'pathology_lab' },
          { text: 'Back to services', action: 'back_to_services' }
        ]
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* Weather Card - Show at the top */}
        <div className="mb-4">
          <WeatherCard />
        </div>

        {/* News Card - Show community updates only when no service selected */}
        {showNewsCard && messages.length === 0 && (
          <div className="mb-4">
            <NewsCard />
          </div>
        )}

        {/* Service Options Chips - Show when no conversation started */}
        {showServiceOptions && messages.length === 0 && (
          <div className="message-slide-in">
            <ServiceOptionsCard onOptionSelect={handleServiceOptionSelect} />
          </div>
        )}

        {/* Messages with reduced spacing when following weather card */}
        <div className={messages.length > 0 ? 'space-y-4' : ''}>
          {messages.map((message) => (
            <div key={message.id} className="message-slide-in">
              <MessageBubble message={message} onDataAction={handleDataAction} />
              {message.quickReplies && (
                <QuickReplies
                  replies={message.quickReplies}
                  onReplyClick={handleQuickReply}
                />
              )}
            </div>
          ))}
        </div>

        {isTyping && (
          <div className="mt-4">
            <TypingIndicator />
          </div>
        )}
        {messages.length > 0 && (
          <div className="mt-6 mb-4 flex ">
            <button
              onClick={handleBackToServices}
              className="flex items-center gap-2 px-4 py-2 border border-primary-200 text-primary-700 rounded-full hover:bg-gray-100 transition-colors shadow-sm text-sm font-medium"
            >
              ← Back to Services
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="fixed bottom-20 left-0 right-0 max-w-mobile mx-auto bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('typeMessage') || 'Type a message...'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Service Selector Modal */}
      {/* <ServiceSelector
        isOpen={showServiceSelector}
        onClose={() => setShowServiceSelector(false)}
        onServiceSelect={handleServiceSelection}
      /> */}
    </div>
  );
};

export default Home;