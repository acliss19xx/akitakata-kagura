import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface FilterContextType {
  selectedGroups: string[];
  setSelectedGroups: (groups: string[]) => void;
  selectedMonth: string; // Format: YYYY-MM
  setSelectedMonth: (month: string) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const STORAGE_KEY_GROUPS = 'kagura_selected_groups_v2';
const STORAGE_KEY_MONTH = 'kagura_selected_month_v2';

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_GROUPS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_MONTH) || '';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(selectedGroups));
  }, [selectedGroups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MONTH, selectedMonth);
  }, [selectedMonth]);

  const resetFilters = () => {
    setSelectedGroups([]);
    setSelectedMonth('');
  };

  return (
    <FilterContext.Provider value={{ selectedGroups, setSelectedGroups, selectedMonth, setSelectedMonth, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
