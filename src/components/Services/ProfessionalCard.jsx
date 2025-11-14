// import React from 'react';
// import { StarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/solid';
// import { HeartIcon, LanguageIcon } from '@heroicons/react/24/outline';

// const ProfessionalCard = ({ professional, serviceType }) => {
//   const isJobListing = serviceType === 'job_search';
//   const isPharmacy = serviceType === 'pharmacy';

//   const handleBooking = () => {
//     // This would open a booking modal or navigate to booking page
//     console.log('Book appointment with:', professional);
//   };

//   const handleContact = () => {
//     // This would show contact information
//     console.log('Contact:', professional);
//   };

//   if (isJobListing) {
//     // Handle job data from Firebase
//     const jobTitle = professional.jobTitle || professional.job_title || professional.title || professional.position || 'Job Position';
//     const company = professional.company || professional.company_name || professional.employer || professional.name || 'Company';
//     const location = professional.location || professional.city || professional.workplace_location || 'Location not specified';
//     const salaryMin = professional.salaryMin || professional.salary_min || professional.min_salary || 0;
//     const salaryMax = professional.salaryMax || professional.salary_max || professional.max_salary || 0;
//     const workArrangement = professional.workArrangement || professional.work_arrangement || [];
//     const requirements = professional.requirements || professional.skills || [];
//     const jobType = professional.jobType || professional.job_type || professional.employment_type || '';

//     return (
//       <div className="bg-white rounded-lg shadow-sm border p-4 service-card hover:shadow-md transition-shadow">
//         <div className="flex items-start justify-between mb-3">
//           <div>
//             <h3 className="font-semibold text-gray-900">{jobTitle}</h3>
//             <p className="text-primary font-medium">{company}</p>
//             {jobType && <p className="text-xs text-gray-500">{jobType}</p>}
//           </div>
//           <div className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium">
//             LGBTQAI+ Inclusive
//           </div>
//         </div>

//         <div className="space-y-2 mb-4">
//           <div className="flex items-center text-sm text-gray-600">
//             <MapPinIcon className="h-4 w-4 mr-1" />
//             {location}
//           </div>
//           {(salaryMin > 0 || salaryMax > 0) && (
//             <div className="flex items-center text-sm text-gray-600">
//               <span className="mr-1">💰</span>
//               {salaryMin > 0 && salaryMax > 0
//                 ? `₹${(salaryMin / 100000).toFixed(1)} - ${(salaryMax / 100000).toFixed(1)} LPA`
//                 : salaryMin > 0
//                   ? `From ₹${(salaryMin / 100000).toFixed(1)} LPA`
//                   : `Up to ₹${(salaryMax / 100000).toFixed(1)} LPA`
//               }
//             </div>
//           )}
//           {workArrangement && workArrangement.length > 0 && (
//             <div className="flex items-center text-sm text-gray-600">
//               <span className="mr-1">🏢</span>
//               {Array.isArray(workArrangement) ? workArrangement.join(', ') : workArrangement}
//             </div>
//           )}
//         </div>

//         {requirements && Array.isArray(requirements) && requirements.length > 0 && (
//           <div className="mb-4">
//             <p className="text-sm text-gray-600 mb-2">Requirements:</p>
//             <div className="flex flex-wrap gap-1">
//               {requirements.slice(0, 5).map((req, index) => (
//                 <span
//                   key={index}
//                   className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
//                 >
//                   {req}
//                 </span>
//               ))}
//               {requirements.length > 5 && (
//                 <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
//                   +{requirements.length - 5} more
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         <div className="flex space-x-2">
//           <button
//             onClick={handleBooking}
//             className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90"
//           >
//             Apply Now
//           </button>
//           <button
//             onClick={handleContact}
//             className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
//           >
//             Details
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (isPharmacy) {
//     const pharmacyServices = professional.services || [];

//     return (
//       <div className="bg-white rounded-lg shadow-sm border p-4 service-card">
//         <div className="flex items-start justify-between mb-3">
//           <div>
//             <h3 className="font-semibold text-gray-900">{professional.name || 'Pharmacy'}</h3>
//             <p className="text-sm text-gray-600">{professional.specialty || ''}</p>
//           </div>
//           {professional.discount && (
//             <div className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium">
//               {professional.discount}
//             </div>
//           )}
//         </div>

//         <div className="space-y-2 mb-4">
//           <div className="flex items-center text-sm text-gray-600">
//             <MapPinIcon className="h-4 w-4 mr-1" />
//             {professional.location || 'Location not specified'}
//           </div>
//         </div>

//         {Array.isArray(pharmacyServices) && pharmacyServices.length > 0 && (
//           <div className="mb-4">
//             <p className="text-sm text-gray-600 mb-2">Services:</p>
//             <div className="flex flex-wrap gap-1">
//               {pharmacyServices.map((service, index) => (
//                 <span
//                   key={index}
//                   className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
//                 >
//                   {service}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="flex space-x-2">
//           <button
//             onClick={handleBooking}
//             className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90"
//           >
//             Order Online
//           </button>
//           <button
//             onClick={handleContact}
//             className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
//           >
//             Call
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const fullName = `${professional.first_name || ''} ${professional.last_name || ''}`.trim();
//   const name = fullName || professional.username || professional.name || 'Professional';
//   const specialty = professional.professional_type_label
//     || professional.specialization
//     || professional.category
//     || '';
//   const experience = professional.years_of_experience || professional.experience || 'N/A';
//   const rating = professional.rating || professional.averageRating || 0;
//   const fee = professional.hourly_rate || professional.fee || 'Contact for fee';
//   const languages = professional.languages_spoken || professional.languages || ['English'];
//   const isLGBTQFriendly = professional.sensitize || professional.isLGBTQFriendly || false;
//   const availability = professional.availableSlots || professional.slots || [];
//   const location = professional.address || professional.location || 'Location not specified';
//   const hasSlots = Array.isArray(availability) && availability.length > 0;
//   return (
//     <div className="bg-white rounded-lg shadow-sm border p-4 service-card hover:shadow-md transition-shadow">
//       <div className="flex items-start justify-between mb-3">
//         <div>
//           <h3 className="font-semibold text-gray-900">{name}</h3>
//           <p className="text-sm text-gray-600">{specialty}</p>
//           <p className="text-xs text-gray-500">{experience} years experience</p>
//         </div>

//         <div className="flex items-center space-x-2">
//           {isLGBTQFriendly && (
//             <HeartIcon className="h-5 w-5 text-secondary" title="LGBTQAI+ Friendly" />
//           )}
//           {rating > 0 && (
//             <div className="flex items-center">
//               <StarIcon className="h-4 w-4 text-yellow-400" />
//               <span className="text-sm text-gray-600 ml-1">{Number(rating).toFixed(1)}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center text-sm text-gray-600">
//           <span className="mr-1">💰</span>
//           Fee: {typeof fee === 'number' ? `₹${fee}` : fee}
//         </div>

//         {languages && languages.length > 0 && (
//           <div className="flex items-center text-sm text-gray-600">
//             <LanguageIcon className="h-4 w-4 mr-1" />
//             {Array.isArray(languages) ? languages.slice(0, 2).join(', ') : languages}
//           </div>
//         )}
//       </div>

//       <div className="flex items-center text-sm text-gray-600 mb-4">
//         <MapPinIcon className="h-4 w-4 mr-1" />
//         {location}
//       </div>

//       {availability && Array.isArray(availability) && availability.length > 0 && (
//         <div className="mb-4">
//           <p className="text-sm text-gray-600 mb-2">Available slots today:</p>
//           <div className="flex flex-wrap gap-1">
//             {availability.slice(0, 4).map((slot, index) => (
//               <span
//                 key={index}
//                 className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
//               >
//                 {slot}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="flex space-x-2">
//         {hasSlots ? (
//           <button
//             onClick={handleBooking}
//             className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90"
//           >
//             Book Appointment
//           </button>
//         ) : (
//           <button
//             onClick={handleBooking} // Renamed for UI, but still uses handleBooking handler (could open a dedicated details view)
//             className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-300"
//           >
//             View Details
//           </button>
//         )}
//         <button
//           onClick={handleContact}
//           className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
//         >
//           Contact
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProfessionalCard;

// src/components/Services/ProfessionalCard.jsx (Replacing content)

import React, { useState } from 'react';
import { StarIcon, MapPinIcon, ClockIcon, CurrencyRupeeIcon, BuildingOfficeIcon, BriefcaseIcon } from '@heroicons/react/24/solid';
import { HeartIcon, LanguageIcon, CheckBadgeIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const ProfessionalCard = ({ professional, serviceType, onBook, onViewDetails, currentUserId }) => {
  const isJobListing = serviceType === 'job_search' || professional.jobTitle || professional.title;
  const isPharmacy = serviceType === 'pharmacy';
  const isLab = serviceType === 'lab_tests';

  const [isExpanded, setIsExpanded] = useState(false);

  // --- JOB LISTING LOGIC ---
  if (isJobListing) {
    const job = professional;
    const jobTitle = job.jobTitle || job.job_title || job.title || job.position || 'Job Position';
    const company = job.company || job.company_name || job.employer || 'Company';
    const location = job.location || job.city || job.workplace_location || 'Location not specified';
    const jobType = job.jobType || job.job_type || job.employment_type || job.type || 'full-time';
    const experience = job.experience || job.experience_level || job.required_experience || 'Not specified';
    const department = job.department || job.dept || '';
    const salaryMin = job.salaryMin || job.salary_min || job.min_salary || 0;
    const salaryMax = job.salaryMax || job.salary_max || job.max_salary || 0;
    const workArrangement = job.workArrangement || job.work_arrangement || job.remote_option || [];
    const companyLogoUrl = job.companyLogoUrl || job.company_logo || '';
    const isInclusive = job.isInclusive || true; // Assuming jobs are inclusive by default for demo

    return (
      <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl border-2 border-green-200 p-5 mb-4 shadow-royal hover:shadow-royal-lg transition-all duration-300">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {companyLogoUrl ? (
              <img src={companyLogoUrl} alt={company} className="w-14 h-14 rounded-xl object-cover shadow-md" />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-primary-900 mb-1">{jobTitle}</h3>
            <p className="text-base text-primary-700 font-semibold">{company}</p>
            {department && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                {department}
              </span>
            )}
            {isInclusive && (
              <span className="inline-block mt-1 ml-2 px-2 py-0.5 bg-success/10 text-success rounded-full text-xs font-semibold">
                LGBTQAI+ Inclusive
              </span>
            )}
          </div>
        </div>

        {/* Essential Info */}
        <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm">
            <MapPinIcon className="h-4 w-4 text-primary-500" />
            <span className="font-medium">{location}</span>
          </div>

          <span className="bg-primary-100 text-primary-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
            {jobType}
          </span>

          <span className="bg-secondary-100 text-secondary-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
            {experience}
          </span>

          {Array.isArray(workArrangement) && workArrangement.map((arrangement, index) => (
            <span key={index} className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
              {arrangement}
            </span>
          ))}
        </div>

        {(salaryMin > 0 || salaryMax > 0) && (
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 mb-4">
            <div className="flex items-center gap-2">
              <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
              <div>
                <span className="text-2xl font-bold text-green-600">
                  {salaryMin > 0 && salaryMax > 0
                    ? `₹${(salaryMin / 100000).toFixed(1)} - ${(salaryMax / 100000).toFixed(1)} LPA`
                    : salaryMin > 0 ? `₹${(salaryMin / 100000).toFixed(1)}+ LPA` : `Up to ₹${(salaryMax / 100000).toFixed(1)} LPA`
                  }
                </span>
                <span className="text-sm font-medium text-primary-600 ml-2">per annum</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onViewDetails?.(job)}
            className="w-full justify-center px-4 py-3 border-2 border-green-400 text-green-700 font-bold rounded-xl hover:bg-green-50 active:scale-95 transition-all flex items-center gap-2 shadow-md"
          >
             <span>Details</span>
          </button>
        </div>
      </div>
    );
  }

  // --- PROFESSIONAL / PHARMACY / LAB LOGIC ---
  
  const fullName = `${professional.first_name || ''} ${professional.last_name || ''}`.trim();
  const name = fullName || professional.username || professional.name || 'Professional';
  const specialization = professional.specialization || '';
  const professionalTypeLabel = professional.professional_type_label || professional.category || '';
  const education = professional.educational_qualification || '';
  const biography = professional.biography || '';
  const experience = professional.years_of_experience || professional.experience || 0;
  const fee = professional.hourly_rate || professional.fee || 'Contact for fee';
  const sessionDuration = professional.session_duration || 60;
  const languages = professional.languages_spoken || professional.languages || [];
  const location = professional.address || professional.location || 'Location not specified';
  const availability = professional.availableSlots || professional.slots || [];
  const verified = professional.verification_status === 'VERIFIED' || professional.professionalStatus === 'verified';
  const isLGBTQFriendly = professional.sensitize || professional.isLGBTQFriendly || true; 
  const rating = professional.rating || professional.averageRating || 0;

  const hasSlots = Array.isArray(availability) && availability.length > 0;
  const isAvailableOnline = professional.is_available_online || false;
  const isAvailableInPerson = professional.is_available_in_person || false;
  const hasAvailabilityInfo = isAvailableOnline || isAvailableInPerson;


  // Use a different color theme for non-job services
  const themeColor = isLab ? 'blue' : isPharmacy ? 'purple' : 'primary';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 mb-3 hover:border-${themeColor}-300 hover:shadow-md transition-all duration-200`}>
      {/* Header - Compact */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <div className={`w-10 h-10 bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm`}>
            {name.charAt(0).toUpperCase()}
          </div>

          {/* Name & Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-semibold text-base text-gray-900 truncate">{name}</h3>
              {verified && (
                <CheckBadgeIcon className="h-4 w-4 text-blue-500 flex-shrink-0" title="Verified" />
              )}
            </div>
            {education && (
              <p className="text-xs text-gray-600 truncate text-wrap"> {education}</p>
            )}
            {(specialization || professionalTypeLabel) && (
              <span className={`inline-block mt-1 px-2 py-0.5 bg-${themeColor}-50 text-${themeColor}-700 rounded text-xs font-medium`}>
                {specialization || professionalTypeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Rating/Friendly */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {/* {isLGBTQFriendly && (
            <span className="inline-block px-2 py-0.5 bg-secondary-100 text-secondary-800 rounded-full text-xs font-medium">
              🏳️‍🌈 Friendly
            </span>
          )} */}
          {rating > 0 && (
            <div className="flex items-center text-xs text-gray-600">
              <StarIcon className="h-3 w-3 text-yellow-500 mr-1" />
              {Number(rating).toFixed(1)}
            </div>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-600 border-t border-gray-100 pt-3">
        {experience > 0 && (
          <div className="flex items-center gap-1">
            <BriefcaseIcon className="h-3.5 w-3.5" />
            <span>{experience} y exp</span>
          </div>
        )}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        {languages && Array.isArray(languages) && languages.length > 0 && (
          <div className="flex items-center gap-1">
            <LanguageIcon className="h-3.5 w-3.5" />
            <span className="truncate">{languages.slice(0, 1).join('')}</span>
          </div>
        )}
      </div>

      {/* Availability & Price */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex gap-1.5 flex-wrap">
          {hasAvailabilityInfo ? (
            <>
              {isAvailableOnline && (
                <span className={`px-2 py-1 bg-${themeColor}-50 text-${themeColor}-700 border border-${themeColor}-200 rounded-md text-xs font-medium`}>
                  💻 Online
                </span>
              )}
              {isAvailableInPerson && (
                <span className={`px-2 py-1 bg-${themeColor}-50 text-${themeColor}-700 border border-${themeColor}-200 rounded-md text-xs font-medium`}>
                  🏥 In-Person
                </span>
              )}
            </>
          ) : (
            <span className="px-2 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs">
              Contact for availability
            </span>
          )}
        </div>

        {typeof fee === 'number' && fee > 0 && (
          <div className={`flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md border border-green-200`}>
            <CurrencyRupeeIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm font-bold text-green-700">{fee.toLocaleString()}</span>
            <span className="text-xs text-gray-500">/{sessionDuration}m</span>
          </div>
        )}
      </div>

      {/* Available Slots */}
      {hasSlots && (
        <div className="mb-4">
          <p className="text-xs text-gray-600 mb-1 font-medium">Available slots today:</p>
          <div className="flex flex-wrap gap-1">
            {availability.slice(0, 4).map((slot, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
              >
                {slot} {/* This should show the time string */}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => onBook?.(professional)}
          className={`flex-1 bg-${themeColor}-500 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-${themeColor}-600 active:scale-[0.98] transition-all shadow-sm`}
        >
          {isPharmacy || isLab ? 'View Details' : hasSlots ? 'Book Appointment' : 'View Details'}
        </button>
        <button
          onClick={() => onViewDetails?.(professional)}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center gap-1"
        >
          {biography && !isExpanded ? (
            <>
              <span>Details</span>
              <ChevronDownIcon className="h-4 w-4" />
            </>
          ) : (
            'Contact'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfessionalCard;