import { Client, Collection, CommandInteraction, Intents } from "discord.js";

import { token } from "./env-vars.js";

import * as help from "./commands/help.js";
import * as magic from "./commands/magic.js";
import * as ping from "./commands/ping.js";
import * as roll from "./commands/roll.js";
import * as schedule from "./commands/schedule.js";
import * as error from "./embeds/error.js";

// Instantiate a new client with the given intents.
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

// Set commands to be used on the bot.
// Should be all those that are specified on the register-commands file.
const commands = new Collection<
    string,
    (interaction: CommandInteraction) => Promise<void>
>();
// Replies with the help message.
commands.set(help.data.name, help.execute);
// Replies with a random Magic 8-Ball answer.
commands.set(magic.data.name, magic.execute);
// Replies with "Pong!". Meant for debugging purposes.
commands.set(ping.data.name, ping.execute);
// Picks a random something, either numbers or users.
commands.set(roll.data.name, roll.execute);
// Schedules events.
commands.set(schedule.data.name, schedule.execute);

// Defines what should be executed when the bot starts.
client.once("ready", (client) => {
    console.log(`Ready! Logged in as ${client.user.username}.`);
});

// Defines what happens when an interaction (a slash command execution, in this
// case) is created.
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const execute = commands.get(interaction.commandName);

    if (!execute) return;

    try {
        await execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({
            embeds: [error.create(`Internal Error: ${err}`)],
            ephemeral: true,
        });
    }
});

// Login with the token specified in the environmental variables.
client.login(token);
