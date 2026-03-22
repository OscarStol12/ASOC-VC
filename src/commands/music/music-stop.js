"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');

const { clearQueue } = require(`${PROJECT_ROOT}/utils/musicHandler.js`);
const isMusicController = require(`${PROJECT_ROOT}/src/validations/isMusicController.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`stop`)
    .setDescription(`Stops music playback and clears the entire queue.`),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        try {
            if (!(await isMusicController(interaction))) return;

            clearQueue(interaction);

            let embed = new EmbedBuilder()
            .setTitle(`✅ Stopped Music`)
            .setDescription(`All music playback has been stopped successfully and the queue has been cleared.`)
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