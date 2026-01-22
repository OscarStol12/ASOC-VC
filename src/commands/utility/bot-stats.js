"use strict";

const {ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags} = require('discord.js');
const {convertToPrettyTime} = require(`${PROJECT_ROOT}/utils/dateConv.js`);
const projectInfo = require(`${PROJECT_ROOT}/package.json`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`bot-stats`)
    .setDescription(`Get bot information + statistics.`),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        try {
            let timeElapsed = Date.now() - BEGIN_UPTIME;
            let prettyResult = convertToPrettyTime(timeElapsed);

            let embed = new EmbedBuilder()
            .setTitle(`ℹ️ Bot Stats`)
            .setDescription(`**Current uptime:** ${prettyResult}\n**Current version:** v${projectInfo.version}, Build ${projectInfo.build}`)
            .setColor(Colors.Yellow)
            .setTimestamp();

            await interaction.reply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while fetching uptime info: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    }
}