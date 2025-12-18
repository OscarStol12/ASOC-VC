"use strict";

const { SlashCommandBuilder, EmbedBuilder, MessageFlags,  Colors, Message, RoleSelectMenuBuilder } = require('discord.js');
const verificationDB = require(`${PROJECT_ROOT}/data/UserVerification`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('unlink')
    .setDescription('Unlinks your Discord account from a ROBLOX account, if connected.'),

    run: async ({ interaction }) => {
        try {
            const query = {
                discordId: interaction.user.id,
            }

            const verificationData = await verificationDB.findOneAndDelete(query);
            if (verificationData) {
                let embed = new EmbedBuilder()
                .setTitle('✅ Unlinked')
                .setDescription(`Your discord account has been unlinked from the ROBLOX account ${verificationData.robloxName} with ID ${verificationData.robloxId}.`)
                .setColor(Colors.Green)
                .setTimestamp();

                await interaction.reply({embeds: [embed]});
            } else {
                let embed = new EmbedBuilder()
                .setTitle('⚠️ No Account Linked')
                .setDescription(`Your discord account is not linked to a ROBLOX account in the database. No changes were made.`)
                .setColor(Colors.Yellow)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
            }
        } catch (e) {
            console.log(`Error unlinking ROBLOX account: ${e}`);
            
            let embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while unlinking your ROBLOX account: ${e}`)
            .setTimestamp();
            
            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    }
}