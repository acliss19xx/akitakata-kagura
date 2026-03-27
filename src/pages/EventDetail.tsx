import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const { events, loading, error: fetchError, refresh } = useEventData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const event = events.find(e => String(e.id) === id);

  if (loading) return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4">
        <div className="text-red-500 text-center mb-4">{fetchError}</div>
        <button
          onClick={refresh}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          再読み込み
        </button>
      </div>
    );
  }
  if (!event) return <div className="text-center mt-10">イベントが見つかりませんでした。</div>;

  const images = event.imageUrl;
  const headerImage = event.headerImageUrl || (images.length > 0 ? images[0] : null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/event_list" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" />
        一覧に戻る
      </Link>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        {headerImage && (
          <div className="w-full aspect-[21/9] overflow-hidden bg-gray-100 border-b border-gray-100">
            <img
              src={getDirectDriveUrl(headerImage, 1200)}
              alt={`${event.groupName} header`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{event.eventName || event.groupName}</h1>
            {event.eventName && <p className="text-xl text-indigo-600 font-semibold mt-1">{event.groupName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">開催日</p>
                  <p className="text-gray-800">{new Date(event.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">時間</p>
                  <p className="text-gray-800">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">会場</p>
                  <p className="text-gray-800">{event.location}</p>
                  {event.mapUrl && (
                    <a href={event.mapUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm mt-1 inline-block">
                      地図を表示
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <Banknote className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">料金</p>
                  <p className="text-gray-800">{event.fee || "情報なし"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <ClipboardList className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">演目</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{event.program || "情報なし"}</p>
                </div>
              </div>

              {event.sponsored && (
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">主催</p>
                    <p className="text-gray-800">{event.sponsored}</p>
                  </div>
                </div>
              )}

              {event.contactInfo && (
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">お問い合わせ先</p>
                    <p className="text-gray-800">{event.contactInfo}</p>
                  </div>
                </div>
              )}

              {event.conditions && (
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-indigo-600 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 font-medium">開催条件</p>
                    <p className="text-gray-800">{event.conditions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">備考</h3>
            <p className="text-gray-700 whitespace-pre-wrap mb-6">{event.notes || "特になし"}</p>

            {event.infoUrl && (
              <a
                href={event.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                公式情報を見る
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Image Gallery at the Bottom */}
      {images.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">チラシ・画像</h3>
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-100 aspect-[3/4]"
                onClick={() => setSelectedImage(img)}
              >
                <img
                  src={getDirectDriveUrl(img, 600)}
                  alt={`${event.groupName}-${idx}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 transition-opacity duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-full max-h-full overflow-auto p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getDirectDriveUrl(selectedImage, 2000)}
              alt="Enlarged view"
              className="mx-auto rounded-sm shadow-2xl max-h-[90vh]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
