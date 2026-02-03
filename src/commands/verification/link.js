"use strict";

const { SlashCommandBuilder, EmbedBuilder, MessageFlags, Colors } = require('discord.js');
const {getRobloxUserFromDiscord, hasRobloxAccountLinked} = require(`${PROJECT_ROOT}/utils/robloxUserInfo`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Links your Discord account to a ROBLOX Account via RoWifi.'),

    run: async ({ interaction }) => {
        try {
            const query = {
                discordId: interaction.user.id,
            }

            if (await hasRobloxAccountLinked(interaction.user.id)) {
                let linkedUser = await getRobloxUserFromDiscord(interaction.user.id);

                let embed = new EmbedBuilder()
                .setTitle('✅ Already Linked')
                .setDescription(`Your account is already linked to the ROBLOX account ${linkedUser.name} with ID ${linkedUser.id}. If you want to link to a different account, run /unlink and then re-verify with RoWifi.`)
                .setColor(Colors.Green)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            let verifiedUser = await getRobloxUserFromDiscord(interaction.user.id);

            let embed = new EmbedBuilder()
            .setTitle('✅ Linked')
            .setDescription(`Your discord account has successfully been linked to the ROBLOX account ${verifiedUser.name} with ID ${verifiedUser.id}.`)
            .setColor(Colors.Green)
            .setTimestamp();

            await interaction.reply({embeds: [embed]});
        } catch (e) {
            console.log(`Error linking ROBLOX account: ${e}`);

            let embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while linking your ROBLOX account: ${e}`)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    }
}