const { 
    createAudioResource, 
    AudioPlayerStatus,
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const { getQueue } = require('../queue/queueManager');
const { getPlayer } = require('../queue/audioManager');


async function playSong(guildId, connection) {
    const serverQueue = getQueue(guildId);

    // Ensure songs are in queue
    if (!serverQueue) {
        if (serverQueue) serverQueue.connection.destroy();
        return;
    }

    // Create new audioPlayer and play resource
    const player = getPlayer();
    temp_play(serverQueue, player);
    connection.subscribe(player);

    // Handle when a song finished playing (move to next song)
    player.removeAllListeners();
    player.on(AudioPlayerStatus.Idle, async () => {
        serverQueue.shift()   // Remove song that finished
        if (serverQueue.length > 0) {
            // playSong(guildId, connection);
            temp_play(serverQueue, player);
        } else {
            console.log("Queue is empty");
        }
    });
}


async function temp_play(serverQueue, player) {
    const song = serverQueue[0];
    
    const stream = ytdl(song, { 
        filter: 'audioonly',
        quality: 'lowestaudio',
    });
    const resource = createAudioResource(stream);

    player.play(resource);
    sendNowPlayingMessage(interaction.channel, song);
}


module.exports = playSong;
