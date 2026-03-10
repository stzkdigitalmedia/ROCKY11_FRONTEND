import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' }
  ];

  useEffect(() => {
    // Load saved language from localStorage on component mount
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      i18n.changeLanguage(savedLanguage);
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('selectedLanguage', langCode);
    setIsOpen(false);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="w-7 h-7 sm:w-9 p-4 sm:h-9 mr-4 border-1 border-white mt-3 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer">

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-colors"
        >
          <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          <span className="text-[10px] sm:text-[12px] font-medium text-white uppercase">
            {getCurrentLanguage().code}
          </span>
        </button>
      </div>


      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-28 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-1 text-sm hover:bg-gray-100 transition-colors ${i18n.language === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;