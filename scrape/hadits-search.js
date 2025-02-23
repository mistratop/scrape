/**
 * Scrape by Mistra
 * Hadith Search API
 * This script fetches hadith based on a given keyword and retrieves hadith details.
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Searches for hadith based on a keyword.
 * @param {string} keyword - The keyword for searching hadith.
 * @returns {Promise<Array>} - A list of hadith results.
 */
async function searchHadith(keyword) {
    if (!keyword) {
        throw new Error('Params need Keyword.');
    }
    
    const { data } = await axios.get(`https://www.hadits.id/tentang/${keyword}`);
    const $ = cheerio.load(data);
    
    let results = [];
    $('section').each((i, el) => {
        const judul = $(el).find('a').text().trim();
        const link = `https://www.hadits.id${$(el).find('a').attr('href')}`;
        const perawi = $(el).find('.perawi').text().trim();
        const kitab = $(el).find('cite').text().replace(perawi, '').trim();
        const teks = $(el).find('p').text().trim();
        
        results.push({ judul, link, perawi, kitab, teks });
    });
    
    return results;
}

/**
 * Retrieves details of a hadith.
 * @param {string} url - The URL of the hadith.
 * @returns {Promise<Object>} - The detailed hadith information.
 */
async function getDetailHadith(url) {
    if (!url) {
        throw new Error('Params need Url.');
    }
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    const title = $('article h1').text().trim();
    const breadcrumb = [];
    $('div.breadcrumb-menu ol.breadcrumbs li').each((index, element) => {
        breadcrumb.push($(element).text().trim());
    });
    
    const haditsArab = $('article p.rtl').text().trim();
    const hadithNumberMatch = $('header .hadits-about h2').text().match(/No. (\d+)/);
    const hadithNumber = hadithNumberMatch ? hadithNumberMatch[1] : 'Unknown';
    
    return { title, breadcrumb, haditsArab, hadithNumber };
}

// Example usage
(async () => {
    try {
        const keywordResults = await searchHadith('Bukhari');
        console.log('Hadith Search Results:', JSON.stringify(keywordResults, null, 2));
        
        if (keywordResults.length > 0) {
            const detailResults = await getDetailHadith(keywordResults[0].link);
            console.log('Hadith Detail:', JSON.stringify(detailResults, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

module.exports = { searchHadith, getDetailHadith };
