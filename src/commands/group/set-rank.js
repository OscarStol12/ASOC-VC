"use strict";

const {SlashCommandBuilder, EmbedBuilder, MessageFlags, ChatInputCommandInteraction, Colors} = require('discord.js');
const noblox = require('noblox.js');
const config = require(`${PROJECT_ROOT}/config.json`);
const hasRankingRights = require(`${PROJECT_ROOT}/src/validations/hasRankingRights`);
const {getRobloxUserFromNameOrId, getRobloxUserFromDiscord} = require(`${PROJECT_ROOT}/utils/robloxUserInfo`);

const rankOpts = [
    {name: '[-] Civilian', value: 50},
    {name: '[VA] Veterans Affairs', value: 100},
    {name: '[E-1] Private', value: 101},
    {name: '[E-2] Private Second Class', value: 102},
    {name: '[E-3] Private First Class', value: 103},
    {name: '[E-4A] Specialist', value: 104},
    {name: '[E-4B] Corporal', value: 105},
    {name: '[E-5] Sergeant', value: 106},
    {name: '[E-6] Staff Sergeant', value: 107},
    {name: '[E-7] Sergeant First Class', value: 108},
    {name: '[E-8A] Master Sergeant', value: 109},
    {name: '[E-8B] First Sergeant', value: 110},
    {name: '[E-9A] Sergeant Major', value: 111},
    {name: '[E-9B] Command Sergeant Major', value: 112},
    {name: '[W-1] Warrant Officer 1', value: 150},
    {name: '[W-2] Chief Warrant Officer 2', value: 151},
    {name: '[W-3] Chief Warrant Officer 3', value: 152},
    {name: '[W-4] Chief Warrant Officer 4', value: 153},
    {name: '[W-5] Chief Warrant Officer 5', value: 154},
    {name: '[O-1] Second Lieutenant', value: 200},
    {name: '[O-2] First Lieutenant', value: 201},
    {name: '[O-3] Captain', value: 202},
    {name: '[O-4] Major', value: 203},
    {name: '[O-5] Lieutenant Colonel', value: 204},
    {name: '[O-6] Colonel', value: 205},
]

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`set-rank`)
    .setDescription(`Sets a user to a specific rank.`)
    .addSubcommand(cmd =>
        cmd.setName(`from-roblox`)
        .setDescription(`Sets a user to a specific rank.`)
        .addStringOption(opt =>
            opt.setName(`user`)
            .setDescription(`The user to rank.`)
            .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName(`rank`)
            .setDescription(`The rank to set the user to.`)
            .setRequired(true)
            .addChoices(rankOpts)
        )
        .addStringOption(opt =>
            opt.setName(`reason`)
            .setDescription(`The reason to provide for ranking.`)
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
        cmd.setName(`from-discord`)
        .setDescription(`Sets a user to a specific rank.`)
        .addUserOption(opt =>
            opt.setName(`user`)
            .setDescription(`The user to rank.`)
            .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName(`rank`)
            .setDescription(`The rank to set the user to.`)
            .setRequired(true)
            .addChoices(rankOpts)
        )
        .addStringOption(opt =>
            opt.setName(`reason`)
            .setDescription(`The reason to provide for ranking.`)
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
        let rank = interaction.options.getInteger('rank', true);
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
                .setTitle(`❌ Self-Ranking`)
                .setDescription(`You cannot rank yourself in the group.`)
                .setColor(Colors.Red)
                .setTimestamp();
        
                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }
        
            if (user.id === (await noblox.getAuthenticatedUser()).id) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Cannot Rank Bot`)
                .setDescription(`You cannot rank the ranking bot.`)
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

            if (rank === targetRank) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ No Rank Change`)
                .setDescription(`${user.name} is already ranked *${eRankName}*, so ranking them to the specified rank would do nothing.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }
        
            if (targetRank >= executorRank) {
                let embed = new EmbedBuilder()
                .setTitle(`⛔ Cannot Rank User`)
                .setDescription(`You are not allowed to rank ${user.name}. Their rank of *${tRankName}* is the same or higher rank compared to your rank of *${eRankName}*.`)
                .setColor(Colors.Red)
                .setTimestamp();
        
                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }
        
            if (rank >= executorRank) {
                let embed = new EmbedBuilder()
                .setTitle(`⛔ Cannot Rank To Selected Rank`)
                .setDescription(`You are not allowed to rank ${user.name} to the rank of *${rankOpts.find(each => each.value === rank).name}*, since that would be equivalent to or higher than your rank of *${eRankName}*.`)
                .setColor(Colors.Red)
                .setTimestamp();
        
                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }
        
            await noblox.setRank(groupInfo.id, user.id, rank);
            let newRank = await noblox.getRankNameInGroup(groupInfo.id, user.id);
            let targetThumbnail = (await noblox.getPlayerThumbnail(user.id, 100, "png", false, "headshot"))[0];
        
            let title = (rank > targetRank) ? `⬆️ User Promotion` : `⬇️ User Demotion`;
            let color = (rank > targetRank) ? Colors.Green : Colors.Red;
            let logMsg = new EmbedBuilder()
            .setTitle(title)
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
            .setColor(color)
            .setThumbnail(targetThumbnail.imageUrl)
            .setTimestamp();
        
            let sendChannel = await interaction.guild.channels.fetch(config.channels.logging.ranks[process.env.THIS_ENVIRONMENT]);
            await sendChannel.send({embeds: [logMsg]});
        
            let embed = new EmbedBuilder()
            .setTitle(`✅ Success`)
            .setDescription(`Successfully ranked ${user.name} to the rank of *${newRank}*.`)
            .setColor(Colors.Green)
            .setTimestamp();
        
            await interaction.reply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occurred while trying to rank ${target}: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();
        
            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}