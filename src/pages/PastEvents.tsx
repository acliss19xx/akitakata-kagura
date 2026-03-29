import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FilterX } from 'lucide-react';
import { useEventData } from '../../useCsvData';
import { useFilter } from '../context/FilterContext';

/**
 * Formats date for the specific design
 */
const formatFullDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];

  return `${year}年${month}月${day}日(${weekday})`;
};

const PastEvents: React.FC = () => {
  const { events, loading, error, refresh } = useEventData();
  const { selectedGroups, selectedMonth, resetFilters } = useFilter();

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

        // Apply multiple group filter
        if (selectedGroups.length > 0 && !selectedGroups.includes(event.groupName)) return false;

        // Apply month filter
        if (selectedMonth) {
          const yearMonth = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
          if (yearMonth !== selectedMonth) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, selectedGroups, selectedMonth]);

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
        {(selectedGroups.length > 0 || selectedMonth) && (
          <div className="mb-8 flex flex-wrap items-center gap-3 bg-white/5 p-4 rounded-sm border border-kagura-red/20">
            <span className="text-xs font-bold text-kagura-muted tracking-widest uppercase">検索条件:</span>
            {selectedMonth && (
              <span className="px-3 py-1 bg-kagura-red/20 text-kagura-red text-xs font-bold rounded-full border border-kagura-red/30">
                {selectedMonth.replace('-', '年')}月
              </span>
            )}
            {selectedGroups.map(group => (
              <span key={group} className="px-3 py-1 bg-kagura-gold/20 text-kagura-gold text-xs font-bold rounded-full border border-kagura-gold/30">
                {group}
              </span>
            ))}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border-t border-white/20">
              <thead>
                <tr className="bg-white/5 text-kagura-gold text-xs tracking-widest uppercase">
                  <th className="py-4 px-4 font-black border-b border-white/20">開催日時</th>
                  <th className="py-4 px-4 font-black border-b border-white/20">イベント名</th>
                  <th className="py-4 px-4 font-black border-b border-white/20">神楽団</th>
                </tr>
              </thead>
              <tbody className="text-kagura-text">
                {filteredPastEvents.map((event) => (
                  <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-kagura-muted whitespace-nowrap">{formatFullDate(event.date)}</span>
                        <span className="text-kagura-muted/50 text-xs">{event.time}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-base">
                      <Link
                        to={`/event_detail/${event.id}`}
                        state={{ from: 'past_events' }}
                        className="hover:text-kagura-gold transition-colors"
                      >
                        {event.eventName}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-sm text-kagura-muted">
                      {event.groupName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
