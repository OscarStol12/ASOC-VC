"use strict";

const { Colors, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getInfoInGroup } = require(`${PROJECT_ROOT}/lib/roblox-api`);
const { getRobloxUserFromDiscord } = require(`${PROJECT_ROOT}/utils/robloxUserInfo`);
const config = require(`${PROJECT_ROOT}/config.json`);
const UserStats = require(`${PROJECT_ROOT}/data/UserStats`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`user-stats`)
    .setDescription(`Gets a user's full stats.`)
    .addUserOption(opt =>
        opt.setName('user')
        .setDescription(`The user to check stats of.`)
        .setRequired(false)
    ),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({interaction}) => {
        try {
            const target = interaction.options.getUser('user') ?? interaction.user;
            const robloxUser = await getRobloxUserFromDiscord(target.id);

            const userGroupInfo = await getInfoInGroup(robloxUser.id, config.group);

            const rankName = (userGroupInfo) ? userGroupInfo.role.name : "Guest";
            const rank = (userGroupInfo) ? userGroupInfo.role.rank : 0;

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
            .setTitle(`🏅 User Stats`)
            .addFields(
                {
                    name: `User`,
                    value: `${robloxUser.name} (<@${target.id}>)`,
                },
                {
                    name: `Promotion Points`,
                    value: `${config.emojis.misc['promotion-points'][process.env.THIS_ENVIRONMENT]} ${stats.promoPoints}`
                },
                {
                    name: `Rank`,
                    value: `${config.emojis.insignias[rank][process.env.THIS_ENVIRONMENT]} __${rankName}__`,
                }
            )
            .setThumbnail(target.displayAvatarURL({ size: 1024 }))
            .setColor(Colors.Yellow)
            .setTimestamp();

            await interaction.reply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while checking user stats: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();
            
            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
            return;
        }
    },
}