"use strict";

const { EmbedBuilder, SlashCommandBuilder, Colors, MessageFlags, ChatInputCommandInteraction } = require('discord.js');
const SnapshotData = require(`${PROJECT_ROOT}/data/ServerSnapshot`);

module.exports = {
    data: new SlashCommandBuilder()
    .setName('list-snapshots')
    .setDescription(`Lists all currently saved snapshots of the server.`)
    .addNumberOption(opt =>
        opt.setName('page')
        .setDescription('The page to check. Defaults to page 1.')
        .setRequired(false)
    ),

    /**
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        let page = interaction.options.getNumber('page') ?? 1;
        try {
            if (!interaction.member.permissions.has("Administrator")) {
                let embed = new EmbedBuilder()
                .setTitle(`⛔ Access Denied`)
                .setDescription(`You do not have the proper permissions to access this command.`)
                .setColor(Colors.Red)
                .setTimestamp();

                await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
                return;
            }

            const snapshots = await SnapshotData.find({});
            if (!snapshots) {
                let embed = new EmbedBuilder()
                .setTitle(`⚠️ No Snapshots Saved`)
                .setDescription(`There are currently no server snapshots saved. In order to create a snapshot, you may use /create-snapshot in order to do so.`)
                .setColor(Colors.Yellow)
                .setTimestamp();

                await interaction.reply({embeds: [embed]});
            } else {
                let totalPages = Math.ceil(snapshots.length / 10);
                let thisPage = Math.min(Math.max(page, 1), totalPages);
                let startPaging = ((thisPage - 1) * 10);
                let endPaging = Math.min(((thisPage * 10) - 1), snapshots.length - 1);

                let embed = new EmbedBuilder()
                .setTitle(`📸 Current Snapshots`)
                .setColor(Colors.Yellow)
                .setTimestamp();

                let fieldDescription = ``;
                for (let i = startPaging; i <= endPaging; i++) {
                    fieldDescription += `Snapshot save date: ${snapshots[i].timestamp}\nTotal roles saved: ${snapshots[i].data.roles.length}\nTotal channels saved: ${snapshots[i].data.channels.length}\n\n`;
                }

                embed.addFields({
                    name: `Page ${thisPage}/${totalPages}`,
                    value: fieldDescription,
                });

                await interaction.reply({embeds: [embed]});
            }
        } catch (e) {
            let embed = new EmbedBuilder()
            .setTitle(`❌ Error`)
            .setDescription(`An error occured while trying to fetch snapshot info: ${e.message}`)
            .setColor(Colors.Red)
            .setTimestamp();

            await interaction.reply({embeds: [embed], flags: MessageFlags.Ephemeral});
        }
    },
}