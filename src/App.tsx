import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm py-4 mb-6">
          <div className="container mx-auto px-4">
            <h1 className="text-xl font-bold text-indigo-600">神楽イベント情報</h1>
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
