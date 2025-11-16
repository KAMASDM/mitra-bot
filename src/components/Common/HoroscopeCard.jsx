import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { ZODIAC_SIGNS, getDailyHoroscope } from '../../services/astrologyService';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';

const HoroscopeCard = () => {
  const { t } = useLanguage();
  const [selectedSign, setSelectedSign] = useState(null);
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignClick = async (sign) => {
    setSelectedSign(sign);
    setLoading(true);
    
    try {
      const prediction = await getDailyHoroscope(sign.id);
      setHoroscope(prediction);
    } catch (error) {
      console.error('Error fetching horoscope:', error);
      toast.error('Failed to fetch horoscope');
      setSelectedSign(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedSign(null);
    setHoroscope(null);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl p-4 shadow-sm border border-purple-100">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-purple-900">{t('dailyHoroscope')}</h3>
      </div>

      <p className="text-sm text-purple-700 mb-4">
        {t('selectZodiacSign')}
      </p>

      {/* Zodiac Signs Grid */}
      <div className="grid grid-cols-6 gap-2 mb-2">
        {ZODIAC_SIGNS.map((sign) => (
          <motion.button
            key={sign.id}
            onClick={() => handleSignClick(sign)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl hover:bg-purple-50 transition-all shadow-sm hover:shadow-md"
            title={`${sign.name} (${sign.dates})`}
          >
            <span className="text-2xl">{sign.emoji}</span>
            <span className="text-[9px] font-medium text-gray-600">{sign.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Horoscope Modal */}
      <AnimatePresence>
        {selectedSign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedSign.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold">{selectedSign.name}</h3>
                      <p className="text-xs text-purple-100">{selectedSign.dates}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                {horoscope && (
                  <p className="text-xs text-purple-100">{horoscope.date}</p>
                )}
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">{t('loadingHoroscope')}</p>
                  </div>
                ) : horoscope ? (
                  <div className="space-y-4">
                    {/* Prediction */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <SparklesIcon className="w-5 h-5 text-purple-600" />
                        <h4 className="font-bold text-purple-900">{t('todaysPrediction')}</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {horoscope.prediction}
                      </p>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-purple-100">
                      {horoscope.mood && (
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-purple-600 font-medium mb-1">{t('mood')}</p>
                          <p className="text-sm font-bold text-purple-900">{horoscope.mood}</p>
                        </div>
                      )}
                      
                      {horoscope.color && (
                        <div className="bg-pink-50 rounded-lg p-3">
                          <p className="text-xs text-pink-600 font-medium mb-1">{t('luckyColor')}</p>
                          <p className="text-sm font-bold text-pink-900 capitalize">{horoscope.color}</p>
                        </div>
                      )}
                      
                      {horoscope.luckyNumber && (
                        <div className="bg-indigo-50 rounded-lg p-3">
                          <p className="text-xs text-indigo-600 font-medium mb-1">{t('luckyNumber')}</p>
                          <p className="text-sm font-bold text-indigo-900">{horoscope.luckyNumber}</p>
                        </div>
                      )}
                      
                      {horoscope.luckyTime && (
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-purple-600 font-medium mb-1">{t('luckyTime')}</p>
                          <p className="text-sm font-bold text-purple-900">{horoscope.luckyTime}</p>
                        </div>
                      )}
                    </div>

                    {horoscope.compatibility && (
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 border border-pink-100">
                        <p className="text-xs text-pink-600 font-medium mb-1">{t('compatibility')}</p>
                        <p className="text-sm font-bold text-pink-900 capitalize">{horoscope.compatibility}</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HoroscopeCard;
