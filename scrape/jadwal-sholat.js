/**
 * Scrape by Mistra
 * Jadwal Sholat Scraper
 * This script fetches prayer schedules based on a given city name.
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetches prayer schedule for a given city.
 * @param {string} city - The city name to retrieve the prayer schedule.
 * @returns {Promise<Object>} - An object containing prayer times.
 */
async function getPrayerSchedule(city) {
    if (!city) {
        throw new Error('City parameter is required');
    }
    
    try {
        const { data } = await axios.get(`https://jadwal-sholat.tirto.id/kota-${city}`);
        const $ = cheerio.load(data);
        
        const jadwalHariIni = $('tr.currDate td').map((i, el) => $(el).text()).get();
        
        if (jadwalHariIni.length === 7) {
            const [tanggal, subuh, duha, dzuhur, ashar, maghrib, isya] = jadwalHariIni;
            return { city, tanggal, subuh, duha, dzuhur, ashar, maghrib, isya };
        } else {
            throw new Error('Prayer schedule not found');
        }
    } catch (error) {
        console.error('Error fetching prayer schedule:', error.message);
        throw new Error('Failed to retrieve prayer schedule');
    }
}

// Example usage
(async () => {
    try {
        const schedule = await getPrayerSchedule('jakarta');
        console.log('Prayer Schedule:', JSON.stringify(schedule, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

module.exports = getPrayerSchedule;
