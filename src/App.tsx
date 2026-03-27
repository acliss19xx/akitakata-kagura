import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-kagura-black text-kagura-text">
        <nav className="bg-kagura-dark border-b border-kagura-red/30 py-6 mb-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-black text-kagura-red tracking-widest text-center md:text-left">
              安芸高田 神楽イベント情報
            </h1>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<Navigate to="/event_list" replace />} />
          <Route path="/event_list" element={<EventList />} />
          <Route path="/event_detail/:id" element={<EventDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
