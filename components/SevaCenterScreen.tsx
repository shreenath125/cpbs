import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, HeartHandshake, MapPin, Phone, Clock, Navigation, Heart, BookOpen, Utensils, Sparkles, MessageCircle, ExternalLink, Languages } from 'lucide-react';

interface SevaCenterScreenProps {
  onBack: () => void;
  scrollBarSide?: 'left' | 'right';
  settingsLanguage?: 'en' | 'hi';
  onOpenDonate?: () => void;
}

interface CenterData {
  id: string;
  nameHi: string;
  nameEn: string;
  addressHi: string;
  addressEn: string;
  phone: string;
  locationUrl?: string;
  isWhatsappLocation?: boolean;
  locationPhone?: string;
}

const CENTERS: CenterData[] = [
  {
    id: 'kota',
    nameHi: 'श्री कृष्ण चैतन्य प्रेम भक्ति धाम',
    nameEn: 'Shri Krishna Chaitanya Prem Bhakti Dham',
    addressHi: 'OCF 5, गणेश नगर, कोटा, राजस्थान',
    addressEn: 'OCF 5, Ganesh Nagar, Kota, Rajasthan',
    phone: '9636943046, 9828235583',
    locationUrl: 'https://maps.app.goo.gl/qFPr5dTKrK8MrGg6A'
  },
  {
    id: 'vrindavan',
    nameHi: 'श्री चैतन्य प्रेम भक्ति संघ आश्रम',
    nameEn: 'Shree Chaitanya Prem Bhakti Sangh Ashram',
    addressHi: 'गोपाल खार, परिक्रमा मार्ग, वृंदावन',
    addressEn: 'Gopal Khar, Parikrama Marg, Vrindavan',
    phone: '9039484855, 9887880429',
    locationUrl: 'https://maps.app.goo.gl/ikVk7U5WXGWc3Qxb9'
  },
  {
    id: 'sagar',
    nameHi: 'श्री गुरुधाम',
    nameEn: 'Shri Gurudham',
    addressHi: 'भूतेश्वर पथ, सागर, मध्य प्रदेश',
    addressEn: 'Bhuteshwar Path, Sagar, M.P.',
    phone: '8839123276',
    locationUrl: 'https://maps.app.goo.gl/gaPkLkDFvxoLvGRA6'
  },
  {
    id: 'damoh',
    nameHi: 'श्री गौर राधा रमण मंदिर',
    nameEn: 'Shri Gaur Radha Raman Mandir',
    addressHi: 'उमा मिस्त्री की तलैया, दमोह, मध्य प्रदेश',
    addressEn: 'Uma Mistri Ki Talaiya, Damoh, M.P.',
    phone: '9407542046, 8770665363',
    locationUrl: 'https://maps.app.goo.gl/bBHqbcv8zYz1TBpy8'
  },
  {
    id: 'chhindwara',
    nameHi: 'श्री श्री गौर राधा गोपीनाथ जू मंदिर',
    nameEn: 'Shri Shri Gaur Radha Gopinath Ju Mandir',
    addressHi: 'बटका रोड, हर्रई, छिंदवाड़ा, मध्य प्रदेश',
    addressEn: 'Batka Road, Harrai, Chhindwara, M.P.',
    phone: '9424324565, 6260583949',
    locationUrl: 'https://maps.app.goo.gl/NpX8xg8m5M7UbwMfA'
  },
  {
    id: 'khurai',
    nameHi: 'श्री श्री राधा कृष्ण सदन',
    nameEn: 'Shri Shri Radha Krishna Sadan',
    addressHi: 'शास्त्री वार्ड, खुरई, मध्य प्रदेश',
    addressEn: 'Shastri Ward, Khurai, M.P.',
    phone: '9926927164',
    locationUrl: 'https://maps.app.goo.gl/CtPXT5BrRcjGMawE6'
  },
  {
    id: 'bhopal',
    nameHi: 'श्री कृष्ण चैतन्य प्रेम भक्ति संकीर्तन मंडल',
    nameEn: 'Shri Krishna Chaitanya Prem Bhakti Sankirtan Mandal',
    addressHi: 'गौर कृष्ण कुंज, कंफर्ट पार्क, अयोध्या बायपास, भोपाल',
    addressEn: 'Gaur Krishna Kunj, Comfort Park, Ayodhya Bypass, Bhopal',
    phone: '9406523141',
    locationUrl: 'https://maps.app.goo.gl/P2UjL51YCuVBHUE28'
  },
  {
    id: 'bharatpur',
    nameHi: 'श्री कृष्ण चैतन्य प्रेम भक्ति संकीर्तन मंडल',
    nameEn: 'Shri Krishna Chaitanya Prem Bhakti Sankirtan Mandal',
    addressHi: 'विदेह कौर कालोनी, भरतपुर, राजस्थान',
    addressEn: 'Videh Kaur Colony, Bharatpur, Rajasthan',
    phone: '8003987027',
    locationPhone: '9887880429', // Naman Prabhuji for location
    isWhatsappLocation: true
  }
];

export const SevaCenterScreen: React.FC<SevaCenterScreenProps> = ({ onBack, scrollBarSide = 'left', settingsLanguage = 'hi', onOpenDonate }) => {
  const [lang, setLang] = useState<'en' | 'hi'>(settingsLanguage || 'hi');
  const isHindi = lang === 'hi';

  useEffect(() => {
    if (settingsLanguage) {
      setLang(settingsLanguage);
    }
  }, [settingsLanguage]);

  const t = {
    title: isHindi ? 'सेवा और केंद्र परिचय' : 'Our Seva & Centers',
    subtitle: isHindi ? 'श्री चैतन्य प्रेम भक्ति संघ' : 'Shree Chaitanya Prem Bhakti Sangh',
    centerInfo: isHindi ? 'हमारे प्रमुख केंद्र' : 'Our Main Centers',
    addressLabel: isHindi ? 'पता:' : 'Address:',
    getDirections: isHindi ? 'मैप पर देखें' : 'Get Directions',
    askLocation: isHindi ? 'लोकेशन मांगें' : 'Ask Location',
    contact: isHindi ? 'संपर्क:' : 'Contact:',
    
    ourSeva: isHindi ? 'हमारी सेवा गतिविधियाँ' : 'Our Seva Activities',
    sevaIntro: isHindi 
      ? 'श्री चैतन्य प्रेम भक्ति संघ का उद्देश्य श्री चैतन्य महाप्रभु के संदेश को जन-जन तक पहुँचाना है। हमारी प्रमुख सेवाएँ निम्नलिखित हैं:'
      : 'The mission of Shree Chaitanya Prem Bhakti Sangh is to spread the message of Sri Chaitanya Mahaprabhu. Our diverse seva activities include:',
    
    seva1: isHindi ? 'हरिनाम प्रचार' : 'Preaching',
    seva2: isHindi ? 'विग्रह सेवा' : 'Deity Seva',
    seva3: isHindi ? 'अन्नदान' : 'Prasadam',

    donateBtn: isHindi ? 'सेवा सहयोग / दान करें' : 'Offer Seva / Donate',
    joinUs: isHindi ? 'हमसे जुड़ें' : 'Join Us',
    joinUsDesc: isHindi 
      ? 'आप भी इस ईश्वरीय कार्य में अपना योगदान दे सकते हैं। तन, मन या धन से सेवा अर्पण कर अपने जीवन को सफल बनाएं।' 
      : 'You too can contribute to this divine cause. Offer your service through body, mind, or wealth and make your life successful.'
  };

  const handleLocationClick = (center: CenterData) => {
      if (center.isWhatsappLocation) {
          const targetNumber = center.locationPhone || center.phone.split(',')[0].trim();
          const msg = isHindi 
            ? `हरे कृष्णा! कृपया ${center.nameHi} (${center.addressHi}) की लोकेशन भेजें।`
            : `Hare Krishna! Please send the location for ${center.nameEn} (${center.addressEn}).`;
          window.open(`https://wa.me/91${targetNumber}?text=${encodeURIComponent(msg)}`, '_blank');
      } else if (center.locationUrl) {
          window.open(center.locationUrl, '_blank');
      }
  };

  const handleCall = (number: string) => {
      window.open(`tel:${number.replace(/\s+/g, '')}`, '_self');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fdfbf7] dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header - Gold and Cream */}
      <div className="flex-none bg-[#fdfbf7]/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#bc8d31]/30 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 text-[#bc8d31] hover:bg-[#bc8d31]/10 rounded-full transition-colors active:scale-95">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-[#bc8d31] flex items-center gap-2 tracking-wide" style={{ fontFamily: '"Kaushan Script", cursive' }}>
              <Building2 className="w-6 h-6" />
              {t.title}
            </h2>
        </div>

        <button 
            onClick={() => setLang(prev => prev === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 bg-[#bc8d31]/10 dark:bg-slate-800 border border-[#bc8d31]/30 hover:bg-[#bc8d31]/20 px-3 py-1.5 rounded-full transition-colors text-sm font-bold text-[#bc8d31]"
        >
            <Languages size={16} />
            <span className="uppercase text-xs">{lang === 'hi' ? 'EN' : 'HI'}</span>
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''} p-4 pb-[calc(2rem+env(safe-area-inset-bottom))]`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="max-w-4xl mx-auto space-y-6 mt-2">
          
          {/* Hero Image / Banner - Solid Gold Premium Look */}
          <div className="bg-[#bc8d31] rounded-3xl p-8 text-white shadow-lg shadow-[#bc8d31]/20 relative overflow-hidden landscape:flex landscape:items-center landscape:justify-center landscape:gap-6 border border-[#bc8d31]/50">
             {/* Background Texture Overlay */}
             <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>
             
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
             
             <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/40 shadow-sm">
                    <HeartHandshake className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 tracking-wide" style={{ fontFamily: '"Kaushan Script", cursive' }}>{t.subtitle}</h3>
                <p className="text-white/90 font-bold text-xs uppercase tracking-widest">
                    {isHindi ? 'मंदिर एवं प्रचार केंद्र' : 'Temples & Preaching Centers'}
                </p>
             </div>
          </div>

          {/* 1. Center List */}
          <div>
              <h3 className="text-lg font-bold text-[#bc8d31] mb-4 flex items-center gap-2 px-2 uppercase tracking-wider text-sm">
                  <MapPin className="w-5 h-5" />
                  {t.centerInfo}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CENTERS.map((center, index) => (
                      <div 
                        key={center.id} 
                        className="bg-[#fdfbf7] dark:bg-slate-800 p-5 rounded-3xl border border-[#bc8d31]/30 shadow-sm animate-fade-in-up hover:border-[#bc8d31]/60 hover:shadow-md transition-all flex flex-col h-full"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                          <div className="flex-1 flex flex-col gap-4 justify-between">
                              {/* Name & Address */}
                              <div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-[#bc8d31]/10 dark:bg-slate-700/50 rounded-full flex items-center justify-center shrink-0 text-[#bc8d31] border border-[#bc8d31]/20">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h4 className="text-base font-bold text-slate-800 dark:text-white leading-tight break-words">
                                            {isHindi ? center.nameHi : center.nameEn}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-snug font-medium break-words">
                                            {isHindi ? center.addressHi : center.addressEn}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-px bg-[#bc8d31]/20 w-full my-4" />
                              </div>

                              {/* Actions Area */}
                              <div className="flex flex-col gap-2.5">
                                  {/* Phone Numbers List */}
                                  <div className="flex flex-wrap gap-2">
                                      {center.phone.split(',').map((num, idx) => (
                                          <button
                                              key={idx}
                                              onClick={() => handleCall(num.trim())}
                                              className="flex items-center gap-2 text-xs font-mono font-bold text-[#bc8d31] bg-[#bc8d31]/5 dark:bg-slate-900/50 px-3 py-2.5 rounded-xl border border-[#bc8d31]/20 hover:bg-[#bc8d31]/10 transition-all active:scale-95 shadow-sm flex-1 justify-center whitespace-nowrap"
                                          >
                                              <Phone size={14} />
                                              <span>{num.trim()}</span>
                                          </button>
                                      ))}
                                  </div>

                                  {/* Location Button */}
                                  <button 
                                    onClick={() => handleLocationClick(center)}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-bold px-4 py-3 rounded-xl transition-colors bg-[#bc8d31]/10 text-[#bc8d31] hover:bg-[#bc8d31]/20 border border-[#bc8d31]/30 shadow-sm"
                                  >
                                      {center.isWhatsappLocation ? <MessageCircle size={16} /> : <Navigation size={16} />}
                                      {center.isWhatsappLocation ? t.askLocation : t.getDirections}
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* 2. Our Seva (Impact Grid Style) */}
          <div className="bg-[#fdfbf7] dark:bg-slate-800 p-6 rounded-3xl border border-[#bc8d31]/30 shadow-sm relative overflow-hidden">
              {/* Background Texture Overlay */}
              <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply dark:opacity-10 dark:mix-blend-screen" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>

              <div className="relative z-10">
                  <h3 className="text-lg font-bold text-[#bc8d31] mb-3 flex items-center gap-2 uppercase tracking-wider text-sm">
                      <HeartHandshake className="w-5 h-5" />
                      {t.ourSeva}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-6 font-medium">
                      {t.sevaIntro}
                  </p>

                  <div className="grid grid-cols-3 gap-3 w-full">
                      {/* 1. Preaching */}
                      <div className="bg-[#bc8d31]/5 dark:bg-slate-900/50 p-4 rounded-2xl border border-[#bc8d31]/20 flex flex-col items-center gap-3 text-center transition-colors hover:bg-[#bc8d31]/10">
                          <div className="text-[#bc8d31] bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm border border-[#bc8d31]/20">
                              <BookOpen size={22} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight leading-tight">
                              {t.seva1}
                          </span>
                      </div>
                      
                      {/* 2. Deity Seva */}
                      <div className="bg-[#bc8d31]/5 dark:bg-slate-900/50 p-4 rounded-2xl border border-[#bc8d31]/20 flex flex-col items-center gap-3 text-center transition-colors hover:bg-[#bc8d31]/10">
                          <div className="text-[#bc8d31] bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm border border-[#bc8d31]/20">
                              <Sparkles size={22} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight leading-tight">
                              {t.seva2}
                          </span>
                      </div>

                      {/* 3. Prasadam */}
                      <div className="bg-[#bc8d31]/5 dark:bg-slate-900/50 p-4 rounded-2xl border border-[#bc8d31]/20 flex flex-col items-center gap-3 text-center transition-colors hover:bg-[#bc8d31]/10">
                          <div className="text-[#bc8d31] bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm border border-[#bc8d31]/20">
                              <Utensils size={22} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight leading-tight">
                              {t.seva3}
                          </span>
                      </div>
                  </div>

                  {/* Donate Button inside Seva */}
                  <div className="mt-6 pt-5 border-t border-[#bc8d31]/20">
                      <button 
                          onClick={onOpenDonate}
                          className="w-full bg-[#bc8d31] hover:brightness-110 text-white py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transform transition-all active:scale-95"
                      >
                          <Heart size={18} className="fill-white animate-pulse" />
                          <span>{t.donateBtn}</span>
                      </button>
                  </div>
              </div>
          </div>

          {/* 3. Join Us Footer */}
          <div className="bg-[#bc8d31]/5 dark:bg-slate-900/50 p-6 rounded-3xl border border-[#bc8d31]/30">
              <h3 className="text-lg font-bold text-[#bc8d31] mb-2 flex items-center gap-2">
                  <Sparkles size={18} />
                  {t.joinUs}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                  {t.joinUsDesc}
              </p>
          </div>

        </div>
      </div>
    </div>
  );
};
