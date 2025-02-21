const { Song } = require('distube');

/**
 * Adds a song to the queue using the given song details, song is added at given position.
 * 
 * @param {*} queue
 * @param {*} songInfo
 * @param {integer} position Where in the queue the song will be added
 */
const queueAddition = (queue, songInfo, position) => {
    let song = new Song({
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
    queue.addToQueue(song, position);
}


const convertToSeconds = (timeStr) => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
};


module.exports = queueAddition;
