const { Client, GatewayIntentBits, Events, Partials, ApplicationCommandOptionType,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder
} = require("discord.js");

const config = require("./config.json");
const deployCommands = require('./deployment');
const handleInteractions = require('./handleInteraction');


// Create client and login using token
// Allows bot to interact with discord and listen to events or messages.
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

// Waits till bot is on and ready
client.once(Events.ClientReady, () => {
    console.log('Ready!');
});
client.on(Events.Error, console.error);
client.on(Events.Warn, console.warn);


// Slash command setup, lets discord know commands bot can execute
// Setup happens in deployment.js
client.on("messageCreate", async message => {
    await deployCommands(client, message);
});


client.on("interactionCreate", async (interaction) => {
    await handleInteractions(interaction);
});


client.login(config.token);
