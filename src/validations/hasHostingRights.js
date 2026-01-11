"use strict";

const { EmbedBuilder, Colors, MessageFlags } = require('discord.js');
const config = require(`${PROJECT_ROOT}/config.json`);

module.exports = async ({interaction, commandObj}) => {
    if (commandObj && commandObj.validations) {
        if (commandObj.validations.hasHostingRights) {
            let userRoles = interaction.member.roles;
            let canUseCmd = (
                userRoles.cache.has(config.clearances['Operation-Leading']) ||
                userRoles.cache.has(config.units.HQASOC) ||
                userRoles.cache.has(config.units.SWCS) ||
                userRoles.cache.has(config.units.SFOI) || 
                userRoles.cache.has(config.units.NCOA) || 
                userRoles.cache.has(config.units.DOTD)
            );
        
            if (!canUseCmd) {
                let embed = new EmbedBuilder()
                .setTitle(`⛔ Access Denied`)
                .setDescription(`You do not have the proper permissions to use this command.`)
                .setColor(Colors.Black)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return true;
            }
        }
    }
}