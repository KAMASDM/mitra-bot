import { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  UserCircleIcon,
  AcademicCapIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { createProfessionalProfile } from '../../services/professionalService';
import toast from 'react-hot-toast';

const PROFESSIONAL_TYPES = [
  { id: 1, name: 'mbbs', label: 'General Doctor (MBBS)', icon: '👨‍⚕️' },
  { id: 2, name: 'mental', label: 'Mental Health Counselor', icon: '🧠' },
  { id: 3, name: 'legal', label: 'Legal Advisor', icon: '⚖️' },
  { id: 4, name: 'placement', label: 'Placement Agency', icon: '💼' },
  { id: 5, name: 'pathology', label: 'Pathology Lab', icon: '🔬' },
  { id: 6, name: 'pharmacy', label: 'Pharmacy', icon: '💊' },
];

const ProfessionalRegistration = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Professional Type
    professional_type_id: '',
    professional_type_label: '',
    category: '',

    // Step 2: Personal Info
    first_name: '',
    last_name: '',
    email: currentUser?.email || '',
    phone: '',

    // Step 3: Qualifications
    educational_qualification: '',
    specialization: '',
    years_of_experience: 0,
    biography: '',

    // Step 4: Pricing & Availability
    hourly_rate: '',
    session_duration: 60,
    is_available_online: true,
    is_available_in_person: false,
    address: '',
    languages_spoken: [],

    // Step 5: Additional Info
    sensitize: false,
  });

  const LANGUAGES = ['English', 'Hindi', 'Gujarati', 'Marathi'];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleLanguage = (language) => {
    const languages = formData.languages_spoken;
    if (languages.includes(language)) {
      handleInputChange('languages_spoken', languages.filter(l => l !== language));
    } else {
      handleInputChange('languages_spoken', [...languages, language]);
    }
  };

  const handleTypeSelect = (type) => {
    setFormData({
      ...formData,
      professional_type_id: type.id,
      professional_type_label: type.label,
      category: type.name,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.professional_type_id !== '';
      case 2:
        return formData.first_name && formData.last_name && formData.phone;
      case 3:
        return formData.educational_qualification && formData.specialization;
      case 4:
        return formData.hourly_rate && formData.languages_spoken.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error('Please log in to continue');
      return;
    }

    try {
      setLoading(true);

      const profileData = {
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`,
        hourly_rate: parseFloat(formData.hourly_rate),
        years_of_experience: parseInt(formData.years_of_experience),
      };

      await createProfessionalProfile(currentUser.uid, profileData);
      
      toast.success('Profile created successfully! Pending verification.');
      navigate('/professional/dashboard');
    } catch (error) {
      console.error('Error creating professional profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full
                  font-bold text-sm
                  ${s === step
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {s < step ? '✓' : s}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          {/* Step 1: Professional Type */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <UserCircleIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Select Your Professional Type
                </h2>
                <p className="text-gray-600">
                  Choose the category that best describes your services
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROFESSIONAL_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type)}
                    className={`
                      p-6 rounded-xl border-2 text-left
                      transition-all duration-200
                      ${formData.professional_type_id === type.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow'
                      }
                    `}
                  >
                    <div className="text-4xl mb-3">{type.icon}</div>
                    <h3 className="font-semibold text-gray-900">{type.label}</h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <UserCircleIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Personal Information
                </h2>
                <p className="text-gray-600">
                  Tell us about yourself
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Qualifications */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <AcademicCapIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Professional Qualifications
                </h2>
                <p className="text-gray-600">
                  Share your credentials and experience
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Educational Qualification *
                  </label>
                  <input
                    type="text"
                    value={formData.educational_qualification}
                    onChange={(e) => handleInputChange('educational_qualification', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g., MBBS, MD, MSW, LLB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g., Child Psychology, Corporate Law"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.years_of_experience}
                    onChange={(e) => handleInputChange('years_of_experience', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Biography
                  </label>
                  <textarea
                    value={formData.biography}
                    onChange={(e) => handleInputChange('biography', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Brief description of your expertise and approach..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pricing & Availability */}
          {step === 4 && (
            <div>
              <div className="text-center mb-8">
                <CurrencyRupeeIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Pricing & Availability
                </h2>
                <p className="text-gray-600">
                  Set your rates and availability preferences
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="1000"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Duration (min)
                    </label>
                    <select
                      value={formData.session_duration}
                      onChange={(e) => handleInputChange('session_duration', parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.is_available_online}
                        onChange={(e) => handleInputChange('is_available_online', e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <span className="font-medium">Online Consultations</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.is_available_in_person}
                        onChange={(e) => handleInputChange('is_available_in_person', e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <span className="font-medium">In-Person Consultations</span>
                    </label>
                  </div>
                </div>

                {formData.is_available_in_person && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic/Office Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Enter your clinic or office address"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages Spoken *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((language) => (
                      <button
                        key={language}
                        onClick={() => toggleLanguage(language)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium
                          transition-all duration-200
                          ${formData.languages_spoken.includes(language)
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Additional Info */}
          {step === 5 && (
            <div>
              <div className="text-center mb-8">
                <CheckCircleIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Almost Done!
                </h2>
                <p className="text-gray-600">
                  Just a few more details
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sensitize}
                      onChange={(e) => handleInputChange('sensitize', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded mt-1"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        LGBTQAI+ Friendly Professional
                      </h3>
                      <p className="text-sm text-gray-700">
                        I am trained and sensitized to provide services to LGBTQAI+ community members 
                        in a safe, inclusive, and affirming environment.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Review Your Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{formData.professional_type_label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.first_name} {formData.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialization:</span>
                      <span className="font-medium">{formData.specialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium">₹{formData.hourly_rate}/session</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Languages:</span>
                      <span className="font-medium">{formData.languages_spoken.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Your profile will be reviewed by our team before going live. 
                    This usually takes 24-48 hours. You'll receive an email once verified.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="
                  flex items-center justify-center gap-2
                  flex-1 px-6 py-3 rounded-xl
                  border-2 border-gray-300 text-gray-700
                  font-medium
                  hover:bg-gray-50 active:scale-95
                  transition-all duration-200
                "
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="
                  flex items-center justify-center gap-2
                  flex-1 px-6 py-3 rounded-xl
                  bg-indigo-500 text-white
                  font-medium
                  hover:bg-indigo-600 active:scale-95
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                Next
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="
                  flex items-center justify-center gap-2
                  flex-1 px-6 py-3 rounded-xl
                  bg-green-500 text-white
                  font-medium
                  hover:bg-green-600 active:scale-95
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Submit for Verification
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRegistration;
