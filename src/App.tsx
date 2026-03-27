import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Menu, X, Filter, RotateCcw, Check } from 'lucide-react';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import PastEvents from './pages/PastEvents';
import { FilterProvider, useFilter } from './context/FilterContext';
import { useEventData } from '../useCsvData';

const KAGURA_GROUPS = [
  "青神楽団", "上河内神楽団", "梶矢神楽団", "来女木神楽団",
  "桑田天使神楽団", "黒瀧神楽団", "佐々部神楽団", "山根神楽団",
  "塩瀬神楽団", "神幸神楽団", "高猿神楽団", "天神神楽団",
  "中北神楽団", "錦城神楽団", "羽佐竹神楽団", "原田神楽団",
  "日吉神楽団", "広森神楽団", "美穂神楽団", "八千代神楽団",
  "横田神楽団", "吉田神楽団"
];

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { events } = useEventData();
  const { selectedGroups, setSelectedGroups, selectedMonth, setSelectedMonth, resetFilters } = useFilter();

  // Dynamically generate available months from current data (only future events)
  const availableMonths = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthSet = new Set<string>();
    events.forEach(event => {
      const d = new Date(event.date);
      if (!isNaN(d.getTime()) && d >= today) {
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(value);
      }
    });

    return Array.from(monthSet)
      .sort()
      .map(value => {
        const [year, month] = value.split('-');
        return { label: `${year}年${parseInt(month)}月`, value };
      });
  }, [events]);

  const toggleGroup = (group: string) => {
    if (selectedGroups.includes(group)) {
      setSelectedGroups(selectedGroups.filter(g => g !== group));
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  return (
    <>
      <nav className="bg-kagura-dark border-b border-kagura-red/30 py-4 mb-6 sticky top-0 z-40 backdrop-blur-md bg-kagura-dark/90">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" onClick={resetFilters}>
            <h1 className="text-xl md:text-2xl font-black text-kagura-red tracking-widest">
              安芸高田 神楽情報
            </h1>
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-kagura-gold hover:bg-white/5 rounded-sm transition-colors flex items-center gap-2 border border-kagura-gold/20"
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs font-black tracking-widest hidden sm:inline">絞り込み</span>
          </button>
        </div>
      </nav>

      {/* Hamburger Menu / Filter Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="absolute inset-0 bg-kagura-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div className="absolute right-0 top-0 bottom-0 w-80 md:w-96 bg-kagura-card border-l border-kagura-red/20 shadow-2xl flex flex-col">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-kagura-black/20">
            <h2 className="text-xl font-black text-kagura-text tracking-widest flex items-center gap-2">
              <Filter className="w-5 h-5 text-kagura-red" />
              絞り込み検索
            </h2>
            <button onClick={() => setIsOpen(false)} className="text-kagura-muted hover:text-white">
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="p-8 space-y-10 flex-grow overflow-y-auto custom-scrollbar">
            {/* Month Filter */}
            <div>
              <label className="block text-xs font-bold text-kagura-muted tracking-widest mb-4 uppercase">年月で絞り込む（今月以降）</label>
              <select 
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setIsOpen(false); // Close on month selection for convenience
                }}
                className="w-full bg-kagura-black border border-white/10 rounded-sm p-4 text-kagura-text focus:border-kagura-red outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">すべての月</option>
                {availableMonths.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Group Filter (Multi-select) */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold text-kagura-muted tracking-widest uppercase">神楽団（複数選択可）</label>
                {selectedGroups.length > 0 && (
                  <button 
                    onClick={() => setSelectedGroups([])}
                    className="text-[10px] text-kagura-gold hover:underline font-bold"
                  >
                    選択解除
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {KAGURA_GROUPS.map(group => {
                  const isSelected = selectedGroups.includes(group);
                  return (
                    <button
                      key={group}
                      onClick={() => toggleGroup(group)}
                      className={`flex items-center justify-between p-3 rounded-sm border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-kagura-red/20 border-kagura-red/50 text-kagura-text' 
                          : 'bg-white/5 border-white/5 text-kagura-muted hover:bg-white/10'
                      }`}
                    >
                      <span className="text-sm font-medium">{group}</span>
                      <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-kagura-red border-kagura-red' : 'border-white/10'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            </div>

            <div className="p-8 bg-kagura-black/40 border-t border-white/5">
            <button 
              onClick={() => {
                resetFilters();
                setIsOpen(false);
              }}
              className="w-full py-4 border border-kagura-muted/30 text-kagura-muted hover:text-kagura-text hover:border-kagura-text transition-all flex items-center justify-center gap-2 text-xs font-bold tracking-widest"
            >
              <RotateCcw className="w-3 h-3" />
              条件をすべてリセット
            </button>
            </div>
            </div>
            </div>

    </>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-kagura-black text-kagura-text">
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/event_list" replace />} />
        <Route path="/event_list" element={<EventList />} />
        <Route path="/event_detail/:id" element={<EventDetail />} />
        <Route path="/past_events" element={<PastEvents />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <FilterProvider>
      <Router>
        <AppContent />
      </Router>
    </FilterProvider>
  );
}

export default App;
