/**
 * Scrape by Mistra
 * YouTube Video Search
 * This script searches for YouTube videos based on a given query and retrieves detailed video information.
 */

const axios = require('axios');

/**
 * Searches for YouTube videos based on a query.
 * @param {string} query - The search keyword.
 * @returns {Promise<Array>} - A list of video results.
 */
async function searchYouTube(query) {
    if (!query) {
        throw new Error('Query parameter is required');
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    const scriptData = response.data.match(/var ytInitialData\s*=\s*({.+?});/)?.[1];
    if (!scriptData) throw new Error('Failed to retrieve YouTube data');

    const data = JSON.parse(scriptData);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents;
    if (!contents) throw new Error('No search results found');

    const videos = [];
    for (const content of contents) {
        if (content.videoRenderer) {
            const video = content.videoRenderer;
            videos.push({
                title: video.title.runs[0].text,
                url: `https://www.youtube.com/watch?v=${video.videoId}`,
                videoId: video.videoId,
                duration: video.lengthText?.simpleText || 'Live',
                views: video.viewCountText?.simpleText || '0 views',
                uploaded: video.publishedTimeText?.simpleText || 'Unknown',
                thumbnail: video.thumbnail.thumbnails[0].url,
                channel: {
                    name: video.ownerText?.runs[0]?.text || 'Unknown',
                    url: `https://www.youtube.com${video.ownerText?.runs[0]?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url || ''}`
                }
            });
            if (videos.length >= 10) break;
        }
    }

    if (videos.length === 0) throw new Error('No videos found');
    return videos;
}

// Example usage
(async () => {
    try {
        const result = await searchYouTube('lofi music');
        console.log('YouTube Search Results:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

module.exports = searchYouTube;
