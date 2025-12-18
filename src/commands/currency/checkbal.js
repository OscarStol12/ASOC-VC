"use strict";

const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('bal')
    .setDescription('Checks the amount of Promotion Points a user has.')
    .addUserOption(opt =>
        opt.setName('user')
        .setDescription('The user to check the points of.')
        .setRequired(true)
    ),

    run: async ({ interaction }) => {
        await interaction.reply({content: "This command is currently being worked on.", flags: MessageFlags.Ephemeral});
    },
}