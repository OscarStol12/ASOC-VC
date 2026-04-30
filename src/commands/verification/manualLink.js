"use strict";

const { EmbedBuilder, MessageFlags, SlashCommandBuilder, ChatInputCommandInteraction, Colors } = require('discord.js');
const { getRobloxUserFromNameOrId } = require(`${PROJECT_ROOT}/utils/robloxUserInfo.js`);
const VerificationData = require(`${PROJECT_ROOT}/data/UserVerification`);
const isModerator = require(`${PROJECT_ROOT}/src/validations/isModerator.js`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`manual-link`)
    .setDescription(`Internal tooling to manually link a specified user to a ROBLOX account.`)
    .addUserOption(opt =>
        opt.setName(`user`)
        .setDescription(`The user to manually link.`)
        .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName(`as`)
        .setDescription(`The ROBLOX account to manually link to.`)
        .setRequired(true)
    ),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({interaction}) => {
        if (!isModerator(interaction)) return;

        try {
            let target = interaction.options.getUser('user', true);
            let as = interaction.options.getString('as', true);
            
            if (target.bot) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Cannot Link Bot`)
                .setDescription(`You cannot link a bot account to any ROBLOX account.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            const query = {
                discordId: target.id,
            }

            let userData = await VerificationData.findOne(query);
            if (!userData) {
                userData = new VerificationData({
                    discordId: target.id,
                    robloxId: "None",
                    robloxName: "None",
                    UTCOffset: 0,
                });
            }

            if (userData.robloxId !== "None" || userData.robloxName !== "None") {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Already Linked`)
                .setDescription(`The user has already been linked to the ROBLOX account ${userData.robloxName} with ID ${userData.robloxId}.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            let robloxUser = await getRobloxUserFromNameOrId(as);
            userData.robloxId = robloxUser.id;
            userData.robloxName = robloxUser.name;
            await userData.save();

            let embed = new EmbedBuilder()
            .setTitle(`✅ Manually Linked`)
            .setDescription(`Successfully manually linked <@${target.id}> to the ROBLOX account ${userData.robloxName} with ID ${userData.robloxId}.`)
            .setColor(Colors.Green)
            .setTimestamp();

            await interaction.reply({embeds: [embed]});
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