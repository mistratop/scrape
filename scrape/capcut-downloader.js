/**
 * Scrape by Mistra
 * CapCut Downloader
 * This script extracts video and thumbnail URLs from a given CapCut template URL.
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes CapCut video and thumbnail URLs from a given template URL.
 * @param {string} url - The CapCut template URL.
 * @returns {Promise<Object>} - An object containing video details.
 */
async function scrapeCapCut(url) {
    if (!url) {
        throw new Error('URL cannot be empty');
    }

    const response = await axios.get(url);
    const data = response.data;
    const $ = cheerio.load(data);

    return {
        name: $("img").attr("alt") || 'Unknown',
        thumbnail: $("img").attr("src") || null,
        videoUrl: $("video").attr("src") || null,
    };
}

// Example usage
(async () => {
    try {
        const result = await scrapeCapCut('https://www.capcut.com/templates/7445547192938450229');
        console.log('CapCut Video Details:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

module.exports = scrapeCapCut;
