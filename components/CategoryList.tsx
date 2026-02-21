
import React, { useMemo } from 'react';
import { Bhajan, ScriptType } from '../types';
import { ChevronRight, Users } from 'lucide-react';
import { AUTHOR_MAPPINGS } from '../data/authorMappings';
import { KNOWN_AUTHORS } from '../data/authors';

interface CategoryListProps {
  bhajans: Bhajan[];
  onSelect: (bhajan: Bhajan) => void;
  script: ScriptType;
}

export const CategoryList: React.FC<CategoryListProps> = ({ bhajans, onSelect, script }) => {
  
  const groupedData = useMemo(() => {
    const groups: Record<string, Bhajan[]> = {};
    const miscKey = "Uncategorized"; 
    
    // 1. Create a map of all bhajans by Song Number or ID for easy lookup
    const bhajanMap = new Map<string, Bhajan>();
    bhajans.forEach(b => {
        if (b.songNumber) bhajanMap.set(b.songNumber, b);
        bhajanMap.set(b.id, b); // Fallback to ID
    });

    const assignedBhajanIds = new Set<string>();

    // 2. Iterate through manual mappings
    Object.entries(AUTHOR_MAPPINGS).forEach(([authorKey, songIds]) => {
        const authorBhajans: Bhajan[] = [];
        songIds.forEach(id => {
            const bhajan = bhajanMap.get(id);
            if (bhajan) {
                authorBhajans.push(bhajan);
                assignedBhajanIds.add(bhajan.id);
                if(bhajan.songNumber) assignedBhajanIds.add(bhajan.songNumber);
            }
        });

        if (authorBhajans.length > 0) {
            groups[authorKey] = authorBhajans;
        }
    });

    // 3. Collect Uncategorized
    const miscBhajans = bhajans.filter(b => {
       const key = b.songNumber || b.id;
       return !assignedBhajanIds.has(key) && !assignedBhajanIds.has(b.id);
    });

    if (miscBhajans.length > 0) {
        groups[miscKey] = miscBhajans;
    }

    // 4. Sort Keys: Known Authors first (alphabetical), then others, then Misc at bottom
    const keys = Object.keys(groups).sort((a, b) => {
        if (a === miscKey) return 1;
        if (b === miscKey) return -1;
        
        // Use Devanagari names for sorting if available
        const nameA = KNOWN_AUTHORS[a]?.deva || a;
        const nameB = KNOWN_AUTHORS[b]?.deva || b;
        return nameA.localeCompare(nameB, 'hi');
    });

    return { groups, keys, miscKey };
  }, [bhajans]);

  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  const getCategoryDisplayName = (key: string) => {
    if (key === groupedData.miscKey) {
       return script === 'iast' ? 'Uncategorized' : 'विविध / अन्य';
    }
    
    // Look up in KNOWN_AUTHORS
    if (KNOWN_AUTHORS[key]) {
        return script === 'iast' ? KNOWN_AUTHORS[key].iast : KNOWN_AUTHORS[key].deva;
    }
    
    return key;
  };

  return (
    <div className="pb-2 pt-2">
      {groupedData.keys.map((categoryKey, index) => {
        const delayStyle = { animationDelay: `${index * 30}ms` };
        const count = groupedData.groups[categoryKey].length;
        
        return (
          <div key={categoryKey} className="mb-2 bg-white dark:bg-slate-800 border-y border-slate-100 dark:border-slate-700 animate-fade-in-up opacity-0 fill-mode-forwards" style={delayStyle}>
            <button
              onClick={() => toggleCategory(categoryKey)}
              className="w-full flex items-center justify-between p-4 hover:bg-saffron-50 dark:hover:bg-slate-700 transition-colors active:bg-saffron-100"
            >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-saffron-100 dark:bg-slate-700 text-saffron-600 dark:text-saffron-400 flex items-center justify-center">
                   <Users size={16} />
                 </div>
                 <div className="text-left">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 font-hindi">
                      {getCategoryDisplayName(categoryKey)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {count} {script === 'iast' ? 'Songs' : 'भजन'}
                    </p>
                 </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expandedCategory === categoryKey ? 'rotate-90' : ''}`} />
            </button>

            {expandedCategory === categoryKey && (
               <ul className="divide-y divide-slate-100 dark:divide-slate-700 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                 {groupedData.groups[categoryKey].map((bhajan, bIndex) => (
                   <li key={bhajan.id} className="animate-fade-in" style={{ animationDelay: `${bIndex * 20}ms` }}>
                     <button
                       onClick={() => onSelect(bhajan)}
                       className="w-full text-left py-3 px-4 pl-14 hover:bg-saffron-50 dark:hover:bg-slate-800 transition-colors active:bg-saffron-100"
                     >
                        <div className="font-hindi text-slate-700 dark:text-slate-200 font-medium">
                           {script === 'iast' ? bhajan.titleIAST : bhajan.title}
                        </div>
                        <div className="text-xs text-slate-400 font-hindi mt-0.5 truncate">
                           {script === 'iast' ? bhajan.firstLineIAST : bhajan.firstLine}
                        </div>
                     </button>
                   </li>
                 ))}
               </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};
