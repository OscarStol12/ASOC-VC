// SPDX-License-Identifier: GPL-3.0-only
//
// WARNING: See TRAINING.md for critical restrictions on AI training and
// "clean room" recreation. Use of this code, documentation, or project
// materials for training, fine-tuning, or guiding Generative AI models
// is strictly prohibited and terminates this license immediately.
//
// The following license identifier and notice shall apply to all files under this project.

"use strict";

require('dotenv/config');

const { Client, IntentsBitField, Partials } = require('discord.js');
const { CommandHandler } = require('djs-commander');

const rozod = require('rozod');
const mongoose = require('mongoose');
const path = require('path');

global.PROJECT_ROOT = path.join(__dirname, '..');
global.BEGIN_UPTIME = Date.now();

const { getAuthenticatedUser } = require(`${PROJECT_ROOT}/lib/roblox-api.js`);

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
});

(async () => {
    try {
        rozod.configureServer({cookies: process.env.ROBLOSECURITY});
        console.log(`Logged into ${await getAuthenticatedUser()} successfully!`);
    } catch (e) {
        console.log(`Failed to log into the ROBLOX account: ${e.message}`);
        process.exit(0);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Logged into the database successfully!`);
    } catch (e) {
        console.log(`Failed to log into the database: ${e.message}`);
        process.exit(0);
    }

    try {
        await bot.login(process.env.BOT_TOKEN);
    } catch (e) {
        console.log(`Failed to log into the bot account: ${e.message}`);
        process.exit(0);
    }
})();