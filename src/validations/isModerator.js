"use strict";

const { EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');
const config = require(`${PROJECT_ROOT}/config.json`);

/**
 * @param {Object} param0 
 * @param {ChatInputCommandInteraction} param0.interaction
 */
module.exports = async ({interaction, commandObj}) => {
    if (commandObj && commandObj.validations) {
        if (commandObj.validations.isModerator) {
            let userRoles = interaction.member.roles;
            let canUseCmd = userRoles.cache.has(config.roles.Moderator);

            if (!canUseCmd) {
                let embed = new EmbedBuilder()
                .setTitle(`⛔ Access Denied`)
                .setDescription(`You do not have proper permissions to use this command.`)
                .setColor(Colors.Black)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return true;
            }
        }
    }
}