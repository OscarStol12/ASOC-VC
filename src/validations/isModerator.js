"use strict";

const { EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');
const config = require(`${PROJECT_ROOT}/config.json`);

/**
 * @param {Object} param0 
 * @param {ChatInputCommandInteraction} param0.interaction
 */
module.exports = async (interaction) => {
    let userRoles = interaction.member.roles;
    let canUseCmd = userRoles.cache.has(config.roles.Moderator[process.env.THIS_ENVIRONMENT]);

    if (!canUseCmd) {
        let embed = new EmbedBuilder()
        .setTitle(`⛔ Access Denied`)
        .setDescription(`You do not have proper permissions to use this command.`)
        .setColor(Colors.NotQuiteBlack)
        .setTimestamp();

        await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        return false;
    }

    return true;
}