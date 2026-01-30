"use strict";

const { EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');
const config = require(`${PROJECT_ROOT}/config.json`);

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns {boolean}
 */
module.exports = async (interaction) => {
    let userRoles = interaction.member.roles;
    let canUseCmd = (
        userRoles.cache.has(config.clearances['Operation-Leading'][process.env.THIS_ENVIRONMENT]) ||
        userRoles.cache.has(config.units.HQASOC[process.env.THIS_ENVIRONMENT]) ||
        userRoles.cache.has(config.units.SWCS[process.env.THIS_ENVIRONMENT]) ||
        userRoles.cache.has(config.units.SFOI[process.env.THIS_ENVIRONMENT]) || 
        userRoles.cache.has(config.units.NCOA[process.env.THIS_ENVIRONMENT]) || 
        userRoles.cache.has(config.units.DOTD[process.env.THIS_ENVIRONMENT])
    );
    
    if (!canUseCmd) {
        let embed = new EmbedBuilder()
        .setTitle(`⛔ Access Denied`)
        .setDescription(`You do not have the proper permissions to use this command.`)
        .setColor(Colors.NotQuiteBlack)
        .setTimestamp();
    
        await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        return false;
    }
        
    return true;
}