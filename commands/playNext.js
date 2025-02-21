const { ApplicationCommandOptionType } = require("discord.js");
const queueAddition = require('./queueManagement');
const ytsr = require('ytsr');
const spotifyApi = require('../spotify/spotifyApi');

module.exports = {
    data: {
        name: "playNext",
        description: "Plays song from Youtube",
        options: [
            {
                name: "query",
                type: ApplicationCommandOptionType.String,
                description: "The song you want to play.",
                required: true
            }
        ]
    },
    async execute(interaction, distube) {
        // Get the current queue to pass into queueAddition()
        const queue = distube.getQueue(interaction.guildId);

        // Get songInfo to pass into queueAddition()
        let query = interaction.options.getString('query');

        // Regular expressions to determine if we have a spotify or youtube link
        const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)\/.+$/;
        const spotifyUrlRegex = /^(https?:\/\/)?(open\.spotify\.com)\/(track|album|playlist|artist|show|episode)\/[a-zA-Z0-9]+(\?.*)?$/;
        
        // If we have a Spotify link, we need to process it to get a youtube link for the music.
        // We need to do things differently depending on if it is a single song link or playlist link.
        if (spotifyUrlRegex.test(query)) {
            // Determining if the link is to a single song or a playlist
            const spotifyTrackRegex = /^(https?:\/\/)?(open\.spotify\.com)\/track\/([a-zA-Z0-9]+)(\?.*)?$/;
            const spotifyPlaylistRegex = /^(https?:\/\/)?(open\.spotify\.com)\/playlist\/([a-zA-Z0-9]+)(\?.*)?$/;
            const trackMatch = query.match(spotifyTrackRegex);

            // If the link was to a single song, we extract the song name and artists.
            // We then use these to search youtube using ytsr, giving us a youtube link for the song.
            // We can then pass this youtube link into the .play function.
            if (trackMatch) {
                const trackId = trackMatch[3];  // Get track id to search in Spotify
                
                // Get song name and artists
                const trackData = await spotifyApi.getTrack(trackId);
                const trackName = trackData.body.name;
                const artists = trackData.body.artists.map(artist => artist.name).join(", ");
        
                // Search youtube using the song name and artists. Obtains youtube link for song.
                const searchQuery = `${trackName} ${artists}`;
                const searchResults = await ytsr(searchQuery, { limit: 1 });
                query = searchResults.items[0].url;
            }
        }


        const searchResults = await ytsr(query, { limit: 1 });

        let songDetails = null;
        if (searchResults.items.length > 0) {
            const video = searchResults.items[0];

            songDetails = {
                url: video.url,
                name: video.title || "Unknown Name",
                artists: video.author || "Unknown Artist",
                duration: video.duration || 0,
                thumbnail: video.thumbnails[0].url || "https://via.placeholder.com/150",
                uploader: video.author.name || "Unknown Channel",
            };
        }

        console.log("SONG DETAILS: ", songDetails)
        // Add the song to the queue
        if (songDetails) {
            queueAddition(queue, songDetails, 1);
        }
    }
};
