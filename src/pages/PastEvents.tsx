import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FilterX } from 'lucide-react';
import { useEventData } from '../../useCsvData';
import { useFilter } from '../context/FilterContext';

/**
 * Converts Google Drive sharing links to direct image links
 */
const getDirectDriveUrl = (url: string, size: number = 1000): string => {
  if (!url) return '';
  const match = url.match(/(?:\/d\/|id=)([\w-]+)/);
  if (match && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
    const fileId = match[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
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

  return {
    month,
    day,
    weekday
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

const PastEvents: React.FC = () => {
  const { events, loading, error, refresh } = useEventData();
  const { selectedGroup, selectedMonth, resetFilters } = useFilter();

  const filteredPastEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        const isPast = !isNaN(eventDate.getTime()) && eventDate < today && eventDate >= oneYearAgo;
        
        if (!isPast) return false;

        // Apply group filter
        if (selectedGroup && event.groupName !== selectedGroup) return false;

        // Apply month filter
        if (selectedMonth) {
          const yearMonth = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
          if (yearMonth !== selectedMonth) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, selectedGroup, selectedMonth]);

  if (loading) return <div className="flex justify-center items-center h-screen text-kagura-red bg-kagura-black">読み込み中...</div>;
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
        <Link to="/event_list" className="inline-flex items-center text-kagura-gold hover:text-yellow-600 mb-8 transition-colors font-bold tracking-widest text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          一覧に戻る
        </Link>

        {/* Active Filters Display */}
        {(selectedGroup || selectedMonth) && (
          <div className="mb-8 flex flex-wrap items-center gap-3 bg-white/5 p-4 rounded-sm border border-kagura-red/20">
            <span className="text-xs font-bold text-kagura-muted tracking-widest uppercase">検索条件:</span>
            {selectedMonth && (
              <span className="px-3 py-1 bg-kagura-red/20 text-kagura-red text-xs font-bold rounded-full border border-kagura-red/30">
                {selectedMonth.replace('-', '年')}月
              </span>
            )}
            {selectedGroup && (
              <span className="px-3 py-1 bg-kagura-gold/20 text-kagura-gold text-xs font-bold rounded-full border border-kagura-gold/30">
                {selectedGroup}
              </span>
            )}
            <button 
              onClick={resetFilters}
              className="ml-auto text-xs text-kagura-muted hover:text-white underline underline-offset-4"
            >
              解除する
            </button>
          </div>
        )}

        <h2 className="text-2xl font-black text-kagura-text mb-12 tracking-widest flex items-center gap-4">
          <span className="text-kagura-muted">/</span>
          過去の開催実績（直近1年）
        </h2>

        {filteredPastEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPastEvents.map((event) => {
              const { month, day, weekday } = formatDateDetails(event.date);

              return (
                <Link
                  key={event.id}
                  to={`/event_detail/${event.id}`}
                  className="group block bg-kagura-card border border-white/20 hover:border-kagura-red/50 hover:shadow-[0_0_30px_rgba(185,28,28,0.2)] transition-all duration-500 opacity-80 grayscale-[0.2] hover:opacity-100 hover:grayscale-0"
                >
                  {/* ev-date */}
                  <div className="p-4 border-b border-white/5 flex items-baseline gap-1 font-black">
                    <span className="text-sm text-kagura-muted">{month}月</span>
                    <span className="text-3xl text-kagura-muted">{day}</span>
                    <span className="text-sm text-kagura-muted">日</span>
                    <span className="text-sm ml-1 text-kagura-muted">{weekday}</span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 bg-white/5 text-kagura-muted rounded-sm">
                      終了
                    </span>
                  </div>

                  {/* ev-msato */}
                  <div className="px-4 py-2 bg-white/5 text-[11px] font-bold tracking-widest border-b border-white/5 uppercase text-kagura-muted">
                    {event.groupName}
                  </div>

                  {/* ev-dsc */}
                  <div className="p-4 flex flex-col h-full">
                    <p className="font-bold text-kagura-text mb-4 line-clamp-2 min-h-[3rem] text-base leading-snug group-hover:text-white transition-colors">
                      {event.eventName}
                    </p>

                    <div className="relative aspect-video overflow-hidden bg-kagura-black mb-4 border border-white/5">
                      <EventImage
                        src={getDirectDriveUrl(event.headerImageUrl || event.imageUrl[0] || '')}
                        alt={event.groupName}
                        className="w-full h-full group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-kagura-black/60 to-transparent" />
                    </div>

                    <p className="text-xs font-medium text-kagura-muted truncate flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-kagura-muted"></span>
                      会場：{event.location}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-sm mb-12">
            <FilterX className="w-12 h-12 text-kagura-muted mb-4 opacity-20" />
            <p className="text-kagura-muted font-bold tracking-widest">条件に一致する実績はありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastEvents;
