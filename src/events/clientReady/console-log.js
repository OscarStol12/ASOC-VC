"use strict";

const { ActivityType } = require('discord.js');

module.exports = async (bot) => {
    console.log(`Logged into the bot account successfully!`)
    bot.user.setPresence({
        activities: [{
            name: 'Army Special Operations Command',
            type: ActivityType.Watching,
        }],
        status: 'online'
    })
}