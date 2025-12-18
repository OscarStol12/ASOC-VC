"use strict";

const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('removebal')
    .setDescription(`Adds a certain amount of Promotion Points to a user.`)
    .addUserOption(opt =>
        opt.setName('user')
        .setDescription('The user to remove points from.')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
        opt.setName('amount')
        .setDescription('The amount of promotion points to remove.')
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName('reason')
        .setDescription('The reason to provide for removing points from the user.')
        .setRequired(true)
    ),

    run: async ({ interaction }) => {
        await interaction.reply({content: "This command is currently being worked on.", flags: MessageFlags.Ephemeral});
    },
}