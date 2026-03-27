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
    <>
      <img
        src={src}
        alt={alt}
        className="hidden"
        onError={() => setError(true)}
      />
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
    </>
  );
};

const EventList: React.FC = () => {
  const { events, loading, error, refresh } = useEventData();

  if (loading) return <div className="flex justify-center items-center h-screen text-kagura-red">読み込み中...</div>;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 bg-kagura-black">
        <div className="text-kagura-red text-center mb-4">{error}</div>
        <button
          onClick={refresh}
          className="bg-kagura-red text-white px-6 py-2 rounded-sm hover:bg-red-800 transition-colors font-bold"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="bg-kagura-black min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => {
            const { month, day, weekday, diffDays } = formatDateDetails(event.date);
            const isNear = diffDays !== null && diffDays >= 0 && diffDays <= 7;

            return (
              <Link
                key={event.id || index}
                to={`/event_detail/${event.id}`}
                className="group block bg-kagura-card border border-white/5 hover:border-kagura-red/50 hover:shadow-[0_0_30px_rgba(185,28,28,0.2)] transition-all duration-500"
              >
                {/* ev-date */}
                <div className="p-4 border-b border-white/5 flex items-baseline gap-1 font-black">
                  <span className="text-sm text-kagura-muted">{month}月</span>
                  <span className="text-3xl text-kagura-red">{day}</span>
                  <span className="text-sm text-kagura-muted">日</span>
                  <span className="text-sm ml-1 text-kagura-muted">{weekday}</span>

                  {diffDays !== null && diffDays >= 0 && (
                    <span className={`ml-auto flex items-center gap-1 text-[10px] px-3 py-1 rounded-sm tracking-tighter ${isNear ? 'bg-kagura-red text-white shadow-[0_0_10px_rgba(185,28,28,0.5)]' : 'bg-white/10 text-kagura-muted'}`}>
                      <span>あと</span>
                      <span className="text-sm font-black">{diffDays}</span>
                      <span>日</span>
                    </span>
                  )}
                </div>

                {/* ev-msato */}
                <div className="px-4 py-2 bg-white/5 text-[11px] font-bold text-kagura-gold tracking-widest border-b border-white/5 uppercase">
                  {event.groupName}
                </div>

                {/* ev-dsc */}
                <div className="p-4 flex flex-col h-full">
                  {/* n-c */}
                  <p className="font-bold text-kagura-text mb-4 line-clamp-2 min-h-[3rem] text-base leading-snug group-hover:text-white transition-colors">
                    {event.eventName}
                  </p>

                  {/* x-img */}
                  <div className="relative aspect-video overflow-hidden bg-kagura-black mb-4 border border-white/5">
                    <EventImage
                      src={getDirectDriveUrl(event.headerImageUrl || event.imageUrl[0] || '')}
                      alt={event.groupName}
                      className="w-full h-full group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-kagura-black/60 to-transparent" />
                  </div>

                  {/* n-s */}
                  <p className="text-xs font-medium text-kagura-muted truncate flex items-center gap-2">
                    <span className="w-1 h-1 bg-kagura-red rounded-full"></span>
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
