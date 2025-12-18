"use strict";

const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Colors } = require('discord.js');
const UserStats = require(`${PROJECT_ROOT}/data/UserStats`);

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
        try {
            const target = interaction.options.getUser('user');

            const query = {
                discordId: target.id,
            };

            let stats = await UserStats.findOne(query);

            if (!stats) {
                stats = new UserStats({
                    discordId: target.id,
                    hostedOps: 0,
                    coHostedOps: 0,
                    hostedTrainings: 0,
                    coHostedTrainings: 0,
                    warnos: 0,
                    currentOp: "None",
                    currentWarno: "None",
                    promoPoints: 0,
                    nextDailyAt: 0,
                })

                await stats.save();
            }

            let embed = new EmbedBuilder()
            .setTitle(`<:promotion_point:959090715923726346> Promotion Points Info`)
            .setDescription(
                `User: <@${target.id}>
                Points: ${stats.promoPoints}`
            )
            .setThumbnail(target.displayAvatarURL({ size: 1024 }))
            .setColor(Colors.Yellow)
            .setTimestamp();

            await interaction.reply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`Something went wrong while fetching user points info: ${e}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}