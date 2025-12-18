"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Gets the bot\'s current latency.'),

    run: async ({interaction}) => {
        let embed = new EmbedBuilder()
        .setTitle('🏓 Ping')
        .setDescription('Pong!')
        .setColor(Colors.Yellow)
        .addFields({
            name: 'Client',
            value: `${Date.now() - interaction.createdTimestamp} ms`,
        })
        .addFields({
            name: 'Websocket',
            value: `${interaction.client.ws.ping} ms`,
        })
        .setTimestamp();

        await interaction.reply({embeds: [embed]})
    },
}