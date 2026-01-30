"use strict";

const { MessageFlags, EmbedBuilder, SlashCommandBuilder, Colors, ChatInputCommandInteraction, ChannelType } = require('discord.js');
const ServerSnapshot = require(`${PROJECT_ROOT}/data/ServerSnapshot`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('create-snapshot')
    .setDescription(`Creates a snapshot of this server. DOES NOT TRANSFER OVER MEMBERS / BOOSTS`),

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        try {
            if (!interaction.member.permissions.has("Administrator")) {
                let embed = new EmbedBuilder()
                .setName(`⛔ Access Denied`)
                .setDescription(`You do not have the proper permissions to use this command.`)
                .setColor(Colors.NotQuiteBlack)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            await interaction.deferReply();
            const createTime = new Date().toISOString();
            const guild = interaction.guild;

            /**
             * @param {ChannelType} type 
             * @returns {string}
             */
            const typeToString = (type) => {
                const typeMap = {
                    [ChannelType.GuildText]: 'GUILD_TEXT',
                    [ChannelType.GuildVoice]: 'GUILD_VOICE',
                    [ChannelType.GuildCategory]: 'GUILD_CATEGORY',
                    [ChannelType.GuildAnnouncement]: 'GUILD_NEWS',
                    [ChannelType.GuildForum]: 'GUILD_FORUM',
                    [ChannelType.GuildStageVoice]: 'GUILD_STAGEVOICE',
                    [ChannelType.GuildMedia]: 'GUILD_MEDIA',
                    [ChannelType.GuildDirectory]: 'GUILD_DIRECTORY',
                }

                return typeMap[type] ?? null;
            }

            const roles = Array.from((await guild.roles.fetch()).values())
            .filter(role => (role.id !== guild.id))
            .filter(role => (!role.managed))
            .sort((a, b) => b.position - a.position)
            .map(role => ({
                id: role.id,
                name: role.name,
                primaryColor: role.colors?.primaryColor ?? null,
                position: role.position,
                hoist: role.hoist,
                mentionable: role.mentionable,
                permissions: role.permissions.bitfield.toString(),
            }));

            const channels = Array.from((await guild.channels.fetch()).values())
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                type: typeToString(channel.type),
                position: channel.position,
                parent: channel.parentId,
                topic: channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement ? channel.topic ?? null : null,
                nsfw: channel.nsfw ?? false,
                rateLimitPerUser: channel.rateLimitPerUser ?? 0,
                bitrate: channel.bitrate ?? null,
                userLimit: channel.userLimit ?? null,

                permissionOverwrites: Array.from(
                    channel.permissionOverwrites.cache.values()
                ).map(overwrite => ({
                    id: overwrite.id,
                    type: overwrite.type,
                    allow: overwrite.allow.bitfield.toString(),
                    deny: overwrite.deny.bitfield.toString(),
                })),
            }))
            .filter(channel => channel.type !== null);

            const thisSnapshot = new ServerSnapshot({
                timestamp: createTime,
                data: {
                    everyone: guild.roles.everyone.id,
                    roles,
                    channels,
                },
            })

            await thisSnapshot.save();

            let embed = new EmbedBuilder()
            .setTitle(`✅ Snapshot Saved`)
            .setDescription(`The server snapshot has been successfully saved.`)
            .setColor(Colors.Green)
            .setTimestamp();

            await interaction.editReply({embeds: [embed]});
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while trying to generate a server snapshot: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.editReply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}