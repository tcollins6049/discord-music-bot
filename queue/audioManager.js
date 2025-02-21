const { createAudioPlayer } = require('@discordjs/voice');
const player = createAudioPlayer();  // Created once

function getPlayer() {
    return player;
}

module.exports = { getPlayer };
