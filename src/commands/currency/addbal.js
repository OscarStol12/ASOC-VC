"use strict";

const { EmbedBuilder, SlashCommandBuilder, MessageFlags, Colors } = require('discord.js');
const UserStats = require(`${PROJECT_ROOT}/data/UserStats`);

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
        try {
            let target = interaction.options.getUser('user');
            let amount = interaction.options.getInteger('amount');
            let reason = interaction.options.getString('reason');

            if (amount < 1) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Error`)
                .setDescription(`Invalid amount of promotion points entered. Please enter a positive number for this command to work.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            const query = {
                discordId: target.id,
            }

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

            stats.promoPoints += amount;
            await stats.save();

            let embed = new EmbedBuilder()
            .setTitle(`✅ Success`)
            .setDescription(
                `Successfully added ${amount} Promotion Points to <@${target.id}>.
                Points: <:promotion_point:959090715923726346>${stats.promoPoints - amount} -> <:promotion_point:959090715923726346>${stats.promoPoints}
                Reason: ${reason}`
            )
            .setColor(Colors.Green)
            .setTimestamp();

            await interaction.reply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while adding user balance: ${e}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },

    validations: {
        hasHostingRights: true,
    }
}