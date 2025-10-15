import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const ServiceSelector = ({ isOpen, onClose, onServiceSelect }) => {
  const { t } = useLanguage();

  const services = [
    {
      name: t('jobSearch'),
      icon: '🔍',
      description: 'Find employment opportunities and placement services',
      id: 'job_search'
    },
    {
      name: t('generalDoctor'),
      icon: '👨‍⚕️',
      description: 'Connect with general practitioners for consultations',
      id: 'general_doctor'
    },
    {
      name: t('surgicalSpecialist'),
      icon: '🏥',
      description: 'Find specialized surgeons and surgical procedures',
      id: 'surgical_specialist'
    },
    {
      name: t('mentalHealthCounselor'),
      icon: '🧠',
      description: 'Mental health support and counseling services',
      id: 'mental_health'
    },
    {
      name: t('clinicalPsychologist'),
      icon: '🩺',
      description: 'Professional therapy and psychological treatment',
      id: 'clinical_psychology'
    },
    {
      name: t('placementAgency'),
      icon: '💼',
      description: 'Employment agencies and career services',
      id: 'placement_agency'
    },
    {
      name: t('pathologyLab'),
      icon: '🔬',
      description: 'Diagnostic tests and laboratory services',
      id: 'pathology_lab'
    },
    {
      name: t('pharmacy'),
      icon: '💊',
      description: 'Discounted medications and pharmacy services',
      id: 'pharmacy'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 max-w-mobile mx-auto">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{t('serviceSelection')}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-3 max-h-96">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all service-card"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{service.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {service.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {service.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelector;