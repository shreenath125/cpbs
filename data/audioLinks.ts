
import { BhajanAudio } from '../types';

// You can add your audio links here. 
// Keys can be the Song Number (e.g. '246') OR the Exact Hindi Title.
// Mapping by number is recommended as it's more stable.
export const BHAJAN_AUDIO_MAP: Record<string, BhajanAudio[]> = {
   '01': [
      {
         id: '01-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Mangalacharan.mp3'
      }
   ],
   '03': [
      {
         id: '03-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Gurvashtakam.mp3'
      },
      {
         id: '03-v2',
         singer: '(हिंदी में) श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Gurvashtakam.Hindi.Anuvad.mp3'
      }
   ],
   '04': [
      {
         id: '04-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Dohavali.mp3'
      }
   ],
   '06': [
      { id: '06-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Ghar.Ghar.Me.Bablu.Ji.2.aac' },
      { id: '06-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Ghar.Ghar.Mein.Shri.Harinaam.Ki.Dhun.Honi.Chahiye.2.mp3' }
   ],
   '07': [
      { id: '07-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Bhakton.Mein.Gaur.Baithe.2.mp3' }
   ],
   '08': [
      {
         id: '08-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Anupam.Madhurijodi.nitai.gaur.sundar.ki.m4a'
      }
   ],
   '09': [
      { id: '09-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Tere.Darbar.Mein.Mujhse.Na.Jaane.Aa.Gaye.Kaise.-.Bablu.Ji.2.mp3' }
   ],
   '12': [
      { id: '12-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Hamare.Gaur.Govinda.Zamane.Se.Nirale.Hain.2.m4a' }
   ],
   '19': [
      { id: '19-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Ghar.Chhod.Ke.Na.Jaiyo.2.mp3' }
   ],
   '20': [
      { id: '20-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Dikhlao.Gaurang.Aapki.Surat.Pyari.Ji.2.mp3' }
   ],
   '21': [
      { id: '21-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Mere.Piyare.Bablu.Ji.2.aac' }
   ],
   '25': [
      { id: '25-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Premi.Ban.Sada.Tu.Prem.Se.Gun.Gaur.Gaya.Kar.2.mp3' }
   ],
   '28': [
      { 
         id: '28-v1', 
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज', 
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Shravan.Sakal.Sukhdayak.He.mp3' 
      },
      { id: '28-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/3.Shravan.Sakal.Sukhdayak.He.2.mp3' }
   ],
   '30': [
      { id: '30-v1', singer: 'ललित कृष्ण दास (लकी प्रभुजी )', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Jab.Gaur.Hari.luckyprg.Ji.mp3' }
   ],
   '33': [
      { id: '33-v1', singer: '(1) रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Mere.Man.Bas.Gaye.Sundar.Gaur.2.mp3' },
      { id: '33-v2', singer: '(2) रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Mere.Man.Bas.Gaye.Sundar.Gaur.mp3' }
   ],
   '35': [
      { id: '35-v1', singer: 'नाम उपलब्ध नहीं', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Chaitanya.Charanon.Mein.mp3' }
   ],
   '39': [
      { id: '39-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Na.Janu.Kaun.Hoon.Kya.Hoon.2.mp3' }
   ],
   '40': [
      { id: '40-v1', singer: 'कृष्णदास प्रभुजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Hare.Krishna.Hare.Ram.Naam.Mukh.Bol.Re.Krishna.Das.Prabhuji.mp3' },
      { id: '40-v2', singer: 'नाम उपलब्ध नहीं', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Hare.Krishna.Hare.Ram.Naam.Mukh.mp3' }
   ],
   '41': [
      { id: '41-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/9.Pyare.Kirtan.Mein.Mat.Sharmaya.Karo.2.mp3' }
   ],
   '42': [
      { id: '42-v1', singer: '(1) रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/12.Apne.Ko.Humne.Saunp.Diya.2.mp3' },
      { id: '42-v2', singer: '(2) रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Apne.Ko.Hamne.Soup.Diya.2.2.aac' }
   ],
   '45': [
      { id: '45-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Mere.Ghar.Aao.Shri.Gaur.Hari.Pyare.2.mp3' }
   ],
   '51': [
      {
         id: '51-v1',
         singer: '(1) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Lage.vrindavan.niko.mp3'
      },
      {
         id: '51-v2',
         singer: '(2) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/lage.vrindavan.niko.wav'
      },
      { id: '51-v3', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Lagat.Vrindavan.Niko.Ali.Mohe.Lagat.Vrindavan.Niko.2.mp3' }
   ],
   '54': [
      {
         id: '54-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/mai.yugal.naam.nidhi.payi.aac'
      },
      { id: '54-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Mai.Yugal.Naam.Nidhi.Payi.2.mp3' }
   ],
   '55': [
      {
         id: '55-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/bhajan.bina.chola.by.guru.maharaj.mp3'
      },
      {
         id: '55-v2',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/BHAJAN.BIN.MAMA.JI+.aac'
      },
      { id: '55-v3', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Bhajan.Bin.Chola.Tero.Bekam.2.mp3' }
   ],
   '60': [
      { id: '60-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Baaj.Rahi.Kis.Or.Muraliya.2.mp3' }
   ],
   '61': [
      {
         id: '61-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/vrandavan.ke.raja.dou.mp3'
      }
   ],
   '72': [
      { id: '72-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/2.Utho.Jeev.Jago.Jeev.2.mp3' }
   ],
   '78': [
      {
         id: '78-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Shri.Shyam.Charan.Sukh.Daai.Bhajan.Karo.Bhai.Shri.Maharaj.Ji.mp3'
      }
   ],
   '85': [
      { id: '85-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/8.Gaur.Pyare.Ko.Jo.Nahi.Jana.Hai.2.mp3' }
   ],
   '87': [
      {
         id: '87-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/anchal.pasar.mangoo.1.aac'
      }
   ],
   '89': [
      { id: '89-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Hum.Chakar.Gaur.Pyare.Ke.2.mp3' }
   ],
   '91': [
      { id: '91-v1', singer: '(1) रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Santan.Ke.Sang.Laag.Re.Teri.Achhi.Banegi.2.mp3' },
      { id: '91-v2', singer: '(2) रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Santan.Ke.Sang.Lag.Re.2.aac' }
   ],
   '95': [
      {
         id: '95-v1',
         singer: '(1) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/mera.gopal.giridhari.1.aac'
      },
      {
         id: '95-v2',
         singer: '(2) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/mera.gopal.giridhari.aac'
      },
      { id: '95-v3', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Mera.Ghopal.Bablu.Ji.2.aac' }
   ],
   '99': [
      { id: '99-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Gaur.Hari.Sharanam.2.mp3' }
   ],
   '100': [
      {
         id: '100-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/khak.iss.duniya.pe.daali.jaegi.aac'
      }
   ],
   '103': [
      { id: '103-v1', singer: 'भूधारी प्रभुजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Gurudev.Kripa.Bindu.Diya.Bhudhary.Prabhuji.mp3' }
   ],
   '110': [
      { id: '110-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Radhe.Tere.Charanon.Ki.Gar.Dhool.Jo.Mil.Jaye.2.mp3' }
   ],
   '114': [
      {
         id: '114-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Prani.Bhaj.lee.mp3'
      },
      { id: '114-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Prani.Bhaj.Le.Radhe.Shyam.2.mp3' }
   ],
   '115': [
      { id: '115-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Maine.Bindiya.Sajai.Hai.Krishna.Naam.Ki.2.mp3' }
   ],
   '116': [
      { id: '116-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Mohe.Apni.Kar.Linhi.Sanwariya.Ne.Naina.Milaike.2.m4a' }
   ],
   '117': [
      {
         id: '117-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/madhav.madan.murari.aac'
      },
      { id: '117-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Jai.Madhav.Madan.Murari.Radhe.Shyam.Shyama.Shyam.2.mp3' }
   ],
   '119': [
      { id: '119-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Shyama.Shyam.Saloni.Surat.2.aac' }
   ],
   '122': [
      { id: '122-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Braj.Ki.Raj.Param.Pavitra.-.Bablu.Ji.2.m4a' },
      { id: '122-v2', singer: 'भूधारी प्रभुजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Braj.Ki.Raj.Param.Pavitra.Bhudhary.Prabhuji.mp3' }
   ],
   '126': [
      {
         id: '126-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/bhajo.re.bhaiya.ram.govind.aac'
      },
      { id: '126-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Bhajo.Re.Bhaiya.Ram.Govind.Hari.2.mp3' }
   ],
   '133': [
      { id: '133-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Gaavat.Sur.Muni.Ved.Puran.2.m4a' }
   ],
   '138': [
      { id: '138-v1', singer: 'ललिता माताजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Mohe.De.Darshan.Giridhari.Re.Lalita.Mataji.mp3' }
   ],
   '141': [
      {
         id: '141-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/avsar.bar.bar.nhi.aave.aac'
      }
   ],
   '146': [
      { id: '146-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Bhakt.Bhagwan.Ka.Rishta.Wo.Hai.2.mp3' }
   ],
   '148': [
      { id: '148-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Krishna.Govind.Gopal.Gaate.Chalo.2.mp3' }
   ],
   '151': [
      { id: '151-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Har.Ek.Se.Pooch.Lijiye.Ki.Chahta.Hai.Kya.2.m4a' }
   ],
   '154': [
      {
         id: '154-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/nachayo.bhakton.ne.aac'
      },
      { id: '154-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Nana.Bhanti.Nachayo.Bhakton.2.mp3' }
   ],
   '155': [
      { id: '155-v1', singer: 'विश्वम्भर प्रभुजी (विशु)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Hari.Ka.Bhajan.Karo.Vishu.mp3' },
      { id: '155-v2', singer: '(2) विश्वम्भर प्रभुजी (विशु)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Hari.Ka.Bhajan.mp3' }
   ],
   '157': [
      { id: '157-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Kon.Pave.Yako.Paar.By.Bablu.Ji.2.mp3' }
   ],
   '159': [
      { id: '159-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/He.Mere.Gurudev.Karuna.Karuna.Sindhu.Kijiye.2.mp3' },
      { id: '159-v2', singer: 'भूधारी प्रभुजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/He.Mere.Gurudev.Karuna.Karuna.Sindhu.Kijiye.Bhudhary.Prabhuji.mp3' }
   ],
   '175': [
      {
         id: '175-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Kesi.Pavan.Hai.Janm.Bhoomi.mp3'
      },
      { id: '175-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Kaisi.Pavan.Hai.Braj.Bhumi.By.Bablu.Ji.2.mp3' }
   ],
   '177': [
      { id: '177-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/13.Aisi.Holi.Machai.Hai.Jisne.2.mp3' }
   ],
   '182': [
      { id: '182-v1', singer: 'मधुसूदन दस (मामाजी)-1', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Hori.Khelan.Aaye.Shyam.with.mridanga.1.mp3' },
      { id: '182-v2', singer: 'मधुसूदन दस (मामाजी)-2', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Hori.Khelan.Aaye.Shyam.2.mp3' }
      

   ],
   '190': [
      { id: '190-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Holi.Mein.Kanha.Lal.Bhaye.2.mp3' }
   ],
   '205': [
      {
         id: '205-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/bajat.aaj.badhai.aac'
      }
   ],
   '209': [
      {
         id: '209-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/yasoda.ke.bhaye.nandlal.ho.aac'
      },
      { id: '209-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Yashoda.Ke.Bhaye.Nandlal.2.mp3' }
   ],
   '211': [
      { id: '211-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Baajat.Aaj.Badhai.Nand.Ghar.2.mp3' }
   ],
   '215': [
      { id: '215-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', 
        url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Jhula.Dare.Kunjan.Mein.Jhool.Rahe.Giridhari.2.mp3' },
      {
         id: '215-v2',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/jhola.dare.kunjan.me.2.aac'
      },
      
   ],
   '216': [
      {
         id: '216-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Jhoolaa.Julee.Yugal.Sarkar.aac'
      },
      { id: '216-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Jhula.Jhule.Bablu.Ji.2.aac' },
      { id: '216-v3', singer: 'रसराज प्रभुजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Jhoola.Jhoolen.Yugal.Kishor.Kinare.Yamuna.Ke.Rasraj.Prabhuji.mp3' }
   ],
   '217': [
      {
         id: '217-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Ab.aa.jao.kungan.me.kunj.bihari.ogg'
      },
      { id: '217-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Ab.Aa.Jao.Kunjan.Mein.Kunj.Bihari.2.mp3' }
   ],
   '219': [
      {
         id: '219-v1',
         singer: '(1) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/jhula.jhul.rae.radhe.aur.sanwariya.mp3'
      },
      {
         id: '219-v2',
         singer: '(2) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Jhool.jhool.rae.sanwariya.aac'
      }
   ],
   '220': [
      {
         id: '220-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/jhula.to.jhule.rani.radhika.mp3'
      }
   ],
   '227': [
      {
         id: '227-v1',
         singer: '(1) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/aaj.dou.jhulat.kunj.majhar.mp3'
      },
      {
         id: '227-v2',
         singer: '(2) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Jhoola.kunj.mazhar.mp3'
      }
   ],
   '233': [
      {
         id: '233-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Naam.Mahima.mp3'
      }
   ],
   '235': [
      {
         id: '235-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Vaishnava.Vandana.mp3'
      }
   ],
   '236': [
      {
         id: '236-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Hari.Haraye.Namah.by.Gurumaharaj.mp3'
      }
   ],
   '237': [
      {
         id: '237-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Jaya.Radhe.Jaya.Krishna.BY.Guru.Maharaj.mp3'
      }
   ],
   '238': [
      {
         id: '238-v1',
         singer: '(HD) श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Prem.Dhan.Lao.Kari.mp3'
      },
      {
         id: '238-v2',
         singer: '(SD) श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Prem.Dhan.Lao.Kari.Karuna.Prachur.Shri.Maharaj.Ji.mp3'
      },
      { id: '238-v3', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Prem.Dhan.Layo.Kari.Karuna.Prachur.2.mp3' }
   ],
   '240': [
      { id: '240-v1', singer: 'भूधारी प्रभुजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Kaun.Vidhi.Paun.Seva.Bhudhary.Prabhuji.mp3' }
   ],
   '241': [
      {
         id: '241-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Saparshad.Mahima.mp3'
      }
   ],
   '265': [
      { id: '265-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Aao.Sundar.Gaur.Tumhare.Kirtan.Mein.2.mp3' }
   ],
   '268': [
      {
         id: '268-v1',
         singer: 'मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Dhoonte.hai.hoo.kaha.hai.kannhiya.mp3'
      },
      { id: '268-v2', singer: 'गौरांग दास (बस्सी) प्रभुजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Gourang.Das.Dhundte.Ho.Kahan.Kanhaiya.mp3' }
   ],
   '269': [
      {
         id: '269-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Maha.Mantra.mp3'
      },
      {
         id: '269-v2',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज (नाम महिमा)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Naam.Mahima.mp3'
      },
      {
         id: '269-v3',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज (बोलो कृष्ण)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Bolo.Krishna.Bhajo.Krishna.BYguru.maharaj.mp3'
      },
      {
         id: '269-v4 ',
         singer: 'मधुसूदन दस (मामाजी) - 1 "यशोमति नंदन" की धुन',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/mm9YashomatiNandan.Mahamantra.by.Mahesh.Prg.mp3'
      },
      {
         id: '269-v5',
         singer: 'मधुसूदन दस (मामाजी) - महामंत्र 2 (Best)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/mm8M-1Mahesh.Prg.Mahamantra.Complete.mp3'
      },
      {  id: '269-v6', 
         singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी) - 1', 
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Maha.Mantra.1.2.mp3' },
      {
         id: '269-v7',
         singer: 'मधुसूदन दस (मामाजी) - महामंत्र 3',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/mm2FullVoice.Ecstatic.Mahamantra.by.Mahesh.Prg.mp3'
      },
      {  id: '269-v8', 
         singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी) - 2', 
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Maha.Mantra.2.2.m4a' },
      {
         id: '269-v9',
         singer: 'मधुसूदन दस (मामाजी) - 4 "झूला डरे कुंजन" की धुन',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/mm5JhulaDareKunjanMe.Mahamantra.By.Mahesh.Prg.mp3'
      },
      {  id: '269-v10', 
         singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी) - 3', 
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Maha.Mantra.4.2.mp3' },
      {
         id: '269-v11',
         singer: 'मधुसूदन दस (मामाजी) महामंत्र 5',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/mahamantra.aac'
      },
      {  id: '269-v12', 
         singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी) - 4',  
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Maha.Mantra.5.2.mp3' }
   ],
   '270': [
     {
         id: '270-v1',
         singer: 'मधुसूदन दस (मामाजी) - पंचतत्व',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/panchtava.mahamantra.aac'
      },
      { id: '270-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी) - पंचतत्व - 1', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Mahamantra.Bablu.Ji.2.aac' },
      { id: '270-v3', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी) - पंचतत्व - 2', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Panchtattva.Maha.Mantra.2.mp3' }
   ],
   '271': [
      { id: '271-v1', singer: 'गोविंदा प्रभुजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Jhool.Rahe.Jhula.Ghanshyam.Kadam.Govind.Prg.Khurai.mp3' }
   ],
   '274': [
      { id: '274-v1', singer: 'मधुसूदन दस (मामाजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Holi.me.barjori.me.aac' }
   ],
   '289': [
      { id: '289-v1', singer: 'भूधारी प्रभुजी', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/4/Nek.Aage.Aa.Shyam.Tope.Rang.Dalun.Bhudhary.Das.mp3' }
   ],
   '301': [
      {
         id: '301-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Shad.Goswami.Ashtakam.mp3'
      }
   ],
   '302': [
      {
         id: '302-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Shachi.Tanaya.Ashtakam.mp3'
      }
   ],
   '303': [
      {
         id: '303-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Yugal.Kishor.Ashtakam.mp3'
      }
   ],
   '306': [
      {
         id: '306-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Jagannath.Ashtakam.mp3'
      }
   ],
   '307': [
      {
         id: '307-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Damodar.Ashtakam.mp3'
      }
   ],
   '310': [
      {
         id: '310-v1',
         singer: '(HD) श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/hd.Dashavatar.Stotra.mp3'
      },
      {
         id: '310-v2',
         singer: '(SD) श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/SD.Dasavatar.Strotra.MP3'
      }
   ],
   '315': [
      {
         id: '315-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Shikshashtakam.mp3'
      }
   ],
   '355': [
      {
         id: '355-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Mangal.Aarti.mp3'
      },
      { id: '355-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/1.Mangal.Aarti.Gaur.Kishor.2.mp3' }
   ],
   '357': [
      {
         id: '357-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Shringar.Aarti.mp3'
      }
   ],
   '358': [
      {
         id: '358-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Bhog.Aarti.mp3'
      },
      { id: '358-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/7.Bhog.Aarti.2.mp3' }
   ],
   '359': [
      {
         id: '359-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Mahaprasad.Mahima.mp3'
      }
   ],
   '360': [
      {
         id: '360-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Yashomati.Nandan.Brijvar.Nagar.mp3'
      },
      {
         id: '360-v2',
         singer: '(1) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/Yashomati.Nandan.mp3'
      },
      {
         id: '360-v3',
         singer: '(2) मधुसूदन दस (मामाजी)',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/2/YASOMATI.NANDAN.2.aac'
      },
      { id: '360-v4', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/10.Yashomati.Nandan.2.mp3' }
   ],
   '361': [
      { id: '361-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/11.Sandhya.Aarti.2.mp3' }
   ],
   '365': [
      { id: '365-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/15.Shayan.Aarti.2.mp3' }
   ],
   '366': [
      {
         id: '366-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Mangala.Tulsi.Aarti.mp3'
      },
      { id: '366-v2', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/14.Mangala.Tulsi.Aarti.2.mp3' }
   ],
   '412': [
      {
         id: '412-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Dhan.Mero.Nityanand.mp3'
      }
   ],
   '425': [
      {
         id: '425-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Yamuna.Pulin.Kadamba.Kanan.Mein.mp3'
      }
   ],
   '427': [
      {
         id: '427-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Avatar.Saar.Gaur.Avatar.mp3'
      }
   ],
   '429': [
      {
         id: '429-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Gaur.Na.Hote.Kaisi.Hoti.mp3'
      }
   ],
   '430': [
      {
         id: '430-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Param.Karuna.Sharan.Dou.Jan.mp3'
      }
   ],
   '432': [
      {
         id: '432-v1',
         singer: 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
         url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/9/Bhajahun.Re.Man.Shri.Nandanandan.Shri.Maharaj.Ji.mp3'
      }
   ],
   '452': [
      { id: '452-v1', singer: 'रविंद्र कृष्ण दस (बबलू प्रभुजी)', url: 'https://github.com/Damodar29/CPBS-APP-ORIGNAL-PHASE-1/releases/download/3/Ab.To.Karuna.Karo.Vaishnav.Gosai.2.wav' }
   ]
};
