import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, SparklesIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import GoogleSignIn from './GoogleSignIn';
import LanguageSelector from '../Settings/LanguageSelector';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !displayName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, { displayName });
      toast.success(t('welcome'));
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits Section (Hidden on Mobile) */}
          <div className="hidden lg:block text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight">
                Join Our<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-200 to-purple-200">
                  Supportive Community
                </span>
              </h1>
              <p className="text-xl text-purple-100">
                A safe space for LGBTQAI+ individuals and women to access healthcare, employment, and mental health support
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                <div className="bg-indigo-500 p-3 rounded-lg">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Safe & Confidential</h3>
                  <p className="text-purple-100 text-sm">Your privacy and safety are our top priorities</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                <div className="bg-purple-500 p-3 rounded-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Expert Support</h3>
                  <p className="text-purple-100 text-sm">Connect with verified professionals who understand your needs</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all">
                <div className="bg-pink-500 p-3 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Inclusive Community</h3>
                  <p className="text-purple-100 text-sm">Be part of a welcoming, LGBTQAI+ friendly community</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full max-w-md mx-auto">
            {/* Language Selector Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowLanguageSelector(true)}
                className="px-4 py-2 text-sm bg-white backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all"
              >
                🌐 {t('changeLanguage')}
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-10 max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="text-center mb-8">
                {/* Gazra Mitra Logo */}
                <div className="w-24 h-24 bg-primary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-105 transition-transform">
                  <img 
                    src="/mitra.png" 
                    alt="Mitra Logo" 
                    className="w-16 h-16"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <span className="text-4xl hidden">👋</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Join Gazra Mitra
                </h1>
                <p className="text-gray-600">
                  Create your account to get started
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-500 text-white py-3.5 rounded-xl font-semibold hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('loading')}
                    </span>
                  ) : (
                    t('register')
                  )}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <GoogleSignIn />
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    {t('login')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LanguageSelector 
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </div>
  );
};

export default Register;