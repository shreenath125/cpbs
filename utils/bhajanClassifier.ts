
import { Bhajan, BhajanAudio } from '../types';
import { BHAJAN_AUDIO_MAP } from '../data/audioLinks';
import { CATEGORY_RULES } from '../data/categories';

// Export constants derived from the data file for compatibility with UI components
export const MORNING_SONG_NUMBERS = CATEGORY_RULES.find(c => c.id === 'morning')?.specificIds || [];
export const EVENING_SONG_NUMBERS = CATEGORY_RULES.find(c => c.id === 'evening')?.specificIds || [];

// Helper to determine category based on rules in data/categories.ts
export const getBhajanCategory = (bhajan: Bhajan): string[] => {
  const categories: string[] = [];
  const text = (bhajan.title + ' ' + bhajan.content).toLowerCase();
  
  // Get visible Song Number (e.g. "305")
  const songNum = bhajan.songNumber;

  // Iterate through all rules defined in the data file
  CATEGORY_RULES.forEach(rule => {
    let isMatch = false;

    // 1. Check specific song numbers (if defined)
    if (rule.specificIds && songNum && rule.specificIds.includes(songNum)) {
      isMatch = true;
    }

    // 2. Check keywords (if defined)
    if (!isMatch && rule.keywords) {
      if (rule.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        isMatch = true;
      }
    }

    if (isMatch) {
      categories.push(rule.id);
    }
  });

  return categories;
};

export interface SingerData {
  name: string;
  bhajanIds: string[];
}

// Helper to normalize singer names (grouping duplicates)
export const normalizeSingerName = (rawName: string): string => {
  // Remove (1), (2), (HD), (SD) prefixes
  let name = rawName.replace(/^(\(\d+\)|\(HD\)|\(SD\))\s*/i, '').trim();
  
  // Canonical Mapping - Mapped TO Hindi Names
  if (name.includes('रविंद्र') || name.includes('बबलू')) return 'रविंद्र कृष्ण दास (बबलू प्रभुजी)';
  if (name.includes('मधुसूदन') || name.includes('मामाजी')) return 'मधुसूदन दास (मामाजी खुरई)';
  if (name.includes('भक्तिशास्त्री')) return 'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज';
  if (name.includes('ललित कृष्ण') || name.includes('लकी')) return 'ललित कृष्ण दास (लकी प्रभुजी)';
  if (name.includes('भूधारी')) return 'भूधारी प्रभुजी';
  if (name.includes('कृष्णदास')) return 'कृष्ण दास प्रभुजी';
  if (name.includes('रसराज')) return 'रसराज प्रभुजी';
  if (name.includes('गोविंदा')) return 'गोविंदा प्रभुजी';
  if (name.includes('गौरांग दास') && name.includes('बस्सी')) return 'गौरांग दास (बस्सी प्रभुजी)';
  if (name.includes('ललिता') && name.includes('माताजी')) return 'ललिता माताजी';
  if (name.includes('चौरसिया')) return 'चौरसिया प्रभुजी';
  if (name.includes('विश्वम्भर') || name.includes('विशु')) return 'विश्वम्भर दास (विशु प्रभुजी)';
  
  return name;
};

// Aggregates singers from the Audio Map
export const getSingersList = (allBhajans: Bhajan[]): SingerData[] => {
  const singerMap: Record<string, Set<string>> = {};

  const processTrack = (track: BhajanAudio, bhajanId: string) => {
      const rawSinger = track.singer?.trim();
      if (!rawSinger) return;
      
      const normalizedSinger = normalizeSingerName(rawSinger);
      
      // Filter out specific excluded singers
      if (normalizedSinger === 'चौरसिया प्रभुजी') return;

      if (!singerMap[normalizedSinger]) {
        singerMap[normalizedSinger] = new Set();
      }
      singerMap[normalizedSinger].add(bhajanId);
  };

  // 1. Iterate through the static audio map
  Object.keys(BHAJAN_AUDIO_MAP).forEach(key => {
    let targetBhajanId: string | null = null;

    // Try finding by song number first
    const matchByNum = allBhajans.find(b => b.songNumber === key);
    if (matchByNum) {
      targetBhajanId = matchByNum.id;
    } else {
      // Try finding by title
      const matchByTitle = allBhajans.find(b => b.title === key);
      if (matchByTitle) targetBhajanId = matchByTitle.id;
    }

    if (targetBhajanId) {
      const tracks = BHAJAN_AUDIO_MAP[key];
      tracks.forEach(track => processTrack(track, targetBhajanId!));
    }
  });

  // 2. Also check inline audio arrays
  allBhajans.forEach(bhajan => {
    if (bhajan.audio) {
      bhajan.audio.forEach(track => processTrack(track, bhajan.id));
    }
  });

  // Define Custom Sort Order
  const prioritySingers = [
    'श्रील गुरुदेव "भक्तिशास्त्री" जी महाराज',
    'मधुसूदन दास (मामाजी खुरई)',
    'रविंद्र कृष्ण दास (बबलू प्रभुजी)',
    'ललिता माताजी',
    'भूधारी प्रभुजी',
    'ललित कृष्ण दास (लकी प्रभुजी)',
    'रसराज प्रभुजी',
    'गौरांग दास (बस्सी प्रभुजी)',
    'विश्वम्भर दास (विशु प्रभुजी)'
  ];

  // Convert to array and sort
  return Object.keys(singerMap).map(singer => ({
    name: singer,
    bhajanIds: Array.from(singerMap[singer])
  })).sort((a, b) => {
      const indexA = prioritySingers.indexOf(a.name);
      const indexB = prioritySingers.indexOf(b.name);

      // If both are in priority list, sort by defined order
      if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
      }
      // If only A is in priority list, move A up
      if (indexA !== -1) return -1;
      // If only B is in priority list, move B up
      if (indexB !== -1) return 1;

      // Default alphabetical sort for others
      return a.name.localeCompare(b.name, 'hi');
  });
};
