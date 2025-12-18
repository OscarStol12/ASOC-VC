"use strict";

const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('addbal')
    .setDescription(`Adds a certain amount of Promotion Points to a user.`)
    .addUserOption(opt =>
        opt.setName('user')
        .setDescription('The user to add points to.')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
        opt.setName('amount')
        .setDescription('The amount of promotion points to add.')
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName('reason')
        .setDescription('The reason to provide for adding points to the user.')
        .setRequired(true)
    ),

    run: async ({ interaction }) => {
        await interaction.reply({content: "This command is currently being worked on.", flags: MessageFlags.Ephemeral});
    },
}