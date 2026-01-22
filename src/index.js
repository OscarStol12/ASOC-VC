"use strict";

require('dotenv/config');
const { Client, IntentsBitField, Partials } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const noblox = require('noblox.js');
const mongoose = require('mongoose');
const path = require('path');

global.PROJECT_ROOT = path.join(__dirname, '..');

const bot = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates,
    ],
    partials: [
        Partials.Channel,
    ],
});

new CommandHandler({
    client: bot,
    commandsPath: path.join(__dirname, 'commands'),
    eventsPath: path.join(__dirname, 'events'),
    validationsPath: path.join(__dirname, 'validations'),
});

(async () => {
    try {
        await noblox.setCookie(process.env.ROBLOSECURITY);
        console.log(`Logged into ${(await noblox.getAuthenticatedUser()).name} successfully!`);
    } catch (e) {
        console.log(`Failed to log into the ROBLOX account: ${e}`);
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Logged into the database successfully!");
    } catch (e) {
        console.log(`Failed to log into the database: ${e}`);
        return;
    }

    try {
        bot.login(process.env.BOT_TOKEN);
    } catch (e) {
        console.log(`Failed to log into the bot account: ${e}`);
        return;
    }
})();