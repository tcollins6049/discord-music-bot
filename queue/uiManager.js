const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');


async function sendNowPlayingMessage(textChannel, song) {
    const embed = new EmbedBuilder()
        .setColor('#1DB954')
        .setTitle("None")
        .setURL(song)
        .setDescription("None")
    
        const playPauseButton = new ButtonBuilder()
        .setCustomId("pause_resume")
        .setLabel("⏯")
        .setStyle(ButtonStyle.Primary);
    
    const skipButton = new ButtonBuilder()
        .setCustomId("skip")
        .setLabel("⏭")
        .setStyle(ButtonStyle.Secondary);
    
    const stopButton = new ButtonBuilder()
        .setCustomId("stop")
        .setLabel("⏹")
        .setStyle(ButtonStyle.Danger);

    const backSkipButton = new ButtonBuilder()
        .setCustomId("back_skip")
        .setLabel("⏮")
        .setStyle(ButtonStyle.Secondary);

    const shuffleButton = new ButtonBuilder()
        .setCustomId("shuffle")
        .setLabel("🔀")
        .setStyle(ButtonStyle.Secondary);
    
    const row = new ActionRowBuilder().addComponents(backSkipButton, playPauseButton, stopButton, skipButton, shuffleButton);

    textChannel.send({
        embeds: [embed],
        components: [row]
    });
}


module.exports = { sendNowPlayingMessage };
