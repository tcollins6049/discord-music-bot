const { 
    joinVoiceChannel, createAudioPlayer, 
    createAudioResource, AudioPlayerStatus,
    getVoiceConnection 
} = require('@discordjs/voice');
const parseQuery = require('./utils/parseQuery');
const playSong = require('./commands/playSong');
const { getPlayer } = require('./queue/audioManager');


const handleInteractions = async (interaction) => {
    if (!interaction.isCommand()) return;

    await interaction.deferReply();
    const voiceChannel = interaction.member.voice.channel;

    if (interaction.commandName === "play") {
        const query = interaction.options.getString("query");

        // Check if bot is connected, if not, connect
        let connection = getVoiceConnection(interaction.guild.id);
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });
        }


        // Find link to song based off query
        await parseQuery(query, interaction.guild.id);


        const player = getPlayer();
        if (player.state.status !== AudioPlayerStatus.Playing) {
            console.log("Player State: ", player.state.status);
            await playSong(interaction.guild.id, connection);
        } else {
            console.log("Song already playing")
        }

        await interaction.deleteReply();
    }
}


module.exports = handleInteractions;
