/**
 * Scrape by Mistra
 * Minecraft Server Status Checker
 * This script checks the status, player count, and other details of a Minecraft server.
 */

const axios = require('axios');

/**
 * Fetches the status of a Minecraft server.
 * @param {string} ip - The IP or domain of the Minecraft server.
 * @returns {Promise<Object>} - An object containing the server status and details.
 */
async function checkMinecraftServer(ip) {
    if (!ip) {
        throw new Error('Parameter ip diperlukan');
    }

    try {
        const response = await axios.get(`https://api.mcsrvstat.us/3/${ip}`, {
            timeout: 10000 // Timeout 10 seconds
        });

        const data = response.data;

        if (data.online) {
            return {
                status: 'online',
                ip: data.ip,
                port: data.port || 25565,
                version: data.version || 'Unknown',
                players: {
                    online: data.players.online,
                    max: data.players.max,
                    list: data.players.list || []
                },
                motd: data.motd.clean || [],
                icon: data.icon || null
            };
        } else {
            return {
                status: 'offline',
                ip: data.ip || ip,
                port: data.port || 25565
            };
        }
    } catch (error) {
        console.error('Minecraft Server Error:', error);

        if (error.response) {
            switch (error.response.status) {
                case 404:
                    throw new Error('Server not found');
                case 429:
                    throw new Error('Error 429');
                case 500:
                    throw new Error('Error 500');
            }
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request Timeout');
        }

        throw new Error('Error Server');
    }
}

// Example usage
(async () => {
    try {
        const result = await checkMinecraftServer('play.hypixel.net');
        console.log('Minecraft Server Status:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

module.exports = checkMinecraftServer;
