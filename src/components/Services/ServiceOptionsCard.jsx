import React from 'react';
// import { 
//   BriefcaseIcon, 
//   HeartIcon, 
//   ScaleIcon,
//   CurrencyDollarIcon,
//   BeakerIcon,
//   ShieldCheckIcon,
//   HomeModernIcon,
//   AcademicCapIcon
// } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const ServiceOptionsCard = ({ onOptionSelect }) => {
  const { t } = useLanguage();
  
  const quickServices = [
    { text: t('jobSearchChip'), action: 'job_search', icon: '💼' },
    { text: t('generalDoctorChip'), action: 'general_doctor', icon: '👨‍⚕️' },
    { text: t('mentalHealthChip'), action: 'mental_health', icon: '🧠' },
    { text: t('specialistChip'), action: 'specialist_care', icon: '🏥' },
    { text: t('legalAidChip'), action: 'legal_aid', icon: '⚖️' },
    { text: t('labTestsChip'), action: 'lab_tests', icon: '🔬' },
    { text: t('pharmacyChip'), action: 'pharmacy', icon: '💊' },
  ];

  return (
    <div className="space-y-3">
      <div className="text-center ">
        <p className="text-sm font-medium text-primary-700">{t('howCanIHelp')}</p>
      </div>

      {/* Chip-based service selector with theme colors */}
      <div className="flex flex-wrap gap-2 justify-center">
        {quickServices.map((service, index) => (
          <button
            key={index}
            onClick={() => onOptionSelect(service)}
            className="
              flex items-center gap-2 px-3 py-2 rounded-full 
              bg-white border border-primary-200
              hover:bg-primary-50 hover:border-primary-300
              active:scale-95
              transition-all duration-200 
              shadow-sm hover:shadow-md
              text-primary-800 font-medium text-sm
            "
          >
            <span className="text-base">{service.icon}</span>
            <span>{service.text}</span>
          </button>
        ))}
      </div>

      {/* Quick tip */}
      <div className="mt-3 p-2.5 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
        <p className="text-xs text-primary-600 text-center">
          💡 <span className="font-medium">{t('tipMessage')}</span>
        </p>
      </div>
    </div>
  );
};

export default ServiceOptionsCard;