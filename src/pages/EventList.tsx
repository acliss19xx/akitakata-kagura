import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEventData } from '../../useCsvData';

/**
 * Converts Google Drive sharing links to direct image links
 */
const getDirectDriveUrl = (url: string): string => {
  if (!url) return '';
  const match = url.match(/(?:\/d\/|id=)([\w-]+)/);
  if (match && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
    const fileId = match[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }
  return url;
};

/**
 * Formats date for the specific design
 */
const formatDateDetails = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return { month: '-', day: '-', weekday: '-', diffDays: null };

  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  const weekdays = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];
  const weekday = weekdays[date.getDay()];

  // Calculate days remaining
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateStr);
  eventDate.setHours(0, 0, 0, 0);

  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    month,
    day,
    weekday,
    diffDays
  };
};

/**
 * Image component with error handling
 */
const EventImage = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
        No Image
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      role="img"
      aria-label={alt}
    />
  );
};

const EventList: React.FC = () => {
  const { events, loading, error, refresh } = useEventData();

  if (loading) return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="text-red-500 text-center mb-4">{error}</div>
        <button
          onClick={refresh}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => {
            const { month, day, weekday, diffDays } = formatDateDetails(event.date);
            const isNear = diffDays !== null && diffDays >= 0 && diffDays <= 7;

            return (
              <Link
                key={event.id || index}
                to={`/event_detail/${event.id}`}
                className="group block bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
              >
                {/* ev-date */}
                <div className="p-3 border-b border-gray-100 flex items-baseline gap-1 font-bold">
                  <span className="text-base">{month}月</span>
                  <span className="text-2xl text-gray-900">{day}</span>
                  <span className="text-base">日</span>
                  <span className="text-base ml-1">{weekday}</span>

                  {diffDays !== null && diffDays >= 0 && (
                    <span className={`ml-auto flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${isNear ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <span>あと</span>
                      <span className="text-xs font-black">{diffDays}</span>
                      <span>日</span>
                    </span>
                  )}
                </div>

                {/* ev-msato */}
                <div className="px-3 py-1.5 bg-gray-50 text-[11px] font-bold text-gray-600 border-b border-gray-100 truncate">
                  {event.groupName}
                </div>

                {/* ev-dsc */}
                <div className="p-3 flex flex-col h-full">
                  {/* n-c */}
                  <p className="font-bold text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem] text-sm leading-snug">
                    {event.eventName}
                  </p>

                  {/* x-img */}
                  <div className="relative aspect-video overflow-hidden bg-gray-100 mb-3">
                    <EventImage
                      src={getDirectDriveUrl(event.headerImageUrl || event.imageUrl[0] || '')}
                      alt={event.groupName}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* n-s */}
                  <p className="text-[10px] font-medium text-gray-400 truncate">
                    会場：{event.location}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventList;
