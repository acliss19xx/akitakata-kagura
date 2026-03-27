import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  selectedMonth: string; // Format: YYYY-MM
  setSelectedMonth: (month: string) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

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
