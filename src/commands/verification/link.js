"use strict";

const { SlashCommandBuilder, EmbedBuilder, MessageFlags, Colors } = require('discord.js');
const noblox = require('noblox.js');
const verificationDB = require(`${PROJECT_ROOT}/data/UserVerification`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Links your Discord account to a ROBLOX Account via RoWifi.'),

    run: async ({ interaction }) => {
        let guildId = interaction.guild.id;

        try {
            const query = {
                discordId: interaction.user.id,
            }

            let verificationData = await verificationDB.findOne(query);
            if (verificationData && (verificationData.robloxName !== "None" && verificationData.robloxId !== "None")) {
                let embed = new EmbedBuilder()
                .setTitle('✅ Already Linked')
                .setDescription(`Your account is already linked to the ROBLOX account ${verificationData.robloxName} with ID ${verificationData.robloxId}. If you want to link to a different account, run /unlink and then re-verify with RoWifi.`)
                .setColor(Colors.Green)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            let response = await fetch(`https://api.rowifi.xyz/v3/guilds/${guildId}/members/${interaction.user.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bot ${process.env.ROWIFI_API_KEY}`
                }
            })

            if (response.status != 200) {
                let embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription(`The RoWifi API returned a status of ${response.status}. Response: ${response.statusText}`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            const data = await response.json();
            if (!verificationData) {
                verificationData = new verificationDB({
                    discordId: interaction.user.id,
                    robloxId: "None",
                    robloxName: "None",
                    UTCOffset: 0,
                })
            }

            verificationData.robloxId = data.roblox_id;
            verificationData.robloxName = await noblox.getUsernameFromId(data.roblox_id);
            verificationData.save();

            let embed = new EmbedBuilder()
            .setTitle('✅ Linked')
            .setDescription(`Your discord account has successfully been linked to the ROBLOX account ${verificationData.robloxName} with ID ${verificationData.robloxId}.`)
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