import { useState, useEffect } from 'react';
import axios from 'axios';
import { Event } from './src/types/event';

const DATA_URL = "https://script.google.com/macros/s/AKfycbwY2djejV2PS0_1_Dab4Q_u24LVit8AA2EAZgaO4Zud6yiW7a21PxoZzw5sLtRTrYU/exec";
const CACHE_KEY = 'cached_events_data';
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const MAX_AUTO_RETRIES = 5;

/**
 * Splits a comma-separated string into a trimmed array of non-empty strings
 */
const splitImages = (val: any): string[] => {
  if (!val) return [];
  if (typeof val !== 'string') return [];
  return val.split(',').map(s => s.trim()).filter(s => s !== '');
};

/**
 * Maps Japanese CSV headers to the Event interface keys
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
    groupName: row['神楽団名'] || row['groupName'] || '',
    eventName: row['公演・イベント名'] || row ['eventName'] || '',
    date: row['開催日'] || row['date'] || '',
    time: time,
    location: row['開催場所'] || row['location'] || '',
    mapUrl: row['地図URL'] || row['mapUrl'] || '',
    program: row['演目'] || row['program'] || '',
    fee: row['料金'] || row['fee'] || '',
    conditions: row['観覧条件'] || row['conditions'] || '',
    infoUrl: row['詳細サイトURL'] || row['infoUrl'] || '',
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
      // 1. Check sessionStorage cache
      if (retryCount === 0) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          if (now - timestamp < CACHE_EXPIRATION) {
            console.log('Using cached data from sessionStorage');
            setEvents(data);
            setLoading(false);
            return;
          }
        }
      } else {
        sessionStorage.removeItem(CACHE_KEY);
      }

      // 2. Try fetching from API with retry
      let lastError = null;
      for (let attempt = 0; attempt <= MAX_AUTO_RETRIES; attempt++) {
        try {
          console.log(`Fetching data (attempt ${attempt + 1}/${MAX_AUTO_RETRIES + 1})...`);
          let fetchedData: Event[] = [];

          try {
            const response = await axios.get('/api/events');
            if (Array.isArray(response.data)) {
              fetchedData = response.data.map(mapEventData);
            } else {
              throw new Error('API response is not an array');
            }
          } catch (apiErr) {
            console.warn('API fetch failed, falling back to direct JSON fetch', apiErr);
            const response = await axios.get(DATA_URL);
            let data = response.data;
            console.log('Fetched data from DATA_URL:', data);

            // 文字列で返ってきた場合にパースを試みる
            if (typeof data === 'string') {
              try {
                data = JSON.parse(data);
                console.log('Parsed string data into object/array:', data);
              } catch (parseErr) {
                console.error('Failed to parse string data as JSON:', parseErr);
              }
            }

            if (Array.isArray(data)) {
              fetchedData = data
                .map(mapEventData)
                .filter(e => e.isPublished === "はい" || e.isPublished === "true");
            } else {
              console.error('Data is not an array. Actual type:', typeof data, 'Value:', data);
              throw new Error('JSON data is not an array');
            }
          }

          if (fetchedData.length > 0) {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
              data: fetchedData,
              timestamp: Date.now()
            }));
            setEvents(fetchedData);
            setError(null);
            setLoading(false);
            return; // Success!
          } else {
            throw new Error("表示できるイベントがありません。");
          }
        } catch (err) {
          lastError = err;
          console.error(`Attempt ${attempt + 1} failed:`, err);
          if (attempt < MAX_AUTO_RETRIES) {
            console.log(`Waiting 1s before next retry...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // All attempts failed
      setError(typeof lastError === 'string' ? lastError : "データの取得に失敗しました。再度お試しください。");
      setLoading(false);
    };

    fetchData();
  }, [retryCount]);

  return { events, loading, error, refresh };
};
