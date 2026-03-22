"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');

const { pauseSong } = require(`${PROJECT_ROOT}/utils/musicHandler.js`);
const isMusicController = require(`${PROJECT_ROOT}/src/validations/isMusicController.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`pause`)
    .setDescription(`Pauses playback of the current song.`),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        try {
            if (!(await isMusicController(interaction))) return;

            pauseSong(interaction);

            let embed = new EmbedBuilder()
            .setTitle(`✅ Paused`)
            .setDescription(`Paused music playback successfully.`)
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