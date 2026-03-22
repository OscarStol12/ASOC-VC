"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');

const { skipSong } = require(`${PROJECT_ROOT}/utils/musicHandler.js`);
const isMusicController = require(`${PROJECT_ROOT}/src/validations/isMusicController.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`skip`)
    .setDescription(`Skips the current song that is playing.`),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        try {
            if (!(await isMusicController(interaction))) return;

            skipSong(interaction);

            let embed = new EmbedBuilder()
            .setTitle(`✅ Skipped Song`)
            .setDescription(`Successfully skipped the current playing song.`)
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
};