"use strict";

const { SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');

const { convertToPrettyTime } = require(`${PROJECT_ROOT}/utils/dateConv.js`);
const { escapeDiscordMarkdown } = require(`${PROJECT_ROOT}/utils/discordUtils.js`);
const { getQueue } = require(`${PROJECT_ROOT}/utils/musicHandler.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`queue`)
    .setDescription(`Gets all of the songs currently in the queue.`)
    .addIntegerOption(opt =>
        opt.setName(`page`)
        .setDescription(`The page to go to. Defaults to page 1.`)
        .setRequired(false)
    ),

    /**
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        let page = interaction.options.getInteger('page') ?? 1;
    
        try {
            const queue = getQueue();
            queue.shift(); // remove first entry as that's the current playing one

            if (queue.length < 1) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Error`)
                .setDescription(`The queue is currently empty!`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            let totalPages = Math.ceil(queue.length / 5);
            let thisPage = Math.min(Math.max(page, 1), totalPages);
            let startPaging = ((thisPage - 1) * 5);
            let endPaging = Math.min(((thisPage * 5) - 1), queue.length - 1);

            let embed = new EmbedBuilder()
            .setTitle(`🎵 Music Queue`)
            .setColor(Colors.DarkBlue)
            .setTimestamp();

            let fieldDescription = ``;
            for (let i = startPaging; i <= endPaging; i++) {
                const entry = queue[i];
                fieldDescription += `**Position in Queue:** ${i + 1}\n**Title:** ${escapeDiscordMarkdown(entry.title)}\n**Artist:** ${escapeDiscordMarkdown(entry.artist)}\n**Duration:** ${escapeDiscordMarkdown(convertToPrettyTime(parseFloat(entry.duration) * 1000))}\n**Added by:** <@${entry.caller.id}>\n\n`;
            }

            embed.addFields({
                name: `Page ${thisPage}/${totalPages}`,
                value: fieldDescription,
            });

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