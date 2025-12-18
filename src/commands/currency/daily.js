"use strict";

const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Colors, Message } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Grants you 1 Promotion Point for each day that you run this command.'),

    run: async ({ interaction }) => {
        await interaction.reply({content: "This command is currently being worked on.", flags: MessageFlags.Ephemeral});
    },
}