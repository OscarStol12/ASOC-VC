"use strict";

const { EmbedBuilder, SlashCommandBuilder, Colors, MessageFlags, Message, Embed } = require('discord.js');
const UserStats = require(`${PROJECT_ROOT}/data/UserStats`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Gets leaderboard stats for total Promotion Points.')
    .addIntegerOption(opt =>
        opt.setName('page')
        .setDescription('The page to check. Defaults to page 1.')
        .setRequired(false)
    ),

    run: async ({ interaction }) => {
        try {
            // Sorted list
            let users = await UserStats.find({}).sort({ promoPoints: -1 });

            let totalPages = Math.ceil(users.length / 10);
            let page = Math.min(Math.max(interaction.options.getInteger('page') ?? 1, 1), totalPages);
            let startPaging = ((page - 1) * 10);
            let endPaging = Math.min(((page * 10) - 1), users.length - 1);

            let sendEmbed = new EmbedBuilder()
            .setTitle(`🏅 Promotion Points Leaderboard`)
            .setColor(Colors.Yellow)
            .setTimestamp();

            let fieldDescription = ``;
            for (let i = startPaging; i <= endPaging; i++) {
                fieldDescription += `**#${i+1}:** <@${users[i].discordId}> - <:promotion_point:959090715923726346>${users[i].promoPoints}\n`;
            }

            sendEmbed.addFields({
                name: `Page ${page}/${totalPages}`,
                value: fieldDescription,
            });

            await interaction.reply({embeds: [sendEmbed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while trying to fetch leaderboard info: ${e}`)
            .setColor(Colors.Red)
            .setTimestamp()

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}