import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Filter, RotateCcw } from 'lucide-react';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import PastEvents from './pages/PastEvents';
import { FilterProvider, useFilter } from './context/FilterContext';

const KAGURA_GROUPS = [
  "青神楽団", "上河内神楽団", "梶矢神楽団", "来女木神楽団",
  "桑田天使神楽団", "黒瀧神楽団", "佐々部神楽団", "山根神楽団",
  "塩瀬神楽団", "神幸神楽団", "高猿神楽団", "天神神楽団",
  "中北神楽団", "錦城神楽団", "羽佐竹神楽団", "原田神楽団",
  "日吉神楽団", "広森神楽団", "美穂神楽団", "八千代神楽団",
  "横田神楽団", "吉田神楽団"
];

// Generate months (current + 11 months ahead)
const generateMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = -12; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ label, value });
  }
  return months;
};

const MONTHS = generateMonths();

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedGroup, setSelectedGroup, selectedMonth, setSelectedMonth, resetFilters } = useFilter();

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(e.target.value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
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
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-kagura-card border-l border-kagura-red/20 shadow-2xl p-8 flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black text-kagura-text tracking-widest flex items-center gap-2">
              <Filter className="w-5 h-5 text-kagura-red" />
              絞り込み検索
            </h2>
            <button onClick={() => setIsOpen(false)} className="text-kagura-muted hover:text-white">
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="space-y-8 flex-grow">
            {/* Month Filter */}
            <div>
              <label className="block text-xs font-bold text-kagura-muted tracking-widest mb-3 uppercase">年月で絞り込む</label>
              <select 
                value={selectedMonth}
                onChange={handleMonthChange}
                className="w-full bg-kagura-black border border-white/10 rounded-sm p-3 text-kagura-text focus:border-kagura-red outline-none transition-colors"
              >
                <option value="">すべての月</option>
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Group Filter */}
            <div>
              <label className="block text-xs font-bold text-kagura-muted tracking-widest mb-3 uppercase">神楽団で絞り込む</label>
              <select 
                value={selectedGroup}
                onChange={handleGroupChange}
                className="w-full bg-kagura-black border border-white/10 rounded-sm p-3 text-kagura-text focus:border-kagura-red outline-none transition-colors"
              >
                <option value="">すべての神楽団</option>
                {KAGURA_GROUPS.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <button 
              onClick={() => {
                resetFilters();
                setIsOpen(false);
              }}
              className="w-full py-4 border border-kagura-muted/30 text-kagura-muted hover:text-kagura-text hover:border-kagura-text transition-all flex items-center justify-center gap-2 text-sm font-bold tracking-widest"
            >
              <RotateCcw className="w-4 h-4" />
              条件をリセット
            </button>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="w-full py-4 bg-kagura-red text-white font-black tracking-widest shadow-xl shadow-kagura-red/20 hover:bg-red-800 transition-all active:scale-95"
          >
            検索を適用する
          </button>
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
