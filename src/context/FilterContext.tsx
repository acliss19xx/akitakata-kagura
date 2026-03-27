import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface FilterContextType {
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  selectedMonth: string; // Format: YYYY-MM
  setSelectedMonth: (month: string) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const STORAGE_KEY_GROUP = 'kagura_selected_group';
const STORAGE_KEY_MONTH = 'kagura_selected_month';

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage if available
  const [selectedGroup, setSelectedGroup] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_GROUP) || '';
  });
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_MONTH) || '';
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GROUP, selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MONTH, selectedMonth);
  }, [selectedMonth]);

  const resetFilters = () => {
    setSelectedGroup('');
    setSelectedMonth('');
  };

  return (
    <FilterContext.Provider value={{ selectedGroup, setSelectedGroup, selectedMonth, setSelectedMonth, resetFilters }}>
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
