const axios = require('axios');
const fs = require('fs');
const path = require('path');

// EventList.tsxで使われているAPIエンドポイントを正とします
const API_URL = "https://script.google.com/macros/s/AKfycbx8SepR_Pm0tSkbC3q2PwSj7kITOprppx1SkfdVHmxg3j5VhyGFYeSOkHuOCTea3XK1/exec";
const OUTPUT_PATH = path.resolve(__dirname, '../public/events.json');

const fetchEvents = async () => {
  try {
    console.log('Fetching events data from API...');
    const response = await axios.get(API_URL);
    const data = Array.isArray(response.data) ? response.data : [];
    const publishedEvents = data.filter(e => e.isPublished === "はい");

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(publishedEvents, null, 2));
    console.log(`✅ Successfully saved ${publishedEvents.length} events to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ Failed to fetch events data:', error.message);
    process.exit(1);
  }
};

fetchEvents();
