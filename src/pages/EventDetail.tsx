import React, { useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Calendar, MapPin, Clock, Info, Banknote, ClipboardList, ArrowLeft, X, Users, Phone } from 'lucide-react';
import { useEventData } from '../../useCsvData';

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

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { events, loading, error: fetchError, refresh } = useEventData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const event = events.find(e => String(e.id) === id);

  // Determine if the event is in the past
  const isPast = useMemo(() => {
    if (!event) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    return !isNaN(eventDate.getTime()) && eventDate < today;
  }, [event]);

  // Determine back link destination
  const isFromPast = location.pathname.includes('past_events') || (location.state as any)?.from === 'past_events';
  const backLink = isFromPast ? "/past_events" : "/event_list";

  if (loading) return <div className="flex justify-center items-center h-screen text-kagura-red bg-kagura-black">読み込み中...</div>;
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 bg-kagura-black">
        <div className="text-kagura-red text-center mb-4">{fetchError}</div>
        <button
          onClick={refresh}
          className="bg-kagura-red text-white px-6 py-2 rounded-sm hover:bg-red-800 transition-colors font-bold"
        >
          再読み込み
        </button>
      </div>
    );
  }
  if (!event) return <div className="text-center mt-10 text-kagura-muted bg-kagura-black h-screen">イベントが見つかりませんでした。</div>;

  const images = event.imageUrl;
  const headerImage = event.headerImageUrl || (images.length > 0 ? images[0] : null);

  return (
    <div className="bg-kagura-black min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to={backLink} className="inline-flex items-center text-kagura-gold hover:text-yellow-600 mb-8 transition-colors font-bold tracking-widest text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          一覧に戻る
        </Link>

        <div className="bg-kagura-card border border-white/5 shadow-2xl overflow-hidden mb-12">
          {headerImage && (
            <div className="w-full aspect-[21/9] overflow-hidden bg-kagura-black border-b border-white/5 relative">
              <img
                src={getDirectDriveUrl(headerImage, 1200)}
                alt={`${event.groupName} header`}
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-kagura-card to-transparent" />
            </div>
          )}

          <div className="p-6 md:p-10">
            <div className="mb-10 border-l-4 border-kagura-red pl-6">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-black text-kagura-text leading-tight tracking-tight">
                  {event.eventName || event.groupName}
                </h1>
                {isPast && (
                  <span className="px-3 py-1 bg-kagura-red text-white text-xs font-bold rounded-sm shadow-[0_0_15px_rgba(185,28,28,0.4)]">
                    公演終了
                  </span>
                )}
              </div>
              {event.eventName && (
                <p className="text-xl text-kagura-gold font-bold tracking-widest">{event.groupName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="bg-white/5 p-2 rounded-sm mr-4 group-hover:bg-kagura-red/20 transition-colors">
                    <Calendar className="w-5 h-5 text-kagura-red" />
                  </div>
                  <div>
                    <p className="text-xs text-kagura-muted font-bold tracking-widest mb-1 uppercase">開催日</p>
                    <p className="text-kagura-text text-lg font-medium">
                      {new Date(event.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-white/5 p-2 rounded-sm mr-4 group-hover:bg-kagura-red/20 transition-colors">
                    <Clock className="w-5 h-5 text-kagura-red" />
                  </div>
                  <div>
                    <p className="text-xs text-kagura-muted font-bold tracking-widest mb-1 uppercase">時間</p>
                    <p className="text-kagura-text text-lg font-medium">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-white/5 p-2 rounded-sm mr-4 group-hover:bg-kagura-red/20 transition-colors">
                    <MapPin className="w-5 h-5 text-kagura-red" />
                  </div>
                  <div>
                    <p className="text-xs text-kagura-muted font-bold tracking-widest mb-1 uppercase">会場</p>
                    <p className="text-kagura-text text-lg font-medium">{event.location}</p>
                    {event.mapUrl && (
                      <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="text-kagura-gold hover:text-yellow-500 text-sm mt-2 inline-flex items-center gap-1 transition-colors">
                        地図を表示
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-white/5 p-2 rounded-sm mr-4 group-hover:bg-kagura-red/20 transition-colors">
                    <Banknote className="w-5 h-5 text-kagura-red" />
                  </div>
                  <div>
                    <p className="text-xs text-kagura-muted font-bold tracking-widest mb-1 uppercase">料金</p>
                    <p className="text-kagura-text text-lg font-medium">{event.fee || "情報なし"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="bg-white/5 p-2 rounded-sm mr-4 group-hover:bg-kagura-red/20 transition-colors">
                    <ClipboardList className="w-5 h-5 text-kagura-red" />
                  </div>
                  <div>
                    <p className="text-xs text-kagura-muted font-bold tracking-widest mb-1 uppercase">演目</p>
                    <p className="text-kagura-text text-base leading-relaxed whitespace-pre-wrap">{event.program || "情報なし"}</p>
                  </div>
                </div>

                {event.sponsored && (
                  <div className="flex items-start group">
                    <div className="bg-white/5 p-2 rounded-sm mr-4 group-hover:bg-kagura-red/20 transition-colors">
                      <Users className="w-5 h-5 text-kagura-red" />
                    </div>
                    <div>
                      <p className="text-xs text-kagura-muted font-bold tracking-widest mb-1 uppercase">主催</p>
                      <p className="text-kagura-text text-base">{event.sponsored}</p>
                    </div>
                  </div>
                )}

                {event.contactInfo && (
                  <div className="flex items-start group">
                    <div className="bg-white/5 p-2 rounded-sm mr-4 group-hover:bg-kagura-red/20 transition-colors">
                      <Phone className="w-5 h-5 text-kagura-red" />
                    </div>
                    <div>
                      <p className="text-xs text-kagura-muted font-bold tracking-widest mb-1 uppercase">お問い合わせ先</p>
                      <p className="text-kagura-text text-base">{event.contactInfo}</p>
                    </div>
                  </div>
                )}

                {event.conditions && (
                  <div className="flex items-start group">
                    <div className="bg-white/5 p-2 rounded-sm mr-4 group-hover:bg-kagura-red/20 transition-colors">
                      <Info className="w-5 h-5 text-kagura-red" />
                    </div>
                    <div>
                      <p className="text-xs text-kagura-muted font-bold tracking-widest mb-1 uppercase">開催条件</p>
                      <p className="text-kagura-text text-base">{event.conditions}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-white/5">
              <h3 className="text-lg font-bold mb-4 text-kagura-gold tracking-widest uppercase flex items-center gap-3">
                <span className="w-8 h-px bg-kagura-gold/30"></span>
                備考
                <span className="w-8 h-px bg-kagura-gold/30"></span>
              </h3>
              <p className="text-kagura-text text-base leading-relaxed whitespace-pre-wrap mb-8 bg-white/5 p-6 border-l-2 border-kagura-gold/30">
                {event.notes || "特になし"}
              </p>

              {event.infoUrl && (
                <a
                  href={event.infoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-kagura-red text-white px-8 py-4 rounded-sm font-black tracking-widest hover:bg-red-800 transition-all duration-300 shadow-xl shadow-kagura-red/20 active:scale-95"
                >
                  公式情報を見る
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Image Gallery at the Bottom */}
        {images.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-black text-kagura-text mb-6 tracking-widest flex items-center gap-4">
              <span className="text-kagura-red">/</span>
              チラシ・画像
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group cursor-pointer overflow-hidden border border-white/5 hover:border-kagura-red/50 transition-all duration-500 bg-kagura-card aspect-[3/4]"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={getDirectDriveUrl(img, 600)}
                    alt={`${event.groupName}-${idx}`}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-kagura-black/95 p-4 backdrop-blur-sm transition-all duration-300"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-6 right-6 text-white hover:text-kagura-red transition-colors z-[60]"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X className="w-10 h-10" />
            </button>
            <div
              className="max-w-full max-h-full overflow-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getDirectDriveUrl(selectedImage, 2000)}
                alt="Enlarged view"
                className="mx-auto border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[85vh]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
