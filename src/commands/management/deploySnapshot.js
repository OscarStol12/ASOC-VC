"use strict";

const { MessageFlags, EmbedBuilder, SlashCommandBuilder, Colors, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const SnapshotData = require(`${PROJECT_ROOT}/data/ServerSnapshot`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('deploy-snapshot')
    .setDescription(`Deploys a saved snapshot of the server. WARNING: DELETES ALL OTHER SERVER CHANNELS`),

    /**
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        try {
            // CHECK 1 - Check the member is an Administrator in the server
            if (!interaction.member.permissions.has("Administrator")) {
                let embed = new EmbedBuilder()
                .setTitle(`⛔ Access Denied`)
                .setDescription(`You do not have the proper permissions to use this command.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            // CHECK 2 - Ensure the bot itself is an administrator
            if (!interaction.appPermissions.has("Administrator")) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ Missing Permissions`)
                .setDescription(`This bot does not have Administrator permissions. This command requires administrative privileges to work properly. Please ensure those permissions are granted.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }
            
            // CHECK 3 - Ensure that a snapshot exists
            const snapshot = await SnapshotData.findOne({});
            if (!snapshot) {
                let embed = new EmbedBuilder()
                .setTitle(`❌ No Snapshot Detected`)
                .setDescription(`There are no snapshots saved to deploy to. Please create a new snapshot before beginning deployment.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            await interaction.deferReply();

            let guild = interaction.guild;
            let thisChannel = interaction.channel;
            let warningEmbed = new EmbedBuilder()
            .setTitle(`⚠️ WARNING ⚠️`)
            .setDescription(`This command will delete all of the old channels, roles, and emojis first before applying the snapshot except the channel in which this command is being run in.\n\nAre you sure that you want to proceed with this command, knowing it could potentially be destructive?`)
            .setColor(Colors.Red)
            .setTimestamp();

            let confirmationOptions = [
                {text: 'Yes', emoji: '✅'},
                {text: 'No', emoji: '❌'},
            ]
            
            let buttonOptions = confirmationOptions.map((each) => {
                return new ButtonBuilder()
                .setCustomId(each.text)
                .setLabel(each.text)
                .setStyle(ButtonStyle.Primary)
                .setEmoji(each.emoji);
            })

            let warning = await interaction.editReply({
                embeds: [warningEmbed], 
                components: [new ActionRowBuilder().addComponents(buttonOptions)]
            });

            let firstComp = await warning.awaitMessageComponent({
                filter: (i) => i.user.id === interaction.user.id,
                time: 30_000,
            }).catch(async (e) => {
                warningEmbed.setTitle(`⌛ Timed Out`)
                .setDescription(`The confirmation window timed out. This command has been aborted.`)
                .setColor(Colors.Yellow)
                .setTimestamp();

                await warning.edit({embeds: [warningEmbed], components: []});
            })

            if (!firstComp) return;

            let firstChoice = confirmationOptions.find(
                (choice) => choice.text === firstComp.customId
            )

            if (firstChoice.text === `No`) {
                warningEmbed.setTitle(`❌ Aborted`)
                .setDescription(`This command has been aborted.`)
                .setColor(Colors.Yellow)
                .setTimestamp();

                await warning.edit({embeds: [warningEmbed], components: []});
                return;
            }

            warningEmbed.setTitle(`⚠️⚠️ FINAL WARNING ⚠️⚠️`)
            .setDescription(`**This command will delete all of the old channels, roles, and emojis** first before applying the snapshot except the channel in which this command is being run in.\n\nThis is your **last chance** to deny execution of this command. After selecting 'Yes', **this command is irreversible.**\n\n**Are you sure** that you want to proceed with this command, knowing it could potentially be destructive?`)
            .setTimestamp();

            await warning.edit({embeds: [warningEmbed], components: [new ActionRowBuilder().addComponents(buttonOptions)]})

            let secondComp = await warning.awaitMessageComponent({
                filter: (i) => i.user.id === interaction.user.id,
                time: 30_000,
            }).catch(async (e) => {
                warningEmbed.setTitle(`⌛ Timed Out`)
                .setDescription(`The confirmation window timed out. This command has been aborted.`)
                .setColor(Colors.Yellow)
                .setTimestamp();

                await warning.edit({embeds: [warningEmbed], components: []});
            })

            if (!secondComp) return;

            let secondChoice = confirmationOptions.find(
                (choice) => choice.text === secondComp.customId
            )

            if (secondChoice.text === `No`) {
                warningEmbed.setTitle(`❌ Aborted`)
                .setDescription(`This command has been aborted.`)
                .setColor(Colors.Yellow)
                .setTimestamp();

                await warning.edit({embeds: [warningEmbed], components: []});
                return;
            }

            const updateWithCurrentStep = async (step) => {
                warningEmbed
                .setDescription(`Your snapshot is currently being deployed. Please be patient, as this command may take a long time to finish.\nCurrent step: ${step}`)
                .setTimestamp();
                await warning.edit({embeds: [warningEmbed]});
            }

            warningEmbed.setTitle(`🔁 Deploying Snapshot`)
            .setDescription(`Your snapshot is currently being deployed. Please be patient, as this command may take a long time to finish.`)
            .setColor(Colors.Yellow)
            .setTimestamp();

            await warning.edit({embeds: [warningEmbed], components: []});

            /**
             * @param {string} type 
             * @returns {ChannelType}
             */
            const getChannelType = (type) => {
                const typeMap = {
                    'GUILD_TEXT': ChannelType.GuildText,
                    'GUILD_VOICE': ChannelType.GuildVoice,
                    'GUILD_CATEGORY': ChannelType.GuildCategory,
                    'GUILD_NEWS': ChannelType.GuildAnnouncement,
                    'GUILD_FORUM': ChannelType.GuildForum,
                    'GUILD_STAGEVOICE': ChannelType.GuildStageVoice,
                    'GUILD_MEDIA': ChannelType.GuildMedia,
                    'GUILD_DIRECTORY': ChannelType.GuildDirectory,
                }

                return typeMap[type] ?? null;
            }

            const STANDARD_DELAY = 2_000; // 2 second delay for each operation

            const sleep = (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms))
            }

            // Delete channels, except the channel where the command was run
            for (const [channelId, channel] of (await guild.channels.fetch())) {
                if (channelId === thisChannel.id) continue;
                await updateWithCurrentStep(`Deleting channel ${channel.name}`);
                try {
                    //await sleep(STANDARD_DELAY);
                    await channel.delete(`Clearing server environment for snapshot deployment`);
                } catch (e) {
                    console.error(e.rawError ?? e);
                    continue;
                } 
            }

            // Delete all roles, except the @everyone and managed roles
            for (const [roleId, role] of (await guild.roles.fetch())) {
                if (role.managed) continue;
                if (roleId === guild.roles.everyone.id) continue;

                await updateWithCurrentStep(`Deleting role ${role.name}`);
                try {
                    //await sleep(STANDARD_DELAY);
                    await role.delete(`Clearing server environment for snapshot deployment`); 
                } catch (e) {
                    console.error(e.rawError ?? e);
                    continue;
                }
            }

            // Create new roles
            const sortedRoles = snapshot.data.roles.sort((a, b) => b.position - a.position);
            const roleMap = new Map();
            roleMap.set(snapshot.everyone, guild.roles.everyone.id);
            for (const roleData of sortedRoles) {
                await updateWithCurrentStep(`Creating role ${roleData.name}`);
                try {
                    //await sleep(STANDARD_DELAY);
                    const role = await guild.roles.create({
                        name: roleData.name,
                        colors: {primaryColor: roleData.primaryColor},
                        hoist: Boolean(roleData.hoist),
                        permissions: roleData.permissions ? new PermissionsBitField(BigInt(roleData.permissions)) : new PermissionsBitField(),
                        mentionable: Boolean(roleData.mentionable),
                    });

                    roleMap.set(roleData.id, role.id);
                } catch (err) {
                    console.error(`❌ Failed to create role "${roleData.name}"`);
                    console.error('Error object:', err);
                    if (err?.code) console.error('Discord error code:', err.code);
                    if (err?.rawError) console.error('Raw error payload:', err.rawError);
                    continue;
                }
            }

            // Sort roles properly based on position (if not already done so)
            await updateWithCurrentStep(`Sorting roles`);
            try {
                const positionArray = Array.from(roleMap.values())
                .sort((a, b) => b.targetPosition - a.targetPosition)
                .map((entry) => ({
                    role: entry.id,
                    position: entry.targetPosition,
                }))

                await guild.roles.setPositions(positionArray);
            } catch (e) {
                console.error(e.rawError ?? e);
            }

            // Create new categories first
            const categoryMap = new Map();
            const categories = snapshot.data.channels
            .filter(channel => channel.type === `GUILD_CATEGORY`)
            .sort((a, b) => b.position - a.position)
            
            for (const categoryData of categories) {
                await updateWithCurrentStep(`Creating category ${categoryData.name}`);
                try {
                    //await sleep(STANDARD_DELAY);
                    const permissionOverwrites = categoryData.permissionOverwrites.map(overwrite => ({
                        id: roleMap.get(overwrite.id) ?? overwrite.id,
                        allow: overwrite.allow,
                        deny: overwrite.deny,
                        type: overwrite.type,
                    }));

                    const category = await guild.channels.create({
                        name: categoryData.name,
                        type: ChannelType.GuildCategory,
                        position: categoryData.position,
                        permissionOverwrites: permissionOverwrites,
                    });

                    categoryMap.set(categoryData.id, category.id);
                } catch (e) {
                    console.error(e.rawError ?? e);
                    continue;
                }
            }

            // Create other channels after creating categories
            const otherChannels = snapshot.data.channels
            .filter(channel => channel.type !== `GUILD_CATEGORY`)
            .sort((a, b) => b.position - a.position);

            for (const channelData of otherChannels) {
                await updateWithCurrentStep(`Creating channel ${channelData.name}`);
                try {
                    //await sleep(STANDARD_DELAY);
                    const channelType = getChannelType(channelData.type)
                    if (channelType === null) continue;

                    const channelDataToCreate = {
                        name: channelData.name,
                        type: channelType,
                        position: channelData.position,
                        parent: channelData.parent ? categoryMap.get(channelData.parent) : null,
                        permissionOverwrites: channelData.permissionOverwrites.map(overwrite => ({
                            id: roleMap.get(overwrite.id) ?? overwrite.id,
                            allow: overwrite.allow,
                            deny: overwrite.deny,
                            type: overwrite.type,
                        })),
                    };

                    if (channelType === ChannelType.GuildText || channelType === ChannelType.GuildAnnouncement || channelType === ChannelType.GuildForum || channelType === ChannelType.GuildMedia) {
                        channelDataToCreate.topic = channelData.topic;
                        channelDataToCreate.nsfw = channelData.nsfw;
                        channelDataToCreate.rateLimitPerUser = channelData.rateLimitPerUser;
                    } else if (channelType === ChannelType.GuildVoice || channelType === ChannelType.GuildStageVoice) {
                        channelDataToCreate.bitrate = channelData.bitrate;
                        channelDataToCreate.userLimit = channelData.userLimit;
                    }

                    await guild.channels.create(channelDataToCreate);
                } catch (e) {
                    console.error(e.rawError ?? e);
                    continue;
                }
            }

            let successEmbed = new EmbedBuilder()
            .setTitle(`✅ Deployment Success`)
            .setDescription(`The snapshot has been deployed successfully.`)
            .setColor(Colors.Green)
            .setTimestamp();

            await interaction.editReply({embeds: [successEmbed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while deploying the snapshot: ${e}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral, components: []});
        }
    },
}