"use strict";

const { EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');
const config = require(`${PROJECT_ROOT}/config.json`);

/**
 * @param {Object} param0 
 * @param {ChatInputCommandInteraction} param0.interaction
 */
module.exports = async (interaction) => {
    let voiceChannel = interaction.member.voice.channel;
    let humansInChannel = (voiceChannel) ? voiceChannel.members.filter(member => !member.user.bot).size : 0;

    let userRoles = interaction.member.roles;
    let canUseCmd = userRoles.cache.has(config.clearances["Music-Controller"][process.env.THIS_ENVIRONMENT]) || humansInChannel < 2;

    if (!canUseCmd) {
        let embed = new EmbedBuilder()
        .setTitle(`⛔ Access Denied`)
        .setDescription(`You are not a Music Controller!`)
        .setColor(Colors.NotQuiteBlack)
        .setTimestamp();

        await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        return false;
    }

    return true;
}