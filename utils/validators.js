const isYouTubeLink = (query) => {
    const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)\/.+$/;
    return youtubeUrlRegex.test(query);
}


const isSpotifyLink = (query) => {
    const spotifyTrackRegex = /^(https?:\/\/)?(open\.spotify\.com)\/track\/([a-zA-Z0-9]+)(\?.*)?$/;
    const spotifyPlaylistRegex = /^(https?:\/\/)?(open\.spotify\.com)\/playlist\/([a-zA-Z0-9]+)(\?.*)?$/;
    const spotifyArtistRegex = /^(https?:\/\/)?(open\.spotify\.com)\/artist\/([a-zA-Z0-9]+)(\?.*)?$/;
       
    if (spotifyTrackRegex.test(query)) {
        return 'track';
    } else if (spotifyPlaylistRegex.test(query)) {
        return 'playlist';
    } else if (spotifyArtistRegex.test(query)) {
        return 'artist';
    } else {
        return null;
    }
}


module.exports = {
    isYouTubeLink,
    isSpotifyLink
};
