"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server.')
    .addUserOption(opt =>
        opt.setName('user')
        .setDescription('The user to ban.')
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName('reason')
        .setDescription('The reason to ban the user for.')
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName('time')
        .setDescription('The amount of time to ban a user for. Defaults to permanent if time is not provided.')
        .setRequired(false)
    ),

    /**
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({interaction}) => {
        let target = interaction.options.getUser('user', true);
        let reason = interaction.options.getString('reason', true);
        let rawTime = interaction.options.getString('time') ?? "-1";
        
        try {
            await interaction.reply('wip');
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while trying to ban user <@${target.id}>: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },

    // testing command only
    deleted: process.env.THIS_ENVIRONMENT === "PRODUCTION",
}