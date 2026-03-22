"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction, MessageActivityType } = require('discord.js');

const { convertToPrettyTime } = require(`${PROJECT_ROOT}/utils/dateConv.js`);
const { escapeDiscordMarkdown } = require(`${PROJECT_ROOT}/utils/discordUtils.js`);
const { removeSongInQueue } = require(`${PROJECT_ROOT}/utils/musicHandler.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`remove`)
    .setDescription(`Removes a song from the queue at a specified position.`)
    .addIntegerOption(opt => 
        opt.setName(`position`)
        .setDescription(`The queue position to remove.`)
        .setRequired(true)
    ),

    /**
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        const position = interaction.options.getInteger('position', true);

        try {
            let removed = removeSongInQueue(interaction, position);

            let embed = new EmbedBuilder()
            .setTitle(`✅ Song Removed`)
            .setDescription(`Successfully removed the following song from the queue:\n\n**Title:** ${escapeDiscordMarkdown(removed.metadata.title)}\n**Artist:** ${escapeDiscordMarkdown(removed.metadata.artist)}\n**Duration:** ${escapeDiscordMarkdown(convertToPrettyTime(parseFloat(removed.metadata.duration) * 1000))}`)
            .setColor(Colors.Green)
            .setTimestamp();

            await interaction.reply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(e.message)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
            return;
        }
    },
}