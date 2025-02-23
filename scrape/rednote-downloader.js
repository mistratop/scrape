/**
 * Scrape by Mistra
 * Red Note Media Downloader
 * This script fetches metadata and downloadable media from Red Note (Xiaohongshu).
*/

/**
 * @param {string} url - The URL of the Red Note post.
 * @returns {Promise<object>} An object containing metadata and download links.
 * @throws {Error} If the URL is missing or invalid.
 */

const axios = require('axios');
const cheerio = require('cheerio');

function removeUnicode(jsonString) {
    return jsonString.replace(/\u/g, '')
        .replace(/\n/g, '\n')
        .replace(/002F/g, "/")
        .replace(/undefined/g, "null")
        .replace(/\r/g, '\r')
        .replace(/\t/g, '\t')
        .replace(/\f/g, '\f')
        .replace(/\b/g, '\b')
        .replace(/\\/g, '\\')
        .replace(/\'/g, "'")
        .replace(/\"/g, '"');
}

async function rednote(url) {
    if (!url) {
        throw new Error('URL parameter is required');
    }
    
    if (!url.includes('xiaohongshu.com') && !url.includes('redbook.com')) {
        throw new Error('Invalid URL format');
    }

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const jsonString = $("script").last().text().split("window.__INITIAL_STATE__=")[1].replace('\/', '/');
    const data = JSON.parse(removeUnicode(jsonString));
    const id = data.note.currentNoteId;
    const meta = data.note.noteDetailMap[id].note;
    const result = {
        metadata: {
            title: meta.title,
            category: meta.tagList.map(a => a.name),
            stats: meta.interactInfo,
            author: meta.user
        },
        download: meta.video ? meta.video.media.stream["h264"][0].masterUrl : meta.imageList.map(a => a.urlDefault)
    };
    return result;
}

(async () => {
    try {
        const testUrl = "https://www.xiaohongshu.com/some-valid-url";
        const result = await rednote(testUrl);
        console.log('Red Note Download Data:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

module.exports = rednote;
