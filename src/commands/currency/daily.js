"use strict";

const { Embed } = require('discord.js');
const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Colors } = require('discord.js');
const UserStats = require(`${PROJECT_ROOT}/data/UserStats`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Grants you 1 Promotion Point for each day that you run this command.'),

    run: async ({ interaction }) => {
        try {
            const query = {
                discordId: interaction.user.id,
            };

            let stats = await UserStats.findOne(query);
            if (!stats) {
                stats = new UserStats({
                    discordId: interaction.user.id,
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

            let currentTime = Math.floor(Date.now().valueOf() / 1000);
            if (currentTime >= stats.nextDailyAt) {
                stats.promoPoints += 1;
                stats.nextDailyAt = currentTime - (currentTime % 86400) + 86400;

                await stats.save();

                let embed = new EmbedBuilder()
                .setTitle(`✅ Daily Claimed`)
                .setDescription(`You have successfully claimed your Daily 1 <:promotion_point:959090715923726346> Promotion Point. Come back at <t:${stats.nextDailyAt}> for your next daily!`)
                .setColor(Colors.Green)
                .setTimestamp();

                await interaction.reply({embeds: [embed]});
            } else {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Daily Unavailable`)
                .setDescription(`You have already claimed your Daily Promotion Point. Check back <t:${stats.nextDailyAt}:R> for your next daily.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
            }
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while trying to check and/or claim daily: ${e}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}