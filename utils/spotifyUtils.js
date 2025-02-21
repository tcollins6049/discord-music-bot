const extractSpotifyId = (query) => {
    const spotifyRegex = /^(https?:\/\/)?(open\.spotify\.com)\/(track|playlist|artist)\/([a-zA-Z0-9]+)(\?.*)?$/;
    const match = query.match(spotifyRegex);
    return match ? match[4] : null;  // Index 4 is the ID
};


module.exports = { extractSpotifyId };
