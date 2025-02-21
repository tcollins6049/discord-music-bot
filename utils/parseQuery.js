const ytdl = require('@distube/ytdl-core');
const ytsr = require('ytsr');
const spotifyApi = require('../spotify/spotifyApi');
const { isYouTubeLink, isSpotifyLink } = require('./validators');
const { extractSpotifyId } = require('./spotifyUtils');
const { getQueue, addToQueue } = require('../queue/queueManager');


const parseQuery = async (query, guildId) => {
    console.log("QUERY: ", query);

    // If query was already a youtube link (youtube or youtube music)
    if (isYouTubeLink(query)) {
        addToQueue(guildId, query);
        console.log(getQueue());
        return;
    }


    // If query is a Spotify link (track, playlist, or artist)
    const spotifyLinkType = isSpotifyLink(query);
    if (spotifyLinkType === 'track') {
        console.log("This is a Spotify track link");
        const trackId = extractSpotifyId(query);  // Get track id to search in Spotify
        
        // Get song name and artists
        const trackData = await spotifyApi.getTrack(trackId);
        const trackName = trackData.body.name;
        const artists = trackData.body.artists.map(artist => artist.name).join(", ");

        // Search youtube using the song name and artists. Obtains youtube link for song.
        const searchQuery = `${trackName} ${artists}`;
        const searchResults = await ytsr(searchQuery, { limit: 1 });
        const result = searchResults.items[0].url;
        addToQueue(guildId, result);
        return;
    }
    if (spotifyLinkType === 'playlist') console.log("This is a Spotify playlist link");
    if (spotifyLinkType === 'artist') console.log("This is a Spotify artist link");


    // If we get to this point then the query is not a youtube or spotify link.
    // So we will just perform a search with the query itself
    const searchResults = await ytsr(query, { limit: 1 });
    const result = searchResults.items[0].url;
    addToQueue(result, guildId);
    return;
}


module.exports = parseQuery;
