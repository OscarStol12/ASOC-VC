"use strict";

const { SlashCommandBuilder, EmbedBuilder, MessageFlags, Colors, ChatInputCommandInteraction} = require('discord.js');
const { getPlayerThumbnail, getOwnership } = require(`${PROJECT_ROOT}/lib/roblox-api.js`);
const { getRobloxUserFromDiscord, getRobloxUserFromNameOrId } = require(`${PROJECT_ROOT}/utils/robloxUserInfo.js`);
const verificationDB = require(`${PROJECT_ROOT}/data/UserVerification`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('check-gamepasses')
    .setDescription('Checks for a user\'s purchased gamepasses. DOES NOT ACCOUNT FOR GIFTED GAMEPASSES')
    .addSubcommand((cmd) =>
        cmd.setName('roblox')
        .setDescription('Checks for a user\'s purchased gamepasses. DOES NOT ACCOUNT FOR GIFTED GAMEPASSES')
        .addStringOption((opt) => 
            opt.setName('user')
            .setDescription('The person\'s Username / User ID')
            .setRequired(true)
        )
    )
    .addSubcommand((cmd) =>
        cmd.setName('discord')
        .setDescription('Checks for a user\'s purchased gamepasses. DOES NOT ACCOUNT FOR GIFTED GAMEPASSES')
        .addUserOption((opt) =>
            opt.setName('user')
            .setDescription('The person to check for gamepasses. User must be linked in order to check via this method')
            .setRequired(true)
        )
    ),

    /**
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        let subCommand = interaction.options.getSubcommand(true);
        let robloxId = "";
        let robloxName = "";

        if (subCommand === 'discord') {
            try {
                let target = interaction.options.getUser('user', true);

                if (!(await interaction.guild.members.fetch(target))) {
                    let embed = new EmbedBuilder()
                    .setTitle('❌ Error')
                    .setDescription('The specified target is not in this server. Please consider using their ROBLOX Username in the /checkgamepasses roblox subcommand instead.')
                    .setColor(Colors.Red)
                    .setTimestamp();

                    await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                    return;
                }

                let robloxUserInfo = await getRobloxUserFromDiscord(target.id);

                robloxId = robloxUserInfo.id;
                robloxName = robloxUserInfo.name;
            } catch (e) {
                let embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription(`An unexpected error occurred while trying to fetch user info: ${e}`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }
        } else if (subCommand === 'roblox') {
            try {
                let target = interaction.options.getString('user', true);
                let robloxUserInfo = await getRobloxUserFromNameOrId(target);

                if (robloxUserInfo === null) {
                    let embed = new EmbedBuilder()
                    .setTitle('❌ Error')
                    .setDescription(`The Username / ID Provided of ${target} does not belong to any ROBLOX account. Please check if you spelt the username / ID correctly.`)
                    .setColor(Colors.Red)
                    .setTimestamp();

                    await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                    return;
                }

                robloxId = robloxUserInfo.id;
                robloxName = robloxUserInfo.name;
            } catch (e) {
                let embed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setDescription(`An unexpected error occurred while trying to fetch user info: ${e}`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }
        } else {
            let embed = new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription(`Unknown subcommand specified: ${subCommand}. Please use either the 'discord' or 'roblox' subcommand for this command.`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
            return;
        }

        try {
            let ownedGamepasses = "";
            let gamepassesToCheck = [
                {id: 22121779, name: "Overseer"},
                {id: 663031922, name: "Unlock All Teams"},
                {id: 15704882, name: "Facility Director"},
                {id: 15704824, name: "Council Executive"},
                {id: 15048937, name: "Security Supervisor"}, 
                {id: 22122463, name: "Warlord"},
                {id: 14888642, name: "Military Officer"},
                {id: 20877486, name: "Government Official"},
                {id: 14888839, name: "Special Task Force"},
                {id: 24927680, name: "Raid Leader"},
                {id: 24927699, name: "Hitman"},
                {id: 908729193, name: "Military Police"},
                {id: 15137680, name: "Commando"}
            ]

            let thumbnailReq = await getPlayerThumbnail(robloxId, "100x100", "Png", false);
            let userThumbnail = thumbnailReq[0];
            let gpCount = 0;
            for (let i = 0; i < gamepassesToCheck.length; i++) {
                let gpInfo = gamepassesToCheck[i];
                let ownsGP = await getOwnership(robloxId, gpInfo.id, "GamePass");
                if (ownsGP) {
                    if (gpCount == 0) ownedGamepasses += (gpInfo.name);
                    else ownedGamepasses += ("\n" + gpInfo.name);
                    gpCount++;
                }
            }

            if (ownedGamepasses === "") ownedGamepasses = "No Gamepasses";

            let embed = new EmbedBuilder()
            .setTitle('🏅 Owned Gamepasses')
            .addFields({name: 'Username', value: robloxName})
            .addFields({name: 'Gamepasses', value: ownedGamepasses})
            .setColor(Colors.Yellow)
            .setThumbnail(userThumbnail.imageUrl)
            .setTimestamp();

            await interaction.reply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription(`An unexpected error occurred while trying to check Gamepass Ownership: ${e}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
            return;
        }
    },
}