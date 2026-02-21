
import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Languages, Lock, Smartphone, Database, Globe } from 'lucide-react';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
  scrollBarSide?: 'left' | 'right';
  settingsLanguage?: 'en' | 'hi';
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack, scrollBarSide = 'left', settingsLanguage = 'hi' }) => {
  const [lang, setLang] = useState<'en' | 'hi'>(settingsLanguage);

  const t = {
    title: lang === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy',
    intro: lang === 'hi' 
      ? 'CPBS भजन ऐप आपकी गोपनीयता का सम्मान करता है। हम पारदर्शिता और सुरक्षा के लिए प्रतिबद्ध हैं।'
      : 'CPBS Bhajan App respects your privacy. We are committed to transparency and security.',
    
    sections: [
      {
        icon: <Database size={20} className="text-blue-500" />,
        title: lang === 'hi' ? 'डेटा संग्रह (Data Collection)' : 'Data Collection',
        content: lang === 'hi'
          ? 'यह ऐप किसी भी बाहरी सर्वर पर आपका व्यक्तिगत डेटा (जैसे नाम, फोन नंबर, स्थान) एकत्र या संग्रहीत नहीं करता है। आपकी प्लेलिस्ट, इतिहास और सेटिंग्स केवल आपके डिवाइस पर स्थानीय रूप से (Local Storage) सहेजी जाती हैं।'
          : 'This app does not collect or store your personal data (such as name, phone number, location) on any external servers. Your playlists, history, and settings are saved locally on your device only.'
      },
      {
        icon: <Smartphone size={20} className="text-green-500" />,
        title: lang === 'hi' ? 'अनुमतियाँ (Permissions)' : 'Permissions',
        content: lang === 'hi'
          ? '• स्टोरेज (Storage): इसका उपयोग केवल आपके द्वारा डाउनलोड की गई पीडीएफ पुस्तकों, ऑडियो ट्रैक और दर्शन छवियों को आपके डिवाइस में सहेजने के लिए किया जाता है।\n• इंटरनेट (Internet): इसका उपयोग ऑनलाइन सामग्री (जैसे दैनिक सुविचार, दर्शन, और ऑडियो) को लाने के लिए किया जाता है।'
          : '• Storage: Used solely to save PDF books, audio tracks, and darshan images that you explicitly choose to download.\n• Internet: Used to fetch online content such as Daily Quotes, Darshan, and Audio streams.'
      },
      {
        icon: <Lock size={20} className="text-saffron-500" />,
        title: lang === 'hi' ? 'सुरक्षा (Security)' : 'Security',
        content: lang === 'hi'
          ? 'चूंकि हम कोई उपयोगकर्ता डेटा एकत्र नहीं करते हैं, इसलिए आपके डेटा के लीक होने का कोई जोखिम नहीं है। ऐप पूरी तरह से सुरक्षित है और बच्चों सहित सभी आयु समूहों के लिए उपयुक्त है।'
          : 'Since we do not collect any user data, there is no risk of your data being compromised. The app is safe and suitable for all age groups, including children.'
      },
      {
        icon: <Globe size={20} className="text-purple-500" />,
        title: lang === 'hi' ? 'तृतीय-पक्ष सेवाएँ (Third Party)' : 'Third-Party Services',
        content: lang === 'hi'
          ? 'ऐप मीडिया सामग्री (ऑडियो/छवि) वितरित करने के लिए तृतीय-पक्ष क्लाउड सेवाओं (जैसे GitHub) का उपयोग कर सकता है। ये सेवाएँ केवल सामग्री वितरण के लिए हैं।'
          : 'The app may use third-party cloud services (like GitHub) strictly for delivering media content (audio/images).'
      }
    ],
    contact: lang === 'hi' ? 'संपर्क करें' : 'Contact Us',
    contactDesc: lang === 'hi' 
      ? 'यदि आपके पास गोपनीयता नीति के बारे में कोई प्रश्न हैं, तो आप हमसे संपर्क कर सकते हैं।'
      : 'If you have any questions regarding this Privacy Policy, you can contact us.'
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300 font-hindi">
      
      {/* Header */}
      <div className="flex-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95">
              <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-saffron-500" />
              {t.title}
            </h2>
        </div>

        <button 
            onClick={() => setLang(prev => prev === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 bg-saffron-50 dark:bg-slate-800 border border-saffron-200 dark:border-slate-700 hover:bg-saffron-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors text-sm font-medium text-saffron-700 dark:text-saffron-400"
        >
            <Languages size={16} />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''} p-4 pb-[calc(2rem+env(safe-area-inset-bottom))]`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="max-w-2xl mx-auto space-y-6">
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-sm font-medium leading-relaxed">
            {t.intro}
          </div>

          <div className="space-y-4">
            {t.sections.map((section, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                    {section.title}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-6 pb-4">
             <p className="text-xs text-slate-400 dark:text-slate-500">
                {t.contactDesc}<br/>
                Email: cpbssangh@gmail.com
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};
