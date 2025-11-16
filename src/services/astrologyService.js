// Horoscope Service with fallback content
// Using local generated horoscopes as free APIs are unreliable

// Zodiac signs with their details
export const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Aries', icon: '♈', emoji: '🐏', dates: 'Mar 21 - Apr 19' },
  { id: 'taurus', name: 'Taurus', icon: '♉', emoji: '🐂', dates: 'Apr 20 - May 20' },
  { id: 'gemini', name: 'Gemini', icon: '♊', emoji: '👯', dates: 'May 21 - Jun 20' },
  { id: 'cancer', name: 'Cancer', icon: '♋', emoji: '🦀', dates: 'Jun 21 - Jul 22' },
  { id: 'leo', name: 'Leo', icon: '♌', emoji: '🦁', dates: 'Jul 23 - Aug 22' },
  { id: 'virgo', name: 'Virgo', icon: '♍', emoji: '👧', dates: 'Aug 23 - Sep 22' },
  { id: 'libra', name: 'Libra', icon: '♎', emoji: '⚖️', dates: 'Sep 23 - Oct 22' },
  { id: 'scorpio', name: 'Scorpio', icon: '♏', emoji: '🦂', dates: 'Oct 23 - Nov 21' },
  { id: 'sagittarius', name: 'Sagittarius', icon: '♐', emoji: '🏹', dates: 'Nov 22 - Dec 21' },
  { id: 'capricorn', name: 'Capricorn', icon: '♑', emoji: '🐐', dates: 'Dec 22 - Jan 19' },
  { id: 'aquarius', name: 'Aquarius', icon: '♒', emoji: '🏺', dates: 'Jan 20 - Feb 18' },
  { id: 'pisces', name: 'Pisces', icon: '♓', emoji: '🐟', dates: 'Feb 19 - Mar 20' }
];

// Daily horoscope predictions (rotated based on day of year)
const HOROSCOPE_PREDICTIONS = {
  aries: [
    "Your energy and enthusiasm will inspire those around you today. Channel your natural leadership into positive action. A new opportunity may present itself.",
    "Bold decisions await you today. Trust your instincts and don't be afraid to take the initiative. Your courage will be rewarded.",
    "Today brings fresh perspectives and exciting challenges. Your pioneering spirit will help you overcome any obstacles in your path."
  ],
  taurus: [
    "Patience and persistence will serve you well today. Focus on building solid foundations for your future goals. Financial stability is within reach.",
    "Your practical approach will help solve a challenging situation. Stay grounded and trust in your abilities. Comfort and security are priorities.",
    "Today favors careful planning and steady progress. Your determination will help you achieve your objectives. Take time to appreciate life's pleasures."
  ],
  gemini: [
    "Communication is your strength today. Share your ideas and connect with others. New information could lead to exciting opportunities.",
    "Your adaptability will be tested today in positive ways. Embrace change and stay curious. Multiple projects may demand your attention.",
    "Mental agility and quick thinking will serve you well. Network and exchange ideas. Your versatility opens many doors."
  ],
  cancer: [
    "Trust your intuition today as it guides you toward the right path. Nurture your relationships and home life. Emotional connections deepen.",
    "Your caring nature will be appreciated by those close to you. Focus on creating a harmonious environment. Family matters take priority.",
    "Emotional intelligence is your superpower today. Listen to your heart while staying protective of your energy. Home brings comfort."
  ],
  leo: [
    "Your natural charisma shines brightly today. Step into the spotlight and share your talents. Recognition and appreciation are coming your way.",
    "Confidence and creativity flow naturally today. Express yourself boldly and inspire others. Your generous spirit attracts positive energy.",
    "Leadership opportunities arise. Your warm heart and strong presence make a lasting impact. Celebrate your achievements."
  ],
  virgo: [
    "Attention to detail will bring success today. Your analytical skills help solve complex problems. Organization leads to efficiency.",
    "Practical solutions come easily to you now. Help others with your expertise and precision. Health and wellness deserve your focus.",
    "Your methodical approach pays off. Refine your plans and perfect your craft. Service to others brings fulfillment."
  ],
  libra: [
    "Balance and harmony guide your decisions today. Your diplomatic skills help resolve conflicts. Relationships flourish through understanding.",
    "Aesthetic appreciation enhances your day. Seek beauty in your surroundings and interactions. Partnership brings joy and growth.",
    "Fair judgment and cooperation lead to success. Your charm and grace open doors. Seek equilibrium in all areas of life."
  ],
  scorpio: [
    "Intensity and passion drive you forward today. Deep transformation is possible. Trust your powerful intuition and inner strength.",
    "Your determination helps you achieve your goals. Look beneath the surface for truth. Meaningful connections deepen.",
    "Embrace your emotional depth today. Your resourcefulness overcomes challenges. Mystery and discovery intrigue you."
  ],
  sagittarius: [
    "Adventure and expansion call to you today. Broaden your horizons through learning or travel. Optimism attracts good fortune.",
    "Your philosophical nature seeks truth and meaning. Share your wisdom generously. Freedom and exploration energize you.",
    "Enthusiasm is contagious today. Your positive outlook inspires others. New experiences bring growth and joy."
  ],
  capricorn: [
    "Ambition and discipline lead to achievement today. Your hard work is noticed and valued. Long-term goals come into focus.",
    "Responsibility comes naturally to you. Build your legacy with patience and determination. Success is earned through effort.",
    "Your practical wisdom guides important decisions. Structure and planning create stability. Professional advancement is possible."
  ],
  aquarius: [
    "Innovation and originality set you apart today. Your unique perspective offers fresh solutions. Community connections strengthen.",
    "Progressive thinking leads to breakthroughs. Embrace your individuality and humanitarian spirit. Technology may play a key role.",
    "Friendship and collaboration bring rewards. Your vision for the future inspires others. Think outside the box."
  ],
  pisces: [
    "Compassion and creativity flow naturally today. Your empathetic nature helps others heal. Artistic expression brings fulfillment.",
    "Intuitive insights guide your path. Trust your dreams and imagination. Spiritual growth and emotional depth enrich your life.",
    "Your sensitive soul perceives subtle energies. Express yourself through art or music. Boundaries protect your gentle nature."
  ]
};

const MOODS = ['Energetic', 'Calm', 'Focused', 'Creative', 'Confident', 'Reflective', 'Adventurous', 'Peaceful'];
const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Turquoise', 'Gold', 'Silver'];
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Late Evening', '6am-9am', '12pm-3pm', '5pm-8pm', '9pm-12am'];

/**
 * Get daily horoscope for a zodiac sign
 * Uses day of year to rotate through predictions consistently
 */
export const getDailyHoroscope = async (zodiacSign) => {
  try {
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    
    // Get predictions for this sign
    const predictions = HOROSCOPE_PREDICTIONS[zodiacSign] || HOROSCOPE_PREDICTIONS.aries;
    const predictionIndex = dayOfYear % predictions.length;
    
    // Generate consistent daily values based on date + sign
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.id === zodiacSign);
    const seed = dayOfYear + signIndex;
    
    return {
      sign: zodiacSign,
      prediction: predictions[predictionIndex],
      luckyNumber: ((seed * 7) % 99) + 1,
      luckyTime: TIMES[seed % TIMES.length],
      color: COLORS[seed % COLORS.length],
      compatibility: ZODIAC_SIGNS[(signIndex + (dayOfYear % 12)) % 12].name,
      mood: MOODS[seed % MOODS.length],
      date: now.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  } catch (error) {
    console.error('Error generating horoscope:', error);
    throw error;
  }
};

/**
 * Get zodiac sign details by ID
 */
export const getZodiacSign = (signId) => {
  return ZODIAC_SIGNS.find(sign => sign.id === signId);
};

export default {
  ZODIAC_SIGNS,
  getDailyHoroscope,
  getZodiacSign
};
