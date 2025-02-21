const { ApplicationCommandOptionType } = require("discord.js");
// const { DisTube } = require('distube');
const ytsr = require('ytsr');
const ytdl = require('@distube/ytdl-core');
const { Song } = require('distube');
const spotifyApi = require('../spotify/spotifyApi');
const queueAddition = require('./queueManagement');

module.exports = {
    data: {
        name: "play",
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
        let query = interaction.options.getString("query");

        // Following checks if the query is a simple search or a youtube or spotify link
        const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)\/.+$/;
        const spotifyUrlRegex = /^(https?:\/\/)?(open\.spotify\.com)\/(track|album|playlist|artist|show|episode)\/[a-zA-Z0-9]+(\?.*)?$/;
        
        // If we have a youtube link then we can pass it directly into the .play function so
        // no further work is needed.
        if (youtubeUrlRegex.test(query)) {
            console.log("YOUTUBE LINK");
        }
        // If we have a Spotify link, we need to process it to get a youtube link for the music.
        // We need to do things differently depending on if it is a single song link or playlist link.
        else if (spotifyUrlRegex.test(query)) {
            // Determining if the link is to a single song or a playlist
            const spotifyTrackRegex = /^(https?:\/\/)?(open\.spotify\.com)\/track\/([a-zA-Z0-9]+)(\?.*)?$/;
            const spotifyPlaylistRegex = /^(https?:\/\/)?(open\.spotify\.com)\/playlist\/([a-zA-Z0-9]+)(\?.*)?$/;
            const trackMatch = query.match(spotifyTrackRegex);
            const playlistMatch = query.match(spotifyPlaylistRegex);

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
            // If we link matches a whole playlist.
            // Extract the song name and artists for each song and then find each youtube link.
            else if (playlistMatch) {
                // Get tracks from playlist
                const playlistId = playlistMatch[3];
                const playlistData = await spotifyApi.getPlaylistTracks(playlistId);
                const tracks = playlistData.body.items;

                // Get name and artists for each track, query youtube for information on each song.
                const searchQueries = tracks.map(track => {
                    const trackName = track.track.name;
                    const artists = track.track.artists.map(artist => artist.name).join(", ");
                    return `${trackName} ${artists}`;
                });
                const searchResults = await Promise.all(
                    searchQueries.map(q => ytsr(q, { limit: 1 }))
                )
                let songDetails = searchResults
                    .map(result => {
                        if (result.items.length > 0) {
                            const video = result.items[0];  // Get the first result
                
                            return {
                                url: video.url,
                                name: video.title || "Unknown Title",
                                artists: video.author || "Unknown Artist",
                                duration: video.duration || 0,
                                thumbnail: video.thumbnails[0].url || "https://via.placeholder.com/150",
                                uploader: video.author.name || "Unknown Channel",
                            };
                        }
                        return null;
                    })
                    .filter(song => song !== null);

                // If we successfully obtained urls for each song
                if (songDetails.length > 0) {
                    const voiceChannel = interaction.member.voice.channel;
                    let queue = distube.getQueue(voiceChannel); // Get the current queue
                    // If the queue is empty meaning no song is playing, play the first song from the playlist before queuing the otheres.
                    if (!queue) {
                        await distube.play(voiceChannel, songDetails[0].url, {
                            textChannel: interaction.channel,
                            member: interaction.member
                        });

                        songDetails.shift();    // Shift songDetails array over by one to get rid of the song we have started to play
                        queue = distube.getQueue(voiceChannel); // Get the new queue
                    }
                    // If the queue is not empty, meaning songs are playing
                    if (queue) {
                        // For each song we gathered from the playlist, add the song to the queue.
                        songDetails.forEach(songInfo =>  {
                            queueAddition(queue, songInfo, 0);
                            /*let song = new Song({
                                ageRestricted: false,
                                dislikes: 1,
                                duration: convertToSeconds(songInfo.duration),
                                id: songInfo.url,
                                isLive: false,
                                likes: 1,
                                name: songInfo.name || "Unknown Title",
                                playFromSource: true,
                                plugin: null,
                                reposts: 1,
                                source: songInfo.url,
                                thumbnail: songInfo.thumbnail,
                                uploader: {
                                    name: songInfo.uploader,
                                    url: songInfo.url
                                },
                                url: songInfo.url,
                                views: 1
                            });
                            queue.addToQueue(song);*/
                        });
                    }
                    return;
                }
            }
        } 
        // Query was neither a spotify or youtube link.
        // Perform youtube search using the query to obtain link.
        else {
            const searchResults = await ytsr(query, { limit: 1 });
            query = searchResults.items[0].url;
        }


        await distube.play(interaction.member.voice.channel, query, {
            textChannel: interaction.channel,
            member: interaction.member,
            metadata: { query },
            searchSongs: 1,
            searchOptions: { limit: 1 }
        });
    }
};


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const convertToSeconds = (timeStr) => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
};

