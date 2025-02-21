const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

async function refreshAccessToken() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        const accessToken = data.body['access_token'];

        // Set token for future requests
        spotifyApi.setAccessToken(accessToken);
    } catch (error) {
        console.error('Error refreshing token', error);
    }
}

// Immedietly get access token when module is loaded
refreshAccessToken();

module.exports = spotifyApi;
