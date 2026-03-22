"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');

const { getCurrentSong } = require(`${PROJECT_ROOT}/utils/musicHandler.js`);
const { convertToPrettyTime } = require(`${PROJECT_ROOT}/utils/dateConv.js`);
const { escapeDiscordMarkdown } = require(`${PROJECT_ROOT}/utils/discordUtils.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`nowplaying`)
    .setDescription(`Retrieves the current playing song and information about that song.`),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        try {
            let currentSong = getCurrentSong();

            let nowPlayingEmbed = new EmbedBuilder()
            .setTitle(`🎵 Now Playing`)
            .setDescription(`The bot is currently playing the following song: \n\n**Title:** ${escapeDiscordMarkdown(currentSong.title)}\n**Artist:** ${escapeDiscordMarkdown(currentSong.artist)}\n**Duration:** ${escapeDiscordMarkdown(convertToPrettyTime(parseFloat(currentSong.duration) * 1000))}\n**Time Elapsed:** ${escapeDiscordMarkdown(convertToPrettyTime(currentSong.timeElapsed))}\n**Added by:** <@${currentSong.caller.id}>`)
            .setColor(Colors.DarkBlue)
            .setTimestamp();
            
            await interaction.reply({embeds: [nowPlayingEmbed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(e.message)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}