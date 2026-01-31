"use strict";

const {ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, MessageFlags, Colors} = require('discord.js');
const noblox = require('noblox.js');
const config = require(`${PROJECT_ROOT}/config.json`);
const hasRankingRights = require(`${PROJECT_ROOT}/src/validations/hasRankingRights`);
const {getRobloxUserFromNameOrId, getRobloxUserFromDiscord} = require(`${PROJECT_ROOT}/utils/robloxUserInfo`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`demote`)
    .setDescription(`Demotes a user one rank down.`)
    .addSubcommand(cmd => 
        cmd.setName(`from-roblox`)
        .setDescription(`Demotes a user one rank down.`)
        .addStringOption(opt =>
            opt.setName(`user`)
            .setDescription(`The user to demote.`)
            .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName(`reason`)
            .setDescription(`The reason to provide for the demotion.`)
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
        cmd.setName(`from-discord`)
        .setDescription(`Demotes a user one rank down.`)
        .addUserOption(opt =>
            opt.setName(`user`)
            .setDescription(`The user to demote.`)
            .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName(`reason`)
            .setDescription(`The reason to provide for the demotion.`)
            .setRequired(true)
        )
    ),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction 
     */
    run: async ({interaction}) => {
        const subcommand = interaction.options.getSubcommand(true);
        let reason = interaction.options.getString('reason', true);
        let user, target;

        try {
            if (!(await hasRankingRights(interaction))) return;

            switch (subcommand) {
                case `from-roblox`: {
                    target = interaction.options.getString(`user`, true);
                    user = await getRobloxUserFromNameOrId(target);
                    break;
                }

                case `from-discord`: {
                    target = interaction.options.getUser(`user`, true);
                    user = await getRobloxUserFromDiscord(target.id);
                    target = `<@${target.id}>`;
                    break;
                }
            }

            if (!user && subcommand === `from-discord`) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Account Not Found`)
                .setDescription(`${target} is not linked to RoWifi. Please try again using their username or user ID.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            } else if (!user) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Invalid Account`)
                .setDescription(`${target} is not a valid Username / User ID on Roblox. Please check that you spelt it correctly, and try again.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            let groupInfo = await noblox.getGroup(config.group);
            let executor = await getRobloxUserFromDiscord(interaction.user.id);

            let targetRank = await noblox.getRankInGroup(groupInfo.id, user.id);
            let executorRank = await noblox.getRankInGroup(groupInfo.id, executor.id);

            let tRankName = await noblox.getRankNameInGroup(groupInfo.id, user.id);
            let eRankName = await noblox.getRankNameInGroup(groupInfo.id, executor.id);

            if (executor.id === user.id) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Self-Demotion`)
                .setDescription(`You cannot demote yourself in the group.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            if (user.id === (await noblox.getAuthenticatedUser()).id) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Cannot Demote Bot`)
                .setDescription(`You cannot demote the ranking bot.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            if (targetRank === 0) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Not In Group`)
                .setDescription(`${user.name} is not in the ASOC group. Their rank cannot be changed.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            if (targetRank >= executorRank) {
                let embed = new EmbedBuilder()
                .setTitle(`⛔ Cannot Promote User`)
                .setDescription(`You are not allowed to demote ${user.name}. Their rank of *${tRankName}* is the same or higher rank compared to your rank of *${eRankName}*.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            await noblox.demote(groupInfo.id, user.id);
            let targetThumbnail = (await noblox.getPlayerThumbnail(user.id, 100, "png", false, "headshot"))[0];
            let newRank = await noblox.getRankNameInGroup(groupInfo.id, user.id);

            let logMsg = new EmbedBuilder()
            .setTitle(`⬇️ User Demotion`)
            .addFields(
                {
                    name: `User`,
                    value: user.name,
                    inline: true,
                },
                {
                    name: `Ranker`,
                    value: `<@${interaction.user.id}>`,
                    inline: true,
                },
                {
                    name: `Reason`,
                    value: reason,
                },
                {
                    name: `Old Rank`,
                    value: tRankName,
                },
                {
                    name: `New Rank`,
                    value: newRank,
                },
            )
            .setColor(Colors.Red)
            .setThumbnail(targetThumbnail.imageUrl)
            .setTimestamp();

            let sendChannel = await interaction.guild.channels.fetch(config.channels.logging.ranks[process.env.THIS_ENVIRONMENT]);
            await sendChannel.send({embeds: [logMsg]});

            let embed = new EmbedBuilder()
            .setTitle(`✅ Success`)
            .setDescription(`Successfully demoted ${user.name} to the rank of *${newRank}*.`)
            .setColor(Colors.Green)
            .setTimestamp();

            await interaction.reply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occurred while trying to demote ${target}: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}