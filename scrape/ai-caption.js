/**
 * Scrape by Mistra
 * AI Caption Generator
 * This script generates multiple variations of captions in English with different tones.
 * It uses an external API to fetch captions based on a given text prompt.
 */

const axios = require('axios');

// List of tones for caption generation
const TONES = ['Fun', 'Funny', 'no-tone', 'Happy', 'Serious', 'Sad', 'Angry'];

/**
 * Fetches AI-generated captions for a given text prompt.
 * @param {string} text - The input text or topic to generate captions.
 * @returns {Promise<Object>} - An object containing the original prompt and generated captions.
 */
async function generateCaptions(text) {
    if (!text) {
        throw new Error('Text parameter is required');
    }

    const promptWithLang = `${text} (create caption in English with a natural style)`;
    const allCaptions = [];

    for (const tone of TONES) {
        try {
            const response = await axios.post('https://pallyy.com/api/tools/captions/get', {
                tone: tone.toLowerCase(),
                hashtags: "5",
                length: "200",
                prompt: promptWithLang,
                language: "en"
            }, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
                    'Accept': 'application/json',
                    'Accept-Language': 'en-US;q=0.9,en;q=0.8',
                    'Content-Type': 'application/json',
                    'Origin': 'https://pallyy.com',
                    'Referer': 'https://pallyy.com/tools/tweet-generator'
                }
            });

            if (response.data?.items?.length > 0) {
                allCaptions.push({ tone, caption: response.data.items[0] });
            }
        } catch (error) {
            console.warn(`Failed to fetch caption for tone: ${tone}`, error.message);
        }

        // Delay between API calls to avoid rate-limiting issues
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (allCaptions.length === 0) {
        throw new Error('No captions generated');
    }

    return { prompt: text, captions: allCaptions };
}

// Example usage
(async () => {
    try {
        const result = await generateCaptions('Cat');
        console.log('Generated Captions:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

module.exports = generateCaptions;
