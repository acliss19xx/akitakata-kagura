import { useState, useEffect } from 'react';
import axios from 'axios';
import { Event } from './src/types/event';

const JSON_URL = "./data/event_list.json";
const MAX_AUTO_RETRIES = 3;

/**
 * Splits a comma-separated string into a trimmed array of non-empty strings
 */
const splitImages = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(s => s !== '');
  if (typeof val !== 'string') return [];
  return val.split(',').map(s => s.trim()).filter(s => s !== '');
};

/**
 * Maps JSON data to the Event interface keys
 */
const mapEventData = (row: any): Event => {
  const imageUrls = splitImages(row['チラシ画像'] || row['imageUrl']);
  const etcImageUrls = splitImages(row['その他画像'] || row['etcImageUrl']);
  const headerImg = row['ヘッダー画像'] || row['headerImageUrl'] || '';

  let time = row['開催時刻'] || row['time'] || '';
  if (typeof time === 'string' && time.includes(' ')) {
    time = time.split(' ')[1];
  }

  return {
    id: row['ID'] || row['id'] || '',
    groupName: row['神楽団名'] || row['groupName'] || '',
    eventName: row['公演・イベント名'] || row['eventName'] || '',
    date: row['開催日'] || row['date'] || '',
    time: time,
    location: row['開催場所'] || row['location'] || '',
    mapUrl: row['地図URL'] || row['mapUrl'] || '',
    program: row['演目'] || row['program'] || '',
    fee: row['料金'] || row['fee'] || '',
    conditions: row['観覧条件'] || row['conditions'] || '',
    infoUrl: row['詳細サイトURL'] || row['infoUrl'] || '',
    contactInfo: row['お問い合わせ先'] || row['contact'] || row['contactInfo'] || '',
    sponsored: row['主催'] || row['sponsored'] || '',
    notes: row['備考'] || row['notes'] || '',
    imageUrl: imageUrls,
    headerImageUrl: headerImg,
    etcImageUrl: etcImageUrls,
    isPublished: row['公開'] || row['isPublished'] || 'はい',
    category: row['カテゴリー'] || row['category'] || ((row['神楽団名'] || row['groupName']) ? '神楽' : 'イベント')
  };
};

export const useEventData = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const refresh = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      let lastError = null;
      for (let attempt = 0; attempt <= MAX_AUTO_RETRIES; attempt++) {
        try {
          console.log(`Fetching local JSON data (attempt ${attempt + 1})...`);

          // キャッシュバスティングのためにタイムスタンプを付与
          const response = await axios.get(`${JSON_URL}?t=${new Date().getTime()}`);
          let data = response.data;

          if (typeof data === 'string') {
            data = JSON.parse(data);
          }

          if (Array.isArray(data)) {
            const fetchedData = data
              .map(mapEventData)
              .filter(e => (e.isPublished === "はい" || e.isPublished === "true") && e.groupName);

            if (fetchedData.length > 0) {
              setEvents(fetchedData);
              setError(null);
              setLoading(false);
              return;
            } else {
              throw new Error("表示できるイベントがありません。JSONの中身を確認してください。");
            }
          } else {
            throw new Error("JSONデータが配列ではありません。");
          }
        } catch (err: any) {
          lastError = err;
          console.error(`Attempt ${attempt + 1} failed:`, err.message);
          if (attempt < MAX_AUTO_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      setError(`データの取得に失敗しました。${lastError?.message || ""}`);
      setLoading(false);
    };

    fetchData();
  }, [retryCount]);

  return { events, loading, error, refresh };
};
