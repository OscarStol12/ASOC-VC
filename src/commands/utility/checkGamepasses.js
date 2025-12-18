"use strict";

const {SlashCommandBuilder, EmbedBuilder, MessageFlags, Colors} = require('discord.js');
const noblox = require('noblox.js');
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

    run: async ({ interaction }) => {
        let subCommand = interaction.options.getSubcommand();
        let robloxId = "";
        let robloxName = "";

        if (subCommand === 'discord') {
            try {
                let target = interaction.options.get('user')?.value;

                if (!interaction.guild.members.cache.has(target)) {
                    let embed = new EmbedBuilder()
                    .setTitle('❌ Error')
                    .setDescription('The specified target is not in this server. Please consider using their ROBLOX Username in the /checkgamepasses roblox subcommand instead.')
                    .setColor(Colors.Red)
                    .setTimestamp();

                    await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                    return;
                }

                const query = {
                    discordId: target,
                }

                let DBEntry = await verificationDB.findOne(query);
                if (!DBEntry) {
                    let embed = new EmbedBuilder()
                    .setTitle('❌ Error')
                    .setDescription('The specified target is not linked to the PDP Bot Verification Database. Please consider asking them to run /link, or using their ROBLOX name in the /checkgamepasses roblox subcommand.')
                    .setColor(Colors.Red)
                    .setTimestamp();

                    await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                    return;
                }

                robloxId = DBEntry.robloxId;
                robloxName = DBEntry.robloxName;
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
                let target = interaction.options.get('user')?.value;
                let valid = false;
                if (isNaN(target)) {
                    // Username was provided
                    robloxId = `${await noblox.getIdFromUsername(target)}`;
                    robloxName = `${target}`;
                    valid = (robloxId != 'null');
                } else {
                    // User ID was provided
                    robloxId = `${target}`;
                    robloxName = `${await noblox.getUsernameFromId(target)}`;
                    valid = (robloxName != 'null');
                }

                if (!valid) {
                    let embed = new EmbedBuilder()
                    .setTitle('❌ Error')
                    .setDescription(`The Username / ID Provided of ${target} does not belong to any ROBLOX account. Please check if you spelt the username / ID correctly.`)
                    .setColor(Colors.Red)
                    .setTimestamp();

                    await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                    return;
                }
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

            let thumbnailReq = await noblox.getPlayerThumbnail(robloxId, 100, "png", false, "headshot");
            let userThumbnail = thumbnailReq[0];
            let gpCount = 0;
            for (let i = 0; i < gamepassesToCheck.length; i++) {
                let gpInfo = gamepassesToCheck[i];
                let ownsGP = await noblox.getOwnership(robloxId, gpInfo.id, "GamePass");
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