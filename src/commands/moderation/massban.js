"use strict";

const {SlashCommandBuilder, EmbedBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`massban`)
    .setDescription(`Bans multiple members for a certain reason.`)
    .addStringOption(opt =>
        opt.setName(`users`)
        .setDescription(`The users to ban. Input their IDs, each followed by a comma`)
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName(`reason`)
        .setDescription(`The reason to issue the massban.`)
        .setRequired(true)
    ),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({interaction}) => {
        let rawUserData = interaction.options.getString(`users`, true);
        let reason = interaction.options.getString(`reason`, true);

        try {
            await interaction.deferReply();

            // Get all users being banned
            const users = []
            const iterations = rawUserData.match(/,/g).length;

            const currentBanned = await interaction.guild.bans.fetch();
            let skipped = 0;

            for (let i = 0; i < iterations; i++) {
                let index = (rawUserData.indexOf(',' !== -1)) ? rawUserData.indexOf(',') : rawUserData.length;
                let content = rawUserData.substring(0, index);

                // NOTE: Discord.js will error if an already banned user is provided in the list, skip users who are already banned
                if (currentBanned.find(user => user.id === content)) {
                    skipped++;
                } else {
                    users[i - skipped] = content;
                }

                rawUserData = rawUserData.substring(index + 1);
            }

            if (currentBanned.find(user => user.id === rawUserData)) {
                skipped++;
            } else {
                users[users.length] = rawUserData;
            }

            let result = await interaction.guild.members.bulkBan(users, {reason: reason});
            
            let embed;
            console.log(result.failedUsers.length);
            if (result.bannedUsers.length === 0) {
                embed = new EmbedBuilder()
                .setTitle(`❌ Bans Failed`)
                .setDescription(`Out of ${users.length} users to ban, none of them were successfully banned. Please try again, or ensure the bot has proper permissions.`)
                .setColor(Colors.Red)
                .setTimestamp();
            } else if (result.failedUsers.length > 0) {
                embed = new EmbedBuilder()
                .setTitle(`⚠️ Partial Success`)
                .setDescription(`${result.bannedUsers.length} / ${users.length} users were successfully banned from the server with reason: ${reason}.\nPlease try the command again if you wish to ensure that all members you listed are banned.`)
                .setColor(Colors.Yellow)
                .setTimestamp();
            } else {
                embed = new EmbedBuilder()
                .setTitle(`✅ Success`)
                .setDescription(`${result.bannedUsers.length} users have been successfully banned from the server with reason: ${reason}. ${(skipped > 0)?`\n${skipped} users were skipped due to already being banned.`:``}`)
                .setColor(Colors.Green)
                .setTimestamp();
            }

            await interaction.editReply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while issuing the massban: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },

    validations: {
        isModerator: true,
    }
}