import React, { useState, useEffect } from 'react';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const MotivationCard = () => {
  const { language } = useLanguage();
  const [currentQuote, setCurrentQuote] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Comprehensive motivational quotes for LGBTQAI+ community and women empowerment
  const quotes = {
    en: [
      {
        text: "Be yourself; everyone else is already taken.",
        author: "Oscar Wilde",
        category: "authenticity"
      },
      {
        text: "Your story is what you have, what you will always have. It is something to own.",
        author: "Michelle Obama",
        category: "empowerment"
      },
      {
        text: "We cannot all succeed when half of us are held back.",
        author: "Malala Yousafzai",
        category: "equality"
      },
      {
        text: "Love is love is love is love is love is love is love is love, cannot be killed or swept aside.",
        author: "Lin-Manuel Miranda",
        category: "love"
      },
      {
        text: "Being different is your power. Being yourself is your right.",
        author: "Community Wisdom",
        category: "pride"
      },
      {
        text: "You alone are enough. You have nothing to prove to anybody.",
        author: "Maya Angelou",
        category: "self-worth"
      },
      {
        text: "The most courageous act is still to think for yourself. Aloud.",
        author: "Coco Chanel",
        category: "courage"
      },
      {
        text: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
        author: "Community Support",
        category: "wellness"
      },
      {
        text: "I am not free while any woman is unfree, even when her shackles are very different from my own.",
        author: "Audre Lorde",
        category: "solidarity"
      },
      {
        text: "Every great dream begins with a dreamer. Remember, you have within you the strength to change the world.",
        author: "Harriet Tubman",
        category: "dreams"
      }
    ],
    gu: [
      {
        text: "તમે જે છો તે બનો; બીજા બધા પહેલેથી જ લેવાયેલા છે.",
        author: "ઓસ્કર વાઇલ્ડ",
        category: "authenticity"
      },
      {
        text: "તમારી વાર્તા તમારી પાસે છે તે જ છે. તે હંમેશા રહેશે. તે તમારું પોતાનું છે.",
        author: "મિશેલ ઓબામા",
        category: "empowerment"
      },
      {
        text: "જ્યારે આપણામાંથી અડધા પાછળ રાખવામાં આવે ત્યારે આપણે બધા સફળ થઈ શકતા નથી.",
        author: "મલાલા યુસુફઝઈ",
        category: "equality"
      },
      {
        text: "પ્રેમ એ પ્રેમ છે, જે મારી શકાતો નથી કે બાજુ પર મૂકી શકાતો નથી.",
        author: "લિન-મેન્યુઅલ મિરાન્ડા",
        category: "love"
      },
      {
        text: "અલગ હોવું એ તમારી શક્તિ છે. તમે જે છો તે રહેવું એ તમારો અધિકાર છે.",
        author: "સમુદાય શાણપણ",
        category: "pride"
      },
      {
        text: "તમે એકલા પૂરતા છો. તમારે કોઈને કંઈ સાબિત કરવાની જરૂર નથી.",
        author: "માયા એન્જેલોઉ",
        category: "self-worth"
      },
      {
        text: "સૌથી બહાદુર કાર્ય એ છે કે તમે જાતે માટે વિચારો. મોટેથી.",
        author: "કોકો ચેનલ",
        category: "courage"
      },
      {
        text: "તમારું માનસિક સ્વાસ્થ્ય પ્રાથમિકતા છે. તમારી ખુશી અત્યાવશ્યક છે. તમારી સ્વ-સંભાળ જરૂરી છે.",
        author: "સમુદાય સમર્થન",
        category: "wellness"
      },
      {
        text: "જ્યાં સુધી કોઈ સ્ત્રી મુક્ત નથી, ત્યાં સુધી હું મુક્ત નથી.",
        author: "ઓડ્રે લોર્ડ",
        category: "solidarity"
      },
      {
        text: "દરેક મહાન સ્વપ્ન એક સ્વપ્ન જોનાર સાથે શરૂ થાય છે. યાદ રાખો, તમારામાં વિશ્વને બદલવાની શક્તિ છે.",
        author: "હેરિયેટ ટબમેન",
        category: "dreams"
      }
    ],
    hi: [
      {
        text: "अपने आप बनो; बाकी सब पहले से ही लिए जा चुके हैं।",
        author: "ऑस्कर वाइल्ड",
        category: "authenticity"
      },
      {
        text: "आपकी कहानी वह है जो आपके पास है, जो हमेशा रहेगी। यह आपकी अपनी है।",
        author: "मिशेल ओबामा",
        category: "empowerment"
      },
      {
        text: "हम सभी सफल नहीं हो सकते जब हममें से आधे को रोक दिया जाता है।",
        author: "मलाला यूसुफ़ज़ई",
        category: "equality"
      },
      {
        text: "प्यार, प्यार है, जिसे मारा या दरकिनार नहीं किया जा सकता।",
        author: "लिन-मैनुअल मिरांडा",
        category: "love"
      },
      {
        text: "अलग होना आपकी शक्ति है। खुद होना आपका अधिकार है।",
        author: "समुदाय ज्ञान",
        category: "pride"
      },
      {
        text: "आप अकेले ही काफी हैं। आपको किसी को कुछ साबित करने की ज़रूरत नहीं।",
        author: "माया एंजेलो",
        category: "self-worth"
      },
      {
        text: "सबसे साहसी कार्य अभी भी अपने लिए सोचना है। ज़ोर से।",
        author: "कोको शैनल",
        category: "courage"
      },
      {
        text: "आपका मानसिक स्वास्थ्य प्राथमिकता है। आपकी खुशी आवश्यक है। आपकी स्व-देखभाल ज़रूरी है।",
        author: "समुदाय समर्थन",
        category: "wellness"
      },
      {
        text: "जब तक कोई महिला स्वतंत्र नहीं है, मैं स्वतंत्र नहीं हूं।",
        author: "ऑड्रे लॉर्डे",
        category: "solidarity"
      },
      {
        text: "हर महान सपना एक सपने देखने वाले के साथ शुरू होता है। याद रखें, आपके पास दुनिया बदलने की शक्ति है।",
        author: "हैरियट टबमैन",
        category: "dreams"
      }
    ],
    mr: [
      {
        text: "स्वतः व्हा; बाकी सर्व आधीच घेतले गेले आहेत.",
        author: "ऑस्कर वाइल्ड",
        category: "authenticity"
      },
      {
        text: "तुमची कथा तुमच्याकडे आहे ती आहे. ती नेहमी राहील. ती तुमची स्वतःची आहे.",
        author: "मिशेल ओबामा",
        category: "empowerment"
      },
      {
        text: "जेव्हा आपल्यापैकी अर्ध्या लोकांना रोखले जाते तेव्हा आपण सर्व यशस्वी होऊ शकत नाही.",
        author: "मलाला युसुफझई",
        category: "equality"
      },
      {
        text: "प्रेम म्हणजे प्रेम, जे मारले किंवा बाजूला केले जाऊ शकत नाही.",
        author: "लिन-मॅन्युएल मिरांडा",
        category: "love"
      },
      {
        text: "वेगळे असणे ही तुमची शक्ती आहे. स्वतः असणे हा तुमचा अधिकार आहे.",
        author: "समुदाय शहाणपण",
        category: "pride"
      },
      {
        text: "तुम्ही एकटेच पुरेसे आहात. तुम्हाला कोणालाही काही सिद्ध करण्याची गरज नाही.",
        author: "माया अँजेलो",
        category: "self-worth"
      },
      {
        text: "सर्वात धाडसी कृती म्हणजे स्वतःसाठी विचार करणे. मोठ्याने.",
        author: "कोको शॅनेल",
        category: "courage"
      },
      {
        text: "तुमचे मानसिक आरोग्य प्राधान्य आहे. तुमचा आनंद आवश्यक आहे. तुमची स्वत:ची काळजी गरजेची आहे.",
        author: "समुदाय समर्थन",
        category: "wellness"
      },
      {
        text: "जोपर्यंत एखादी स्त्री मुक्त नाही तोपर्यंत मी मुक्त नाही.",
        author: "ऑड्रे लॉर्ड",
        category: "solidarity"
      },
      {
        text: "प्रत्येक महान स्वप्न स्वप्न पाहणाऱ्यापासून सुरू होते. लक्षात ठेवा, तुमच्यात जग बदलण्याची शक्ती आहे.",
        author: "हॅरिएट टबमॅन",
        category: "dreams"
      }
    ]
  };

  // Get a random quote for the current language
  const getRandomQuote = () => {
    const languageQuotes = quotes[language] || quotes.en;
    const randomIndex = Math.floor(Math.random() * languageQuotes.length);
    return languageQuotes[randomIndex];
  };

  // Initialize quote on mount and language change
  useEffect(() => {
    setCurrentQuote(getRandomQuote());
  }, [language]);

  // Refresh quote with animation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsRefreshing(false);
    }, 300);
  };

  // Get category color and icon
  const getCategoryStyle = (category) => {
    const styles = {
      authenticity: { color: 'text-purple-600', bg: 'bg-purple-50', icon: '🦋' },
      empowerment: { color: 'text-pink-600', bg: 'bg-pink-50', icon: '💪' },
      equality: { color: 'text-blue-600', bg: 'bg-blue-50', icon: '⚖️' },
      love: { color: 'text-red-600', bg: 'bg-red-50', icon: '❤️' },
      pride: { color: 'text-rainbow-600', bg: 'bg-gradient-to-r from-red-50 via-yellow-50 to-purple-50', icon: '🌈' },
      'self-worth': { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '✨' },
      courage: { color: 'text-orange-600', bg: 'bg-orange-50', icon: '🦁' },
      wellness: { color: 'text-green-600', bg: 'bg-green-50', icon: '🧘' },
      solidarity: { color: 'text-teal-600', bg: 'bg-teal-50', icon: '🤝' },
      dreams: { color: 'text-cyan-600', bg: 'bg-cyan-50', icon: '⭐' }
    };
    return styles[category] || styles.authenticity;
  };

  if (!currentQuote) return null;

  const categoryStyle = getCategoryStyle(currentQuote.category);

  return (
    <div className="w-full">
      <div className={`relative overflow-hidden rounded-2xl shadow-lg ${categoryStyle.bg} p-6 transition-all duration-300 ${isRefreshing ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-12 -mb-12"></div>
        
        {/* Header */}
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-3xl">{categoryStyle.icon}</div>
            <div>
              <h3 className={`text-sm font-semibold ${categoryStyle.color} uppercase tracking-wide`}>
                {language === 'en' ? 'Daily Inspiration' : 
                 language === 'gu' ? 'દૈનિક પ્રેરણા' : 
                 language === 'hi' ? 'दैनिक प्रेरणा' : 
                 'दैनिक प्रेरणा'}
              </h3>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-full hover:bg-white/50 transition-all duration-300 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-label="Refresh quote"
          >
            <ArrowPathIcon className={`w-5 h-5 ${categoryStyle.color}`} />
          </button>
        </div>

        {/* Quote */}
        <div className="relative">
          <div className="absolute -left-2 -top-2 text-6xl text-white/40 font-serif">"</div>
          <blockquote className="relative pl-4">
            <p className={`text-lg font-medium ${categoryStyle.color} leading-relaxed mb-3`}>
              {currentQuote.text}
            </p>
            <footer className="flex items-center gap-2">
              <SparklesIcon className={`w-4 h-4 ${categoryStyle.color}`} />
              <cite className={`text-sm ${categoryStyle.color} opacity-80 not-italic font-medium`}>
                — {currentQuote.author}
              </cite>
            </footer>
          </blockquote>
        </div>

        {/* Decorative bottom accent */}
        <div className={`mt-4 pt-4 border-t border-white/30`}>
          <div className="flex items-center justify-center gap-1">
            <div className={`w-2 h-2 rounded-full ${categoryStyle.color} opacity-60`}></div>
            <div className={`w-2 h-2 rounded-full ${categoryStyle.color} opacity-40`}></div>
            <div className={`w-2 h-2 rounded-full ${categoryStyle.color} opacity-20`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotivationCard;
