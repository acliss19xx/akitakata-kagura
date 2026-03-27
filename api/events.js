import axios from 'axios';
import Papa from 'papaparse';

// Simple in-memory cache
const cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTu7GhrO_TIqc3O1Rqc99XDiYvxRgJMpmRMAs_Whg3A3M12nsxkDtVg_BzNJJxgFrvPvJ8Rdydzr3-P/pub?gid=1424514696&single=true&output=csv";

/**
 * Maps Japanese CSV headers to the Event interface keys
 */
const mapEventData = (row) => {
  return {
    groupName: row['神楽団名'] || row['公演・イベント名'] || '',
    date: row['開催日'] || '',
    time: row['開催時刻'] ? (row['開催時刻'].includes(' ') ? row['開催時刻'].split(' ')[1] : row['開催時刻']) : '',
    location: row['開催場所'] || '',
    mapUrl: row['地図URL'] || '',
    program: row['演目'] || '',
    fee: row['料金'] || '',
    conditions: row['観覧条件'] || '',
    infoUrl: row['詳細サイトURL'] || '',
    contactInfo: row['お問い合わせ先'] || row['contact'] || '',
    sponsored: row['主催'] || row['sponsored'] || '',
    notes: row['備考'] || '',
    imageUrl: row['チラシ画像'] || '',
    isPublished: row['公開'] || row['isPublished'] || 'はい' // Defaulting to 'はい' for now if not present
  };
};

// This function will be deployed as a serverless function (e.g., on Vercel/Netlify)
export default async function handler(req, res) {
  const now = Date.now();

  // If cache is valid, return cached data
  if (cache.data && (now - cache.lastFetch < CACHE_DURATION)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(cache.data);
  }

  try {
    console.log('Fetching fresh events data from API...');
    const response = await axios.get(API_URL, { responseType: 'text' });
    console.log(response.data);
    const csvData = response.data;

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    if (!parsed || !Array.isArray(parsed.data)) {
      throw new Error('Failed to parse CSV or parsed data is not an array.');
    }

    // Map Japanese headers to English keys and filter
    const events = parsed.data
      .map(mapEventData)
      .filter(e => e.isPublished === "はい" || e.isPublished === true);

    cache.data = events;
    cache.lastFetch = now;

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(events);
  } catch (error) {
    console.error('❌ Failed to fetch events data:', error.message);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ message: 'Failed to fetch events data', details: error.message });
  }
}

