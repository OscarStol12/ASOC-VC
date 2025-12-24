"use strict";

const { SlashCommandBuilder, Colors, MessageFlags, EmbedBuilder } = require('discord.js');
const UserVerification = require(`${PROJECT_ROOT}/data/UserVerification`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('set-timezone')
    .setDescription('Sets relevant bot timezone data.')
    .addStringOption(opt =>
        opt.setName('offset')
        .setDescription('Your current offset from UTC. Format as: UTC+HH[:MM] / UTC-HH[:MM]')
        .setRequired(true)
    ),

    run: async ({ interaction }) => {
        let rawOffsetData = interaction.options.getString('offset');
        try {
            if (!rawOffsetData.startsWith("UTC")) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Formatting Error`)
                .setDescription(`Your parameter does not follow the proper format outlined.\nMore specifically, the parameter text does not start with UTC.\nFormat: UTC+HH[:MM] / UTC-HH[:MM]`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }
            
            const symbol = rawOffsetData.charAt(3);
            if (symbol !== "+" && symbol !== "-") {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Formatting Error`)
                .setDescription(`Your parameter does not follow the proper format outlined.\nMore specifically, the symbol you placed in between UTC and the time part is not + or -.\nFormat: UTC+HH[:MM] / UTC-HH[:MM]`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            let restOfOffsetData = rawOffsetData.substring(4);
            let dividerIndex = restOfOffsetData.indexOf(':');

            let multiplier = (symbol === '-') ? -1 : 1;
            let hourOffset = 0;
            let minuteOffset = 0;

            if (dividerIndex === -1) {
                hourOffset = parseInt(restOfOffsetData) * multiplier;
                minuteOffset = 0;
            } else {
                hourOffset = parseInt(restOfOffsetData.substring(0, dividerIndex)) * multiplier;
                minuteOffset = parseInt(restOfOffsetData.substring(dividerIndex + 1)) * multiplier;
            }

            let totalOffset = (hourOffset * 3600) + (minuteOffset * 60);
            
            const query = {
                discordId: interaction.user.id,
            }

            let verificationData = await UserVerification.findOne(query);
            if (!verificationData) {
                verificationData = new UserVerification({
                    discordId: interaction.user.id,
                    robloxId: "None",
                    robloxName: "None",
                    UTCOffset: 0,
                })
            }

            verificationData.UTCOffset = totalOffset;
            await verificationData.save();

            let embed = new EmbedBuilder()
            .setTitle(`✅ Timezone Updated`)
            .setDescription(`Your timezone data has been successfully updated to ${rawOffsetData}.`)
            .setColor(Colors.Green)
            .setTimestamp();

            await interaction.reply({embeds: [embed]})
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while trying to set timezone info: ${e}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    }
}