const { ApplicationCommandOptionType } = require('discord.js');


// Slash command setup, lets discord know commands bot can execute
const deployCommands = async (client, message) => {
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
        ]);

        await message.reply("Deployed!");
    }
};


module.exports = deployCommands;
