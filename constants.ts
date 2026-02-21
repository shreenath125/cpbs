import { Bhajan, Book } from './types';

// Using dummy PDF for demonstration because real Drive/Github links often block CORS without proxy
// In a real app, the user would provide direct download links (e.g., raw.githubusercontent...)
export const DEMO_PDF_URL = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf";

export const PDF_LIB_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
export const PDF_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export const BHAJANS: Bhajan[] = [
  {
    id: '1',
    title: 'Raghupati Raghav Raja Ram',
    titleIAST: 'Raghupati Raghav Raja Ram',
    firstLine: 'Raghupati Raghav Raja Ram',
    firstLineIAST: 'Raghupati Raghav Raja Ram',
    content: `Raghupati Raghav Raja Ram,\nPatit Pavan Sita Ram\n\nSita Ram Sita Ram,\nBhaj Pyare Tu Sita Ram\n\nIshwar Allah Tero Naam,\nSabko Sanmati De Bhagwan`,
    contentIAST: `Raghupati Raghav Raja Ram,\nPatit Pavan Sita Ram\n\nSita Ram Sita Ram,\nBhaj Pyare Tu Sita Ram\n\nIshwar Allah Tero Naam,\nSabko Sanmati De Bhagwan`,
    searchIndex: 'raghupati raghav raja ram',
    searchTokens: ['raghupati', 'raghav', 'raja', 'ram'],
    audio: [
      { id: 's1', singer: 'Singer A', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 's2', singer: 'Singer B', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
    ]
  },
  {
    id: '2',
    title: 'Vaishnav Jan To',
    titleIAST: 'Vaishnav Jan To',
    firstLine: 'Vaishnav jan to tene kahiye je',
    firstLineIAST: 'Vaishnav jan to tene kahiye je',
    content: `Vaishnav jan to tene kahiye je\nPeed paraayi jaane re\nPar-dukhkhe upkaar kare toye\nMan abhimaan na aane re`,
    contentIAST: `Vaishnav jan to tene kahiye je\nPeed paraayi jaane re\nPar-dukhkhe upkaar kare toye\nMan abhimaan na aane re`,
    searchIndex: 'vaishnav jan to',
    searchTokens: ['vaishnav', 'jan', 'to'],
    audio: [
      { id: 's3', singer: 'Traditional', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
    ]
  },
  {
    id: '3',
    title: 'Achutam Keshavam',
    titleIAST: 'Achutam Keshavam',
    firstLine: 'Achyutam Keshavam Krishna Damodaram',
    firstLineIAST: 'Achyutam Keshavam Krishna Damodaram',
    content: `Achyutam Keshavam Krishna Damodaram\nRama Narayanam Janaki Vallabham\n\nKaun Kehta Hai Bhagvan Aate Nahi\nTum Meera Ke Jaise Bulate Nahi`,
    contentIAST: `Achyutam Keshavam Krishna Damodaram\nRama Narayanam Janaki Vallabham\n\nKaun Kehta Hai Bhagvan Aate Nahi\nTum Meera Ke Jaise Bulate Nahi`,
    searchIndex: 'achutam keshavam',
    searchTokens: ['achutam', 'keshavam'],
    audio: [
      { id: 's4', singer: 'Popular', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
    ]
  }
];

export const BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Bhajan Sangrah Vol 1',
    url: '#', // Placeholder for url
    secondaryUrl: DEMO_PDF_URL, // Placeholder for secondaryUrl
    fileName: 'bhajan_vol1.pdf' // Placeholder for fileName
  },
  {
    id: 'b2',
    title: 'Geeta Saar',
    url: '#',
    secondaryUrl: DEMO_PDF_URL, 
    fileName: 'geeta_saar.pdf'
  }
];