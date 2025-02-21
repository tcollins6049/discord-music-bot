const { 
    Client, 
    GatewayIntentBits, 
    Events, 
    Partials, 
    ApplicationCommandOptionType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { Player } = require("discord-player");
const { DisTube } = require('distube');
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SpotifyPlugin } = require('@distube/spotify');
const config = require("./config.json");
require('dotenv').config();
const ytdl = require('@distube/ytdl-core');

const playCommand = require('./commands/play');
const playNextCommand = require('./commands/playNext');


// Create client and login using token
const client = new Client({
    intents: [
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
    ]
});


// Distube settings
const distube = new DisTube(client, {
    emitNewSongOnly: true,
    plugins: [new YtDlpPlugin()],
});

distube
    .on('playSong', (queue, song) => {
        // Create embed for song
        const embed = new EmbedBuilder()
            .setColor("#1DB954")
            .setTitle(song.name)
            .setURL(song.url)
            .setThumbnail(song.thumbnail)
            .setDescription(`**Artist:** ${song.uploader?.name || "Unknown"}\n⏳ **Duration:** ${song.formattedDuration}`)

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
            .setStyle(ButtonStyle.Secondary)
    
        const row = new ActionRowBuilder().addComponents(backSkipButton, playPauseButton, stopButton, skipButton, shuffleButton);

        queue.textChannel.send({
            embeds: [embed],
            components: [row]
        });
    })
    .on('addSong', (queue, song) => {
        const embed = new EmbedBuilder()
            .setColor("#FFAA00")
            .setTitle("Song Added to Queue")
            .setDescription(`**${song.name}** by **${song.uploader?.name || "Unknown"}**`)
            .setThumbnail(song.thumbnail);
        
        queue.textChannel.send({ embeds: [embed] });
    })


// Waits till bot is on and ready
client.once(Events.ClientReady, () => {
    console.log('Ready!');
});
client.on(Events.Error, console.error);
client.on(Events.Warn, console.warn);


// Creating the discord player
const player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        filter: "audioonly"
    }
});


// Listeners for different player events
player.on("trackStart", (queue, track) => {
    const playPauseButton = new ButtonBuilder()
        .setCustomId("pause_resume")
        .setLabel("⏯")
        .setStyle(ButtonStyle.Primary); 
    
    const skipButton = new ButtonBuilder()
        .setCustomId("skip")
        .setLabel("⏭")
        .setStyle(ButtonStyle.Danger);
    
    const row = new ActionRowBuilder().addComponents(playPauseButton, skipButton);

    queue.metadata.send({
        content: `Now playing: **${track}**`,
        components: [row]
    });
});

player.on("trackAdd", (queue, track) => {
    queue.metadata.send(`Track: **${track.title}** queued`);
});

player.on("botDisconnect", (queue) => {
    queue.metadata.send(`Disconnected from voice channel`);
});

player.on("channelEmpty", (queue) => {
    queue.metadata.send(`Noone in voice channel, leaving...`);
});

player.on("queueEnd", (queue) => {
    queue.metadata.send(`Queue finished`);
});


// Slash command setup, lets discord know commands bot can execute
client.on("messageCreate", async message => {
    if (message.author.bot || !message.guild) return;
    if (!client.application?.owner) await client.application?.fetch();

    if (message.content === "!deploy") {
        await message.guild.commands.set([
            {
                name: "play",
                description: "Plays song from youtube",
                options: [
                    {
                        name: "query",
                        type: ApplicationCommandOptionType.String,
                        description: "The song you want to play",
                        required: true
                    }
                ]
            },
            {
                name: "play-next",
                description: "Plays song from youtube",
                options: [
                    {
                        name: "query",
                        type: ApplicationCommandOptionType.String,
                        description: "The song you want to play",
                        required: true
                    }
                ]
            },
            {
                name: "skip",
                description: "Skip the current song"
            },
            {
                name: "queue",
                description: "See the queue"
            },
            {
                name: "stop",
                description: "Stop the player"
            },
        ]);

        await message.reply("Deployed!");
    }
});


// Interactions
client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        await interaction.deferReply();
        const queue = distube.getQueue(interaction.guildId);
        if (interaction.commandName === "play") {
            // await playCommand.execute(interaction, distube);
            
            // discord-player testing
            const voiceChannel = interaction.member.voice.channel;
            const query = interaction.options.getString("query");
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });
            const stream = ytdl(query, { filter: 'audioonly' });
            const resource = createAudioResource(stream);
            const pl = createAudioPlayer();
            pl.play(resource);
            connection.subscribe(pl);

            await interaction.deleteReply();
        } else if (interaction.commandName === "play-next") {
            if (!queue) {
                await playCommand.execute(interaction, distube);
                await interaction.deleteReply();
            } else if (queue) {
                console.log("WITHIN PLAY NEXT");
                await playNextCommand.execute(interaction, distube);
                await interaction.deleteReply();
            }
        }
    }

    if (interaction.isButton()) {
        const queue = distube.getQueue(interaction.guildId);
        if (!queue) {
            return await interaction.reply({ content: "There is no music playing!", ephemeral: true });
        }

        await interaction.deferUpdate();

        switch (interaction.customId) {
            case "pause_resume":
                if (queue.paused) {
                    queue.resume();
                    await interaction.editReply({ content: "⏯ Resumed the song!", ephemeral: true });
                } else {
                    queue.pause();
                    await interaction.editReply({ content: "⏯ Paused the song!", ephemeral: true });
                }
                break;
            
            case "skip":
                queue.skip();
                await interaction.followUp({ content: "⏭ Skipped the song!", ephemeral: true });
                break;
            
            case "stop":
                queue.stop()
                queue.voice.leave();
                await interaction.editReply({ content: "⏹ Stopped the music and cleared the queue!", ephemeral: true });
                break;

            case "back_skip":
                if (queue.songs.length > 1) {
                    queue.previous();
                    await interaction.editReply({ content: "⏮ Skipped back to the previous song!", ephemeral: true });
                } else {
                    await interaction.editReply({ content: "There is no previous song to skip to!", ephemeral: true });
                }
                break;
                
            case "shuffle":
                queue.shuffle();
                await interaction.editReply({ content: "🔀 Shuffled the queue!", ephemeral: true });
                break;
        }
    }
});


client.login(config.token);
